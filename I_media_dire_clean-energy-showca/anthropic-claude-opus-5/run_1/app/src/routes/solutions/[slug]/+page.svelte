<script>
	import Plate from '$lib/components/Plate.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import Reveal from '$lib/components/Reveal.svelte';

	let { data } = $props();
	const s = $derived(data.solution);

	const BLOCKS = [
		{
			key: 'source',
			title: 'The source',
			line: 'A module delivers 250 MW thermal with helium leaving the core at 750 degrees Celsius.'
		},
		{
			key: 'transfer',
			title: 'The transfer',
			line: 'Heat crosses into the site loop at the band this industry works in, with no combustion anywhere in the chain.'
		},
		{
			key: 'use',
			title: 'The use',
			line: 'The energy goes into the process itself rather than into a grid connection beside it.'
		},
		{
			key: 'model',
			title: 'The arrangement',
			line: 'Zettajoule owns, runs and staffs the plant. You buy the delivered energy.'
		}
	];
</script>

<svelte:head><title>{s.industry}, Zettajoule solutions</title></svelte:head>

<article>
	<section class="head">
		<div class="wrap">
			<p class="eyebrow"><a href="/solutions">Solutions</a> / {s.industry}</p>
			<h1>{s.title}</h1>
			<p class="lede">{s.summary}</p>
			<dl class="specs">
				<div><dt>Output</dt><dd class="mono">{s.output_kind}</dd></div>
				<div><dt>Temperature band</dt><dd class="mono">{s.temperature_band}</dd></div>
				<div><dt>Deployment</dt><dd class="mono">{s.deployment}</dd></div>
				<div>
					<dt>Modules</dt>
					<dd class="mono">{s.module_count}</dd>
				</div>
			</dl>
			<div class="actions">
				<SaveButton slug={s.slug} label="Save this solution" />
				<a class="btn btn-quiet" href={`/contact?topic=Solutions&solution=${s.slug}`}>Enquire</a>
				<a class="btn btn-quiet" href="/contact">Get in Touch</a>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="wrap detail-grid">
			<div>
				<Reveal><h2>What the reactor does here</h2></Reveal>
				<p>{s.detail}</p>
			</div>
			<div>
				<Plate seed={s.slug} ratio="4 / 3" label={s.industry} />
			</div>
		</div>
	</section>

	<section class="section blocks">
		<div class="wrap">
			<h2>Block by block</h2>
			<ol class="block-list">
				{#each BLOCKS as b, i}
					<li>
						<svg viewBox="0 0 120 80" class="diagram" role="img" aria-label={`${b.title} diagram`}>
							<rect
								x="8"
								y="16"
								width="46"
								height="48"
								rx="5"
								fill="none"
								stroke="var(--ink)"
								stroke-width="1.4"
							/>
							<rect
								x="66"
								y="16"
								width="46"
								height="48"
								rx="5"
								fill="none"
								stroke="var(--accent)"
								stroke-width="1.4"
								stroke-dasharray={i % 2 ? '4 3' : 'none'}
							/>
							<path
								d="M54 40 H66"
								stroke="var(--accent)"
								stroke-width="1.6"
								marker-end="url(#arrow)"
							/>
							<path d="M60 36 L66 40 L60 44 Z" fill="var(--accent)" />
							<text x="31" y="43" text-anchor="middle" font-size="8" fill="var(--ink-muted)"
								>{i + 1}</text
							>
						</svg>
						<div>
							<h3>{b.title}</h3>
							<p>{b.line}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</section>

	{#if data.related.length}
		<section class="section related">
			<div class="wrap">
				<h2>Others taking {s.output_kind}</h2>
				<ul class="rel-list">
					{#each data.related as r}
						<li>
							<a href={`/solutions/${r.slug}`}>
								<strong>{r.industry}</strong>
								<span>{r.summary}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}
</article>

<style>
	.head {
		padding: 40px 0 32px;
		background: var(--surface-soft);
		border-bottom: 1px solid var(--rule);
	}
	.specs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 14px;
		margin: 22px 0;
		border-top: 1px solid var(--rule);
		padding-top: 16px;
	}
	.specs dt {
		font-family: var(--font-heading);
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	.specs dd {
		margin: 4px 0 0;
	}
	.actions {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		flex-wrap: wrap;
	}
	.detail-grid {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: 40px;
		align-items: start;
	}
	.blocks {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.block-list {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 20px;
	}
	.block-list li {
		display: grid;
		gap: 8px;
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 16px;
	}
	.diagram {
		width: 120px;
		height: 80px;
	}
	.block-list h3 {
		font-size: 1rem;
		margin-bottom: 4px;
	}
	.block-list p {
		font-size: 0.9rem;
		color: var(--ink-muted);
		margin: 0;
	}
	.rel-list {
		list-style: none;
		margin: 16px 0 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.rel-list a {
		display: grid;
		gap: 4px;
		padding: 14px 16px;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--ink);
	}
	.rel-list a:hover {
		border-color: var(--accent);
	}
	.rel-list span {
		color: var(--ink-muted);
		font-size: 0.9rem;
	}
	@media (max-width: 820px) {
		.detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
