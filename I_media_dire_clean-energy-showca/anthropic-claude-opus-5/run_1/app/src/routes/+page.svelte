<script>
	import Reactor from '$lib/components/Reactor.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import { sceneProgress, prefersReducedMotion } from '$lib/scroll.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	const copy = $derived(data.copy || {});
	const solutions = $derived(data.solutions || []);

	const OUTPUTS = [
		{ kind: 'heat', label: 'Heat' },
		{ kind: 'heat-and-power', label: 'Heat and power' },
		{ kind: 'hydrogen', label: 'Hydrogen' },
		{ kind: 'electricity', label: 'Electricity' }
	];

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	let progress = $state(0);
	let reduced = $state(false);
	let hinted = $state(false);

	onMount(() => {
		reduced = prefersReducedMotion();
		if (reduced) progress = 0.55;
		const onScroll = () => {
			if (window.scrollY > 40) hinted = true;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	const stage = $derived(
		progress < 0.2
			? 'Whole and metallic'
			: progress < 0.45
				? 'Control rods lifting free'
				: progress < 0.68
					? 'Dome off, core exposed'
					: 'Resolved into a technical drawing'
	);
</script>

<svelte:head>
	<title>Zettajoule, Powering the World</title>
</svelte:head>

<section
	class="scene"
	use:sceneProgress={(v) => {
		if (!reduced) progress = v;
	}}
>
	<div class="sticky">
		<div class="wash" style:--p={progress}></div>
		<div class="stage-inner wrap">
			<h1 class="display">Powering the World</h1>
			<div class="reactor-slot">
				<Reactor {progress} mode={reduced ? 'still' : 'auto'} size={430} />
			</div>
			<p class="promise">
				{copy.hero?.body ||
					'We build small high-temperature reactor modules, own them, run them, and sell you the energy.'}
			</p>

			<ul class="facts" aria-label="Key facts">
				{#each FACTS as fact, i}
					<li style:opacity={reduced ? 1 : progress > 0.34 + i * 0.06 ? 1 : 0.25}>{fact}</li>
				{/each}
			</ul>

			<ul class="outputs" aria-label="What it delivers">
				{#each OUTPUTS as o, i}
					<li style:opacity={reduced ? 1 : progress > 0.5 + i * 0.04 ? 1 : 0.3}>
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

			{#if !hinted}
				<!-- chrome exemption 2 of 2: the downward hint pulses until the visitor scrolls -->
				<p class="hint" aria-hidden="true">
					<svg viewBox="0 0 20 20" width="18" height="18" focusable="false">
						<path
							d="M10 3 v13 M5 11 l5 5 5-5"
							stroke="currentColor"
							stroke-width="1.8"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span>Scroll</span>
				</p>
			{/if}
		</div>
	</div>
</section>

<!-- every stage of the sequence in plain written text, so no fact is only
     reachable by aiming at something moving -->
<section class="section-tight written">
	<div class="wrap">
		<h2 class="visually-hidden">The reactor sequence in words</h2>
		<p class="stage-line">
			<span class="eyebrow" style="margin:0">Sequence</span>
			<span aria-live="polite">{stage}</span>
		</p>
		<ol class="stages">
			<li>The module stands whole, a metallic pressure vessel on its base.</li>
			<li>The tall control rods lift up and pull free of the core.</li>
			<li>The rounded lid rises off and the dark column of fuel inside is laid bare.</li>
			<li>The metal resolves into a clean technical line drawing with the helium circuit named.</li>
		</ol>
	</div>
</section>

<section class="section name-section">
	<div class="wrap-narrow">
		<Reveal><h2>{copy.name?.heading || 'Why Zettajoule'}</h2></Reveal>
		<Reveal><p class="lede">{copy.name?.body}</p></Reveal>
	</div>
</section>

<section class="section industries">
	<div class="wrap">
		<Reveal><h2>{copy.industries?.heading || 'Eight industries, one object'}</h2></Reveal>
		<Reveal><p class="lede">{copy.industries?.body}</p></Reveal>
		<ul class="rail">
			{#each solutions as s}
				<li>
					<a class="ind-card" href={`/solutions/${s.slug}`}>
						<Plate seed={s.slug} ratio="4 / 3" />
						<h3>{s.industry}</h3>
						<p>{s.summary}</p>
						<span class="ind-meta mono">{s.output_kind} &middot; {s.temperature_band}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section tech-preview">
	<div class="wrap tech-grid">
		<div>
			<Reveal><h2>{copy.technology?.heading || 'A reactor that runs hot'}</h2></Reveal>
			<Reveal><p class="lede">{copy.technology?.body}</p></Reveal>
			<p><a class="btn btn-quiet" href="/technology">Read the technology</a></p>
		</div>
		<div class="tech-plate">
			<Plate seed="technology-preview" ratio="4 / 3" label="Module cutaway" />
		</div>
	</div>
</section>

<!-- the single inverted section: the hottest beat of the route -->
<section class="section inverse heat">
	<div class="wrap-narrow">
		<Reveal distance={34}
			><h2 class="heat-head">{copy.heat?.heading || 'Nothing else runs this hot'}</h2></Reveal
		>
		<Reveal><p class="lede">{copy.heat?.body}</p></Reveal>
		<p class="big mono">750 &deg;C</p>
		<p><a class="btn btn-primary" href="/edge">See why that matters</a></p>
	</div>
</section>

<style>
	.scene {
		position: relative;
		height: 320vh;
	}
	.sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
		display: grid;
		place-items: center;
	}
	.wash {
		position: absolute;
		inset: 0;
		/* opens on a wash from a cool blue tint to a warm cream tint and settles
		   to light grey as the sequence runs */
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--sky) calc((1 - var(--p)) * 100%), var(--surface-grey)) 0%,
				color-mix(in srgb, #f7efe2 calc((1 - var(--p)) * 100%), var(--surface-grey)) 100%
			);
		z-index: 0;
	}
	.stage-inner {
		position: relative;
		z-index: 1;
		text-align: center;
		display: grid;
		gap: 8px;
		align-content: center;
		height: 100%;
		padding-top: var(--bar-h);
		padding-bottom: 16px;
	}
	.display {
		/* the one display line: the single place the heading family runs at its
		   lightest weight and largest size */
		font-family: var(--font-heading);
		font-weight: 200;
		font-size: clamp(2.6rem, 9.5vw, 7rem);
		letter-spacing: -0.045em;
		line-height: 0.94;
		margin: 0;
		grid-row: 1;
		grid-column: 1;
		align-self: center;
		pointer-events: none;
	}
	.reactor-slot {
		grid-row: 1;
		grid-column: 1;
		align-self: center;
		display: grid;
		place-items: center;
		max-height: 52vh;
	}
	.reactor-slot :global(svg) {
		max-height: 52vh;
	}
	.promise {
		margin: 4px auto 0;
		max-width: 46ch;
		color: var(--ink-muted);
		font-size: 1rem;
	}
	.facts {
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
		display: flex;
		gap: 8px 22px;
		justify-content: center;
		flex-wrap: wrap;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--ink-muted);
	}
	.outputs {
		list-style: none;
		margin: 10px 0 0;
		padding: 0;
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.outputs a {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		min-height: 44px;
		padding: 8px 16px;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.8);
		color: var(--ink);
		text-decoration: none;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 0.84rem;
	}
	.outputs a:hover {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.hint {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 14px;
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-muted);
		animation: zj-hint 1600ms ease-in-out infinite;
	}
	@keyframes zj-hint {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.55;
		}
		50% {
			transform: translateY(6px);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hint {
			animation: none;
		}
	}

	.written {
		background: var(--surface);
		border-bottom: 1px solid var(--rule);
	}
	.stage-line {
		display: flex;
		align-items: baseline;
		gap: 12px;
		font-family: var(--font-mono);
		font-size: 0.86rem;
		margin-bottom: 10px;
	}
	.stages {
		margin: 0;
		padding-left: 20px;
		color: var(--ink-muted);
		font-size: 0.94rem;
		columns: 2;
		column-gap: 32px;
	}
	.stages li {
		margin-bottom: 6px;
		break-inside: avoid;
	}

	.name-section {
		background: var(--surface);
	}

	.industries {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
	}
	.rail {
		list-style: none;
		margin: 28px 0 0;
		padding: 0 0 12px;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(250px, 1fr);
		gap: 18px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
	}
	.rail li {
		scroll-snap-align: start;
		display: flex;
	}
	.ind-card {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		background: var(--surface);
		padding: 14px;
		text-decoration: none;
		color: var(--ink);
		display: block;
		width: 100%;
	}
	.ind-card:hover {
		border-color: var(--accent);
	}
	.ind-card h3 {
		margin: 12px 0 6px;
		font-size: 1.1rem;
	}
	.ind-card p {
		font-size: 0.9rem;
		color: var(--ink-muted);
		margin-bottom: 8px;
	}
	.ind-meta {
		font-size: 0.74rem;
		color: var(--ink-faint);
	}

	.tech-grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 40px;
		align-items: center;
	}

	.heat {
		text-align: center;
	}
	.heat .lede {
		margin: 0 auto 20px;
	}
	.heat-head {
		font-size: clamp(2rem, 6vw, 4rem);
	}
	.big {
		font-size: clamp(3rem, 12vw, 8rem);
		font-family: var(--font-heading);
		font-weight: 800;
		letter-spacing: -0.05em;
		margin: 10px 0 22px;
		color: #ffb257;
	}

	@media (max-width: 820px) {
		.tech-grid {
			grid-template-columns: 1fr;
		}
		.stages {
			columns: 1;
		}
		.rail {
			grid-auto-columns: 84%;
		}
		.display {
			font-size: clamp(2.2rem, 13vw, 3.4rem);
		}
		.reactor-slot :global(svg) {
			max-height: 40vh;
		}
	}
</style>
