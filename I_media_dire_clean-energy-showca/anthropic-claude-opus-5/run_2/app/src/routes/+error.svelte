<script>
	import { page } from '$app/stores';
</script>

<section class="section">
	<div class="wrap">
		<div class="card notfound">
			<p class="eyebrow">{$page.status}</p>
			<h1>We cannot find that page</h1>
			<p class="lede">
				{#if $page.error?.message && $page.status !== 404}
					{$page.error.message}
				{:else}
					The address you asked for is not one of ours. Nothing has broken; there is simply nothing here.
				{/if}
			</p>
			<a class="btn" href="/">Back to the home page</a>
		</div>
	</div>
</section>

<style>
	.notfound {
		max-width: 600px;
		margin: 40px auto;
	}
</style>
