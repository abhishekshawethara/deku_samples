<script>
	import Plate from '$lib/art/Plate.svelte';

	export let data;
	$: s = data.story;
	$: paragraphs = s.body.split('\n\n');
</script>

<svelte:head><title>{s.title} | Zettajoule</title></svelte:head>

<article class="section-tight">
	<div class="wrap-narrow">
		<p class="crumbs"><a href="/news">News</a> <span aria-hidden="true">/</span> {s.outlet}</p>
		<h1>{s.title}</h1>
		<p class="meta">
			{s.outlet} ·
			<time datetime={s.published_at}>
				{new Date(s.published_at).toLocaleDateString('en-GB', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</time>
			{#if s.featured}<span class="pill">Featured</span>{/if}
		</p>
	</div>

	<div class="wrap-narrow plate-row">
		<Plate seed={s.slug} ratio="16 / 7" label="Generated plate for this story" />
	</div>

	<div class="wrap-narrow body">
		{#each paragraphs as p}
			<p>{p}</p>
		{/each}
		<hr class="rule" />
		<a class="btn" href="/news">Back to the newsroom</a>
	</div>
</article>

<style>
	.crumbs {
		font-size: 0.85rem;
		color: var(--ink-muted);
		margin-bottom: 10px;
	}
	h1 {
		max-width: 20ch;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.plate-row {
		margin: 22px auto;
	}
	.body p {
		font-size: 1.05rem;
	}
	.body hr {
		margin: 26px 0 20px;
	}
</style>
