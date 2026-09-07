<script>
	import { page } from '$app/stores';
</script>

<svelte:head><title>We cannot find that page · Zettajoule</title></svelte:head>

<section class="section wrap notfound">
	<div class="card card--pad">
		<p class="eyebrow">{$page.status}</p>
		<h1>We cannot find that page</h1>
		<p class="lede">
			{#if $page.status === 404}
				The address you asked for is not one of ours, or it is a room your account cannot open.
			{:else}
				{$page.error?.message || 'Something went wrong on our side.'}
			{/if}
		</p>
		<div class="row">
			<a class="btn" href="/">Back to home</a>
			<a class="btn btn--ghost" href="/solutions">Browse solutions</a>
		</div>
	</div>
</section>

<style>
	.notfound {
		padding-top: calc(var(--bar-h) + 4rem);
		max-width: 720px;
	}
</style>
