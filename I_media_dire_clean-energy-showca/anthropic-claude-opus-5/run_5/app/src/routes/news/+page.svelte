
<script>
	import { api } from '$lib/api';
	import Plate from '$lib/components/Plate.svelte';

	const PAGE = 3;

	let featured = $state(null);
	let wall = $state([]);
	let total = $state(0);
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state('');

	async function loadFirst() {
		loading = true;
		error = '';
		try {
			const f = await api('/stories?featured=true', { auth: false });
			featured = (f.data || [])[0] || null;
			const res = await api(`/stories?featured=false&limit=${PAGE}&offset=0`, { auth: false });
			wall = res.data || [];
			total = Number(res.headers.get('X-Total-Count') ?? wall.length);
		} catch (err) {
			error = err.message || 'The newsroom could not load.';
		} finally {
			loading = false;
		}
	}

	async function more() {
		loadingMore = true;
		try {
			const res = await api(`/stories?featured=false&limit=${PAGE}&offset=${wall.length}`, {
				auth: false
			});
			wall = [...wall, ...(res.data || [])];
			total = Number(res.headers.get('X-Total-Count') ?? total);
		} catch (err) {
			error = err.message || 'The next stories could not load.';
		} finally {
			loadingMore = false;
		}
	}

	$effect(() => {
		loadFirst();
	});

	function fmtDate(v) {
		if (!v) return '';
		return new Date(v).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	let hasMore = $derived(wall.length < total);
</script>

<svelte:head><title>Newsroom, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<h1 class="giant">latest news</h1>
		<p class="lede">Browse company news, press coverage and media.</p>
	</div>
</div>

<div class="wrap section-tight">
	{#if error}
		<div class="banner banner-fail" role="alert">
			<strong>The newsroom could not load.</strong>
			{error} Reload the page to try again.
		</div>
	{/if}

	{#if loading}
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading the newsroom</div>
	{:else}
		{#if featured}
			<a class="featured card" href="/news/{featured.slug}" data-testid="featured-story">
				<Plate seed={featured.slug} height={220} />
				<div class="f-body">
					<p class="f-meta">
						<span class="pill">Featured</span>
						<span class="muted">{featured.outlet} · {fmtDate(featured.published_at)}</span>
					</p>
					<h2>{featured.title}</h2>
					<span class="read">Read the story</span>
				</div>
			</a>
		{/if}

		{#if wall.length === 0}
			<div class="empty">
				<h3>No other story is published</h3>
				<p>Only the featured story is up right now. More follows as the programme moves.</p>
				<a class="btn btn-sm btn-secondary" href="/company">Read the company story</a>
			</div>
		{:else}
			<ul class="wall" data-testid="story-wall">
				{#each wall as s (s.slug)}
					<li class="card story">
						<Plate seed={s.slug} height={120} />
						<p class="s-meta muted">{s.outlet} · {fmtDate(s.published_at)}</p>
						<h3><a href="/news/{s.slug}">{s.title}</a></h3>
					</li>
				{/each}
			</ul>

			<div class="more-row">
				<p class="muted" data-testid="wall-count">
					Showing {wall.length} of {total} stories, the featured story aside.
				</p>
				{#if hasMore}
					<button class="btn btn-secondary" type="button" onclick={more} disabled={loadingMore}>
						{#if loadingMore}<span class="spinner" aria-hidden="true"></span>{/if}
						{loadingMore ? 'Loading' : 'More stories'}
					</button>
				{:else}
					<p class="muted small">That is every story we have published.</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 46px 0 34px;
	}
	.giant {
		font-size: clamp(2.6rem, 9vw, 6rem);
		letter-spacing: -0.045em;
		margin-bottom: 8px;
	}
	.featured {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 26px;
		align-items: center;
		text-decoration: none;
		color: var(--ink);
		margin-bottom: 26px;
	}
	.featured:hover {
		border-color: var(--accent);
	}
	.f-meta {
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
		margin: 0 0 10px;
		font-size: 0.86rem;
	}
	.featured h2 {
		font-size: clamp(1.4rem, 3vw, 2.1rem);
		margin-bottom: 12px;
	}
	.read {
		color: var(--accent);
		font-weight: 650;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.wall {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}
	.s-meta {
		font-size: 0.78rem;
		margin: 12px 0 6px;
	}
	.story h3 {
		font-size: 1.05rem;
		margin: 0;
	}
	.story h3 a {
		color: var(--ink);
		text-decoration: none;
	}
	.story h3 a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.more-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin: 24px 0 60px;
	}
	.more-row p {
		margin: 0;
		font-size: 0.9rem;
	}
	.small {
		font-size: 0.88rem;
	}
	@media (max-width: 900px) {
		.featured,
		.wall {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
