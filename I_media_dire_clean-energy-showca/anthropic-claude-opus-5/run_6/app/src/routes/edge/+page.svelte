<script>
	import { reveal } from '$lib/scroll.js';
	import { OUTPUTS } from '$lib/nav.js';
	import BlockDiagram from '$lib/art/BlockDiagram.svelte';
</script>

<svelte:head><title>Our Edge | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Our Edge</p>
		<h1>Not a concept. A machine with a service record.</h1>
		<p class="lede">
			Four things separate this from the rest of the field, and the first one does most of the work.
		</p>
	</div>
</section>

<section class="section proven">
	<div class="wrap-narrow" use:reveal>
		<p class="number">01</p>
		<h2>It already exists</h2>
		<p>
			The design is a modernized version of a real high-temperature gas-cooled reactor that has been
			running as a test reactor since the late 1990s. It has started, run at temperature, been shut
			down, been inspected and been started again, for decades.
		</p>
		<p>
			Every other claim on this page is downstream of that one. A regulator reviewing a paper concept
			has to be persuaded about behaviour nobody has observed. A regulator reviewing this is being
			shown data from a machine with a service record, which is both a more believable argument and a
			very much faster one.
		</p>
	</div>
</section>

<section class="section invert hot">
	<div class="wrap" use:reveal>
		<p class="number">02</p>
		<h2>It runs far hotter than a water-cooled reactor</h2>
		<p class="lede">
			750 degrees Celsius at the outlet against roughly 300. That is not an incremental improvement,
			it is a different set of jobs.
		</p>
		<div class="temp-chart">
			<div class="t-row">
				<span class="t-name">Zettajoule module</span>
				<span class="t-bar" style="--w:100%"><span class="t-val">750 C</span></span>
			</div>
			<div class="t-row">
				<span class="t-name">Light water reactor</span>
				<span class="t-bar dim" style="--w:40%"><span class="t-val">about 300 C</span></span>
			</div>
		</div>
		<p>
			Below 300 degrees you can make electricity and warm things up. Above 550 you can crack
			hydrocarbons, reform, reduce iron ore directly and run high-temperature electrolysis where heat
			does part of the work that electricity would otherwise have to do. Those are the processes that
			have no other route off combustion.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap two" use:reveal>
		<div>
			<p class="number">03</p>
			<h2>One module or several</h2>
			<p>
				A remote mine needs 100 MW electrical and a single module. A steel mill on the hydrogen
				route needs eight. The same factory-built unit serves both, so a customer is never buying a
				scale they do not need or waiting for a bespoke design they cannot afford.
			</p>
			<p>
				In a multi-module block one unit comes off for maintenance while the others carry base load,
				which is how a site that cannot stop gets served at all.
			</p>
		</div>
		<div>
			<BlockDiagram outputKind="heat-and-power" moduleCount={4} />
		</div>
	</div>
</section>

<section class="section model">
	<div class="wrap-narrow" use:reveal>
		<p class="number">04</p>
		<h2>We own it, run it and staff it</h2>
		<p>
			The customer buys energy, not a reactor. We hold the asset, we hold the licence, and we crew
			the plant with operators trained through our own Operations Academy. No customer has to become
			a nuclear operator to stop burning gas.
		</p>
		<p>
			That removes the two objections that kill most industrial nuclear conversations before they
			start: the capital line and the competence question.
		</p>
	</div>
</section>

<section class="section outputs-band">
	<div class="wrap" use:reveal>
		<h2>And what comes out</h2>
		<ul class="outputs">
			{#each OUTPUTS as o}
				<li>
					<a href="/solutions?output_kind={encodeURIComponent(o.kind)}">
						<span class="o-name">{o.label}</span>
						<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
							<path d="M4 12 L12 4 M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.number {
		font-family: var(--font-head);
		font-size: 0.8rem;
		letter-spacing: 0.2em;
		color: var(--accent);
		margin: 0 0 6px;
	}
	.two {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: center;
	}
	.temp-chart {
		display: grid;
		gap: 12px;
		margin: 22px 0 26px;
	}
	.t-row {
		display: grid;
		grid-template-columns: 180px 1fr;
		align-items: center;
		gap: 14px;
	}
	.t-name {
		font-weight: 600;
		font-size: 0.9rem;
	}
	.t-bar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		width: var(--w);
		height: 34px;
		background: var(--accent);
		border-radius: var(--r-sm);
		padding-right: 10px;
		min-width: 90px;
	}
	.t-bar.dim {
		background: #4a5561;
	}
	.t-val {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		font-weight: 700;
		color: #fff;
	}
	.model {
		background: var(--paper-2);
	}
	.outputs-band {
		background: var(--paper);
	}
	.outputs {
		list-style: none;
		padding: 0;
		margin: 20px 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}
	.outputs a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-height: 56px;
		padding: 12px 16px;
		border: 1px solid var(--rule-strong);
		border-radius: var(--r-lg);
		text-decoration: none;
		color: var(--ink);
	}
	.outputs a:hover {
		border-color: var(--accent);
		background: var(--accent-tint);
		color: var(--accent-hover);
	}
	.o-name {
		font-family: var(--font-head);
		font-size: 1rem;
	}
	:global([data-revealed]) {
		transform: translateY(calc((1 - var(--rp, 1)) * 18px));
		opacity: calc(0.35 + var(--rp, 1) * 0.65);
	}
	@media (max-width: 860px) {
		.two {
			grid-template-columns: 1fr;
		}
		.t-row {
			grid-template-columns: 1fr;
			gap: 4px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global([data-revealed]) {
			transform: none !important;
			opacity: 1 !important;
		}
	}
</style>
