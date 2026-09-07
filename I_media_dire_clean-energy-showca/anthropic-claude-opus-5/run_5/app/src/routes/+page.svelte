
<script>
	import Reactor from '$lib/components/Reactor.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import { scrollRange, scrollBound, prefersReducedMotion } from '$lib/scroll';
	import { browser } from '$app/environment';

	const facts = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	const outputs = [
		{ label: 'Heat', kind: 'heat', note: 'Process heat delivered straight into the site header.' },
		{
			label: 'Heat and power',
			kind: 'heat-and-power',
			note: 'One helium loop split between process heat and a turbine set.'
		},
		{ label: 'Hydrogen', kind: 'hydrogen', note: 'High temperature electrolysis at industrial volume.' },
		{ label: 'Electricity', kind: 'electricity', note: 'Firm power behind the meter, every hour of the year.' }
	];

	const industries = [
		{ slug: 'steel', name: 'Steel', line: 'The hydrogen route to primary steel.' },
		{ slug: 'data-centres', name: 'Data Centres', line: 'Firm power beside the hall.' },
		{ slug: 'chemicals', name: 'Chemicals', line: 'Heat and power from one loop.' },
		{ slug: 'desalination', name: 'Desalination', line: 'Water without fuel.' },
		{ slug: 'mining', name: 'Mining', line: 'Off grid power with no diesel convoy.' },
		{ slug: 'communities', name: 'Communities', line: 'District heat for a town.' }
	];

	let p = $state(0);
	let still = $state(false);
	let scrollHintGone = $state(false);

	$effect(() => {
		if (!browser) return;
		still = prefersReducedMotion();
		const onScroll = () => {
			if (window.scrollY > 40) scrollHintGone = true;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// the ground goes from the blue-to-cream wash to light grey as it comes apart
	let wash = $derived(Math.min(1, p * 1.8));
</script>

<svelte:head>
	<title>Zettajoule, powering the world with high-temperature reactor modules</title>
</svelte:head>

<!-- The scroll-bound sequence: a tall stage the reactor is pinned inside. -->
<section
	class="stage"
	use:scrollRange={{ onprogress: (v) => (p = v) }}
	style="--wash:{wash}"
>
	<div class="pin">
		<div class="ground" aria-hidden="true"></div>
		<div class="pin-inner wrap">
			<h1 class="display">Powering the World</h1>
			<p class="promise">
				Clean heat, power and hydrogen for heavy industry, sold by the gigajoule rather than by the
				reactor.
			</p>

			<div class="reactor-holder">
				<Reactor {p} {still} size={330} />
			</div>

			<ul class="facts" aria-label="Key facts">
				{#each facts as f, i}
					<li style="opacity:{still ? 1 : Math.max(0, Math.min(1, (p - 0.28 - i * 0.05) * 7))}">
						{f}
					</li>
				{/each}
			</ul>

			<ul class="outputs" aria-label="What a module delivers">
				{#each outputs as o, i}
					<li style="opacity:{still ? 1 : Math.max(0, Math.min(1, (p - 0.46 - i * 0.04) * 7))}">
						<a href="/solutions?output_kind={o.kind}">
							<span class="o-label">{o.label}</span>
							<span class="o-note">{o.note}</span>
							<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
								<path d="M4 12 L12 4 M6 4 h6 v6" stroke="currentColor" stroke-width="1.8" fill="none" />
							</svg>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		{#if !scrollHintGone}
			<div class="hint" aria-hidden="true">
				<svg viewBox="0 0 18 22" width="16" height="20" focusable="false">
					<path d="M9 2 V18 M3 12 L9 18 L15 12" stroke="currentColor" stroke-width="1.8" fill="none" />
				</svg>
			</div>
		{/if}
	</div>
</section>

<!-- Every stage of the sequence is also available as plain written text. -->
<section class="section wrap" id="sequence-text">
	<div class="grid g2">
		<div>
			<p class="eyebrow">The sequence in words</p>
			<h2>What the reactor above is doing</h2>
			<ol class="steps">
				<li><strong>Whole.</strong> A sealed metallic module standing on its base.</li>
				<li><strong>Rods out.</strong> The tall control rods lift up and pull free of the vessel.</li>
				<li><strong>Dome off.</strong> The rounded lid rises away from the pressure vessel.</li>
				<li><strong>Core bare.</strong> A dark column of fuel is laid bare inside the vessel.</li>
				<li><strong>Drawing.</strong> The metal resolves into a clean technical line drawing.</li>
			</ol>
			<p class="muted">
				Scrolling back reassembles it. Nothing in this list is only reachable by aiming at the
				moving picture.
			</p>
		</div>
		<div>
			<p class="eyebrow">Zettajoule</p>
			<h2>A name taken from the units</h2>
			<p>
				A zettajoule is a thousand billion billion joules. The world uses a few hundred of them a
				year and industry wants far more of them clean. The name is the size of the problem written
				in the units the problem is measured in, which is the only honest way to state it.
			</p>
			<p>
				Roughly a quarter of that demand is industrial process heat, and almost none of it can be
				met by a water cooled reactor, because the temperature is not there. Ours leaves the core at
				<strong>750 degrees Celsius</strong>, which is what puts steel, chemicals, refining and
				hydrogen inside reach.
			</p>
			<p><a href="/company">Read the company story</a></p>
		</div>
	</div>
</section>

<!-- One section inverts to near-black, and nothing else does. -->
<section class="section section-invert">
	<div class="wrap-narrow" use:scrollBound>
		<p class="eyebrow">The hottest beat</p>
		<h2 class="big-claim reveal-line"><span>Heat no water cooled reactor can reach</span></h2>
		<p class="lede">
			A pressurised water reactor tops out near 320 degrees Celsius. That is enough to make
			electricity and nothing else. Helium leaves our core at 750, and above roughly 550 the whole
			industrial catalogue opens: direct reduction of iron, steam cracking, reforming, high
			temperature electrolysis. The difference between 320 and 750 is the difference between
			powering industry and decarbonising it.
		</p>
		<a class="btn" href="/edge">Why this is different</a>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap">
		<p class="eyebrow">Industries</p>
		<h2>What this can power</h2>
		<div class="rail">
			{#each industries as ind}
				<a class="ind-card" href="/solutions/{ind.slug}">
					<Plate seed={ind.slug} height={120} />
					<h3>{ind.name}</h3>
					<p class="muted">{ind.line}</p>
				</a>
			{/each}
		</div>
		<p class="rail-more"><a href="/solutions">Open the solutions explorer, all eight industries</a></p>
	</div>
</section>

<section class="section wrap">
	<div class="grid g2 tech-preview">
		<div use:scrollBound>
			<p class="eyebrow">Technology</p>
			<h2 class="reveal-line"><span>A proven machine, modernized</span></h2>
			<p class="lede">
				Tiny uranium grains in tough ceramic shells, graphite around them, helium flowing past. The
				design is a modernized version of a test reactor that has run since the late 1990s, so the
				safety case rests on an operating record rather than on a paper concept.
			</p>
			<a class="btn btn-secondary" href="/technology">Pick the reactor apart</a>
		</div>
		<div class="on-scroll" use:scrollBound>
			<Plate seed="technology-preview" kind="diagram" height={260} />
		</div>
	</div>
</section>

<style>
	.stage {
		height: 320vh;
		position: relative;
	}
	.pin {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
		display: grid;
		place-items: center;
	}
	.ground {
		position: absolute;
		inset: 0;
		z-index: var(--z-plate);
		/* opens on a wash from a cool blue tint to a warm cream tint */
		background: linear-gradient(178deg, #e2ecfb 0%, #eef1f6 46%, #f7f0e4 100%);
	}
	.ground::after {
		content: '';
		position: absolute;
		inset: 0;
		/* and settles to light grey */
		background: #eeeeec;
		opacity: var(--wash);
	}
	.pin-inner {
		position: relative;
		z-index: var(--z-words);
		text-align: center;
		display: grid;
		justify-items: center;
		gap: 4px;
		width: 100%;
		padding-top: 8px;
	}
	.display {
		/* the single place the heading family runs at its lightest weight and largest size */
		font-family: var(--font-head);
		font-weight: 200;
		font-size: clamp(2.4rem, 8.4vw, 7rem);
		letter-spacing: -0.045em;
		line-height: 0.94;
		margin: 0;
		max-width: 14ch;
	}
	.promise {
		max-width: 46ch;
		color: var(--ink-muted);
		font-size: clamp(0.92rem, 1.5vw, 1.05rem);
		margin: 6px 0 0;
	}
	.reactor-holder {
		margin: -18px 0 -14px;
		display: grid;
		place-items: center;
	}
	.facts {
		list-style: none;
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
		margin: 0;
		padding: 0;
	}
	.facts li {
		font-size: 0.78rem;
		font-weight: 650;
		border: var(--hair) solid var(--rule);
		background: rgba(255, 255, 255, 0.8);
		border-radius: 999px;
		padding: 5px 13px;
	}
	.outputs {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 8px;
		margin: 12px 0 0;
		padding: 0;
		width: min(940px, 100%);
	}
	.outputs a {
		display: grid;
		gap: 2px;
		padding: 11px 13px;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius);
		background: rgba(255, 255, 255, 0.86);
		text-decoration: none;
		color: var(--ink);
		text-align: left;
		position: relative;
		min-height: 62px;
	}
	.outputs a:hover {
		border-color: var(--accent);
		background: #fff;
	}
	.o-label {
		font-family: var(--font-head);
		font-size: 0.95rem;
	}
	.o-note {
		font-size: 0.74rem;
		color: var(--ink-muted);
		line-height: 1.35;
	}
	.outputs svg {
		position: absolute;
		top: 11px;
		right: 11px;
		color: var(--accent);
	}

	.hint {
		position: absolute;
		bottom: 18px;
		left: 50%;
		transform: translateX(-50%);
		color: var(--ink-muted);
		z-index: var(--z-words);
		animation: pulse 1700ms ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			transform: translate(-50%, 0);
			opacity: 0.5;
		}
		50% {
			transform: translate(-50%, 7px);
			opacity: 1;
		}
	}

	.steps {
		padding-left: 20px;
		margin: 0 0 14px;
	}
	.steps li {
		margin-bottom: 7px;
	}

	.big-claim {
		font-size: clamp(1.9rem, 5vw, 3.3rem);
	}

	.rail {
		display: flex;
		gap: 16px;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		overflow-x: auto;
		contain: paint;
		padding-bottom: 10px;
		scroll-snap-type: x mandatory;
	}
	.ind-card {
		flex: 0 0 232px;
		min-width: 0;
		scroll-snap-align: start;
		text-decoration: none;
		color: var(--ink);
		background: var(--surface);
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius-lg);
		padding: 12px;
	}
	.ind-card:hover {
		border-color: var(--accent);
	}
	.ind-card h3 {
		margin: 12px 0 4px;
		font-size: 1.05rem;
	}
	.ind-card p {
		margin: 0;
		font-size: 0.87rem;
	}
	.rail-more {
		margin: 18px 0 0;
	}

	.tech-preview {
		align-items: center;
		gap: 40px;
	}

	@media (max-width: 860px) {
		.stage {
			height: 300vh;
		}
		.outputs {
			grid-template-columns: minmax(0, 1fr);
			max-width: 420px;
		}
		.facts li {
			font-size: 0.72rem;
		}
		.ind-card {
			flex: 0 0 82%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hint {
			animation: none;
		}
		.stage {
			height: auto;
		}
		.pin {
			position: static;
			height: auto;
			padding: 40px 0 60px;
		}
	}
</style>
