
<script>
	import { scrollBound } from '$lib/scroll';

	const outputs = [
		['Heat', 'heat', 'Process heat straight into the header the site already owns.'],
		['Heat and power', 'heat-and-power', 'One helium loop split between process heat and a turbine set.'],
		['Hydrogen', 'hydrogen', 'High temperature electrolysis, cheaper because heat does part of the work.'],
		['Electricity', 'electricity', 'Firm power behind the meter, every hour of the year.']
	];
</script>

<svelte:head><title>Our Edge, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Our Edge</p>
		<h1>Not a paper concept</h1>
		<p class="lede">
			Most advanced reactor companies are asking a regulator to believe a design that has never
			run. We are asking one to accept a modernized version of a reactor that has been running
			since the late 1990s. That is the whole argument, and everything else follows from it.
		</p>
	</div>
</div>

<section class="section wrap">
	<div class="wrap-narrow" style="padding:0">
		<p class="eyebrow">The strong point</p>
		<h2>A proven machine, brought up to date</h2>
		<p>
			The reference reactor exists. It was built, licensed and operated, and its behaviour under the
			cases that matter, including a full loss of forced circulation, was demonstrated on real
			hardware rather than argued in a document. Our work is modernization: current materials,
			current instrumentation, factory manufacture, a digital twin.
		</p>
		<p>
			The consequence is believability. A regulator reviewing an update to something with an
			operating record is doing a different job from one reviewing a concept, and the difference
			shows up as years on the schedule and as risk an investor can actually price.
		</p>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap">
		<p class="eyebrow">Temperature</p>
		<h2>It runs hotter, so it does jobs they cannot</h2>
		<div class="temps">
			<div class="temp card">
				<p class="t-name">Water cooled reactor</p>
				<p class="t-value">about 320 C</p>
				<span class="t-bar" style="width:43%"></span>
				<p class="muted">Enough to raise steam and make electricity. Nothing above that.</p>
			</div>
			<div class="temp card">
				<p class="t-name">Zettajoule module</p>
				<p class="t-value">750 C</p>
				<span class="t-bar hot" style="width:100%"></span>
				<p class="muted">
					Above roughly 550 the industrial catalogue opens: direct reduction of iron, steam
					cracking, reforming, high temperature electrolysis.
				</p>
			</div>
		</div>
		<p class="muted note">
			In words: 320 degrees powers industry, 750 decarbonises it. The gap between the two numbers is
			the reason this company exists.
		</p>
	</div>
</section>

<section class="section wrap">
	<div class="grid g2 pair">
		<div use:scrollBound>
			<p class="eyebrow">Flexibility</p>
			<h2 class="reveal-line"><span>One module, or several</span></h2>
			<p>
				A single module suits a mine, a data centre campus or a town. Multiples suit a refinery, a
				chemical complex or a steel mill, and the plant grows by adding identical modules rather
				than by being redesigned. Same machine, same crew training, same licensing basis.
			</p>
		</div>
		<div use:scrollBound>
			<p class="eyebrow">The business model</p>
			<h2 class="reveal-line"><span>We own it, run it and staff it</span></h2>
			<p>
				The customer buys energy, not a reactor, and never employs an operator. We keep the asset,
				take the operating risk and sell the output on a long contract. It is the reason
				industrial conversations that normally end at "we are not going to become a nuclear
				operator" keep going.
			</p>
		</div>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap">
		<p class="eyebrow">What comes out</p>
		<h2>Four outputs from one machine</h2>
		<ul class="outs">
			{#each outputs as [label, kind, note]}
				<li class="card">
					<h3><a href="/solutions?output_kind={kind}">{label}</a></h3>
					<p class="muted">{note}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 46px 0 36px;
	}
	.temps {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		margin-top: 20px;
	}
	.temp {
		background: var(--surface);
	}
	.t-name {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-muted);
		margin: 0 0 4px;
		text-transform: uppercase;
		letter-spacing: 0.09em;
	}
	.t-value {
		font-family: var(--font-head);
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		margin: 0 0 10px;
	}
	.t-bar {
		display: block;
		height: 9px;
		border-radius: 999px;
		background: var(--ink-faint);
		margin-bottom: 12px;
	}
	.t-bar.hot {
		background: var(--accent);
	}
	.temp p.muted {
		margin: 0;
		font-size: 0.9rem;
	}
	.note {
		margin-top: 18px;
		font-size: 0.92rem;
	}
	.pair {
		gap: 40px;
	}
	.outs {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 14px;
	}
	.outs h3 {
		margin: 0 0 8px;
		font-size: 1.05rem;
	}
	.outs p {
		margin: 0;
		font-size: 0.88rem;
	}
	.outs .card {
		background: var(--surface);
	}
	@media (max-width: 900px) {
		.temps,
		.outs {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 620px) {
		.temps,
		.outs {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
