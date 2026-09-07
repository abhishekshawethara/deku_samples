<script>
	import { page } from '$app/stores';
	const status = $derived($page.status);
	const isNotFound = $derived(status === 404);
</script>

<svelte:head>
	<title>{isNotFound ? 'We cannot find that page' : 'Something went wrong'}, Zettajoule</title>
</svelte:head>

<section class="section">
	<div class="wrap-narrow">
		<div class="card nf" data-testid="not-found">
			<p class="eyebrow">{status}</p>
			<h1>{isNotFound ? 'We cannot find that page' : 'Something went wrong'}</h1>
			<p class="lede">
				{#if isNotFound}
					The address you asked for is not one of ours. Nothing is broken; there is simply nothing
					here.
				{:else}
					{$page.error?.message || 'The request could not be completed.'} Try again, and if it keeps
					happening use the contact form.
				{/if}
			</p>
			<div class="row">
				<a class="btn btn-primary" href="/">Back to the home page</a>
				<a class="btn btn-quiet" href="/solutions">Browse the solutions</a>
			</div>
		</div>
	</div>
</section>

<style>
	.nf {
		padding: 34px;
	}
	.row {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
</style>
