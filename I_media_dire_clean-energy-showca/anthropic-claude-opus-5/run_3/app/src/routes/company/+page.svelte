<script>
	import Reveal from '$lib/Reveal.svelte';
	import Plate from '$lib/Plate.svelte';
	import { reveal } from '$lib/scroll.js';

	let { data } = $props();
</script>

<svelte:head><title>Company · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Company</p>
		<Reveal
			as="h1"
			text={'clean heat and electricity to power a world of industrial applications'}
		/>
	</div>
</section>

<section class="section wrap grid grid--2">
	<div>
		<h2>The vision</h2>
		<p>
			A world where the heat industry runs on stops being the reason industry emits. Not electricity
			alone, which is the part everyone already knows how to decarbonise, but the hot, continuous,
			unglamorous energy that makes steel, fuel, chemicals and fresh water.
		</p>
		<h2>The mission</h2>
		<p>
			To provide clean, reliable heat and power at the temperatures industry actually uses, in units
			small enough to build in a factory and put where the demand already is. Reliable is the load
			bearing word: a plant that cannot ride out an interruption needs a supply that does not have
			one.
		</p>
	</div>
	<Plate seed="company-vision" ratio="4 / 3" label="Generated plate: the company vision" />
</section>

<section class="section name-sec">
	<div class="wrap">
		<p class="eyebrow">The name</p>
		<Reveal as="h2" text="Built from the units of energy the world will need" />
		<p class="lede">
			A joule is the small unit. A zettajoule is a sextillion of them, and it is the scale at which
			the world's future energy need is measured. We took the company name from the unit rather than
			from a metaphor, because the size of the problem is the whole reason the company exists.
		</p>
	</div>
</section>

<section class="section wrap">
	<h2>Where we are</h2>
	<ul class="offices">
		{#each data.offices as o, i}
			<li class="office" use:reveal style:--i={i}>
				<Plate seed={`office-${o.city}`} ratio="16 / 9" />
				<h3>{o.city}</h3>
				<p class="muted">{o.country}</p>
				<p class="office__role">{o.role_label}</p>
			</li>
		{/each}
	</ul>
</section>

<section class="section owned">
	<div class="wrap grid grid--2">
		<div>
			<p class="eyebrow">The model</p>
			<Reveal as="h2" text={'We do not only\nbuild the reactor.'} />
		</div>
		<div>
			<p>
				We own it, we run it and we staff it. The customer does not buy a reactor, take on a nuclear
				operating licence or hire operators: they sign an energy supply agreement and buy heat,
				hydrogen or electricity by the unit, the way they already buy energy today.
			</p>
			<p>
				That decision shapes everything else about the company. It is why we run our own Operations
				Academy, why the digital twin matters enough to fund properly, and why the licensing
				strategy leans on a machine with a real operating record instead of a concept. The operating
				risk sits with the organisation built around understanding it.
			</p>
			<a class="btn btn--ghost" href="/edge">What makes this different</a>
		</div>
	</div>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3.5rem);
		padding-bottom: 1.5rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.head :global(h1) {
		max-width: 18ch;
		text-transform: lowercase;
	}
	.name-sec {
		background: var(--paper-2);
		border-block: 1px solid var(--rule);
	}
	.offices {
		list-style: none;
		margin: 1.5rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.25rem;
	}
	/* the office cards arrive one by one, bound to scroll position */
	.office {
		opacity: 0;
		transform: translateY(14px);
		transition:
			opacity 460ms ease,
			transform 460ms ease;
		transition-delay: calc(var(--i) * 110ms);
	}
	.office[data-revealed='true'] {
		opacity: 1;
		transform: none;
	}
	.office h3 {
		margin: 0.7rem 0 0.1rem;
		font-size: 1.15rem;
	}
	.office p {
		margin: 0;
	}
	.office__role {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--accent);
		margin-top: 0.25rem !important;
	}
	.owned {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
	}
	@media (prefers-reduced-motion: reduce) {
		.office {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
