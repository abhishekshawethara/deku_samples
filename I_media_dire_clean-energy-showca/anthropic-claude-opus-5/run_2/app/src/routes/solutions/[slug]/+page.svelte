<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api.js';
	import { token, saveToken } from '$lib/session.js';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';

	export let data;
	$: s = data.solution;

	let savedId = null;
	let saved = false;
	let enquiryOpen = false;

	async function loadSaves() {
		try {
			let rows = [];
			if ($token) rows = await api('/api/saves', { token: $token });
			else if ($saveToken) rows = await api(`/api/saves?save_token=${encodeURIComponent($saveToken)}`);
			const hit = rows.find((r) => r.slug === s.slug);
			saved = Boolean(hit);
			savedId = hit ? hit.id : null;
		} catch {
			saved = false;
		}
	}
	onMount(loadSaves);

	$: blocks = [
		{
			title: 'Heat leaves the core',
			body: `Helium leaves the core at 750 degrees Celsius and carries ${s.module_count * 250} MW thermal across ${s.module_count} module${s.module_count > 1 ? 's' : ''}.`
		},
		{
			title: 'The transfer',
			body: `A heat exchanger hands that duty to the ${s.industry.toLowerCase()} process in the ${s.temperature_band} band, matched to the existing plant.`
		},
		{
			title: 'The output',
			body: `The site takes ${s.output_kind.replace(/-/g, ' ')} at the fence, metered and billed by the unit, on a ${s.deployment.replace('-', ' ')} arrangement.`
		}
	];
</script>

<svelte:head><title>{s.industry}, Zettajoule solutions</title></svelte:head>

<article>
	<section class="section-tight lead">
		<div class="wrap">
			<p class="eyebrow"><a href="/solutions">Solutions</a> / {s.industry}</p>
			<h1>{s.title}</h1>
			<p class="lede">{s.summary}</p>
			<div class="row actions">
				<SaveButton slug={s.slug} {saved} {savedId} on:changed={(e) => ((saved = e.detail.saved), (savedId = e.detail.id))} />
				<button type="button" class="btn" on:click={() => (enquiryOpen = true)}>Enquire about this</button>
				<a class="btn btn-secondary" href="/contact">Contact the team</a>
			</div>
		</div>
	</section>

	<section class="section-tight">
		<div class="wrap">
			<Plate seed={s.slug} ratio="21 / 6" kind="industry" label={`Generated plate for ${s.industry}`} />
			<dl class="specs">
				<div><dt>Output</dt><dd>{s.output_kind}</dd></div>
				<div><dt>Temperature band</dt><dd>{s.temperature_band}</dd></div>
				<div><dt>Deployment</dt><dd>{s.deployment}</dd></div>
				<div><dt>Modules</dt><dd>{s.module_count}</dd></div>
			</dl>
		</div>
	</section>

	<section class="section">
		<div class="wrap detail-grid">
			<div>
				<h2>What the reactor does for {s.industry.toLowerCase()}</h2>
				{#each s.detail.split('\n\n') as para}<p class="lede">{para}</p>{/each}
			</div>
			<ol class="blocks">
				{#each blocks as b, i}
					<li>
						<svg viewBox="0 0 120 70" class="block-diagram" role="img" aria-label={`Diagram, ${b.title}`}>
							<rect x="4" y="16" width="42" height="38" rx="5" fill="none" stroke="var(--accent)" stroke-width="1.3" />
							<rect x="74" y="16" width="42" height="38" rx="5" fill="none" stroke="var(--accent)" stroke-width="1.3" />
							<path d="M46 35 H74" stroke="var(--accent)" stroke-width="1.3" fill="none" />
							<path d="M68 30 L74 35 L68 40" stroke="var(--accent)" stroke-width="1.3" fill="none" />
							<text x="25" y="38" text-anchor="middle" font-size="9" fill="var(--ink-muted)">{i + 1}</text>
							<text x="95" y="38" text-anchor="middle" font-size="9" fill="var(--ink-muted)">{i + 2}</text>
						</svg>
						<div>
							<h3>{b.title}</h3>
							<p class="dense">{b.body}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</section>
</article>

<Modal open={enquiryOpen} title={`Enquire about ${s.industry}`} on:close={() => (enquiryOpen = false)}>
	<EnquiryForm
		defaultTopic="Solutions"
		prefillMessage={`I would like to know more about ${s.title} for our site.`}
		on:sent={() => {}}
	/>
</Modal>

<style>
	.lead {
		border-bottom: 1px solid var(--rule);
	}
	.actions {
		margin-top: 16px;
	}
	.specs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0;
		margin: 24px 0 0;
		border-top: 1px solid var(--rule-strong);
	}
	.specs div {
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
	}
	.specs dt {
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	.specs dd {
		margin: 4px 0 0;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.1rem;
	}
	.detail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
		align-items: start;
	}
	.blocks {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.blocks li {
		display: flex;
		gap: 14px;
		align-items: center;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 14px;
	}
	.block-diagram {
		width: 118px;
		flex: none;
	}
	.blocks h3 {
		font-size: 1.02rem;
		margin-bottom: 4px;
	}
	.blocks p {
		margin: 0;
		color: var(--ink-muted);
	}
</style>
