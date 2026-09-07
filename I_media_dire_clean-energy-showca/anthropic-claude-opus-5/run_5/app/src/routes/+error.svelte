
<script>
	import { page } from '$app/state';
</script>

<svelte:head><title>We cannot find that page, Zettajoule</title></svelte:head>

<div class="wrap section">
	<div class="card nf">
		{#if page.status === 404}
			<h1>We cannot find that page</h1>
			<p class="lede">
				Nothing lives at <span class="mono">{page.url.pathname}</span>. It may have been mistyped,
				or it may never have existed.
			</p>
		{:else}
			<h1>Something went wrong</h1>
			<p class="lede">
				{page.error?.message || 'The page could not be shown.'} Nothing you had saved is affected.
			</p>
		{/if}
		<div class="acts">
			<a class="btn" href="/">Back to the home route</a>
			<a class="btn btn-secondary" href="/solutions">Open the explorer</a>
			<a class="btn btn-secondary" href="/contact">Get in Touch</a>
		</div>
	</div>
</div>

<style>
	.nf {
		text-align: center;
		padding: 48px 26px;
		max-width: 720px;
		margin: 0 auto;
	}
	.nf .lede {
		margin: 0 auto 22px;
	}
	.acts {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
