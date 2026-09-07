<script>
	import Plate from '$lib/Plate.svelte';
	import SaveButton from '$lib/SaveButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import EnquiryForm from '$lib/EnquiryForm.svelte';
	import { browser } from '$app/environment';
	import { refreshSaves } from '$lib/saves.js';

	let { data } = $props();
	const s = $derived(data.solution);

	let banner = $state(null);
	let enquiryOpen = $state(false);

	$effect(() => {
		if (browser) refreshSaves();
	});

	// The blocks explain, for this industry exactly, what the reactor does for
	// it. Each is drawn as a clean line diagram rather than a picture.
	const BLOCKS = $derived([
		{
			title: 'The module',
			body: `${s.module_count} ${s.module_count === 1 ? 'module' : 'modules'}, ${s.deployment.replace('-', ' ')}, each delivering 250 MW thermal.`
		},
		{
			title: 'The heat',
			body: `Helium leaves the core and carries heat out in the ${s.temperature_band} band, which is what this process needs.`
		},
		{
			title: 'The output',
			body: `Delivered as ${s.output_kind.replaceAll('-', ' ')}, into the plant you already run.`
		},
		{
			title: 'The arrangement',
			body: 'Zettajoule owns the modules, runs them and staffs them. You buy the energy by the unit.'
		}
	]);
</script>

<svelte:head>
	<title>{s.industry} · Solutions · Zettajoule</title>
	<meta name="description" content={s.summary} />
</svelte:head>

<article class="sol-page">
	<header class="sol-head">
		<div class="wrap">
			<p class="eyebrow"><a href="/solutions">Solutions</a> / {s.industry}</p>
			<h1>{s.title}</h1>
			<p class="lede">{s.summary}</p>
			<ul class="chips">
				<li>{s.output_kind}</li>
				<li>{s.temperature_band}</li>
				<li>{s.deployment}</li>
				<li>{s.module_count} {s.module_count === 1 ? 'module' : 'modules'}</li>
			</ul>

			{#if banner}
				<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
					<strong>{banner.kind === 'ok' ? 'Done' : 'Not done'}</strong>
					<span>{banner.text}</span>
				</div>
			{/if}

			<div class="row">
				<SaveButton slug={s.slug} onmessage={(m) => (banner = m)} />
				<button class="btn btn--ghost" type="button" onclick={() => (enquiryOpen = true)}>
					Enquire about {s.industry}
				</button>
				<a class="btn btn--ghost" href="/contact">Contact</a>
			</div>
		</div>
	</header>

	<div class="wrap sol-body">
		<div class="sol-body__text">
			<h2>What the reactor does here</h2>
			{#each s.detail.split('\n\n') as para}
				<p>{para}</p>
			{/each}
		</div>
		<aside class="sol-body__plate">
			<Plate seed={s.slug} ratio="4 / 3" label={`Generated plate for ${s.industry}`} />
			<p class="muted plate-note">
				Every plate on this site is drawn from code as a gradient, so it stays sharp at any size and
				nothing has to be downloaded.
			</p>
		</aside>
	</div>

	<section class="wrap blocks" aria-labelledby="blocks-head">
		<h2 id="blocks-head">Block by block</h2>
		<ol class="blocks__grid">
			{#each BLOCKS as b, i}
				<li class="block">
					<svg class="block__dia" viewBox="0 0 120 70" aria-hidden="true" focusable="false">
						<rect
							x="6"
							y="14"
							width="42"
							height="42"
							rx="4"
							fill="none"
							stroke="var(--ink)"
							stroke-width="1.4"
						/>
						<path
							d="M48 35 H74"
							stroke="var(--accent)"
							stroke-width="1.6"
							stroke-dasharray="4 3"
						/>
						<path d="M68 30 L74 35 L68 40" fill="none" stroke="var(--accent)" stroke-width="1.6" />
						<rect
							x="74"
							y="20"
							width="40"
							height="30"
							rx="4"
							fill="none"
							stroke="var(--ink)"
							stroke-width="1.4"
						/>
						<text x="27" y="39" text-anchor="middle" font-size="13" fill="var(--ink)">{i + 1}</text>
					</svg>
					<h3>{b.title}</h3>
					<p>{b.body}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section class="wrap section--tight">
		<a class="btn btn--ghost" href="/solutions">Back to the explorer</a>
		<a class="btn btn--ghost" href="/compare">Compare saved solutions</a>
		<a class="btn btn--ghost" href="/calculator">Size this site</a>
	</section>
</article>

<Modal
	open={enquiryOpen}
	title={`Enquire about ${s.industry}`}
	onclose={() => (enquiryOpen = false)}
>
	<EnquiryForm
		topic="Solutions"
		presetMessage={`I am interested in ${s.industry.toLowerCase()} (${s.title}). `}
		onsent={(enq) => {
			banner = { kind: 'ok', text: `Enquiry sent. Your reference is ${enq.reference}.` };
			enquiryOpen = false;
		}}
	/>
</Modal>

<style>
	.sol-head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 2rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0 0 1.25rem;
		padding: 0;
	}
	.chips li {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: var(--paper);
	}
	.sol-body {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		padding-block: 2.5rem;
	}
	.plate-note {
		font-size: 0.8rem;
		margin-top: 0.75rem;
	}
	.blocks {
		padding-bottom: 2.5rem;
	}
	.blocks__grid {
		list-style: none;
		margin: 1.25rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: 1rem;
	}
	.block {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
	}
	.block__dia {
		width: 100%;
		height: 64px;
		margin-bottom: 0.5rem;
	}
	.block h3 {
		font-size: 1rem;
		margin-bottom: 0.3rem;
	}
	.block p {
		font-size: 0.88rem;
		color: var(--ink-muted);
		margin: 0;
	}
	@media (max-width: 820px) {
		.sol-body {
			grid-template-columns: 1fr;
		}
	}
</style>
