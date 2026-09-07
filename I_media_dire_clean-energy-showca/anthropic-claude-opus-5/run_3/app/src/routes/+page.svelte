<script>
	import Reactor from '$lib/Reactor.svelte';
	import Reveal from '$lib/Reveal.svelte';
	import Plate from '$lib/Plate.svelte';
	import { reducedMotion, scrollProgress, reveal } from '$lib/scroll.js';
	import { browser } from '$app/environment';

	let { data } = $props();

	let seqProgress = $state(0);
	let scrolledAny = $state(false);
	let lowPower = $state(false);

	// If the machine cannot carry the moving picture we hold one clean still
	// frame instead of stuttering.
	$effect(() => {
		if (!browser) return;
		let frames = 0;
		let slow = 0;
		let last = performance.now();
		let raf;
		const tick = (now) => {
			const dt = now - last;
			last = now;
			if (dt > 34) slow++;
			if (++frames < 60) raf = requestAnimationFrame(tick);
			else if (slow > 24) lowPower = true;
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const still = $derived($reducedMotion || lowPower);

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	const OUTPUTS = [
		{ label: 'Heat', kind: 'heat', note: 'Process heat straight into the header.' },
		{
			label: 'Heat and power',
			kind: 'heat-and-power',
			note: 'Both at once, from one installation.'
		},
		{ label: 'Hydrogen', kind: 'hydrogen', note: 'High-temperature production at works scale.' },
		{ label: 'Electricity', kind: 'electricity', note: 'Firm power that does not wait for a queue.' }
	];

	const STAGES = [
		['Whole', 'The module stands sealed and metallic, as it ships.'],
		['Rods lift', 'Six control rods pull clear of the graphite channels.'],
		['Dome opens', 'The rounded lid rises off the pressure vessel.'],
		['Core exposed', 'A dark column of TRISO fuel is laid bare.'],
		['Drawn', 'The metal resolves into a clean technical drawing.']
	];
</script>

<svelte:head>
	<title>Zettajoule · Powering the World</title>
	<meta
		name="description"
		content="Small high-temperature gas-cooled reactor modules delivering heat, hydrogen and electricity. We own, run and staff them; you buy the energy."
	/>
</svelte:head>

<svelte:window onscroll={() => (scrolledAny = true)} />

<!-- ---------------------------------------------------------------- hero -->
<section class="hero">
	<div class="hero__wash"></div>
	<div class="wrap hero__inner">
		<h1 class="display">Powering the World</h1>
		<div class="hero__reactor">
			<Reactor progress={still ? 0 : Math.min(seqProgress * 1.15, 1)} still={false} height="min(58vh, 460px)" />
		</div>
		<p class="hero__promise">
			Small modular reactors that deliver clean heat, hydrogen and electricity to industry. We own
			them, run them and staff them; you buy the energy.
		</p>
		<div class="row hero__actions">
			<a class="btn" href="/solutions">Explore the solutions</a>
			<a class="btn btn--ghost" href="/technology">See the technology</a>
		</div>
	</div>

	{#if !scrolledAny}
		<!-- chrome exemption 1 of 2: pulses until the visitor scrolls -->
		<div class="hint" aria-hidden="true">
			<svg width="20" height="26" viewBox="0 0 20 26" focusable="false">
				<path
					d="M10 1 V22 M3 15 L10 23 L17 15"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
		<p class="visually-hidden">Scroll to take the reactor apart.</p>
	{/if}
</section>

<!-- ------------------------------------------------- scroll-bound sequence -->
<section
	class="sequence"
	use:scrollProgress={{ onprogress: (v) => (seqProgress = v), start: 1, end: 0 }}
	aria-labelledby="seq-head"
>
	<div class="wrap sequence__inner">
		<div class="sequence__stage">
			<div class="sequence__sticky">
				<Reactor progress={seqProgress} {still} height="min(66vh, 540px)" />
				<p class="sequence__caption">
					{#if still}
						Reduced motion: the reactor holds one clean frame.
					{:else}
						Stage {Math.min(STAGES.length, Math.floor(seqProgress * STAGES.length) + 1)} of {STAGES.length}:
						{STAGES[Math.min(STAGES.length - 1, Math.floor(seqProgress * STAGES.length))][0]}
					{/if}
				</p>
			</div>
		</div>

		<div class="sequence__text">
			<Reveal as="h2" id="seq-head" text={'One engineered\nobject, taken apart.'} />
			<p class="lede">
				Zettajoule builds the reactor in modules, small enough to be made in a factory and shipped
				whole. Scroll and it comes apart; scroll back and it goes together again.
			</p>

			<!-- Every stage is available as plain written text, so no fact is only
			     reachable by aiming at something moving. -->
			<ol class="stages">
				{#each STAGES as [name, text], i}
					<li class:stages__now={!still && Math.floor(seqProgress * STAGES.length) === i}>
						<strong>{name}.</strong>
						{text}
					</li>
				{/each}
			</ol>

			<h3>The three key facts</h3>
			<ul class="facts">
				{#each FACTS as fact}
					<li use:reveal><span class="facts__dot" aria-hidden="true"></span>{fact}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- ------------------------------------------------------------- outputs -->
<section class="section outputs" aria-labelledby="outputs-head">
	<div class="wrap">
		<p class="eyebrow">What comes out</p>
		<Reveal as="h2" id="outputs-head" text="Four outputs, one machine" />
		<p class="lede">
			Each output links into the explorer already filtered, so you can see which industries it
			serves.
		</p>
		<ul class="outputs__grid">
			{#each OUTPUTS as o}
				<li>
					<a class="output" href={`/solutions?output_kind=${encodeURIComponent(o.kind)}`}>
						<span class="output__label">{o.label}</span>
						<span class="output__note">{o.note}</span>
						<span class="output__go" aria-hidden="true">
							<svg width="16" height="16" viewBox="0 0 16 16" focusable="false">
								<path
									d="M3 13 L13 3 M6 3 h7 v7"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- ------------------------------------------------------------ the name -->
<section class="section name">
	<div class="wrap grid grid--2">
		<div>
			<p class="eyebrow">The name</p>
			<Reveal as="h2" text={'A zettajoule is the\nsize of the problem.'} />
			<p>
				The world uses hundreds of exajoules of primary energy a year, and the demand curve for
				industrial heat and clean electricity bends upward from here, not down. A zettajoule is a
				thousand exajoules: we took the name from the unit the future need is measured in, because
				that is the size of the thing this has to serve.
			</p>
			<p>
				Most of that demand is heat, not electricity, and most of it is hot enough that a
				water-cooled reactor cannot reach it. That is the gap this machine was built for.
			</p>
		</div>
		<div class="name__plate">
			<Plate seed="zettajoule-scale" ratio="4 / 3" label="Generated plate: the scale of future energy demand" />
		</div>
	</div>
</section>

<!-- ------------------------------------------------- industries card row -->
<section class="section industries" aria-labelledby="ind-head">
	<div class="wrap">
		<p class="eyebrow">Who it serves</p>
		<Reveal as="h2" id="ind-head" text="Eight industries" />
		<p class="lede">Each one wants a different temperature and a different output.</p>
	</div>
	<ul class="rail">
		{#each data.solutions as s}
			<li class="rail__item">
				<a class="ind" href={`/solutions/${s.slug}`}>
					<Plate seed={s.slug} ratio="16 / 10" />
					<span class="ind__industry">{s.industry}</span>
					<span class="ind__title">{s.title}</span>
					<span class="ind__meta">{s.output_kind} · {s.temperature_band} · {s.module_count} modules</span>
				</a>
			</li>
		{/each}
	</ul>
	<div class="wrap">
		<a class="btn btn--ghost" href="/solutions">Open the explorer</a>
	</div>
</section>

<!-- ----------------------------------------------- technology preview -->
<section class="section tech-preview">
	<div class="wrap grid grid--2">
		<div class="tech-preview__art">
			<Reactor progress={0.85} still height="360px" />
		</div>
		<div>
			<p class="eyebrow">Technology</p>
			<Reveal as="h2" text={'Proven metal,\nmodernized.'} />
			<p>
				The design is a modernized version of a high-temperature gas-cooled reactor that has been
				operating since the late 1990s. Fuel comes as tiny uranium grains wrapped in tough ceramic
				shells that hold together far past anything the reactor sees in service; graphite surrounds
				them; helium carries the heat out and stays chemically calm around everything it touches.
			</p>
			<a class="btn btn--ghost" href="/technology">Pick the reactor apart</a>
		</div>
	</div>
</section>

<!-- ------------------------------- the one inverted section on the site -->
<section class="heat">
	<div class="wrap heat__inner">
		<p class="eyebrow heat__eyebrow">Unmatched heat</p>
		<Reveal as="h2" class="heat__head" text={'750 degrees.\nNothing else\ncomes close.'} />
		<p class="heat__body">
			An ordinary water-cooled reactor tops out around 300 degrees Celsius, which is hot enough to
			make electricity and nothing else. At 750 the machine reaches the chemistry: direct reduction
			of iron, high-temperature electrolysis, cracking, reforming, thermal desalination. The
			temperature is not a specification. It is the whole argument.
		</p>
		<div class="heat__scale" aria-hidden="true">
			<div class="heat__bar heat__bar--water"><span>Water-cooled, 300 C</span></div>
			<div class="heat__bar heat__bar--zj"><span>Zettajoule, 750 C</span></div>
		</div>
		<p class="visually-hidden">
			A water-cooled reactor delivers about 300 degrees Celsius; a Zettajoule module delivers 750.
		</p>
		<a class="btn heat__cta" href="/edge">Why this is different</a>
	</div>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100vh;
		display: grid;
		align-items: center;
		padding-top: var(--bar-h);
		overflow: hidden;
	}
	/* opens on a wash from a cool blue tint to a warm cream tint */
	.hero__wash {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, var(--wash-top) 0%, #f4f6f8 46%, var(--wash-bottom) 100%);
		z-index: -1;
	}
	.hero__inner {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: 0.5rem;
		padding-block: 2rem 4rem;
	}
	/* the one display line on the site, at its lightest weight and largest size */
	.display {
		font-family: var(--font-head);
		font-weight: 200;
		font-size: clamp(2.6rem, 11vw, 8.5rem);
		letter-spacing: -0.045em;
		line-height: 0.92;
		margin: 0;
		text-align: center;
	}
	.hero__reactor {
		width: min(520px, 88vw);
		margin-block: -1.5rem;
	}
	.hero__promise {
		max-width: 46ch;
		font-size: clamp(1rem, 1.6vw, 1.2rem);
		color: var(--ink-muted);
		margin: 0;
	}
	.hero__actions {
		justify-content: center;
		margin-top: 0.5rem;
	}
	.hint {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		color: var(--ink-muted);
		animation: hint 1600ms ease-in-out infinite;
	}
	@keyframes hint {
		0%,
		100% {
			transform: translate(-50%, 0);
			opacity: 0.55;
		}
		50% {
			transform: translate(-50%, 7px);
			opacity: 1;
		}
	}

	.sequence {
		background: var(--paper-2);
		border-block: 1px solid var(--rule);
	}
	.sequence__inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(1.5rem, 4vw, 4rem);
		align-items: start;
		padding-block: clamp(2rem, 5vw, 4rem);
	}
	.sequence__stage {
		position: relative;
		min-height: 190vh;
	}
	.sequence__sticky {
		position: sticky;
		top: calc(var(--bar-h) + 2vh);
		display: grid;
		justify-items: center;
		gap: 0.5rem;
	}
	.sequence__caption {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--ink-muted);
		margin: 0;
		text-align: center;
	}
	.sequence__text {
		position: sticky;
		top: calc(var(--bar-h) + 6vh);
		padding-block: 2rem;
	}
	.stages {
		margin: 0 0 2rem;
		padding-left: 1.1rem;
		font-size: 0.94rem;
		color: var(--ink-muted);
		max-width: 54ch;
	}
	.stages li {
		margin-bottom: 0.45rem;
	}
	.stages li strong {
		color: var(--ink);
	}
	.stages__now {
		color: var(--ink);
	}
	.facts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
		max-width: 48ch;
	}
	.facts li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
		font-weight: 600;
	}
	.facts__dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--accent);
		flex: none;
	}

	.outputs {
		background: var(--paper);
	}
	.outputs__grid {
		list-style: none;
		margin: 2rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}
	.output {
		position: relative;
		display: grid;
		gap: 0.4rem;
		height: 100%;
		padding: 1.2rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		background: var(--paper);
		text-decoration: none;
		color: var(--ink);
	}
	.output:hover {
		border-color: var(--accent);
		background: var(--sky);
		color: var(--accent-hover);
	}
	.output__label {
		font-family: var(--font-head);
		font-size: 1.3rem;
	}
	.output__note {
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.output__go {
		position: absolute;
		top: 1rem;
		right: 1rem;
		color: var(--accent);
	}

	.name {
		background: var(--paper-2);
	}
	.name__plate {
		align-self: center;
	}

	.industries {
		background: var(--paper);
	}
	.rail {
		list-style: none;
		margin: 1.75rem 0;
		padding: 0 var(--pad-page) 1rem;
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: thin;
	}
	.rail__item {
		flex: 0 0 clamp(230px, 26vw, 290px);
		scroll-snap-align: start;
	}
	.ind {
		display: grid;
		gap: 0.3rem;
		height: 100%;
		padding: 0.75rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--ink);
		background: var(--paper);
	}
	.ind:hover {
		border-color: var(--accent);
		background: var(--sky);
	}
	.ind__industry {
		font-family: var(--font-head);
		font-size: 1.05rem;
		margin-top: 0.5rem;
	}
	.ind__title {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.ind__meta {
		font-family: var(--font-mono);
		font-size: 0.73rem;
		color: var(--ink-faint);
	}

	.tech-preview {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
	}
	.tech-preview__art {
		display: grid;
		place-items: center;
	}

	/* the single inverted beat */
	.heat {
		background: var(--near-black);
		color: #f2f2f0;
	}
	.heat__inner {
		padding-block: clamp(4rem, 10vw, 8rem);
	}
	.heat__eyebrow {
		color: #b7b4ae;
	}
	:global(.heat__head) {
		font-size: clamp(2.4rem, 8vw, 6rem);
		max-width: 14ch;
	}
	.heat__body {
		color: #d4d2cd;
		max-width: 56ch;
		font-size: 1.05rem;
	}
	.heat__scale {
		display: grid;
		gap: 0.5rem;
		max-width: 620px;
		margin: 2rem 0;
	}
	.heat__bar {
		display: flex;
		align-items: center;
		height: 42px;
		padding-left: 0.8rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.8rem;
	}
	.heat__bar--water {
		width: 40%;
		background: #35343a;
		color: #cfcdc8;
	}
	.heat__bar--zj {
		width: 100%;
		background: linear-gradient(90deg, #7a3d0e, #e08b2a);
		color: #1a1206;
		font-weight: 700;
	}
	.heat__cta {
		margin-top: 0.5rem;
	}

	@media (max-width: 900px) {
		.sequence__inner {
			grid-template-columns: 1fr;
		}
		.sequence__stage {
			min-height: 120vh;
		}
		.sequence__text {
			position: static;
		}
	}
</style>
