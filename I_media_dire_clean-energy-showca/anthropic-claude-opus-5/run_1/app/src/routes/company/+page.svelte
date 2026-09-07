<script>
	import Reveal from '$lib/components/Reveal.svelte';
	import Plate from '$lib/components/Plate.svelte';

	let { data } = $props();
	const c = $derived(data.copy);
</script>

<svelte:head><title>Company, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Company</p>
		<h1 class="opening">{c.lede?.heading}</h1>
		<p class="lede">{c.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap story">
		{#each ['vision', 'mission', 'name'] as key, i}
			<Reveal>
				<article class="beat">
					<p class="beat-n mono">0{i + 1}</p>
					<div>
						<h2>{c[key]?.heading}</h2>
						<p>{c[key]?.body}</p>
					</div>
				</article>
			</Reveal>
		{/each}
	</div>
</section>

<section class="section offices-section">
	<div class="wrap">
		<h2>Where we work</h2>
		<ul class="offices">
			{#each data.offices as o, i}
				<li class="card">
					<Reveal distance={20 + i * 6}>
						<Plate seed={`office-${o.city}`} ratio="16 / 10" />
						<h3>{o.city}</h3>
						<p class="muted">{o.country}</p>
						<span class="badge">{o.role_label}</span>
					</Reveal>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section model">
	<div class="wrap-narrow">
		<Reveal><h2>{c.model?.heading}</h2></Reveal>
		<p class="lede">{c.model?.body}</p>
		<p><a class="btn btn-primary" href="/solutions">See what it powers</a></p>
	</div>
</section>

<style>
	.head {
		padding: 46px 0 28px;
		border-bottom: 1px solid var(--rule);
	}
	.opening {
		max-width: 20ch;
		font-size: clamp(1.9rem, 5.4vw, 3.7rem);
	}
	.story {
		display: grid;
		gap: 34px;
	}
	.beat {
		display: grid;
		grid-template-columns: 70px 1fr;
		gap: 20px;
		align-items: start;
		border-top: 1px solid var(--rule);
		padding-top: 22px;
	}
	.beat-n {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.1rem;
		color: var(--ink-faint);
	}
	.beat p {
		max-width: 66ch;
		color: var(--ink-muted);
		margin: 0;
	}
	.offices-section {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.offices {
		list-style: none;
		margin: 22px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 20px;
	}
	.offices h3 {
		margin: 14px 0 2px;
		font-size: 1.15rem;
	}
	.offices p {
		margin: 0 0 8px;
		font-size: 0.9rem;
	}
	@media (max-width: 700px) {
		.beat {
			grid-template-columns: 1fr;
			gap: 6px;
		}
	}
</style>
