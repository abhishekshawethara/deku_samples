<script>
	// The calculator turns a site's need into a module count, the clean energy
	// that delivers and the carbon it avoids. The arithmetic is done on the
	// server; the bar chart is drawn from the numbers it returns.
	import { api, ApiError } from '$lib/api.js';

	let need = $state('251');
	let kind = $state('thermal');
	let result = $state(null);
	let failure = $state('');
	let busy = $state(false);

	const numberFmt = new Intl.NumberFormat('en-GB');

	async function submit(event) {
		event?.preventDefault();
		failure = '';
		const value = Number(need);
		if (!Number.isFinite(value) || value <= 0) {
			failure = 'Enter a need in megawatts greater than zero.';
			result = null;
			return;
		}
		busy = true;
		try {
			const { data } = await api('/calculator', {
				method: 'POST',
				auth: false,
				body: { need_mw: value, kind }
			});
			result = data;
		} catch (e) {
			failure = e instanceof ApiError ? e.message : 'Could not work that out just now.';
			result = null;
		} finally {
			busy = false;
		}
	}

	const bars = $derived(
		result
			? [
					{
						label: 'Modules required',
						value: result.modules_required,
						display: numberFmt.format(result.modules_required),
						max: Math.max(result.modules_required, 8),
						unit: 'modules'
					},
					{
						label: 'Annual clean energy',
						value: result.annual_clean_energy_gwh,
						display: numberFmt.format(result.annual_clean_energy_gwh),
						max: Math.max(result.annual_clean_energy_gwh, 4000),
						unit: 'GWh a year'
					},
					{
						label: 'Annual carbon avoided',
						value: result.annual_co2_avoided_tonnes,
						display: numberFmt.format(result.annual_co2_avoided_tonnes),
						max: Math.max(result.annual_co2_avoided_tonnes, 1800000),
						unit: 'tonnes a year'
					}
				]
			: []
	);
</script>

<svelte:head><title>Calculator · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Calculator</p>
		<h1>Size a site</h1>
		<p class="lede">
			Give a need in megawatts and what you want out of it. Modules round up to a whole module, and
			the energy figure follows the modules built rather than the need asked for.
		</p>
	</div>
</section>

<section class="wrap calc">
	<form class="calc__form card card--pad" onsubmit={submit} novalidate>
		{#if failure}
			<div class="banner banner--fail" role="alert">
				<strong>Cannot calculate</strong>
				<span>{failure}</span>
			</div>
		{/if}

		<div class="field">
			<label for="need">Need in megawatts</label>
			<input
				id="need"
				name="need_mw"
				type="number"
				min="1"
				step="1"
				bind:value={need}
				aria-describedby="need-hint"
			/>
			<p class="field__hint" id="need-hint">A need of zero or less is not valid.</p>
		</div>

		<fieldset class="field kinds">
			<legend>What you want out</legend>
			{#each [['thermal', 'Thermal, 250 MW a module'], ['electrical', 'Electrical, 100 MW a module']] as [value, label]}
				<label class="kind">
					<input type="radio" name="kind" {value} bind:group={kind} />
					<span>{label}</span>
				</label>
			{/each}
		</fieldset>

		<button class="btn btn--block" type="submit" disabled={busy}>
			{#if busy}
				<span class="spinner" aria-hidden="true"></span> Working
			{:else}
				Calculate
			{/if}
		</button>
	</form>

	<div class="calc__out">
		{#if result}
			<div class="figures" role="status">
				<div class="figure">
					<p class="figure__label">Modules required</p>
					<p class="figure__value" data-field="modules_required">{result.modules_required}</p>
				</div>
				<div class="figure">
					<p class="figure__label">Annual clean energy</p>
					<p class="figure__value" data-field="annual_clean_energy_gwh">
						{numberFmt.format(result.annual_clean_energy_gwh)}<span class="figure__unit">GWh</span>
					</p>
				</div>
				<div class="figure">
					<p class="figure__label">Annual carbon avoided</p>
					<p class="figure__value" data-field="annual_co2_avoided_tonnes">
						{numberFmt.format(result.annual_co2_avoided_tonnes)}<span class="figure__unit"
							>tonnes</span
						>
					</p>
				</div>
			</div>

			<!-- the bar chart beside the three figures -->
			<div class="chart" aria-hidden="true">
				{#each bars as b}
					<div class="chart__row">
						<span class="chart__label">{b.label}</span>
						<span class="chart__track">
							<span class="chart__fill" style:width={`${Math.min(100, (b.value / b.max) * 100)}%`}
							></span>
						</span>
						<span class="chart__value">{b.display}</span>
					</div>
				{/each}
			</div>

			<!-- the plain written version of the same figures -->
			<table class="data">
				<caption class="visually-hidden">The calculated result, as a table</caption>
				<tbody>
					<tr><th scope="row">Modules required</th><td>{result.modules_required}</td></tr>
					<tr>
						<th scope="row">Annual clean energy</th>
						<td>{numberFmt.format(result.annual_clean_energy_gwh)} GWh</td>
					</tr>
					<tr>
						<th scope="row">Annual carbon avoided</th>
						<td>{numberFmt.format(result.annual_co2_avoided_tonnes)} tonnes</td>
					</tr>
				</tbody>
			</table>

			<p class="muted small">
				{result.modules_required}
				{result.modules_required === 1 ? 'module' : 'modules'} at {result.per_module_mw} MW
				{result.kind}, running 8000 hours a year, avoiding 450 tonnes of carbon for every GWh
				delivered.
			</p>
		{:else}
			<div class="empty-state">
				<h2>No figures yet</h2>
				<p>Enter a need in megawatts and press Calculate to see the three figures.</p>
			</div>
		{/if}

		<div class="worked">
			<h2>The arithmetic</h2>
			<table class="data">
				<thead>
					<tr>
						<th scope="col">Need</th>
						<th scope="col">Kind</th>
						<th scope="col">Modules</th>
						<th scope="col">GWh</th>
						<th scope="col">Tonnes</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr>
					<tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr>
					<tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr>
					<tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr>
				</tbody>
			</table>
			<p class="muted small">
				One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs
				8000 hours a year.
			</p>
		</div>
	</div>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.calc {
		display: grid;
		grid-template-columns: minmax(280px, 380px) 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		padding-bottom: 4rem;
		align-items: start;
	}
	.calc__form {
		position: sticky;
		top: calc(var(--bar-h) + 1rem);
	}
	.kinds {
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
		padding: 0.75rem;
	}
	.kinds legend {
		font-weight: 600;
		font-size: 0.86rem;
		padding-inline: 0.35rem;
	}
	.kind {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 400;
		min-height: 40px;
		margin-bottom: 0;
	}
	.kind input {
		width: auto;
		min-height: auto;
	}
	.figures {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.figure {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
		background: var(--paper);
	}
	.figure__label {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-muted);
		margin: 0 0 0.35rem;
	}
	.figure__value {
		font-family: var(--font-head);
		font-size: clamp(1.5rem, 3.4vw, 2.2rem);
		margin: 0;
		line-height: 1;
	}
	.figure__unit {
		display: block;
		font-family: var(--font-body);
		font-size: 0.78rem;
		font-weight: 400;
		color: var(--ink-muted);
		margin-top: 0.25rem;
	}
	.chart {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.chart__row {
		display: grid;
		grid-template-columns: 150px 1fr 90px;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.82rem;
	}
	.chart__track {
		height: 14px;
		background: var(--paper-3);
		border-radius: 3px;
		overflow: hidden;
	}
	.chart__fill {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.chart__value {
		font-family: var(--font-mono);
		text-align: right;
	}
	.worked {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
	}
	.small {
		font-size: 0.84rem;
	}
	@media (max-width: 860px) {
		.calc {
			grid-template-columns: 1fr;
		}
		.calc__form {
			position: static;
		}
		.chart__row {
			grid-template-columns: 110px 1fr 76px;
		}
	}
</style>
