<script>
	import { api, ApiError } from '$lib/api.js';
	import Plate from '$lib/components/Plate.svelte';

	export let data;

	let wall = data.wall;
	let busy = false;
	let error = '';

	$: hasMore = wall.length < data.wallTotal;

	function fmtDate(d) {
		return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	async function more() {
		busy = true;
		error = '';
		try {
			// Fetch a page wider than needed, then drop the featured story.
			const rows = await api(`/stories?limit=${data.pageSize + 1}&offset=${wall.length + 1}`);
			const next = rows.filter((s) => !s.featured).slice(0, data.pageSize);
			wall = [...wall, ...next];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'More stories could not be loaded.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Newsroom, Zettajoule</title>
	<meta name="description" content="Company news, press coverage and media from Zettajoule." />
</svelte:head>

<section class="section section--tight wrap">
	<h1 class="giant">latest news</h1>
	<p class="lede">Browse company news, press coverage and media.</p>
</section>

{#if data.featured}
	<section class="wrap section--tight" aria-labelledby="featured-heading">
		<h2 id="featured-heading" class="eyebrow">Featured</h2>
		<a class="featured" href="/news/{data.featured.slug}">
			<Plate seed={data.featured.slug} label="Generated plate for the featured story" ratio="21 / 9" />
			<div class="featured__body">
				<p class="meta">{data.featured.outlet} &middot; {fmtDate(data.featured.published_at)}</p>
				<h3>{data.featured.title}</h3>
				<span class="more-link">Read the story</span>
			</div>
		</a>
	</section>
{/if}

<section class="section wrap" aria-labelledby="wall-heading">
	<h2 id="wall-heading">The wall</h2>

	{#if error}
		<div class="banner banner--fail" role="alert">
			<span class="banner__title">Could not load more</span>{error}
		</div>
	{/if}

	{#if wall.length === 0}
		<div class="empty">
			<p><strong>No stories yet.</strong></p>
			<p>Nothing has been published beyond the featured story.</p>
			<a class="btn" href="/">Back to the home route</a>
		</div>
	{:else}
		<ul class="wall" data-testid="story-wall">
			{#each wall as story (story.slug)}
				<li>
					<a class="story" href="/news/{story.slug}">
						<Plate seed={story.slug} label="Generated plate for {story.title}" ratio="16 / 9" />
						<span class="meta">{story.outlet} &middot; {fmtDate(story.published_at)}</span>
						<span class="story__title">{story.title}</span>
					</a>
				</li>
			{/each}
		</ul>

		<p class="wall__count" role="status" aria-live="polite">
			Showing {wall.length} of {data.wallTotal} stories on the wall
		</p>

		{#if hasMore}
			<button class="btn btn--ghost" type="button" on:click={more} disabled={busy} data-testid="more-stories">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				More stories
			</button>
		{/if}
	{/if}
</section>

<style>
	.giant {
		font-size: clamp(2.6rem, 12vw, 7rem);
		letter-spacing: -0.04em;
		line-height: 0.9;
		margin-bottom: 0.5rem;
	}
	.featured {
		display: block;
		text-decoration: none;
		color: var(--ink);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.featured:hover {
		border-color: var(--accent);
	}
	.featured__body {
		padding: 1.1rem;
	}
	.featured h3 {
		font-size: clamp(1.3rem, 3vw, 2rem);
		margin: 0.35rem 0 0.5rem;
	}
	.meta {
		font-size: 0.8rem;
		color: var(--ink-muted);
		font-family: var(--font-mono);
		display: block;
	}
	.more-link {
		color: var(--accent);
		font-weight: 700;
		font-size: 0.9rem;
	}
	.wall {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}
	.story {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		text-decoration: none;
		color: var(--ink);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.75rem;
		height: 100%;
	}
	.story:hover {
		border-color: var(--accent);
	}
	.story__title {
		font-family: var(--font-head);
		font-size: 1.05rem;
		line-height: 1.2;
	}
	.wall__count {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
</style>
