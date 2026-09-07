
<script>
	import { apiData } from '$lib/api';

	let need = $state('251');
	let kind = $state('thermal');
	let result = $state(null);
	let busy = $state(false);
	let failure = $state('');
	let touched = $state(false);

	// bind:value on a number input yields a number, or undefined when empty
	let needText = $derived(need === undefined || need === null ? '' : String(need).trim());

	let localError = $derived(
		needText === ''
			? 'Enter the need for your site in megawatts.'
			: !Number.isFinite(Number(needText)) || Number(needText) <= 0
				? 'A need of zero or less is not valid. Enter a number greater than zero.'
				: ''
	);

	async function submit(e) {
		e.preventDefault();
		touched = true;
		failure = '';
		if (localError) {
			result = null;
			return;
		}
		busy = true;
		try {
			result = await apiData('/calculator', {
				method: 'POST',
				auth: false,
				body: { need_mw: Number(needText), kind }
			});
		} catch (err) {
			result = null;
			failure = err.message || 'The calculation was refused.';
		} finally {
			busy = false;
		}
	}

	const fmt = (n) => new Intl.NumberFormat('en-GB').format(n);

	// bars scaled against the largest of the three, drawn from code
	let bars = $derived(
		result
			? [
					{ label: 'Modules required', value: result.modules_required, unit: '', key: 'modules' },
					{
						label: 'Annual clean energy',
						value: result.annual_clean_energy_gwh,
						unit: 'GWh',
						key: 'energy'
					},
					{
						label: 'Annual carbon avoided',
						value: result.annual_co2_avoided_tonnes,
						unit: 'tonnes',
						key: 'co2'
					}
				]
			: []
	);
</script>

<svelte:head><title>Calculator, modules and energy, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Calculator</p>
		<h1>Turn a site need into modules</h1>
		<p class="lede">
			One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs
			8000 hours a year. Each GWh delivered avoids 450 tonnes of carbon. The energy figure follows
			the modules built, never the need asked for.
		</p>
	</div>
</div>

<div class="wrap section-tight calc">
	<form class="card calc-form" onsubmit={submit} novalidate>
		<div class="field">
			<label for="c-need">Your site need, in megawatts</label>
			<input
				id="c-need"
				type="number"
				inputmode="decimal"
				step="any"
				bind:value={need}
				onblur={() => (touched = true)}
				aria-invalid={touched && localError ? 'true' : undefined}
				aria-describedby={touched && localError ? 'c-need-err' : 'c-need-hint'}
			/>
			{#if touched && localError}
				<p class="field-error" id="c-need-err">{localError}</p>
			{:else}
				<p class="muted hint" id="c-need-hint">For example 251 for a mid sized process site.</p>
			{/if}
		</div>

		<fieldset class="field kinds">
			<legend>What kind of output</legend>
			<label class="checkbox">
				<input type="radio" name="kind" value="thermal" bind:group={kind} />
				Thermal, 250 MW a module
			</label>
			<label class="checkbox">
				<input type="radio" name="kind" value="electrical" bind:group={kind} />
				Electrical, 100 MW a module
			</label>
		</fieldset>

		<button class="btn" type="submit" disabled={busy} data-testid="calc-submit">
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
			{busy ? 'Working it out' : 'Calculate'}
		</button>

		{#if failure}
			<div class="banner banner-fail" role="alert">
				<strong>That calculation was refused.</strong>
				{failure} Enter a need greater than zero and calculate again.
			</div>
		{/if}
	</form>

	<div class="results">
		{#if result}
			<div class="figures" data-testid="calc-results">
				<div class="fig">
					<p class="fig-label">Modules required</p>
					<p class="fig-value" data-testid="modules-required">{fmt(result.modules_required)}</p>
				</div>
				<div class="fig">
					<p class="fig-label">Annual clean energy, GWh</p>
					<p class="fig-value" data-testid="annual-energy">{fmt(result.annual_clean_energy_gwh)}</p>
				</div>
				<div class="fig">
					<p class="fig-label">Annual carbon avoided, tonnes</p>
					<p class="fig-value" data-testid="annual-co2">{fmt(result.annual_co2_avoided_tonnes)}</p>
				</div>
			</div>

			<!-- a simple bar chart beside the three figures, plus its written version -->
			<div class="chart" role="group" aria-label="The three figures drawn as bars">
				{#each bars as b (b.key)}
					<div class="bar-row">
						<span class="bar-label">{b.label}</span>
						<span class="bar-track">
							<span
								class="bar-fill"
								style="width:{Math.max(
									3,
									(Math.log10(b.value + 1) / Math.log10(Math.max(...bars.map((x) => x.value)) + 1)) * 100
								)}%"
							></span>
						</span>
						<span class="bar-value">{fmt(b.value)} {b.unit}</span>
					</div>
				{/each}
			</div>

			<p class="muted plain-note">
				In words: a need of {fmt(Number(needText))} MW {kind} takes
				<strong>{fmt(result.modules_required)}</strong> modules, which deliver
				<strong>{fmt(result.annual_clean_energy_gwh)}</strong> GWh a year and avoid
				<strong>{fmt(result.annual_co2_avoided_tonnes)}</strong> tonnes of carbon dioxide.
			</p>
		{:else}
			<div class="empty">
				<h3>No figures yet</h3>
				<p>Enter a need in megawatts and choose thermal or electrical to see the three figures.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 40px 0 32px;
	}
	.calc {
		display: grid;
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		gap: 26px;
		align-items: start;
		padding-bottom: 60px;
	}
	.kinds {
		border: 0;
		padding: 0;
		margin: 0 0 16px;
	}
	.kinds legend {
		font-weight: 650;
		font-size: 0.86rem;
		margin-bottom: 6px;
		padding: 0;
	}
	.kinds .checkbox {
		display: flex;
		margin-bottom: 6px;
		min-height: 34px;
		align-items: center;
	}
	.hint {
		font-size: 0.82rem;
		margin: 5px 0 0;
	}
	.figures {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		margin-bottom: 20px;
	}
	.fig {
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius);
		padding: 14px;
	}
	.fig-label {
		font-size: 0.76rem;
		color: var(--ink-muted);
		margin: 0 0 4px;
		font-weight: 650;
	}
	.fig-value {
		font-family: var(--font-head);
		font-size: clamp(1.3rem, 3vw, 1.9rem);
		margin: 0;
		letter-spacing: -0.02em;
	}
	.chart {
		display: grid;
		gap: 10px;
		padding: 16px;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius-lg);
	}
	.bar-row {
		display: grid;
		grid-template-columns: 150px minmax(0, 1fr) 130px;
		gap: 10px;
		align-items: center;
		font-size: 0.82rem;
	}
	.bar-label {
		color: var(--ink-muted);
		font-weight: 650;
	}
	.bar-track {
		height: 13px;
		background: var(--surface-sunk);
		border-radius: 999px;
		overflow: hidden;
		border: var(--hair) solid var(--rule);
	}
	.bar-fill {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.bar-value {
		text-align: right;
		font-weight: 650;
	}
	.plain-note {
		margin-top: 16px;
		font-size: 0.9rem;
	}
	@media (max-width: 900px) {
		.calc {
			grid-template-columns: minmax(0, 1fr);
		}
		.figures {
			grid-template-columns: minmax(0, 1fr);
		}
		.bar-row {
			grid-template-columns: minmax(0, 1fr);
			gap: 3px;
		}
		.bar-value {
			text-align: left;
		}
	}
</style>
