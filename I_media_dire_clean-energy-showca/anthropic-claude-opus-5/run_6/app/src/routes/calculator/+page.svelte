<script>
	import { post, ApiError } from '$lib/api.js';

	let need_mw = 251;
	let kind = 'thermal';
	let result = null;
	let busy = false;
	let error = '';
	let fieldError = '';

	function validate() {
		const n = Number(need_mw);
		if (need_mw === '' || need_mw === null) return 'Enter the energy you need in megawatts.';
		if (!Number.isFinite(n)) return 'That is not a number.';
		if (n <= 0) return 'The need must be greater than zero megawatts.';
		return '';
	}

	async function run() {
		error = '';
		fieldError = validate();
		if (fieldError) {
			result = null;
			return;
		}
		busy = true;
		try {
			result = await post('/calculator', { need_mw: Number(need_mw), kind }, { anonymous: true });
		} catch (err) {
			result = null;
			error = err instanceof ApiError ? err.message : 'Could not reach the calculator. Try again.';
		} finally {
			busy = false;
		}
	}

	$: if (need_mw !== undefined) fieldError = fieldError ? validate() : '';

	const fmt = (n) => new Intl.NumberFormat('en-GB').format(n);

	/* bar chart proportions, drawn from code */
	$: bars = result
		? [
				{ label: 'Modules', value: result.modules_required, max: Math.max(result.modules_required, 8) },
				{ label: 'GWh a year', value: result.annual_clean_energy_gwh, max: Math.max(result.annual_clean_energy_gwh, 4000) },
				{ label: 'Tonnes CO2 avoided', value: result.annual_co2_avoided_tonnes, max: Math.max(result.annual_co2_avoided_tonnes, 1800000) }
			]
		: [];
</script>

<svelte:head><title>Calculator | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Calculator</p>
		<h1>How many modules does your site need?</h1>
		<p class="lede">
			One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, running
			8000 hours a year. Each GWh delivered avoids 450 tonnes of carbon.
		</p>
	</div>
</section>

<section class="section-tight">
	<div class="wrap calc-grid">
		<form class="calc-form card" on:submit|preventDefault={run} novalidate>
			<h2>Your need</h2>
			<div class="field">
				<label for="need">Energy need in megawatts</label>
				<input
					id="need"
					class="input"
					type="number"
					min="1"
					step="1"
					bind:value={need_mw}
					aria-describedby="need-hint {fieldError ? 'need-err' : ''}"
					aria-invalid={fieldError ? 'true' : undefined}
					required
				/>
				<p class="hint" id="need-hint">A steady site load, not a peak.</p>
				{#if fieldError}<p class="error-text" id="need-err" role="alert">{fieldError}</p>{/if}
			</div>
			<fieldset class="field kind">
				<legend class="field-label">What kind</legend>
				<label class="radio">
					<input type="radio" bind:group={kind} value="thermal" /> Thermal (250 MW a module)
				</label>
				<label class="radio">
					<input type="radio" bind:group={kind} value="electrical" /> Electrical (100 MW a module)
				</label>
			</fieldset>
			<button class="btn btn-primary" type="submit" disabled={busy}>
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Calculate
			</button>
		</form>

		<div class="results">
			{#if error}
				<div class="banner banner-error" role="alert"><strong>Could not calculate</strong>{error}</div>
			{/if}

			{#if result}
				<div class="figures" role="status">
					<div class="fig">
						<p class="fig-label">Modules required</p>
						<p class="fig-value" data-testid="modules_required">{fmt(result.modules_required)}</p>
					</div>
					<div class="fig">
						<p class="fig-label">Annual clean energy</p>
						<p class="fig-value" data-testid="annual_clean_energy_gwh">{fmt(result.annual_clean_energy_gwh)}</p>
						<p class="fig-unit">GWh a year</p>
					</div>
					<div class="fig">
						<p class="fig-label">Carbon avoided</p>
						<p class="fig-value" data-testid="annual_co2_avoided_tonnes">{fmt(result.annual_co2_avoided_tonnes)}</p>
						<p class="fig-unit">tonnes a year</p>
					</div>
				</div>

				<div class="chart card">
					<h2 class="chart-h">The three figures</h2>
					<ul class="bars">
						{#each bars as b}
							<li>
								<span class="b-label">{b.label}</span>
								<span class="b-track" aria-hidden="true">
									<span class="b-fill" style="width:{Math.max(3, (b.value / b.max) * 100)}%"></span>
								</span>
								<span class="b-value">{fmt(b.value)}</span>
							</li>
						{/each}
					</ul>
					<p class="muted note">
						The energy figure follows the modules built, not the need asked for: {fmt(result.modules_required)}
						module{result.modules_required === 1 ? '' : 's'} at {result.kind === 'thermal' ? 250 : 100} MW
						for 8000 hours.
					</p>
				</div>
			{:else if !error}
				<div class="empty">
					<h2>No result yet</h2>
					<p>Enter a megawatt figure and choose thermal or electrical, then calculate.</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.calc-grid {
		display: grid;
		grid-template-columns: minmax(280px, 380px) 1fr;
		gap: clamp(20px, 4vw, 44px);
		align-items: start;
	}
	.calc-form h2 {
		font-size: 1.1rem;
	}
	.kind {
		border: 0;
		padding: 0;
		margin-bottom: 18px;
	}
	.radio {
		display: flex;
		align-items: center;
		gap: 9px;
		min-height: 40px;
		font-size: 0.92rem;
	}
	.figures {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 14px;
		margin-bottom: 20px;
	}
	.fig {
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
		padding: 16px;
		background: var(--paper);
	}
	.fig-label {
		margin: 0 0 6px;
		font-family: var(--font-head);
		font-size: 0.68rem;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	.fig-value {
		margin: 0;
		font-family: var(--font-head);
		font-size: clamp(1.7rem, 3.4vw, 2.5rem);
		line-height: 1;
		letter-spacing: -0.03em;
	}
	.fig-unit {
		margin: 4px 0 0;
		font-size: 0.78rem;
		color: var(--ink-muted);
	}
	.chart-h {
		font-size: 1.05rem;
	}
	.bars {
		list-style: none;
		padding: 0;
		margin: 0 0 14px;
		display: grid;
		gap: 12px;
	}
	.bars li {
		display: grid;
		grid-template-columns: 140px 1fr auto;
		align-items: center;
		gap: 12px;
		font-size: 0.86rem;
	}
	.b-label {
		color: var(--ink-muted);
		font-weight: 600;
	}
	.b-track {
		height: 14px;
		background: var(--paper-3);
		border-radius: 999px;
		overflow: hidden;
	}
	.b-fill {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.b-value {
		font-family: var(--font-mono);
		font-weight: 600;
	}
	.note {
		font-size: 0.84rem;
		margin: 0;
	}
	@media (max-width: 820px) {
		.calc-grid {
			grid-template-columns: 1fr;
		}
		.bars li {
			grid-template-columns: 110px 1fr auto;
		}
	}
</style>
