<script>
	// The wall shows three at a time and excludes the featured story, so seven
	// seeded stories leave exactly two pages of three.
	import Plate from '$lib/Plate.svelte';
	import Reveal from '$lib/Reveal.svelte';
	import { api } from '$lib/api.js';

	let { data } = $props();

	let wall = $state([...data.wall]);
	let loading = $state(false);
	let failure = $state('');

	const remaining = $derived(data.wallTotal - wall.length);

	function when(value) {
		return new Date(value).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	async function more() {
		loading = true;
		failure = '';
		try {
			const { data: rows } = await api(
				`/stories?featured=false&limit=${data.pageSize}&offset=${wall.length}`,
				{ auth: false }
			);
			wall = [...wall, ...rows];
		} catch (e) {
			failure = 'Could not load more stories just now. Try again in a moment.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>News · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<Reveal as="h1" class="giant" text="latest news" />
		<p class="lede">Browse company news, press coverage and media.</p>
	</div>
</section>

{#if data.featured}
	<section class="wrap featured-wrap">
		<article class="featured">
			<a class="featured__plate" href={`/news/${data.featured.slug}`} tabindex="-1" aria-hidden="true">
				<Plate seed={data.featured.slug} ratio="21 / 9" />
			</a>
			<p class="eyebrow">Featured · {data.featured.outlet} · {when(data.featured.published_at)}</p>
			<h2><a href={`/news/${data.featured.slug}`}>{data.featured.title}</a></h2>
		</article>
	</section>
{/if}

<section class="wrap wall-wrap">
	<h2 class="wall__head">The wall</h2>
	{#if failure}
		<div class="banner banner--fail" role="alert">
			<strong>Could not load</strong>
			<span>{failure}</span>
		</div>
	{/if}

	{#if wall.length === 0}
		<div class="empty-state">
			<p><strong>No other stories yet.</strong> Only the featured story is published.</p>
			<a class="btn" href="/">Back to home</a>
		</div>
	{:else}
		<ul class="wall">
			{#each wall as s (s.slug)}
				<li>
					<article class="story">
						<a class="story__plate" href={`/news/${s.slug}`} tabindex="-1" aria-hidden="true">
							<Plate seed={s.slug} ratio="16 / 9" />
						</a>
						<p class="story__meta">{s.outlet} · {when(s.published_at)}</p>
						<h3><a href={`/news/${s.slug}`}>{s.title}</a></h3>
					</article>
				</li>
			{/each}
		</ul>

		<p class="wall__count" role="status">
			Showing {wall.length} of {data.wallTotal}.
		</p>

		{#if remaining > 0}
			<button class="btn btn--ghost" type="button" onclick={more} disabled={loading}>
				{#if loading}<span class="spinner" aria-hidden="true"></span> Loading{:else}More stories{/if}
			</button>
		{:else}
			<p class="muted">That is every story on the wall.</p>
		{/if}
	{/if}
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	:global(.giant) {
		font-size: clamp(2.8rem, 12vw, 8rem);
		letter-spacing: -0.04em;
		line-height: 0.92;
	}
	.featured-wrap {
		padding-block: 1.5rem 2.5rem;
	}
	.featured h2 {
		font-size: clamp(1.5rem, 3.6vw, 2.4rem);
		margin: 0.4rem 0 0;
		max-width: 22ch;
	}
	.featured h2 a,
	.story h3 a {
		color: var(--ink);
		text-decoration: none;
	}
	.featured h2 a:hover,
	.story h3 a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.wall-wrap {
		padding-bottom: 4rem;
	}
	.wall__head {
		border-bottom: 2px solid var(--ink);
		padding-bottom: 0.4rem;
		font-size: 1.2rem;
	}
	.wall {
		list-style: none;
		margin: 1.25rem 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}
	.story__meta {
		margin: 0.6rem 0 0.15rem;
		font-size: 0.8rem;
		color: var(--ink-muted);
		font-family: var(--font-mono);
	}
	.story h3 {
		margin: 0;
		font-size: 1.15rem;
	}
	.wall__count {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
</style>
