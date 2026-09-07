<script>
	import Plate from '$lib/components/Plate.svelte';
	export let data;
</script>

<svelte:head>
	<title>Company, Zettajoule</title>
	<meta name="description" content="Zettajoule provides clean heat and electricity to power a world of industrial applications." />
</svelte:head>

<section class="section wrap">
	<p class="eyebrow">Company</p>
	<h1 class="opening">clean heat and electricity to power a world of industrial applications</h1>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div>
			<p class="eyebrow">The vision</p>
			<h2>Industry gets to keep its heat and lose its carbon</h2>
			<p>
				Almost everything manufactured passes through a furnace, a reformer, a kiln or a column, and almost
				all of that heat is made by burning something. Electrification answers part of it. It does not answer
				the part that needs to be genuinely hot, and that part is enormous.
			</p>
			<p>
				We see a future where the high-grade heat under heavy industry comes from a small sealed machine
				sitting beside the plant, delivering exactly the temperature the process already runs at, with no
				flame and no stack.
			</p>
		</div>
		<Plate seed="company-vision" label="Generated plate: the vision" ratio="4 / 3" />
	</div>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<Plate seed="company-mission" label="Generated plate: the mission" ratio="4 / 3" />
		<div>
			<p class="eyebrow">The mission</p>
			<h2>Clean, reliable heat and power, sold as energy</h2>
			<p>
				Our mission is to provide clean and reliable heat and power to industry at a price it can contract
				against. Reliable is the operative word: an industrial site does not want energy that is clean on an
				annual average, it wants energy that is there every hour of every shift.
			</p>
			<p>
				A module runs 8000 hours a year, refuels on a cycle measured in years, and is not exposed to weather
				or to a fuel market. That is what makes it contractible.
			</p>
		</div>
	</div>
</section>

<section class="section wrap">
	<p class="eyebrow">The name</p>
	<h2>Built from the units of energy the world will need</h2>
	<p>
		The world runs on roughly six hundred exajoules of primary energy a year. As populations grow and industry
		electrifies, the honest unit for the demand ahead stops being the exajoule and becomes the zettajoule, a
		thousand of them.
	</p>
	<p>
		We took the name because it states the size of the problem rather than the size of the company. A joule is
		the smallest honest unit of energy; a zettajoule is what the century needs. The work is getting from one to
		the other with something industry can actually buy.
	</p>
</section>

<section class="section wrap" aria-labelledby="offices-heading">
	<p class="eyebrow">Where we are</p>
	<h2 id="offices-heading">Three offices</h2>
	<div class="grid grid--3">
		{#each data.offices as office, i}
			<div class="office">
				<span class="office__n mono">{String(i + 1).padStart(2, '0')}</span>
				<strong>{office.city}</strong>
				<span class="sub">{office.country}</span>
				<span class="chip">{office.role_label}</span>
			</div>
		{/each}
	</div>
</section>

<section class="section wrap">
	<div class="closing card">
		<h2>We do not only build the reactor</h2>
		<p>
			A reactor sale hands the customer a licence to hold, a fuel supply to secure and a control room to staff.
			Most industrial companies do not want any of those things, and asking them to want them is why so much of
			this industry stalls.
		</p>
		<p>
			So we keep them. Zettajoule owns the module, operates it, and staffs it with crews trained in our own
			Operations Academy. The customer signs an energy supply contract and buys heat, hydrogen or electricity
			by the unit. You never become a nuclear operator; you just stop burning things.
		</p>
		<a class="btn" href="/solutions">See what it powers</a>
	</div>
</section>

<style>
	.opening {
		font-size: clamp(1.9rem, 5.5vw, 4rem);
		max-width: 18ch;
		line-height: 1.02;
	}
	.office {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		align-items: flex-start;
	}
	.office__n {
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.office strong {
		font-family: var(--font-head);
		font-size: 1.3rem;
	}
	.sub {
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.closing {
		max-width: 760px;
		padding: 1.75rem;
	}
</style>
