<script>
	import Plate from '$lib/components/Plate.svelte';
	export let data;
	$: story = data.story;

	function fmtDate(d) {
		return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{story.title}, Zettajoule newsroom</title>
	<meta name="description" content={story.body.slice(0, 150)} />
</svelte:head>

<article class="section section--tight wrap">
	<p class="eyebrow"><a href="/news">Newsroom</a></p>
	<h1>{story.title}</h1>
	<p class="meta">
		{story.outlet} &middot; {fmtDate(story.published_at)}
		{#if story.featured}<span class="chip">Featured</span>{/if}
	</p>
	<Plate seed={story.slug} label="Generated plate for {story.title}" ratio="21 / 9" />
	<div class="body">
		{#each story.body.split('\n\n') as para}
			<p>{para}</p>
		{/each}
	</div>
	<a class="btn btn--ghost" href="/news">Back to the newsroom</a>
</article>

<section class="section wrap">
	<h2>More stories</h2>
	<div class="grid grid--3">
		{#each data.more as s}
			<a class="card more" href="/news/{s.slug}">
				<span class="meta">{s.outlet} &middot; {fmtDate(s.published_at)}</span>
				<strong>{s.title}</strong>
			</a>
		{/each}
	</div>
</section>

<style>
	.meta {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--ink-muted);
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		margin-bottom: 1.25rem;
	}
	.body {
		margin: 1.75rem 0;
		font-size: 1.05rem;
	}
	.body p {
		max-width: 68ch;
	}
	.more {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		text-decoration: none;
		color: var(--ink);
	}
	.more:hover {
		border-color: var(--accent);
	}
	.more strong {
		font-family: var(--font-head);
		font-size: 1rem;
		line-height: 1.25;
	}
</style>
