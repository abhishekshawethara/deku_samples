<script>
import { page } from '$app/stores';
</script>

<svelte:head><title>We cannot find that page, Zettajoule</title></svelte:head>

<section class="section wrap">
<div class="card notfound">
<p class="eyebrow">Error {$page.status}</p>
<h1>We cannot find that page</h1>
<p class="lede">
{#if $page.status === 404}
The address you asked for is not one of ours. Nothing was lost; the route simply does not exist.
{:else}
{$page.error?.message || 'Something went wrong on our side.'}
{/if}
</p>
<a class="btn" href="/">Back to the home route</a>
</div>
</section>

<style>
.notfound {
max-width: 620px;
margin: 2rem auto;
text-align: center;
padding: 2.5rem 1.5rem;
}
.notfound .lede {
margin: 0 auto 1.5rem;
}
</style>
