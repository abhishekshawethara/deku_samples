<script>
	import Plate from '$lib/components/Plate.svelte';
	export let data;
	$: s = data.story;
</script>

<svelte:head><title>{s.title}, Zettajoule newsroom</title></svelte:head>

<article class="section">
	<div class="wrap story">
		<p class="eyebrow"><a href="/news">News</a> / {s.outlet}</p>
		<h1>{s.title}</h1>
		<p class="meta dense">{s.outlet} &middot; {String(s.published_at).slice(0, 10)}</p>
		<Plate seed={s.slug} ratio="21 / 8" kind="story" label={`Generated plate for ${s.title}`} />
		<div class="body">
			{#each s.body.split('\n\n') as para}<p>{para}</p>{/each}
		</div>
		<a class="btn btn-secondary" href="/news">Back to the newsroom</a>
	</div>
</article>

<style>
	.story {
		max-width: 760px;
	}
	.meta {
		color: var(--ink-muted);
		margin-bottom: 18px;
	}
	.body {
		margin: 26px 0;
		font-size: 1.06rem;
	}
</style>
