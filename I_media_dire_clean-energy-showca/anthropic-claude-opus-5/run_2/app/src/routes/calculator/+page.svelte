<script>
	import { api } from '$lib/api.js';

	let need_mw = 251;
	let kind = 'thermal';
	let result = null;
	let busy = false;
	let banner = null;

	async function calculate() {
		banner = null;
		const need = Number(need_mw);
		if (!Number.isFinite(need) || need <= 0) {
			banner = { kind: 'error', text: 'Enter a need in megawatts greater than zero.' };
			result = null;
			return;
		}
		busy = true;
		try {
			result = await api('/api/calculator', { method: 'POST', body: { need_mw: need, kind } });
		} catch (err) {
			result = null;
			banner = { kind: 'error', text: err.message || 'That could not be worked out. Try again.' };
		} finally {
			busy = false;
		}
	}

	function fmt(n) {
		return new Intl.NumberFormat('en-GB').format(n);
	}

	$: bars = result
		? [
				{ label: 'Modules required', value: result.modules_required, max: Math.max(result.modules_required, 1), unit: 'modules' },
				{ label: 'Annual clean energy', value: result.annual_clean_energy_gwh, max: result.annual_clean_energy_gwh, unit: 'GWh' },
				{ label: 'Carbon avoided', value: result.annual_co2_avoided_tonnes, max: result.annual_co2_avoided_tonnes, unit: 'tonnes' }
			]
		: [];
</script>

<svelte:head><title>Calculator, Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap calc">
		<p class="eyebrow">Calculator</p>
		<h1>How many modules does your site need?</h1>
		<p class="lede">
			One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs 8000 hours a
			year. Each GWh delivered avoids 450 tonnes of carbon. Modules round up, because half a module delivers
			nothing.
		</p>

		<div class="calc-grid">
			<form class="card" on:submit|preventDefault={calculate} novalidate>
				<div class="field">
					<label for="c-need">Your need, in megawatts</label>
					<input id="c-need" type="number" step="1" bind:value={need_mw} data-testid="calc-need" />
					<p class="field-hint">A need of zero or less is not valid.</p>
				</div>
				<div class="field">
					<label for="c-kind">Kind</label>
					<select id="c-kind" bind:value={kind} data-testid="calc-kind">
						<option value="thermal">Thermal, 250 MW a module</option>
						<option value="electrical">Electrical, 100 MW a module</option>
					</select>
				</div>
				<button class="btn" type="submit" disabled={busy} data-testid="calc-submit">
					{busy ? 'Working it out' : 'Work it out'}
				</button>
			</form>

			<div>
				{#if banner}
					<div class="banner banner-error" role="alert"><strong>Not calculated.</strong> {banner.text}</div>
				{/if}
				{#if result}
					<dl class="figures" data-testid="calc-results">
						<div>
							<dt>modules_required</dt>
							<dd data-testid="calc-modules">{fmt(result.modules_required)}</dd>
						</div>
						<div>
							<dt>annual_clean_energy_gwh</dt>
							<dd data-testid="calc-energy">{fmt(result.annual_clean_energy_gwh)}</dd>
						</div>
						<div>
							<dt>annual_co2_avoided_tonnes</dt>
							<dd data-testid="calc-co2">{fmt(result.annual_co2_avoided_tonnes)}</dd>
						</div>
					</dl>
					<div class="chart" role="img" aria-label={`Modules required ${result.modules_required}, annual clean energy ${result.annual_clean_energy_gwh} gigawatt hours, carbon avoided ${result.annual_co2_avoided_tonnes} tonnes`}>
						{#each bars as b}
							<div class="bar-row">
								<span class="bar-label dense">{b.label}</span>
								<div class="bar"><span style={`width:${b.value > 0 ? 100 : 0}%`}>{fmt(b.value)} {b.unit}</span></div>
							</div>
						{/each}
					</div>
					<p class="dense note">
						The energy figure follows the modules built rather than the need asked for: {result.modules_required}
						module{result.modules_required === 1 ? '' : 's'} deliver {fmt(result.annual_clean_energy_gwh)} GWh a year,
						avoiding {fmt(result.annual_co2_avoided_tonnes)} tonnes of carbon.
					</p>
				{:else if !banner}
					<div class="empty-state">
						<h3>No figures yet</h3>
						<p>Enter a need and a kind, then work it out. Try 251 MW thermal.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.calc {
		max-width: 940px;
	}
	.calc-grid {
		display: grid;
		grid-template-columns: minmax(280px, 360px) 1fr;
		gap: 28px;
		align-items: start;
		margin-top: 24px;
	}
	.figures {
		display: grid;
		gap: 0;
		margin: 0 0 20px;
		border-top: 1px solid var(--rule-strong);
	}
	.figures div {
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 16px;
	}
	.figures dt {
		font-family: var(--font-mono);
		font-size: 0.86rem;
		color: var(--ink-muted);
	}
	.figures dd {
		margin: 0;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: clamp(1.3rem, 3vw, 2rem);
	}
	.chart {
		display: grid;
		gap: 10px;
	}
	.bar-row {
		display: grid;
		grid-template-columns: minmax(120px, 170px) 1fr;
		gap: 12px;
		align-items: center;
	}
	.bar {
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		background: var(--ground-soft);
		height: 36px;
	}
	.bar span {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		height: 100%;
		padding: 0 10px;
		background: var(--sky-deep);
		font-family: var(--font-mono);
		font-size: 0.82rem;
		border-radius: var(--radius-sm);
	}
	.note {
		color: var(--ink-muted);
		margin-top: 14px;
	}
	@media (max-width: 760px) {
		.calc-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
