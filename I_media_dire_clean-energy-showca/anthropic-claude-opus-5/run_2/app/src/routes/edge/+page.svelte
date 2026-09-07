<script>
	import { reveal } from '$lib/scroll.js';

	const OUTPUTS = [
		['Heat', 'heat'],
		['Heat and power', 'heat-and-power'],
		['Hydrogen', 'hydrogen'],
		['Electricity', 'electricity']
	];
</script>

<svelte:head><title>Our Edge, Zettajoule</title></svelte:head>

<section class="section lead">
	<div class="wrap">
		<p class="eyebrow">Our Edge</p>
		<h1>Not a paper concept. A reactor that has been running since the late 1990s.</h1>
		<p class="lede">
			Most advanced reactor companies are asking a regulator, a bank and a customer to believe a design that has
			never existed. We are modernizing one that has been operating as a test reactor for a quarter of a century.
			That single fact changes the licensing argument, the financing conversation and the customer's risk
			assessment at the same time.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 use:reveal>It runs far hotter than a water cooled plant.</h2>
		<div class="temp-chart" role="img" aria-label="A water cooled reactor reaches about 300 degrees Celsius at the outlet; this module reaches 750 degrees Celsius.">
			<div class="bar-row">
				<span class="bar-label">Water cooled reactor</span>
				<div class="bar"><span style="width:40%">300 C</span></div>
			</div>
			<div class="bar-row">
				<span class="bar-label">This module</span>
				<div class="bar"><span class="bar-hot" style="width:100%">750 C</span></div>
			</div>
		</div>
		<p class="lede">
			Below three hundred degrees a reactor makes electricity and little else. Above seven hundred it drives
			chemical reformers, high temperature electrolysis, direct reduced iron and thermal desalination. Those jobs
			are simply not available to a water cooled plant, whatever else it does well.
		</p>
	</div>
</section>

<section class="section band">
	<div class="wrap cols">
		<div class="card" use:reveal>
			<h3>One module or several</h3>
			<p>
				A single module suits a mine, a town network or a compute campus. Three to eight suit a chemical
				complex, a hydrogen corridor or a steelworks. Capacity is added by ordering, not by starting a new
				construction programme, and modules are staggered so heat never stops during maintenance.
			</p>
		</div>
		<div class="card" use:reveal>
			<h3>We own it, run it and staff it</h3>
			<p>
				The customer buys the energy. We hold the licence, we operate the plant and we supply the operators from
				our own Operations Academy. No industrial company has to become a nuclear operator to decarbonise its
				heat.
			</p>
		</div>
		<div class="card" use:reveal>
			<h3>Licensed on a real record</h3>
			<p>
				Every claim in the safety case points at an operating reactor of the same family and at fuel that has
				been manufactured and irradiated for decades. Reviewers are asked to check a record rather than to
				accept a simulation, which is a far shorter route to a licence.
			</p>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2>Four outputs from one machine.</h2>
		<ul class="outputs">
			{#each OUTPUTS as [label, kind]}
				<li><a href={`/solutions?output_kind=${kind}`}>{label}</a></li>
			{/each}
		</ul>
		<a class="btn" href="/solutions">See the eight industries</a>
	</div>
</section>

<style>
	.lead {
		background: linear-gradient(180deg, #eaf1fb 0%, #fbf6ee 100%);
	}
	.lead h1 {
		max-width: 20ch;
	}
	.temp-chart {
		display: grid;
		gap: 14px;
		margin: 24px 0 28px;
	}
	.bar-row {
		display: grid;
		grid-template-columns: minmax(160px, 220px) 1fr;
		gap: 14px;
		align-items: center;
	}
	.bar-label {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 0.9rem;
	}
	.bar {
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		background: var(--ground-soft);
		height: 42px;
	}
	.bar span {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		height: 100%;
		padding: 0 12px;
		background: var(--sky-deep);
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: 0.86rem;
		border-radius: var(--radius-sm);
	}
	.bar-hot {
		background: var(--navy);
		color: #fff;
	}
	.band {
		background: var(--ground-soft);
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 18px;
	}
	.cols p {
		margin: 0;
		color: var(--ink-muted);
	}
	.outputs {
		list-style: none;
		margin: 0 0 24px;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		border-top: 1px solid var(--rule-strong);
	}
	.outputs li {
		border-bottom: 1px solid var(--rule-strong);
	}
	.outputs a {
		display: block;
		padding: 18px 4px;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.3rem;
		text-decoration: none;
		color: var(--ink);
	}
	.outputs a:hover {
		color: var(--accent-hover);
	}
	[data-revealed='false'] {
		opacity: 0;
		transform: translateY(18px);
	}
</style>
