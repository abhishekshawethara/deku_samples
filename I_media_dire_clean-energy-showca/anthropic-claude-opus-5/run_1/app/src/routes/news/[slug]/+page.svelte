<script>
	import Plate from '$lib/components/Plate.svelte';

	let { data } = $props();
	const s = $derived(data.story);
	const paragraphs = $derived((s.body || '').split('\n\n').filter(Boolean));

	function fmt(d) {
		return d ? new Date(d).toISOString().slice(0, 10) : '';
	}
</script>

<svelte:head><title>{s.title}, Zettajoule news</title></svelte:head>

<article>
	<section class="head">
		<div class="wrap-narrow">
			<p class="eyebrow"><a href="/news">News</a> / {s.outlet}</p>
			<h1>{s.title}</h1>
			<p class="meta mono">
				{s.outlet} &middot; {fmt(s.published_at)}
				{#if s.featured}<span class="badge">Featured</span>{/if}
			</p>
		</div>
	</section>

	<div class="wrap-narrow">
		<Plate seed={s.slug} ratio="16 / 9" label={s.outlet} />
	</div>

	<section class="section">
		<div class="wrap-narrow body">
			{#each paragraphs as p}
				<p>{p}</p>
			{/each}
		</div>
	</section>

	{#if data.others.length}
		<section class="section-tight others">
			<div class="wrap-narrow">
				<h2>More from the newsroom</h2>
				<ul>
					{#each data.others as o}
						<li>
							<a href={`/news/${o.slug}`}>
								<strong>{o.title}</strong>
								<span class="mono">{o.outlet} &middot; {fmt(o.published_at)}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}
</article>

<style>
	.head {
		padding: 40px 0 22px;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--ink-muted);
		font-size: 0.84rem;
	}
	.body p {
		font-size: 1.06rem;
		line-height: 1.72;
		margin-bottom: 1.2em;
	}
	.others {
		border-top: 1px solid var(--rule);
	}
	.others h2 {
		font-size: 1.1rem;
	}
	.others ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.others a {
		display: grid;
		gap: 3px;
		padding: 12px 14px;
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--ink);
	}
	.others a:hover {
		border-color: var(--accent);
	}
	.others span {
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
</style>
