<script>
	import Plate from '$lib/components/Plate.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';

	export let data;
	$: s = data.solution;

	let enquiryOpen = false;

	const BLOCKS = [
		{
			title: 'The energy arrives',
			body: 'Helium leaves the core at 750 degrees Celsius and crosses a heat exchanger into your process loop. Nothing burns on your site and the primary circuit stays sealed.'
		},
		{
			title: 'The process takes it',
			body: 'The energy is delivered at the grade the process already expects, so the existing equipment keeps running against the curves it was designed for.'
		},
		{
			title: 'We carry the machine',
			body: 'Zettajoule owns the modules, holds the licence, buys the fuel and staffs the control room with crews from our own Operations Academy.'
		},
		{
			title: 'You buy the energy',
			body: 'A long supply contract at a price that does not move with a fuel market. Growth is met by adding a module, not by rebuilding the site.'
		}
	];
</script>

<svelte:head>
	<title>{s.industry}, Zettajoule solutions</title>
	<meta name="description" content={s.summary} />
</svelte:head>

<article>
	<section class="section section--tight wrap">
		<p class="eyebrow"><a href="/solutions">Solutions</a> / {s.industry}</p>
		<h1>{s.title}</h1>
		<p class="lede">{s.summary}</p>
		<div class="actions">
			<SaveButton slug={s.slug} />
			<button class="btn btn--ghost" type="button" on:click={() => (enquiryOpen = true)}>Enquire about this</button>
			<a class="btn btn--ghost" href="/contact">Get in Touch</a>
		</div>
	</section>

	<section class="wrap">
		<Plate seed={s.slug} label="Generated plate for {s.industry}" ratio="21 / 9" />
		<dl class="spec">
			<div><dt>Industry</dt><dd>{s.industry}</dd></div>
			<div><dt>Output</dt><dd>{s.output_kind}</dd></div>
			<div><dt>Temperature band</dt><dd>{s.temperature_band}</dd></div>
			<div><dt>Deployment</dt><dd>{s.deployment}</dd></div>
			<div><dt>Modules</dt><dd>{s.module_count}</dd></div>
		</dl>
	</section>

	<section class="section wrap">
		<h2>What the reactor does for {s.industry.toLowerCase()}</h2>
		<p class="detail">{s.detail}</p>
	</section>

	<section class="section wrap" aria-labelledby="blocks-heading">
		<h2 id="blocks-heading">Block by block</h2>
		<div class="grid grid--2 blocks">
			{#each BLOCKS as block, i}
				<div class="block">
					<svg class="block__dia" viewBox="0 0 200 90" role="img" aria-label="Line diagram for step {i + 1}" focusable="false">
						<g fill="none" stroke="var(--navy)" stroke-width="1.4">
							<rect x="8" y="24" width="52" height="42" rx="4" />
							<rect x="140" y="24" width="52" height="42" rx="4" />
							<path d="M60 45 h80" stroke="var(--accent)" stroke-width="1.8" />
							<path d="M132 39 l8 6 l-8 6" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
							<circle cx="100" cy="45" r="9" stroke="var(--accent)" />
							<text x="94" y="49" font-size="10" fill="var(--ink-muted)" stroke="none" font-family="var(--font-mono)">{i + 1}</text>
						</g>
					</svg>
					<h3>{block.title}</h3>
					<p>{block.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="section wrap">
		<h2>Other industries</h2>
		<div class="grid grid--3">
			{#each data.related as r}
				<a class="card related" href="/solutions/{r.slug}">
					<strong>{r.industry}</strong>
					<span>{r.title}</span>
				</a>
			{/each}
		</div>
	</section>
</article>

<Modal open={enquiryOpen} title="Enquire about {s.industry}" on:close={() => (enquiryOpen = false)}>
	<EnquiryForm
		topic="Solutions"
		prefill={`I am interested in the ${s.industry} solution (${s.slug}).`}
		on:sent={() => {}}
	/>
</Modal>

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 1.25rem;
	}
	.spec {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0;
		margin: 1.5rem 0 0;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.spec > div {
		padding: 0.8rem 1rem;
		border-right: 1px solid var(--rule);
	}
	.spec > div:last-child {
		border-right: 0;
	}
	dt {
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
		font-family: var(--font-head);
	}
	dd {
		margin: 0.25rem 0 0;
		font-weight: 600;
	}
	.detail {
		font-size: 1.05rem;
		max-width: 70ch;
	}
	.block {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
	}
	.block__dia {
		width: 100%;
		height: auto;
		max-width: 220px;
		margin-bottom: 0.5rem;
	}
	.block h3 {
		margin-bottom: 0.35rem;
	}
	.block p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.related {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-decoration: none;
		color: var(--ink);
	}
	.related:hover {
		border-color: var(--accent);
	}
	.related span {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
</style>
