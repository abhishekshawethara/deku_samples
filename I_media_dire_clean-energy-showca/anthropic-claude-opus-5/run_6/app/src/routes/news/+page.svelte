<script>
	import Plate from '$lib/art/Plate.svelte';
	import { api, ApiError } from '$lib/api.js';

	export let data;

	const PAGE = 3;
	let stories = data.stories;
	let total = data.total;
	let busy = false;
	let error = '';

	$: hasMore = stories.length < total;

	function fmt(d) {
		return new Date(d).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	async function more() {
		busy = true;
		error = '';
		try {
			const next = await api(`/stories?featured=false&limit=${PAGE}&offset=${stories.length}`, {
				anonymous: true
			});
			stories = [...stories, ...next];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not load more stories.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>News | Zettajoule</title></svelte:head>

<section class="opener">
	<div class="wrap">
		<h1 class="giant">latest news</h1>
		<p class="lede">Browse company news, press coverage and media.</p>
	</div>
</section>

{#if data.featured}
	<section class="section-tight">
		<div class="wrap">
			<article class="featured">
				<a class="f-plate" href="/news/{data.featured.slug}" tabindex="-1" aria-hidden="true">
					<Plate seed={data.featured.slug} ratio="16 / 9" />
				</a>
				<div class="f-body">
					<span class="pill">Featured</span>
					<h2><a href="/news/{data.featured.slug}">{data.featured.title}</a></h2>
					<p class="f-meta">{data.featured.outlet} · {fmt(data.featured.published_at)}</p>
					<a class="btn btn-primary" href="/news/{data.featured.slug}">Read the story</a>
				</div>
			</article>
		</div>
	</section>
{/if}

<section class="section-tight">
	<div class="wrap">
		<h2 class="wall-h">More stories</h2>
		{#if error}
			<div class="banner banner-error" role="alert">
				<strong>Could not load</strong>{error}
				<p style="margin:8px 0 0"><button class="btn btn-sm" type="button" on:click={more}>Try again</button></p>
			</div>
		{/if}

		{#if !stories.length}
			<div class="empty">
				<h3>No other stories yet</h3>
				<p>Only the featured story is published. Check back, or get in touch for press enquiries.</p>
				<a class="btn btn-primary" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="wall">
				{#each stories as s (s.slug)}
					<li class="story">
						<a class="s-plate" href="/news/{s.slug}" tabindex="-1" aria-hidden="true">
							<Plate seed={s.slug} ratio="16 / 9" />
						</a>
						<p class="s-meta">{s.outlet} · {fmt(s.published_at)}</p>
						<h3><a href="/news/{s.slug}">{s.title}</a></h3>
					</li>
				{/each}
			</ul>
			<p class="counted muted" role="status">Showing {stories.length} of {total} stories</p>
			{#if hasMore}
				<button class="btn" type="button" on:click={more} disabled={busy}>
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}More stories
				</button>
			{/if}
		{/if}
	</div>
</section>

<style>
	.opener {
		background: linear-gradient(180deg, var(--sky), var(--paper));
		padding-block: clamp(40px, 7vw, 92px);
	}
	.giant {
		font-size: clamp(2.6rem, 11vw, 8rem);
		line-height: 0.9;
		letter-spacing: -0.05em;
		margin-bottom: 14px;
	}
	.featured {
		display: grid;
		grid-template-columns: 1.25fr 1fr;
		gap: clamp(18px, 3vw, 40px);
		align-items: center;
		border: 1px solid var(--rule);
		border-radius: var(--r-xl);
		padding: clamp(14px, 2.4vw, 26px);
		background: var(--paper-2);
	}
	.f-plate {
		display: block;
	}
	.f-body h2 {
		font-size: clamp(1.35rem, 2.8vw, 2rem);
		margin: 12px 0 6px;
	}
	.f-body h2 a,
	.story h3 a {
		color: var(--ink);
		text-decoration: none;
	}
	.f-body h2 a:hover,
	.story h3 a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.f-meta,
	.s-meta {
		font-size: 0.82rem;
		color: var(--ink-muted);
		margin: 0 0 14px;
	}
	.wall-h {
		font-size: 1.3rem;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--rule);
	}
	.wall {
		list-style: none;
		padding: 0;
		margin: 20px 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
	}
	.s-plate {
		display: block;
		margin-bottom: 12px;
	}
	.story h3 {
		font-size: 1.05rem;
		margin: 0;
	}
	.story .s-meta {
		margin-bottom: 6px;
	}
	.counted {
		font-size: 0.86rem;
	}
	@media (max-width: 780px) {
		.featured {
			grid-template-columns: 1fr;
		}
	}
</style>
