
<script>
	import { apiData } from '$lib/api';
	import { scrollBound } from '$lib/scroll';

	let offices = $state([]);
	let loading = $state(true);

	$effect(() => {
		apiData('/offices', { auth: false })
			.then((d) => (offices = d || []))
			.catch(() => (offices = []))
			.finally(() => (loading = false));
	});
</script>

<svelte:head><title>Company, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Company</p>
		<h1 class="opening">
			clean heat and electricity to power a world of industrial applications
		</h1>
	</div>
</div>

<section class="section wrap">
	<div class="grid g2 story">
		<div use:scrollBound>
			<p class="eyebrow">The vision</p>
			<h2 class="reveal-line"><span>A world that can afford its own energy</span></h2>
			<p class="lede">
				Energy demand climbs for the rest of this century while the carbon budget falls. Both are
				true at once, and the only way through is energy that is clean, firm and hot enough to do
				industrial work. We are building the machine that does all three.
			</p>
		</div>
		<div use:scrollBound>
			<p class="eyebrow">The mission</p>
			<h2 class="reveal-line"><span>Clean, reliable heat and power</span></h2>
			<p class="lede">
				To provide clean, reliable heat and power to the industries that cannot electrify their way
				out of the problem: steel, chemicals, refining, shipping fuel, water. Reliable means every
				hour of the year, not when the weather allows.
			</p>
		</div>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap-narrow">
		<p class="eyebrow">The name</p>
		<h2>Built from the units of energy the world will need</h2>
		<p>
			A joule is a small thing. A zettajoule is a thousand billion billion of them, and the world
			gets through a few hundred a year. When we looked for a name, every metaphor felt like
			decoration next to the number itself, so we took the unit.
		</p>
		<p>
			It fixes the scale of the problem in the company's own name. Roughly a quarter of that demand
			is industrial process heat, most of it above the temperature any water cooled reactor can
			reach. That quarter is the part we are built for.
		</p>
	</div>
</section>

<section class="section wrap">
	<p class="eyebrow">Where we are</p>
	<h2>Three offices</h2>
	{#if loading}
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading the offices</div>
	{:else if offices.length === 0}
		<div class="empty">
			<h3>No office is listed</h3>
			<p>The office list is empty right now.</p>
			<a class="btn btn-sm btn-secondary" href="/contact">Get in Touch</a>
		</div>
	{:else}
		<ul class="offices">
			{#each offices as o, i (o.city)}
				<li class="card on-scroll" use:scrollBound={{ start: 0.95, end: 0.62 }}>
					<h3>{o.city}</h3>
					<p class="muted">{o.country}</p>
					<span class="pill">{o.role_label}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="section section-sunk">
	<div class="wrap-narrow">
		<p class="eyebrow">The model</p>
		<h2>We do not only build the reactor</h2>
		<p>
			A conventional vendor designs a plant, sells it, and hands the keys to a customer who now has
			to become a nuclear operator. Almost no industrial company wants that, and it is the reason
			most industrial nuclear conversations end.
		</p>
		<p>
			So we keep the machine. Zettajoule owns the reactor, runs it, and staffs it through the
			Operations Academy. The customer buys heat, power or hydrogen by the unit on a long contract
			at an agreed price, and never employs a single reactor operator. It is the same energy at the
			same fence line, with the hard part on our side of it.
		</p>
		<a class="btn" href="/edge">Why this is different</a>
	</div>
</section>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 52px 0 42px;
	}
	.opening {
		max-width: 20ch;
		font-size: clamp(1.9rem, 5vw, 3.4rem);
	}
	.story {
		gap: 44px;
	}
	.offices {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}
	.offices h3 {
		margin: 0 0 4px;
	}
	.offices p {
		margin: 0 0 10px;
		font-size: 0.9rem;
	}
	@media (max-width: 760px) {
		.offices {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
