<script>
	import Plate from '$lib/Plate.svelte';

	let { data } = $props();
	const s = $derived(data.story);

	function when(value) {
		return new Date(value).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{s.title} · News · Zettajoule</title>
	<meta name="description" content={s.title} />
</svelte:head>

<article class="story-page">
	<header class="wrap story-head">
		<p class="eyebrow"><a href="/news">News</a> / {s.outlet}</p>
		<h1>{s.title}</h1>
		<p class="muted meta">
			{s.outlet} · {when(s.published_at)}
			{#if s.featured}<span class="status-tag status-tag--approved">Featured</span>{/if}
		</p>
	</header>

	<div class="wrap">
		<Plate seed={s.slug} ratio="21 / 9" label={`Generated plate for ${s.title}`} />
	</div>

	<div class="wrap body">
		{#each s.body.split('\n\n') as para}
			<p>{para}</p>
		{/each}
	</div>

	<div class="wrap section--tight">
		<a class="btn btn--ghost" href="/news">Back to the newsroom</a>
	</div>
</article>

<style>
	.story-head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
	}
	.story-head h1 {
		max-width: 20ch;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}
	.body {
		padding-block: 2rem;
		max-width: 74ch;
	}
	.body p {
		font-size: 1.05rem;
	}
</style>
