
<script>
	import { page } from '$app/state';
	import { apiData } from '$lib/api';
	import Plate from '$lib/components/Plate.svelte';

	let slug = $derived(page.params.slug);
	let story = $state(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		const s = slug;
		loading = true;
		error = '';
		story = null;
		apiData(`/stories/${encodeURIComponent(s)}`, { auth: false })
			.then((d) => (story = d))
			.catch((err) => {
				error = err.status === 404 ? 'notfound' : err.message || 'That story could not load.';
			})
			.finally(() => (loading = false));
	});

	function fmtDate(v) {
		if (!v) return '';
		return new Date(v).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head><title>{story ? `${story.title}, news` : 'Story'}, Zettajoule</title></svelte:head>

{#if loading}
	<div class="wrap section">
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading this story</div>
	</div>
{:else if error === 'notfound'}
	<div class="wrap section">
		<div class="card">
			<h1>We cannot find that page</h1>
			<p class="lede">There is no story with the slug <span class="mono">{slug}</span>.</p>
			<a class="btn" href="/">Back to the home route</a>
			<a class="btn btn-secondary" href="/news">All stories</a>
		</div>
	</div>
{:else if error}
	<div class="wrap section">
		<div class="banner banner-fail" role="alert">
			<strong>This story could not load.</strong>
			{error} Reload the page, or go back to <a href="/news">the newsroom</a>.
		</div>
	</div>
{:else if story}
	<article class="wrap-narrow story">
		<p class="eyebrow"><a href="/news">Newsroom</a></p>
		<h1>{story.title}</h1>
		<p class="meta">
			{#if story.featured}<span class="pill">Featured</span>{/if}
			<span class="muted">{story.outlet} · {fmtDate(story.published_at)}</span>
		</p>
		<Plate seed={story.slug} height={240} />
		<div class="body">
			{#each story.body.split('\n\n') as para}
				<p>{para}</p>
			{/each}
		</div>
		<hr class="rule" />
		<a class="btn btn-secondary" href="/news">Back to the newsroom</a>
	</article>
{/if}

<style>
	.story {
		padding: 40px 20px 70px;
	}
	.eyebrow a {
		color: inherit;
	}
	.meta {
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
		margin: 0 0 20px;
		font-size: 0.9rem;
	}
	.body {
		margin-top: 24px;
		font-size: 1.05rem;
	}
	.card .btn {
		margin-right: 8px;
	}
</style>
