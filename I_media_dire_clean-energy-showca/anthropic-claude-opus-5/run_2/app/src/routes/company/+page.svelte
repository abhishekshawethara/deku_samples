<script>
	import { reveal } from '$lib/scroll.js';
	import Plate from '$lib/components/Plate.svelte';
	export let data;
</script>

<svelte:head><title>Company, Zettajoule</title></svelte:head>

<section class="section opening">
	<div class="wrap">
		<p class="eyebrow">Company</p>
		<h1>clean heat and electricity to power a world of industrial applications</h1>
	</div>
</section>

<section class="section">
	<div class="wrap narrative">
		<div use:reveal>
			<h2>The vision</h2>
			<p class="lede">
				A world where industry runs on clean energy without asking it to run more slowly, in fewer places, or at
				a higher price. Not a world of fewer factories: a world of factories that stopped burning things.
			</p>
		</div>
		<div use:reveal>
			<h2>The mission</h2>
			<p class="lede">
				To provide clean, reliable heat and power wherever industry needs it, at the temperatures industry
				actually uses. Reliable means firm: through the night, through winter, through a still week. Clean means
				at the point of use, with no stack and no fuel convoy.
			</p>
		</div>
		<div use:reveal>
			<h2>The name</h2>
			<p class="lede">
				A joule is the unit of energy. An exajoule is a billion billion of them, and the world already uses more
				than six hundred exajoules of primary energy a year. A zettajoule is a thousand exajoules, which is the
				order of the energy the world will need each year once everything that burns has stopped burning. The
				company is named for the size of the problem rather than for the size of the machine.
			</p>
		</div>
	</div>
</section>

<section class="section offices-band">
	<div class="wrap">
		<h2>Where we are</h2>
		<ul class="offices">
			{#each data.offices as o, i (o.city)}
				<li use:reveal style={`--i:${i}`}>
					<Plate seed={`office-${o.city}`} ratio="3 / 1" kind="ground" />
					<h3>{o.city}</h3>
					<p class="dense">{o.country}</p>
					<span class="tag">{o.role_label}</span>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section closing">
	<div class="wrap split">
		<div>
			<h2>We do not only build the reactor.</h2>
		</div>
		<div>
			<p class="lede">
				We own it. We run it. We staff it, through our own Operations Academy, with operators we trained and
				certified ourselves. The customer signs an energy agreement and buys heat, hydrogen or electricity by
				the unit. The licence, the operators, the maintenance and the operating risk stay with us.
			</p>
			<p class="lede">
				That is the whole business model, and it is why an industrial customer can act this decade rather than
				starting a nuclear programme of its own.
			</p>
			<a class="btn btn-secondary" href="/edge">What makes us different</a>
		</div>
	</div>
</section>

<style>
	.opening {
		background: linear-gradient(180deg, #eaf1fb 0%, #fbf6ee 100%);
		padding-bottom: 88px;
	}
	.opening h1 {
		max-width: 18ch;
		font-size: clamp(2rem, 6vw, 4rem);
	}
	.narrative {
		display: grid;
		gap: 48px;
		max-width: 780px;
	}
	.offices-band {
		background: var(--ground-soft);
	}
	.offices {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 18px;
	}
	.offices li {
		background: #fff;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 14px;
	}
	.offices h3 {
		margin: 12px 0 2px;
	}
	.offices p {
		color: var(--ink-muted);
		margin-bottom: 8px;
	}
	.tag {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.76rem;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		padding: 2px 9px;
		color: var(--ink-muted);
	}
	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
	}
	[data-revealed='false'] {
		opacity: 0;
		transform: translateY(18px);
	}
</style>
