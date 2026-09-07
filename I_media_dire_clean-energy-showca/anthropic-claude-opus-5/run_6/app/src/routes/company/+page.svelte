<script>
	import { reveal } from '$lib/scroll.js';
	import Plate from '$lib/art/Plate.svelte';
	import { api } from '$lib/api.js';
	import { onMount } from 'svelte';

	let offices = [];
	let loading = true;

	onMount(async () => {
		try {
			offices = await api('/offices', { anonymous: true });
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head><title>Company | Zettajoule</title></svelte:head>

<section class="opener">
	<div class="wrap">
		<p class="eyebrow">Company</p>
		<h1 class="split">clean heat and electricity to power a world of industrial applications</h1>
	</div>
</section>

<section class="section">
	<div class="wrap two" use:reveal>
		<div>
			<h2>The vision</h2>
			<p>
				A world where the heat industry runs on does not come from burning something. Not a world
				with less industry in it, and not one that waits for demand to fall: demand is going up. The
				vision is the same industry, the same output, the same jobs, with the combustion taken out
				of the middle of it.
			</p>
			<h2>The mission</h2>
			<p>
				To provide clean, reliable heat and power at the temperatures industry actually uses, on the
				customer's own site, under a contract they can plan a business around. Reliable is the word
				that carries the weight. A plant that cannot stop cannot be run on a supply that stops.
			</p>
		</div>
		<div>
			<Plate seed="company-vision" ratio="4 / 3" label="Generated plate: an industrial site at daylight" />
		</div>
	</div>
</section>

<section class="section name-band">
	<div class="wrap-narrow" use:reveal>
		<h2>Where the name comes from</h2>
		<p>
			A joule is the base unit of energy. An exajoule is a billion billion of them, and the world
			uses several hundred exajoules a year. A zettajoule is a thousand exajoules: the unit you reach
			for when you describe the whole of humanity's energy use over a span of years, or what it will
			take to carry the century in front of us.
		</p>
		<p>
			The company is named after the unit the future is measured in, because the scale of the job is
			the point. One module is 250 MW thermal. The answer is a great many modules, built in a
			factory, deployed one site at a time.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 use:reveal>Where we are</h2>
		{#if loading}
			<p aria-busy="true"><span class="spinner" aria-hidden="true"></span> Loading offices…</p>
		{:else if !offices.length}
			<div class="empty">
				<p>The office list is unavailable right now.</p>
				<a class="btn btn-sm" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="offices">
				{#each offices as o, i}
					<li class="card" use:reveal={{ stagger: i }}>
						<Plate seed="office-{o.city}" ratio="16 / 9" />
						<h3>{o.city}</h3>
						<p class="muted">{o.country}</p>
						<span class="pill">{o.role_label}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<section class="section model-band">
	<div class="wrap-narrow" use:reveal>
		<h2>We do not only build the reactor</h2>
		<p>
			This is the part that surprises people. We own the plant, we operate it, and we staff it with
			crews we train ourselves through the Operations Academy. The customer does not become a nuclear
			operator, does not hold the licence, and does not hire a single reactor engineer.
		</p>
		<p>
			What they buy is heat, hydrogen or electricity, metered and contracted, in the same way they
			buy gas today. The nuclear part is our problem, which is exactly how it should be if this is
			going to be adopted at the speed the need requires.
		</p>
		<a class="btn btn-primary" href="/edge">Why that matters</a>
	</div>
</section>

<style>
	.opener {
		background: linear-gradient(180deg, var(--sky), var(--paper));
		padding-block: clamp(48px, 9vw, 116px);
	}
	.opener h1 {
		max-width: 17ch;
		font-size: clamp(2rem, 5.4vw, 4rem);
	}
	.two {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: start;
	}
	.name-band {
		background: var(--paper-2);
	}
	.offices {
		list-style: none;
		padding: 0;
		margin: 22px 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: 18px;
	}
	.offices h3 {
		margin: 14px 0 2px;
		font-size: 1.15rem;
	}
	.offices p {
		margin: 0 0 10px;
		font-size: 0.9rem;
	}
	.model-band {
		background: var(--near-black);
		color: #eceef0;
	}
	.model-band :global(h2) {
		color: #fff;
	}
	.model-band p {
		color: #b9c0c8;
	}
	:global([data-revealed]) {
		transform: translateY(calc((1 - var(--rp, 1)) * 18px));
		opacity: calc(0.35 + var(--rp, 1) * 0.65);
	}
	@media (max-width: 860px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global([data-revealed]) {
			transform: none !important;
			opacity: 1 !important;
		}
	}
</style>
