<script>
	import { api, ApiError } from '$lib/api.js';

	let needMw = 251;
	let kind = 'thermal';
	let busy = false;
	let result = null;
	let banner = null;

	$: clientError =
		needMw === '' || needMw === null || !Number.isFinite(Number(needMw))
			? 'Enter the need in megawatts.'
			: Number(needMw) <= 0
				? 'The need must be greater than zero.'
				: '';

	async function run() {
		banner = null;
		if (clientError) {
			banner = { kind: 'fail', title: 'Check the figure', text: clientError };
			result = null;
			return;
		}
		busy = true;
		try {
			result = await api('/calculator', { method: 'POST', body: { need_mw: Number(needMw), kind } });
		} catch (err) {
			result = null;
			banner = {
				kind: 'fail',
				title: 'That could not be calculated',
				text: err instanceof ApiError ? err.message : 'The server could not be reached.'
			};
		} finally {
			busy = false;
		}
	}

	const fmt = (n) => new Intl.NumberFormat('en-GB').format(n);

	$: bars = result
		? [
				{ label: 'Modules required', value: result.modules_required, max: Math.max(result.modules_required, 1), unit: '' },
				{ label: 'Clean energy a year', value: result.annual_clean_energy_gwh, max: 8000, unit: 'GWh' },
				{ label: 'Carbon avoided a year', value: result.annual_co2_avoided_tonnes, max: 3600000, unit: 't' }
			]
		: [];
</script>

<svelte:head><title>Module calculator, Zettajoule</title></svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Calculator</p>
	<h1>How many modules does your site need?</h1>
	<p class="lede">
		One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs 8000 hours a
		year. Each GWh delivered avoids 450 tonnes of carbon. The energy figure follows the modules built, not the
		need asked for.
	</p>
</section>

<section class="wrap section--tight">
	<div class="calc">
		<form class="calc__form" on:submit|preventDefault={run} novalidate>
			<div class="field">
				<label for="need">Site need, megawatts</label>
				<input
					id="need"
					type="number"
					min="1"
					step="1"
					bind:value={needMw}
					aria-invalid={clientError ? 'true' : 'false'}
					aria-describedby="need-hint"
					data-testid="calc-need"
				/>
				<p class="field__hint" id="need-hint">A whole number greater than zero.</p>
				{#if clientError}<p class="field__error">{clientError}</p>{/if}
			</div>

			<fieldset class="field">
				<legend class="label">Output kind</legend>
				<div class="radios">
					<label class="radio"><input type="radio" bind:group={kind} value="thermal" /> Thermal, 250 MW a module</label>
					<label class="radio"><input type="radio" bind:group={kind} value="electrical" /> Electrical, 100 MW a module</label>
				</div>
			</fieldset>

			<button class="btn" type="submit" disabled={busy} data-testid="calc-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				Calculate
			</button>
		</form>

		<div class="calc__out">
			{#if banner}
				<div class="banner banner--fail" role="alert" data-testid="calc-banner">
					<span class="banner__title">{banner.title}</span>{banner.text}
				</div>
			{/if}

			{#if result}
				<dl class="figures" data-testid="calc-result">
					<div>
						<dt>Modules required</dt>
						<dd data-testid="modules-required">{fmt(result.modules_required)}</dd>
					</div>
					<div>
						<dt>Annual clean energy</dt>
						<dd data-testid="annual-gwh">{fmt(result.annual_clean_energy_gwh)} <span>GWh</span></dd>
					</div>
					<div>
						<dt>Annual carbon avoided</dt>
						<dd data-testid="annual-co2">{fmt(result.annual_co2_avoided_tonnes)} <span>tonnes</span></dd>
					</div>
				</dl>

				<div class="chart" role="img" aria-label="Bar chart of the three figures, also given as text above">
					{#each bars as bar}
						<div class="chart__row">
							<span class="chart__label">{bar.label}</span>
							<span class="chart__track">
								<span class="chart__fill" style="width:{Math.min(100, (bar.value / bar.max) * 100)}%"></span>
							</span>
							<span class="chart__value">{fmt(bar.value)} {bar.unit}</span>
						</div>
					{/each}
				</div>
			{:else if !banner}
				<div class="empty">
					<p><strong>No figures yet.</strong></p>
					<p>Enter a need and press Calculate.</p>
				</div>
			{/if}

			<details class="worked">
				<summary>The worked arithmetic</summary>
				<ol>
					<li>Modules required is the need divided by the per-module output, rounded up to a whole module.</li>
					<li>Annual clean energy is modules times per-module megawatts times 8000 hours, divided by 1000.</li>
					<li>Carbon avoided is that energy figure times 450 tonnes a GWh.</li>
				</ol>
				<table>
					<caption class="visually-hidden">Worked rows</caption>
					<thead>
						<tr><th>Need</th><th>Kind</th><th>Modules</th><th>GWh</th><th>Tonnes</th></tr>
					</thead>
					<tbody>
						<tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr>
						<tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr>
						<tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr>
						<tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr>
					</tbody>
				</table>
			</details>
		</div>
	</div>
</section>

<style>
	.calc {
		display: grid;
		grid-template-columns: minmax(260px, 360px) 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	.calc__form,
	.calc__out {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1.1rem;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0 0 1rem;
	}
	.radios {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.radio {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 400;
		font-size: 0.92rem;
		min-height: 40px;
		margin: 0;
	}
	.figures {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin: 0 0 1.25rem;
	}
	.figures dt {
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
		font-family: var(--font-head);
	}
	.figures dd {
		margin: 0.25rem 0 0;
		font-family: var(--font-head);
		font-size: clamp(1.5rem, 3.5vw, 2.2rem);
		line-height: 1.1;
	}
	.figures dd span {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.chart__row {
		display: grid;
		grid-template-columns: 11rem 1fr 9rem;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.5rem;
		font-size: 0.82rem;
	}
	.chart__label {
		color: var(--ink-muted);
	}
	.chart__track {
		height: 14px;
		background: var(--paper-grey);
		border: 1px solid var(--rule);
		border-radius: 999px;
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
		margin-top: 1.25rem;
		border-top: 1px solid var(--rule);
		padding-top: 0.9rem;
	}
	.worked summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.worked ol {
		font-size: 0.88rem;
		color: var(--ink-muted);
		padding-left: 1.2rem;
	}
	@media (max-width: 800px) {
		.calc {
			grid-template-columns: 1fr;
		}
		.chart__row {
			grid-template-columns: 1fr;
			gap: 0.2rem;
		}
		.chart__value {
			text-align: left;
		}
	}
</style>
