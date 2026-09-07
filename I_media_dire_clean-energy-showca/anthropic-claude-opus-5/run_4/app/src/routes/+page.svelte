<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import Reactor from '$lib/components/Reactor.svelte';
	import Plate from '$lib/components/Plate.svelte';

	export let data;

	const OUTPUTS = [
		{ key: 'heat', label: 'Heat', note: 'Process heat straight into the plant, no combustion on site.' },
		{ key: 'heat-and-power', label: 'Heat and power', note: 'Both grades of energy from the same modules.' },
		{ key: 'hydrogen', label: 'Hydrogen', note: 'High-temperature electrolysis at the outlet temperature.' },
		{ key: 'electricity', label: 'Electricity', note: 'Firm, carbon-free power, hour by hour.' }
	];

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	let progress = 0;
	let reduced = false;
	let scrolled = false;
	let stageEl;

	function onScroll() {
		if (stageEl) {
			const rect = stageEl.getBoundingClientRect();
			const span = rect.height - window.innerHeight;
			progress = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
		}
		scrolled = window.scrollY > 40;
	}

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
	});
	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onScroll);
	});

	$: stageName =
		progress < 0.28
			? 'Whole module, sealed'
			: progress < 0.55
				? 'Control rods withdrawn, dome lifted'
				: progress < 0.8
					? 'Fuel core exposed'
					: 'Resolved to a technical drawing';
</script>

<svelte:head>
	<title>Zettajoule, powering the world with high-temperature reactor modules</title>
	<meta name="description" content="Zettajoule builds small high-temperature gas-cooled reactor modules and sells the energy: heat, heat and power, hydrogen and electricity." />
</svelte:head>

<!-- The scroll-bound reactor sequence. Progress is glued to scroll position,
     so it runs backwards on the way up; reduced motion holds one still frame. -->
<div class="stage" bind:this={stageEl}>
	<div class="stage__sticky">
		<div class="wash" style="--settle:{Math.min(1, progress * 2.2)}"></div>
		<div class="hero wrap">
			<div class="hero__art">
				<Reactor {progress} {reduced} width={360} />
			</div>
			<h1 class="display">Powering the World</h1>
			<p class="promise">
				We build small high-temperature reactor modules, own them, run them and staff them, and sell you the
				heat, hydrogen and electricity they make.
			</p>

			<div class="hero__facts" aria-hidden={progress < 0.3 ? 'true' : 'false'} style="opacity:{reduced ? 1 : Math.min(1, Math.max(0, (progress - 0.25) / 0.25))}">
				{#each FACTS as fact}
					<span class="fact">{fact}</span>
				{/each}
			</div>

			<p class="stage__read" role="status" aria-live="polite">Sequence: {stageName}</p>

			{#if !scrolled}
				<span class="hint" aria-hidden="true">
					<svg width="20" height="28" viewBox="0 0 20 28" focusable="false">
						<path d="M10 3v18M4 15l6 6 6-6" fill="none" stroke="var(--ink-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</span>
			{/if}
		</div>
	</div>
</div>

<!-- Every stage of the sequence, in plain text, so no fact is only reachable
     by aiming at something that moves. -->
<section class="section wrap" aria-labelledby="sequence-text">
	<h2 id="sequence-text" class="visually-hidden">The reactor sequence in words</h2>
	<div class="grid grid--2 sequence">
		<div>
			<p class="eyebrow">The module, in stages</p>
			<ol class="steps">
				<li><strong>Whole.</strong> A sealed steel module: base, pressure vessel, dome, control rods.</li>
				<li><strong>Rods out.</strong> The tall control rods lift up and pull free of the vessel.</li>
				<li><strong>Dome off.</strong> The rounded lid rises, and the inside is laid bare.</li>
				<li><strong>Core exposed.</strong> A dark column of fuel: uranium grains in ceramic shells.</li>
				<li><strong>Drawn.</strong> The metal resolves into a clean technical line drawing.</li>
			</ol>
		</div>
		<div>
			<p class="eyebrow">The three key facts</p>
			<ul class="facts-list">
				{#each FACTS as fact}
					<li>{fact}</li>
				{/each}
			</ul>
			<p class="lede">
				Ordinary water-cooled reactors stop around 300 degrees Celsius. Ours runs at 750, which is what puts
				industrial heat, hydrogen and the steel route inside reach.
			</p>
		</div>
	</div>
</section>

<section class="section wrap" aria-labelledby="outputs-heading">
	<p class="eyebrow">What comes out</p>
	<h2 id="outputs-heading">Four outputs, one machine</h2>
	<div class="grid grid--4 outputs">
		{#each OUTPUTS as output}
			<a class="output" href="/solutions?output_kind={encodeURIComponent(output.key)}">
				<span class="output__label">{output.label}</span>
				<span class="output__note">{output.note}</span>
				<span class="output__go">
					See solutions
					<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
						<path d="M3 11 L11 3 M5 3h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</span>
			</a>
		{/each}
	</div>
</section>

<section class="section wrap" aria-labelledby="name-heading">
	<div class="grid grid--2">
		<div>
			<p class="eyebrow">The name</p>
			<h2 id="name-heading">A zettajoule is the unit the future is measured in</h2>
			<p>
				The world uses roughly six hundred exajoules of primary energy a year, and demand keeps climbing as
				industry electrifies and populations grow. Push far enough out and the honest unit stops being the
				exajoule and becomes the zettajoule: a thousand of them.
			</p>
			<p>
				We took the name because it states the size of the problem. Answering it means clean energy that
				industry can actually use, at the temperature it already runs at, at a price it can sign a contract
				against.
			</p>
			<a class="btn btn--ghost" href="/company">Read the company story</a>
		</div>
		<Plate seed="zettajoule-scale" label="Generated plate: the scale of future energy need" ratio="4 / 3" />
	</div>
</section>

<section class="section wrap" aria-labelledby="industries-heading">
	<p class="eyebrow">Where it goes</p>
	<h2 id="industries-heading">Eight industries, one module family</h2>
	<div class="rail">
		{#each data.solutions as solution}
			<a class="rail__card" href="/solutions/{solution.slug}">
				<Plate seed={solution.slug} label="Generated plate for {solution.industry}" ratio="16 / 9" />
				<span class="rail__industry">{solution.industry}</span>
				<span class="rail__title">{solution.title}</span>
				<span class="rail__meta">{solution.module_count} module{solution.module_count === 1 ? '' : 's'}</span>
			</a>
		{/each}
	</div>
	<p><a href="/solutions">Open the solutions explorer</a></p>
</section>

<!-- The one inverted section: the hottest beat of the route. -->
<section class="invert" aria-labelledby="heat-heading">
	<div class="wrap invert__inner">
		<p class="eyebrow eyebrow--light">Unmatched heat</p>
		<h2 id="heat-heading">750 degrees Celsius is the whole argument.</h2>
		<p>
			A water-cooled reactor tops out around 300. It can boil water and it can make electricity, and there its
			usefulness to heavy industry ends. Helium does not have that ceiling. At 750 degrees the module reaches
			the chemistry, the electrolysis and the direct reduction of iron that no water-cooled machine will ever
			touch, and it does it without a flame anywhere on the site.
		</p>
		<div class="invert__scale">
			<div class="bar-row">
				<span class="bar-row__label">Water-cooled</span>
				<span class="bar-row__track"><span class="bar-row__fill" style="width:40%"></span></span>
				<span class="bar-row__value">300 C</span>
			</div>
			<div class="bar-row">
				<span class="bar-row__label">Zettajoule</span>
				<span class="bar-row__track"><span class="bar-row__fill bar-row__fill--hot" style="width:100%"></span></span>
				<span class="bar-row__value">750 C</span>
			</div>
		</div>
		<a class="btn" href="/technology">How it works</a>
	</div>
</section>

<section class="section wrap" aria-labelledby="tech-heading">
	<div class="grid grid--2">
		<Plate seed="technology-preview" label="Generated plate: technology preview" ratio="4 / 3" />
		<div>
			<p class="eyebrow">Technology</p>
			<h2 id="tech-heading">Proven metal, modernized</h2>
			<p>
				The design modernizes a test reactor that has been running since the late 1990s. That matters more than
				it sounds: a regulator reviewing a modernization is answering a smaller question than one reviewing a
				concept, and a machine with an operating record is a different proposition from a drawing.
			</p>
			<p>
				Fuel is uranium grains in tough ceramic shells that hold together far above anything the reactor
				reaches. Graphite moderates. Helium cools and stays chemically calm around everything it touches.
			</p>
			<a class="btn btn--ghost" href="/technology">Pick the reactor apart</a>
		</div>
	</div>
</section>

<style>
	.stage {
		height: 260vh;
		position: relative;
	}
	.stage__sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
	}
	/* opens on a cool blue to warm cream wash and settles to light grey */
	.wash {
		position: absolute;
		inset: 0;
		z-index: var(--z-art);
		background:
			linear-gradient(180deg, var(--paper-blue) 0%, var(--paper-cream) 100%);
	}
	.wash::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--paper-grey);
		opacity: var(--settle);
	}
	.hero {
		position: relative;
		z-index: var(--z-words);
		text-align: center;
		width: 100%;
	}
	.hero__art {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -46%);
		z-index: -1;
		opacity: 0.96;
	}
	.display {
		font-family: var(--font-head);
		font-weight: 200;
		font-size: clamp(2.6rem, 11vw, 7.5rem);
		letter-spacing: -0.045em;
		line-height: 0.94;
		margin: 0;
		color: var(--ink);
		mix-blend-mode: multiply;
	}
	.promise {
		margin: 1.25rem auto 0;
		max-width: 46ch;
		font-size: clamp(0.95rem, 1.5vw, 1.1rem);
		color: var(--ink-muted);
		background: rgba(255, 255, 255, 0.6);
		border-radius: var(--radius);
		padding: 0.5rem 0.75rem;
	}
	.hero__facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 1.25rem;
	}
	.fact {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.3rem 0.8rem;
		font-size: 0.82rem;
		font-weight: 600;
	}
	.stage__read {
		margin: 1rem 0 0;
		font-size: 0.78rem;
		color: var(--ink-muted);
		font-family: var(--font-mono);
	}
	/* chrome exemption 2 of 2: the scroll hint pulses until the visitor scrolls */
	.hint {
		position: absolute;
		left: 50%;
		bottom: -14vh;
		transform: translateX(-50%);
		animation: hint 1.8s ease-in-out infinite;
	}
	@keyframes hint {
		0%,
		100% {
			transform: translate(-50%, 0);
			opacity: 0.5;
		}
		50% {
			transform: translate(-50%, 8px);
			opacity: 1;
		}
	}

	.sequence .steps {
		margin: 0;
		padding-left: 1.2rem;
	}
	.sequence .steps li {
		margin-bottom: 0.6rem;
	}
	.facts-list {
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
	}
	.facts-list li {
		border-left: 3px solid var(--accent);
		padding: 0.35rem 0 0.35rem 0.75rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.outputs {
		margin-top: 1.5rem;
	}
	.output {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1.1rem;
		text-decoration: none;
		color: var(--ink);
		background: var(--paper);
	}
	.output:hover {
		border-color: var(--accent);
		background: var(--accent-tint);
		color: var(--ink);
	}
	.output__label {
		font-family: var(--font-head);
		font-size: 1.15rem;
	}
	.output__note {
		font-size: 0.88rem;
		color: var(--ink-muted);
		flex: 1;
	}
	.output__go {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--accent);
	}

	.rail {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(230px, 1fr);
		gap: 1rem;
		overflow-x: auto;
		padding-bottom: 1rem;
		scroll-snap-type: x mandatory;
	}
	.rail__card {
		scroll-snap-align: start;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		text-decoration: none;
		color: var(--ink);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.75rem;
		background: var(--paper);
	}
	.rail__card:hover {
		border-color: var(--accent);
	}
	.rail__industry {
		font-family: var(--font-head);
		font-size: 1rem;
		margin-top: 0.5rem;
	}
	.rail__title {
		font-size: 0.86rem;
		color: var(--ink-muted);
	}
	.rail__meta {
		font-size: 0.78rem;
		color: var(--ink-faint);
		font-family: var(--font-mono);
	}

	.invert {
		background: var(--near-black);
		color: #f2f0ee;
		padding: clamp(3.5rem, 9vw, 7rem) 0;
	}
	.invert :global(h2) {
		color: #fff;
		max-width: 18ch;
	}
	.invert p {
		color: #cfcbc7;
		max-width: 62ch;
	}
	.eyebrow--light {
		color: #a49f9a;
	}
	.invert__scale {
		margin: 2rem 0;
		max-width: 520px;
	}
	.bar-row {
		display: grid;
		grid-template-columns: 8rem 1fr 4rem;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.6rem;
		font-size: 0.85rem;
	}
	.bar-row__label {
		color: #cfcbc7;
	}
	.bar-row__track {
		height: 12px;
		background: rgba(255, 255, 255, 0.14);
		border-radius: 999px;
		overflow: hidden;
	}
	.bar-row__fill {
		display: block;
		height: 100%;
		background: #6f7982;
	}
	.bar-row__fill--hot {
		background: linear-gradient(90deg, var(--accent) 0%, #ff9d4d 100%);
	}
	.bar-row__value {
		font-family: var(--font-mono);
		text-align: right;
		color: #fff;
	}

	@media (max-width: 720px) {
		.stage {
			height: 220vh;
		}
		.hero__art :global(svg) {
			width: 240px;
			height: auto;
		}
		.rail {
			grid-auto-columns: 84%;
		}
		.bar-row {
			grid-template-columns: 6rem 1fr 3.5rem;
		}
	}
</style>
