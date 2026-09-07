<script>
	import Reactor from '$lib/art/Reactor.svelte';
	import Plate from '$lib/art/Plate.svelte';
	import { reveal, scrollProgress } from '$lib/scroll.js';
	import { OUTPUTS, KEY_FACTS } from '$lib/nav.js';

	export let data;

	let progress = 0;
	let still = false;
	let hasScrolled = false;

	function onProgress(p) {
		if (p === -1) {
			still = true;
			return;
		}
		progress = p;
		if (p > 0.01) hasScrolled = true;
	}

	const STAGES = [
		{ name: 'Whole', text: 'The module stands complete: dome, vessel, control rods and base.' },
		{ name: 'Rods clear', text: 'The tall control rods lift up and pull free of the core.' },
		{ name: 'Dome off', text: 'The rounded lid rises off the vessel.' },
		{ name: 'Core bare', text: 'The inside is laid bare: a dark column of coated fuel grains in graphite.' },
		{ name: 'Drawing', text: 'The metal resolves into a clean technical line drawing.' }
	];
</script>

<svelte:head>
	<title>Zettajoule | Powering the World</title>
	<meta name="description" content="Small high-temperature gas-cooled reactor modules. We own, run and staff the plant; you buy the heat, hydrogen or electricity." />
</svelte:head>

<div class="hero-scroll" use:scrollProgress={onProgress}>
	<div class="hero-sticky">
		<div class="hero-ground" style="--gp:{Math.min(1, progress * 2.2)}"></div>
		<div class="hero-inner wrap">
			<h1 class="display"><span>Powering</span> <span>the</span> <span>World</span></h1>
			<div class="hero-reactor">
				<Reactor {progress} {still} width="min(340px, 74vw)" />
			</div>
			<p class="promise">
				Clean heat, hydrogen and electricity from a reactor we own, run and staff. You buy the
				energy.
			</p>

			<ul class="facts" aria-label="Key facts" style="--fp:{still ? 1 : Math.min(1, Math.max(0, (progress - 0.34) / 0.24))}">
				{#each KEY_FACTS as fact}
					<li>{fact}</li>
				{/each}
			</ul>

			<ul class="outputs" aria-label="What a module delivers" style="--fp:{still ? 1 : Math.min(1, Math.max(0, (progress - 0.44) / 0.26))}">
				{#each OUTPUTS as o}
					<li>
						<a href="/solutions?output_kind={encodeURIComponent(o.kind)}">
							<span class="o-label">{o.label}</span>
							<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
								<path d="M4 12 L12 4 M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		{#if !hasScrolled && !still}
			<!-- Chrome exemption 2 of 2: the scroll hint pulses until the visitor scrolls -->
			<div class="hint-arrow" aria-hidden="true">
				<svg width="20" height="26" viewBox="0 0 20 26" focusable="false">
					<path d="M10 2 V22 M3 15 L10 22 L17 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
		{/if}
	</div>
</div>

<!-- Every stage of the sequence is also available as plain written text -->
<section class="section-tight sequence-text">
	<div class="wrap">
		<h2 class="sr-only">The reactor sequence in words</h2>
		<details>
			<summary>Read the reactor sequence as text</summary>
			<ol>
				{#each STAGES as s}
					<li><strong>{s.name}.</strong> {s.text}</li>
				{/each}
			</ol>
			<p class="muted">
				The three key facts: {KEY_FACTS.join('; ')}. The four outputs: {OUTPUTS.map((o) => o.label).join(', ')}.
			</p>
		</details>
	</div>
</section>

<section class="section name-story">
	<div class="wrap two-col">
		<div use:reveal>
			<p class="eyebrow">The name</p>
			<h2 class="split">A zettajoule is the unit the future is measured in.</h2>
			<p>
				Global energy demand runs at hundreds of exajoules a year and is going up, not down, as
				industry electrifies and the world builds. Name a company after the unit above that and you
				have said out loud what you think the job is.
			</p>
			<p>
				One module is 250 MW thermal, running 8000 hours a year. That is 2000 GWh delivered, every
				year, from a machine that fits on an industrial site and does not burn anything.
			</p>
			<a class="btn" href="/company">The company story</a>
		</div>
		<div use:reveal>
			<Plate seed="home-ground" ratio="4 / 3" label="Generated plate: a reactor site at daylight" />
		</div>
	</div>
</section>

<section class="section industries">
	<div class="wrap">
		<div use:reveal>
			<p class="eyebrow">What it powers</p>
			<h2 class="split">Eight industries, one machine.</h2>
			<p class="lede">
				Narrow them by what you make, what you need out of it, how hot, and how it would be
				deployed.
			</p>
		</div>
		<ul class="ind-row">
			{#each data.solutions as s, i}
				<li use:reveal={{ stagger: i }}>
					<a href="/solutions/{s.slug}">
						<Plate seed={s.slug} ratio="5 / 4" />
						<span class="ind-name">{s.industry}</span>
						<span class="ind-kind muted">{s.output_kind.replace(/-/g, ' ')}</span>
					</a>
				</li>
			{/each}
		</ul>
		<a class="btn btn-primary" href="/solutions">Open the solutions explorer</a>
	</div>
</section>

<section class="section invert heat-beat">
	<div class="wrap">
		<div use:reveal>
			<p class="eyebrow">Unmatched heat</p>
			<h2 class="split big">750 degrees Celsius.<br />Not one water-cooled reactor gets there.</h2>
			<p class="lede">
				A light water reactor tops out around 300 degrees. That is why it makes electricity and
				little else. Helium at 750 degrees does the jobs that heat, and only heat, can do: cracking,
				reforming, direct reduction, high-temperature electrolysis. This is the whole argument.
			</p>
			<a class="btn btn-primary" href="/edge">Why this is different</a>
		</div>
	</div>
</section>

<section class="section tech-preview">
	<div class="wrap two-col">
		<div use:reveal>
			<Reactor still={true} width="min(300px, 70vw)" labelled={true} />
		</div>
		<div use:reveal>
			<p class="eyebrow">The technology</p>
			<h2 class="split">A proven machine, modernized.</h2>
			<p>
				This is not a paper concept. The design is a modernized version of a high-temperature
				gas-cooled reactor that has run as a test reactor since the late 1990s. Coated fuel grains
				that hold together at extreme heat, graphite around them, helium that cools the core and
				stays chemically calm around everything it touches.
			</p>
			<p>
				Modules are built in a factory and shipped in sections, so deployment is quick and scaling
				up is a matter of adding modules rather than starting again.
			</p>
			<a class="btn" href="/technology">How it works</a>
		</div>
	</div>
</section>

<style>
	.hero-scroll {
		position: relative;
		height: 260vh;
	}
	.hero-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		overflow: hidden;
	}
	.hero-ground {
		position: absolute;
		inset: 0;
		z-index: var(--z-art);
		background:
			linear-gradient(180deg, #e3edfa 0%, #f3ecdf 100%);
	}
	.hero-ground::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--paper-2);
		opacity: var(--gp, 0);
	}
	.hero-inner {
		position: relative;
		z-index: var(--z-text);
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-areas:
			'facts reactor outputs'
			'display display display'
			'promise promise promise';
		align-items: center;
		justify-items: center;
		gap: 6px 26px;
		width: 100%;
	}
	/* The one display line: the lightest weight and largest size on the site. */
	.display {
		grid-area: display;
		font-family: var(--font-head);
		font-weight: 200;
		font-size: clamp(2.6rem, 10.5vw, 8.4rem);
		line-height: 0.94;
		letter-spacing: -0.045em;
		text-align: center;
		margin: 0;
		color: var(--ink);
		display: flex;
		gap: 0.24em;
		flex-wrap: wrap;
		justify-content: center;
	}
	.hero-reactor {
		grid-area: reactor;
	}
	.promise {
		grid-area: promise;
		text-align: center;
		max-width: 46ch;
		color: var(--ink-muted);
		font-size: clamp(0.95rem, 1.4vw, 1.1rem);
		margin: 6px 0 0;
	}
	.facts {
		grid-area: facts;
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
		justify-self: start;
		opacity: var(--fp, 0);
		max-width: 200px;
	}
	.facts li {
		font-size: 0.84rem;
		font-weight: 600;
		border-left: 2px solid var(--accent);
		padding-left: 10px;
		color: var(--ink);
	}
	.outputs {
		grid-area: outputs;
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
		justify-self: end;
		opacity: var(--fp, 0);
		min-width: 180px;
	}
	.outputs a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 9px 12px;
		border: 1px solid var(--rule-strong);
		border-radius: var(--r-md);
		background: rgba(255, 255, 255, 0.78);
		text-decoration: none;
		color: var(--ink);
		font-size: 0.86rem;
		font-weight: 600;
		min-height: 44px;
	}
	.outputs a:hover {
		background: var(--accent-tint);
		border-color: var(--accent);
		color: var(--accent-hover);
	}

	.hint-arrow {
		position: absolute;
		bottom: 22px;
		left: 50%;
		transform: translateX(-50%);
		color: var(--ink-muted);
		animation: zj-pulse 1900ms ease-in-out infinite;
	}
	@keyframes zj-pulse {
		0%,
		100% {
			transform: translate(-50%, 0);
			opacity: 0.45;
		}
		50% {
			transform: translate(-50%, 8px);
			opacity: 1;
		}
	}

	.sequence-text {
		background: var(--paper);
		border-bottom: 1px solid var(--rule);
	}
	.sequence-text summary {
		cursor: pointer;
		font-weight: 600;
		padding: 8px 0;
	}
	.sequence-text ol {
		margin: 12px 0;
		padding-left: 20px;
	}
	.sequence-text li {
		margin-bottom: 6px;
	}

	/* Headings split into lines that rise into place from behind an edge,
	   bound to scroll position, not a duration. */
	.split {
		overflow: hidden;
	}
	:global([data-revealed]) .split,
	.split {
		transform: translateY(calc((1 - var(--rp, 1)) * 26px));
		opacity: calc(0.25 + var(--rp, 1) * 0.75);
	}
	:global([data-revealed]) {
		transform: translateY(calc((1 - var(--rp, 1)) * 18px));
		opacity: calc(0.35 + var(--rp, 1) * 0.65);
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(24px, 5vw, 64px);
		align-items: center;
	}
	.name-story {
		background: var(--paper);
	}
	.industries {
		background: var(--paper-2);
	}
	.ind-row {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 16px;
		padding: 0;
		margin: 28px 0;
	}
	.ind-row a {
		display: block;
		text-decoration: none;
		color: var(--ink);
	}
	.ind-row a:hover .ind-name {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.ind-name {
		display: block;
		font-family: var(--font-head);
		font-size: 0.95rem;
		margin-top: 10px;
	}
	.ind-kind {
		display: block;
		font-size: 0.78rem;
		text-transform: capitalize;
	}
	.heat-beat h2.big {
		font-size: clamp(1.9rem, 4.6vw, 3.4rem);
	}
	.heat-beat .lede {
		margin-bottom: 22px;
	}
	.tech-preview {
		background: var(--paper);
	}

	@media (max-width: 900px) {
		.hero-inner {
			grid-template-columns: 1fr;
			grid-template-areas:
				'display'
				'reactor'
				'promise'
				'facts'
				'outputs';
			gap: 14px;
		}
		.facts,
		.outputs {
			justify-self: stretch;
			max-width: none;
			width: 100%;
		}
		.facts {
			grid-template-columns: 1fr;
		}
		.two-col {
			grid-template-columns: 1fr;
		}
		.ind-row {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 560px) {
		.hero-scroll {
			height: 220vh;
		}
		.ind-row {
			grid-auto-flow: column;
			grid-auto-columns: 78%;
			grid-template-columns: none;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			padding-bottom: 8px;
		}
		.ind-row li {
			scroll-snap-align: start;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-scroll {
			height: auto;
		}
		.hero-sticky {
			position: static;
			height: auto;
			padding-block: 80px 60px;
		}
		.facts,
		.outputs {
			opacity: 1 !important;
		}
		.split,
		:global([data-revealed]) {
			transform: none !important;
			opacity: 1 !important;
		}
	}
</style>
