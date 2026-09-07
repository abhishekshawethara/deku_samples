<script>
	import Plate from '$lib/components/Plate.svelte';

	export let data;
	const PAGE = 3;
	let shown = PAGE;

	$: visible = data.wall.slice(0, shown);
	$: more = data.wall.length - visible.length;

	function fmt(d) {
		return String(d).slice(0, 10);
	}
</script>

<svelte:head><title>Newsroom, Zettajoule</title></svelte:head>

<section class="section lead">
	<div class="wrap">
		<h1 class="giant">latest news</h1>
		<p class="lede">Browse company news, press coverage and media.</p>
	</div>
</section>

{#if data.featured}
	<section class="section-tight">
		<div class="wrap">
			<a class="featured" href={`/news/${data.featured.slug}`}>
				<Plate seed={data.featured.slug} ratio="21 / 8" kind="story" />
				<div class="featured-body">
					<span class="status-pill status-answered">Featured</span>
					<h2>{data.featured.title}</h2>
					<p class="dense">{data.featured.outlet} &middot; {fmt(data.featured.published_at)}</p>
				</div>
			</a>
		</div>
	</section>
{/if}

<section class="section-tight wall-band">
	<div class="wrap">
		<h2>The wall</h2>
		{#if data.wall.length === 0}
			<div class="empty-state">
				<h3>No stories on the wall yet</h3>
				<p>Nothing beyond the featured story has been published. <a href="/contact">Ask for the press pack</a>.</p>
			</div>
		{:else}
			<ul class="wall" data-testid="story-wall">
				{#each visible as s (s.slug)}
					<li>
						<a href={`/news/${s.slug}`}>
							<Plate seed={s.slug} ratio="16 / 9" kind="story" />
							<p class="meta dense">{s.outlet} &middot; {fmt(s.published_at)}</p>
							<h3>{s.title}</h3>
						</a>
					</li>
				{/each}
			</ul>
			<p class="counter dense" role="status">Showing {visible.length} of {data.wall.length} stories</p>
			{#if more > 0}
				<button type="button" class="btn btn-secondary" on:click={() => (shown += PAGE)}>
					More stories<span class="visually-hidden">, {more} remaining</span>
				</button>
			{/if}
		{/if}
	</div>
</section>

<style>
	.lead {
		background: linear-gradient(180deg, #eaf1fb 0%, #ffffff 100%);
		padding-bottom: 32px;
	}
	.giant {
		font-size: clamp(2.6rem, 12vw, 8rem);
		letter-spacing: -0.05em;
		margin-bottom: 8px;
	}
	.featured {
		display: block;
		text-decoration: none;
		color: var(--ink);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		overflow: hidden;
		background: #fff;
	}
	.featured:hover {
		border-color: var(--accent);
	}
	.featured-body {
		padding: 18px 20px 22px;
	}
	.featured h2 {
		margin: 10px 0 4px;
		font-size: clamp(1.4rem, 3.4vw, 2.3rem);
	}
	.featured p {
		color: var(--ink-muted);
		margin: 0;
	}
	.wall-band {
		background: var(--ground-soft);
		padding-bottom: 72px;
	}
	.wall {
		list-style: none;
		margin: 16px 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 18px;
	}
	.wall a {
		display: block;
		text-decoration: none;
		color: var(--ink);
		background: #fff;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 12px;
		height: 100%;
	}
	.wall a:hover {
		border-color: var(--accent);
	}
	.meta {
		color: var(--ink-muted);
		margin: 10px 0 4px;
	}
	.wall h3 {
		font-size: 1.1rem;
		margin: 0;
	}
	.counter {
		color: var(--ink-muted);
	}
</style>
