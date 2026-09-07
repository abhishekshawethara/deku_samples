<script>
	import { page } from '$app/stores';
</script>

<svelte:head><title>We cannot find that page | Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap-narrow">
		<div class="card notfound">
			<p class="eyebrow">Error {$page.status}</p>
			<h1>We cannot find that page</h1>
			<p class="lede">
				{#if $page.status === 404}
					The address you asked for is not one of ours. Nothing has been lost.
				{:else}
					{$page.error?.message || 'Something went wrong on our side.'} You can try again, or go back
					to the start.
				{/if}
			</p>
			<a class="btn btn-primary" href="/">Back to the home page</a>
		</div>
	</div>
</section>

<style>
	.notfound {
		padding: clamp(28px, 6vw, 56px);
		text-align: center;
	}
	.notfound .lede {
		margin-inline: auto;
		margin-bottom: 22px;
	}
</style>
