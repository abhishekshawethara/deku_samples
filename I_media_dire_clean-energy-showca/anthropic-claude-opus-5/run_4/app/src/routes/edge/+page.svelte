<script>
	import Plate from '$lib/components/Plate.svelte';
	export let data;

	const OUTPUTS = [
		{ key: 'heat', label: 'Heat', note: 'Process heat at the grade the plant already runs at.' },
		{ key: 'heat-and-power', label: 'Heat and power', note: 'Both grades from the same modules, on one contract.' },
		{ key: 'hydrogen', label: 'Hydrogen', note: 'High-temperature electrolysis, fed with steam at 750 C.' },
		{ key: 'electricity', label: 'Electricity', note: 'Firm carbon-free power, matched hour by hour.' }
	];
</script>

<svelte:head>
	<title>Our Edge, Zettajoule</title>
	<meta name="description" content="A modernized proven reactor, hotter than water-cooled machines, deployed in modules and sold as energy." />
</svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Our Edge</p>
	<h1>Why this one works</h1>
	<p class="lede">
		Plenty of companies have a reactor concept. The difference here is that ours already exists, runs far
		hotter than the alternatives, arrives in modules, and is sold as energy rather than as a machine.
	</p>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div>
			<p class="eyebrow">The strong point</p>
			<h2>Not a paper concept. A modernized machine with an operating record.</h2>
			<p>
				Our design is a modernized version of a real high-temperature gas-cooled reactor that has been running
				since the late 1990s. The physics has been observed, the fuel has been irradiated, the graphite has
				aged and the helium circuit has run hot for decades.
			</p>
			<p>
				This changes the two things that kill new nuclear ventures. It makes the technology believable to a
				customer signing a twenty-year supply contract, and it makes licensing faster, because the regulator
				is reviewing a modernization rather than adjudicating a first principle.
			</p>
		</div>
		<Plate seed="edge-proven" label="Generated plate: the proven ancestor" ratio="4 / 3" />
	</div>
</section>

<section class="section wrap" aria-labelledby="hotter-heading">
	<p class="eyebrow">Temperature</p>
	<h2 id="hotter-heading">It does jobs a water-cooled reactor simply cannot</h2>
	<p>
		A water-cooled reactor is limited by the water in it and tops out around 300 degrees Celsius. That is enough
		to make electricity and almost nothing else industry actually needs. Helium has no such ceiling.
	</p>
	<div class="scale">
		<div class="scale__row">
			<span class="scale__label">Water-cooled nuclear</span>
			<span class="scale__track"><span class="scale__fill" style="width:40%"></span></span>
			<span class="scale__value mono">300 C</span>
		</div>
		<div class="scale__row">
			<span class="scale__label">Zettajoule module</span>
			<span class="scale__track"><span class="scale__fill scale__fill--hot" style="width:100%"></span></span>
			<span class="scale__value mono">750 C</span>
		</div>
	</div>
	<p>
		At 750 degrees the module reaches chemical process heat, high-temperature electrolysis and the direct
		reduction of iron. Those are the hard, high-carbon corners of industry, and they are exactly the ones a
		water-cooled machine cannot enter.
	</p>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div class="card">
			<h2>One module or several</h2>
			<p>
				A single module suits a remote mine, a town network or a compute campus. A multi-module installation
				suits a refinery, a chemical complex or a steel plant, and grows by adding modules rather than by
				rebuilding.
			</p>
			<p class="sub">
				Of the eight industries we serve, {data.solutions.filter((s) => s.deployment === 'single-module').length}
				are usually single module and {data.solutions.filter((s) => s.deployment === 'multi-module').length} multi module.
			</p>
		</div>
		<div class="card">
			<h2>We own it, run it and staff it</h2>
			<p>
				The customer does not buy a reactor, hold a licence, procure fuel or hire operators. They sign an
				energy supply contract and buy the units they use.
			</p>
			<p>
				We keep the machine, the licence and the crew, because that is where the expertise is and because it
				is the only version of this business that an industrial buyer will actually sign.
			</p>
		</div>
	</div>
</section>

<section class="section wrap" aria-labelledby="outputs-heading">
	<p class="eyebrow">What comes out</p>
	<h2 id="outputs-heading">Four outputs</h2>
	<div class="grid grid--4">
		{#each OUTPUTS as o}
			<a class="output" href="/solutions?output_kind={encodeURIComponent(o.key)}">
				<strong>{o.label}</strong>
				<span>{o.note}</span>
			</a>
		{/each}
	</div>
</section>

<style>
	.scale {
		margin: 1.75rem 0;
		max-width: 620px;
	}
	.scale__row {
		display: grid;
		grid-template-columns: 12rem 1fr 4rem;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.6rem;
		font-size: 0.9rem;
	}
	.scale__label {
		color: var(--ink-muted);
	}
	.scale__track {
		height: 14px;
		background: var(--paper-grey);
		border: 1px solid var(--rule);
		border-radius: 999px;
		overflow: hidden;
	}
	.scale__fill {
		display: block;
		height: 100%;
		background: var(--rule-strong);
	}
	.scale__fill--hot {
		background: linear-gradient(90deg, var(--accent) 0%, #ff9d4d 100%);
	}
	.scale__value {
		text-align: right;
		font-weight: 700;
	}
	.sub {
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.output {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
		text-decoration: none;
		color: var(--ink);
	}
	.output:hover {
		border-color: var(--accent);
		background: var(--accent-tint);
	}
	.output strong {
		font-family: var(--font-head);
		font-size: 1.1rem;
	}
	.output span {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
	@media (max-width: 560px) {
		.scale__row {
			grid-template-columns: 8rem 1fr 3.5rem;
		}
	}
</style>
