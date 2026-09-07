<script>
	import Reveal from '$lib/Reveal.svelte';
	import Plate from '$lib/Plate.svelte';

	const OUTPUTS = [
		['Heat', 'heat', 'Process heat straight into the header, no combustion at the boundary.'],
		['Heat and power', 'heat-and-power', 'Both from one installation, for plants that need both.'],
		['Hydrogen', 'hydrogen', 'High-temperature production, where the heat does part of the work.'],
		['Electricity', 'electricity', 'Firm power that does not wait for a grid connection queue.']
	];
</script>

<svelte:head><title>Our Edge · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Our Edge</p>
		<Reveal as="h1" text="Why this one is different" />
		<p class="lede">
			Four arguments, and the first one carries most of the weight.
		</p>
	</div>
</section>

<section class="section wrap grid grid--2">
	<div>
		<p class="eyebrow">The strong point</p>
		<Reveal as="h2" text={'Not a paper concept.\nA machine that runs.'} />
		<p>
			Most advanced reactor companies are asking a regulator, an investor and a customer to believe
			a design that has never been built. We are asking them to assess a modernized version of a
			high-temperature gas-cooled reactor that has been operating since the late 1990s.
		</p>
		<p>
			That difference is not marketing. It changes what a licensing submission contains: measured
			behaviour from an operating machine instead of a projection from a model. It is why we expect
			to license faster, why the safety case is arguable today, and why a customer signed a fifteen
			year supply agreement off the back of it.
		</p>
	</div>
	<Plate seed="edge-proven" ratio="4 / 3" label="Generated plate: a proven design, modernized" />
</section>

<section class="section hotter">
	<div class="wrap">
		<p class="eyebrow">Temperature</p>
		<Reveal as="h2" text="It runs much hotter" />
		<p class="lede">
			An ordinary water-cooled reactor tops out near 300 degrees Celsius. Ours delivers 750, which
			is the difference between making electricity and doing the chemistry.
		</p>
		<div class="scale">
			<div class="scale__row">
				<span class="scale__label">Water-cooled reactor</span>
				<span class="scale__track"><span class="scale__fill scale__fill--water"></span></span>
				<span class="scale__value">300 C</span>
			</div>
			<div class="scale__row">
				<span class="scale__label">Zettajoule module</span>
				<span class="scale__track"><span class="scale__fill scale__fill--zj"></span></span>
				<span class="scale__value">750 C</span>
			</div>
		</div>
		<p>
			Direct reduction of iron, high-temperature electrolysis, cracking, reforming and thermal
			desalination all live above the line a water-cooled reactor can reach. Those jobs are not
			harder for us; they are simply impossible for the alternative.
		</p>
	</div>
</section>

<section class="section wrap grid grid--2">
	<div>
		<h2>One module or several</h2>
		<p>
			Capacity arrives in module-sized steps. A remote mine, a district heat network or a small
			campus takes one; a refinery or a desalination plant takes two to four; a primary steel works
			on the hydrogen route takes eight. A site starts with what it needs and grows without a
			redesign, because the unit of growth is a whole machine built in a factory.
		</p>
	</div>
	<div>
		<h2>We own it, run it and staff it</h2>
		<p>
			The customer buys energy, not a reactor, and takes on no nuclear operating obligation. We hold
			the licence, we run the plant and we supply the operators through our own Operations Academy.
			It is a supply agreement of the kind every industrial site already signs, and it puts the risk
			with the party built to carry it.
		</p>
	</div>
</section>

<section class="section outputs">
	<div class="wrap">
		<h2>The four outputs, again</h2>
		<ul class="outputs__grid">
			{#each OUTPUTS as [label, kind, note]}
				<li>
					<a class="output" href={`/solutions?output_kind=${encodeURIComponent(kind)}`}>
						<span class="output__label">{label}</span>
						<span class="output__note">{note}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.hotter {
		background: var(--paper-2);
		border-block: 1px solid var(--rule);
	}
	.scale {
		display: grid;
		gap: 0.6rem;
		max-width: 640px;
		margin: 1.5rem 0;
	}
	.scale__row {
		display: grid;
		grid-template-columns: 170px 1fr 60px;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.88rem;
	}
	.scale__track {
		height: 16px;
		background: var(--paper-3);
		border-radius: 3px;
		overflow: hidden;
	}
	.scale__fill {
		display: block;
		height: 100%;
	}
	.scale__fill--water {
		width: 40%;
		background: var(--ink-faint);
	}
	.scale__fill--zj {
		width: 100%;
		background: linear-gradient(90deg, var(--accent), #e08b2a);
	}
	.scale__value {
		font-family: var(--font-mono);
		text-align: right;
	}
	.outputs__grid {
		list-style: none;
		margin: 1.25rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}
	.output {
		display: grid;
		gap: 0.35rem;
		height: 100%;
		padding: 1.1rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
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
		font-size: 1.2rem;
	}
	.output__note {
		font-size: 0.86rem;
		color: var(--ink-muted);
	}
	@media (max-width: 560px) {
		.scale__row {
			grid-template-columns: 120px 1fr 52px;
		}
	}
</style>
