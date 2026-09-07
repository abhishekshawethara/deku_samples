<script>
	import Reveal from '$lib/components/Reveal.svelte';

	let { data } = $props();
	const c = $derived(data.copy);

	const OUTPUTS = [
		{ kind: 'heat', label: 'Heat' },
		{ kind: 'heat-and-power', label: 'Heat and power' },
		{ kind: 'hydrogen', label: 'Hydrogen' },
		{ kind: 'electricity', label: 'Electricity' }
	];
</script>

<svelte:head><title>Our Edge, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Our Edge</p>
		<h1>{c.lede?.heading}</h1>
		<p class="lede">{c.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap-narrow">
		<Reveal><h2 class="lead-claim">{c.proven?.heading}</h2></Reveal>
		<p class="lede">{c.proven?.body}</p>
	</div>
</section>

<section class="section hotter">
	<div class="wrap">
		<Reveal><h2>{c.hotter?.heading}</h2></Reveal>
		<p class="lede">{c.hotter?.body}</p>
		<div class="scale" role="img" aria-label="A water-cooled reactor reaches about 300 degrees Celsius; this module reaches 750">
			<div class="bar">
				<span class="bar-label">Water-cooled reactor</span>
				<span class="track"><span class="fill grey" style="width:40%"></span></span>
				<span class="mono">300 &deg;C</span>
			</div>
			<div class="bar">
				<span class="bar-label">Zettajoule module</span>
				<span class="track"><span class="fill" style="width:100%"></span></span>
				<span class="mono">750 &deg;C</span>
			</div>
		</div>
		<p class="muted small">
			In words: a water-cooled reactor tops out around 300 degrees Celsius; this module delivers 750,
			which is where steel, hydrogen and chemistry live.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap two">
		<Reveal>
			<article class="card">
				<h2>{c.modular?.heading}</h2>
				<p>{c.modular?.body}</p>
			</article>
		</Reveal>
		<Reveal>
			<article class="card">
				<h2>{c.model?.heading}</h2>
				<p>{c.model?.body}</p>
			</article>
		</Reveal>
	</div>
</section>

<section class="section outputs-section">
	<div class="wrap">
		<h2>The four outputs</h2>
		<ul class="outputs">
			{#each OUTPUTS as o}
				<li>
					<a href={`/solutions?output_kind=${encodeURIComponent(o.kind)}`}>
						<span>{o.label}</span>
						<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
							<path
								d="M4 12 L12 4 M6 4 h6 v6"
								stroke="currentColor"
								stroke-width="1.8"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.head {
		padding: 44px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.lead-claim {
		font-size: clamp(1.8rem, 4.6vw, 3rem);
	}
	.hotter {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.scale {
		display: grid;
		gap: 12px;
		margin: 24px 0 12px;
		max-width: 780px;
	}
	.bar {
		display: grid;
		grid-template-columns: 190px 1fr auto;
		gap: 14px;
		align-items: center;
		font-size: 0.9rem;
	}
	.bar-label {
		color: var(--ink-muted);
	}
	.track {
		height: 18px;
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
	.fill.grey {
		background: var(--ink-faint);
	}
	.small {
		font-size: 0.88rem;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 22px;
	}
	.two h2 {
		font-size: 1.2rem;
	}
	.two p {
		color: var(--ink-muted);
		margin: 0;
	}
	.outputs-section {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
	}
	.outputs {
		list-style: none;
		margin: 18px 0 0;
		padding: 0;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.outputs a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding: 10px 20px;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink);
		text-decoration: none;
		font-family: var(--font-heading);
		font-weight: 800;
	}
	.outputs a:hover {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	@media (max-width: 800px) {
		.two {
			grid-template-columns: 1fr;
		}
		.bar {
			grid-template-columns: 120px 1fr auto;
		}
	}
</style>
