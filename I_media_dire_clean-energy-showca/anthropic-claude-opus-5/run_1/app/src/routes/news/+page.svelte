<script>
	import Plate from '$lib/components/Plate.svelte';
	import { api, ApiError } from '$lib/api.js';

	let { data } = $props();

	// Pages loaded by the more action, appended to whatever the server rendered.
	let extra = $state([]);
	let busy = $state(false);
	let error = $state('');

	$effect(() => {
		data.wall;
		extra = [];
	});

	const wall = $derived([...data.wall, ...extra]);
	const total = $derived(data.wallTotal);
	const more = $derived(wall.length < total);

	function fmt(d) {
		return d ? new Date(d).toISOString().slice(0, 10) : '';
	}

	async function loadMore() {
		if (busy) return;
		busy = true;
		error = '';
		try {
			const { data: rows } = await api(
				`/api/stories?featured=false&limit=${data.pageSize}&offset=${wall.length}`
			);
			extra = [...extra, ...rows];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'More stories could not be loaded.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>News, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<h1 class="giant">latest news</h1>
		<p class="lede">{data.copy.lede?.body || 'Browse company news, press coverage and media.'}</p>
	</div>
</section>

{#if data.featured}
	<section class="section-tight">
		<div class="wrap">
			<a class="feature" href={`/news/${data.featured.slug}`} data-testid="featured-story">
				<div class="feature-plate"><Plate seed={data.featured.slug} ratio="16 / 9" /></div>
				<div>
					<p class="badge">Featured</p>
					<h2>{data.featured.title}</h2>
					<p class="meta mono">{data.featured.outlet} &middot; {fmt(data.featured.published_at)}</p>
				</div>
			</a>
		</div>
	</section>
{/if}

<section class="section-tight">
	<div class="wrap">
		<h2 class="wall-head">The wall</h2>
		{#if wall.length === 0}
			<div class="empty">
				<h3>No stories beyond the featured one</h3>
				<p>There is nothing else on the wall yet. The featured story is above.</p>
				<a class="btn btn-primary btn-sm" href="/">Back to the home page</a>
			</div>
		{:else}
			<ul class="wall" data-testid="story-wall">
				{#each wall as s (s.slug)}
					<li>
						<a href={`/news/${s.slug}`}>
							<Plate seed={s.slug} ratio="16 / 9" />
							<p class="meta mono">{s.outlet} &middot; {fmt(s.published_at)}</p>
							<h3>{s.title}</h3>
						</a>
					</li>
				{/each}
			</ul>
			<p class="count mono" aria-live="polite">
				Showing {wall.length} of {total} stories on the wall
			</p>
			{#if error}
				<p class="banner banner-error" role="alert">{error}</p>
			{/if}
			{#if more}
				<button
					class="btn btn-quiet"
					type="button"
					onclick={loadMore}
					disabled={busy}
					data-testid="load-more"
				>
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
					{busy ? 'Loading' : 'More stories'}
				</button>
			{:else}
				<p class="muted">That is every story on the wall.</p>
			{/if}
		{/if}
	</div>
</section>

<style>
	.head {
		padding: 44px 0 24px;
	}
	.giant {
		font-size: clamp(2.6rem, 11vw, 7.5rem);
		letter-spacing: -0.05em;
		line-height: 0.9;
		margin-bottom: 14px;
	}
	.feature {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 28px;
		align-items: center;
		text-decoration: none;
		color: var(--ink);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 18px;
		background: var(--surface-soft);
	}
	.feature:hover {
		border-color: var(--accent);
	}
	.feature h2 {
		font-size: clamp(1.4rem, 3vw, 2.1rem);
		margin: 10px 0 6px;
	}
	.meta {
		font-size: 0.8rem;
		color: var(--ink-muted);
		margin: 0;
	}
	.wall-head {
		font-size: 1.15rem;
		padding-bottom: 8px;
		border-bottom: 2px solid var(--rule-strong);
	}
	.wall {
		list-style: none;
		margin: 20px 0 16px;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 20px;
	}
	.wall a {
		display: block;
		text-decoration: none;
		color: var(--ink);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 12px;
		height: 100%;
	}
	.wall a:hover {
		border-color: var(--accent);
	}
	.wall h3 {
		font-size: 1.02rem;
		margin: 4px 0 0;
	}
	.wall .meta {
		margin: 10px 0 0;
	}
	.count {
		color: var(--ink-muted);
		font-size: 0.86rem;
	}
	@media (max-width: 900px) {
		.feature {
			grid-template-columns: 1fr;
		}
		.wall {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 600px) {
		.wall {
			grid-template-columns: 1fr;
		}
	}
</style>
