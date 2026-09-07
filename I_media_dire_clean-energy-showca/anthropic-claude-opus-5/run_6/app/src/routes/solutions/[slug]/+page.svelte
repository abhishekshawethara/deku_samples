<script>
	import Plate from '$lib/art/Plate.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import BlockDiagram from '$lib/art/BlockDiagram.svelte';
	import { labelForOutput } from '$lib/nav.js';

	export let data;
	$: s = data.solution;
	$: blocks = s.detail
		.split('\n\n')
		.filter((p) => /^Block one|^Block/.test(p))
		.flatMap((p) => p.split(/(?=Block (?:one|two|three|four),)/))
		.map((b) => b.trim())
		.filter(Boolean);
	$: paragraphs = s.detail.split('\n\n');
</script>

<svelte:head><title>{s.industry} | Solutions | Zettajoule</title></svelte:head>

<article>
	<header class="head">
		<div class="wrap">
			<p class="crumbs"><a href="/solutions">Solutions</a> <span aria-hidden="true">/</span> {s.industry}</p>
			<h1>{s.title}</h1>
			<p class="lede">{s.summary}</p>
			<ul class="tags" aria-label="Attributes">
				<li><span>Output</span>{labelForOutput(s.output_kind)}</li>
				<li><span>Temperature</span>{s.temperature_band}</li>
				<li><span>Deployment</span>{s.deployment}</li>
				<li><span>Modules</span>{s.module_count}</li>
			</ul>
			<div class="actions">
				<SaveButton slug={s.slug} />
				<a class="btn btn-primary" href="/contact?topic=Solutions">Enquire about {s.industry}</a>
				<a class="btn" href="/contact">Contact</a>
			</div>
		</div>
	</header>

	<div class="wrap plate-row">
		<Plate seed={s.slug} ratio="21 / 8" label="Generated plate for {s.industry}" />
	</div>

	<section class="section-tight">
		<div class="wrap two">
			<div class="prose">
				<h2>What the reactor does here</h2>
				{#each paragraphs as p}
					<p>{p}</p>
				{/each}
			</div>
			<aside class="side">
				<h2 class="side-h">Block by block</h2>
				<BlockDiagram outputKind={s.output_kind} moduleCount={s.module_count} />
				<ol class="block-list">
					{#each blocks as b}
						<li>{b}</li>
					{/each}
				</ol>
				<div class="side-card card">
					<h3>Ready to talk?</h3>
					<p class="muted">
						Tell us the load and the temperature you need and we will come back with a module
						count.
					</p>
					<a class="btn btn-primary btn-sm" href="/calculator">Size it yourself</a>
				</div>
			</aside>
		</div>
	</section>
</article>

<style>
	.head {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(30px, 5vw, 56px);
	}
	.crumbs {
		font-size: 0.85rem;
		color: var(--ink-muted);
		margin-bottom: 10px;
	}
	.tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		padding: 0;
		margin: 18px 0;
	}
	.tags li {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--rule-strong);
		border-radius: var(--r-md);
		background: var(--paper);
		padding: 7px 12px;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.tags span {
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
		font-family: var(--font-head);
	}
	.actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: center;
	}
	.plate-row {
		margin-top: 26px;
	}
	.two {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: start;
	}
	.prose p {
		white-space: pre-line;
	}
	.side-h {
		font-size: 1.15rem;
	}
	.block-list {
		margin: 16px 0 22px;
		padding-left: 18px;
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.block-list li {
		margin-bottom: 10px;
	}
	.side-card h3 {
		font-size: 1rem;
	}
	@media (max-width: 860px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
