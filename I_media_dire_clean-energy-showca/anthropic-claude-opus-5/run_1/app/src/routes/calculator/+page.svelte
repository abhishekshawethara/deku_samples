<script>
	import { api, ApiError } from '$lib/api.js';

	let { data } = $props();

	let need = $state('250');
	let kind = $state('thermal');
	let result = $state(null);
	let busy = $state(false);
	let error = $state('');
	let fieldError = $state('');

	function validate() {
		// a number input hands back a number when it parses and '' when it does not
		const raw = typeof need === 'string' ? need.trim() : need;
		if (raw === '' || raw === null || raw === undefined) return 'Enter the need in megawatts.';
		const n = Number(raw);
		if (!Number.isFinite(n)) return 'That is not a number of megawatts.';
		if (n <= 0) return 'A need of zero or less is not valid; enter a figure above zero.';
		return '';
	}

	async function submit(event) {
		event.preventDefault();
		fieldError = validate();
		error = '';
		if (fieldError) {
			result = null;
			return;
		}
		busy = true;
		try {
			const { data: out } = await api('/api/calculator', {
				method: 'POST',
				body: { need_mw: Number(need), kind }
			});
			result = out;
		} catch (err) {
			result = null;
			error =
				err instanceof ApiError
					? err.message
					: 'The calculation could not be run. Try again in a moment.';
		} finally {
			busy = false;
		}
	}

	const nf = new Intl.NumberFormat('en-GB');
	const bars = $derived(
		result
			? [
					{ label: 'Modules required', value: result.modules_required, max: 12, unit: '' },
					{
						label: 'Annual clean energy',
						value: result.annual_clean_energy_gwh,
						max: 24000,
						unit: 'GWh'
					},
					{
						label: 'Annual CO2 avoided',
						value: result.annual_co2_avoided_tonnes,
						max: 10800000,
						unit: 't'
					}
				]
			: []
	);
</script>

<svelte:head><title>Calculator, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Calculator</p>
		<h1>{data.copy.lede?.heading || 'Size your site'}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap calc-grid">
		<form onsubmit={submit} novalidate>
			<div class="field">
				<label for="need">Your need in megawatts</label>
				<input
					id="need"
					type="number"
					inputmode="decimal"
					step="any"
					min="0.0001"
					bind:value={need}
					oninput={() => (fieldError = validate())}
					aria-invalid={fieldError ? 'true' : 'false'}
					aria-describedby={fieldError ? 'need-error' : 'need-hint'}
					data-testid="need-input"
				/>
				{#if fieldError}
					<p class="field-error" id="need-error">{fieldError}</p>
				{:else}
					<p class="field-hint" id="need-hint">
						A module gives 250 MW thermal, or 100 MW electrical at 40 percent conversion.
					</p>
				{/if}
			</div>

			<div class="field">
				<span class="field-label" id="kind-label">Output kind</span>
				<div class="radios" role="radiogroup" aria-labelledby="kind-label">
					{#each [{ v: 'thermal', l: 'Thermal' }, { v: 'electrical', l: 'Electrical' }] as k}
						<label class="radio">
							<input type="radio" name="kind" value={k.v} bind:group={kind} />
							<span>{k.l}</span>
						</label>
					{/each}
				</div>
			</div>

			<button class="btn btn-primary" type="submit" disabled={busy} data-testid="calc-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Calculating' : 'Calculate'}
			</button>

			{#if error}
				<p class="banner banner-error" role="alert" style="margin-top:16px">
					<strong>That did not calculate.</strong>
					{error}
				</p>
			{/if}
		</form>

		<div class="out">
			{#if result}
				<ul class="figures" data-testid="calc-results" aria-live="polite">
					<li>
						<span class="fig-label">Modules required</span>
						<span class="fig mono" data-testid="modules-required">{result.modules_required}</span>
					</li>
					<li>
						<span class="fig-label">Annual clean energy</span>
						<span class="fig mono" data-testid="annual-gwh"
							>{nf.format(result.annual_clean_energy_gwh)}</span
						>
						<span class="fig-unit">GWh</span>
					</li>
					<li>
						<span class="fig-label">Annual CO2 avoided</span>
						<span class="fig mono" data-testid="annual-co2"
							>{nf.format(result.annual_co2_avoided_tonnes)}</span
						>
						<span class="fig-unit">tonnes</span>
					</li>
				</ul>

				<div class="chart" role="img" aria-label="The three figures drawn as a bar chart">
					{#each bars as b}
						<div class="bar-row">
							<span class="bar-label">{b.label}</span>
							<span class="track">
								<span
									class="fill"
									style:width={`${Math.max(3, Math.min(100, (b.value / b.max) * 100))}%`}
								></span>
							</span>
							<span class="bar-value mono">{nf.format(b.value)}{b.unit ? ` ${b.unit}` : ''}</span>
						</div>
					{/each}
				</div>

				<p class="note muted">
					The energy figure follows the modules built, never the need asked for: {result.modules_required}
					module{result.modules_required === 1 ? '' : 's'} at {kind === 'thermal' ? 250 : 100} MW for
					8000 hours.
				</p>
			{:else}
				<div class="empty">
					<h3>No figures yet</h3>
					<p>
						Enter a need above and calculate. Try 251 MW thermal, which needs two modules and
						delivers 4000 GWh a year.
					</p>
				</div>
			{/if}

			<div class="worked-scroll">
				<table class="data worked">
					<caption>Worked rows</caption>
				<thead>
					<tr>
						<th scope="col">Need</th>
						<th scope="col">Kind</th>
						<th scope="col">Modules</th>
						<th scope="col">GWh</th>
						<th scope="col">Tonnes CO2</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr>
					<tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr>
					<tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr>
					<tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

<style>
	.head {
		padding: 40px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.calc-grid {
		display: grid;
		grid-template-columns: 0.85fr 1.15fr;
		gap: 40px;
		align-items: start;
	}
	.calc-grid > * {
		min-width: 0;
	}
	.radios {
		display: flex;
		gap: 10px;
	}
	.radio {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 8px 14px;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.95rem;
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink);
		margin: 0;
		font-weight: 500;
	}
	.radio:has(input:checked) {
		border-color: var(--accent);
		background: var(--sky);
	}
	.radio:has(input:focus-visible) {
		box-shadow: var(--focus);
	}
	.figures {
		list-style: none;
		margin: 0 0 22px;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.figures li {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 14px;
		background: var(--surface-soft);
	}
	.fig-label {
		display: block;
		font-family: var(--font-heading);
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
		margin-bottom: 6px;
	}
	.fig {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: clamp(1.5rem, 3.4vw, 2.2rem);
		line-height: 1;
	}
	.fig-unit {
		font-size: 0.8rem;
		color: var(--ink-muted);
		margin-left: 4px;
	}
	.chart {
		display: grid;
		gap: 10px;
		margin-bottom: 18px;
	}
	.bar-row {
		display: grid;
		grid-template-columns: 150px 1fr auto;
		gap: 12px;
		align-items: center;
		font-size: 0.84rem;
	}
	.bar-label {
		color: var(--ink-muted);
	}
	.track {
		height: 14px;
		background: var(--surface-grey);
		border: 1px solid var(--rule);
		border-radius: 3px;
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.bar-value {
		font-size: 0.8rem;
		white-space: nowrap;
	}
	.note {
		font-size: 0.88rem;
	}
	.worked-scroll {
		margin-top: 24px;
		overflow-x: auto;
		max-width: 100%;
	}
	.worked {
		min-width: 420px;
	}
	.worked caption {
		text-align: left;
		font-family: var(--font-heading);
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
		padding-bottom: 8px;
	}
	@media (max-width: 880px) {
		.calc-grid {
			grid-template-columns: 1fr;
		}
		.figures {
			grid-template-columns: 1fr;
		}
		.bar-row {
			grid-template-columns: 110px 1fr auto;
		}
	}
</style>
