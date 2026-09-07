<script>
  import { page } from '$app/stores';
  $: status = $page.status;
  $: notFound = status === 404;
</script>

<svelte:head><title>{notFound ? 'We cannot find that page' : 'Something went wrong'}, Zettajoule</title></svelte:head>

<section class="section">
  <div class="wrap wrap-narrow">
    <div class="card notfound">
      <p class="eyebrow">{status}</p>
      {#if notFound}
        <h1>We cannot find that page</h1>
        <p class="lede">
          Nothing lives at that address. It may have moved, or the link may be mistyped.
        </p>
      {:else}
        <h1>Something went wrong</h1>
        <p class="lede">
          {$page.error?.message || 'The page could not be shown.'} Nothing you were working on has
          been lost. Try again, or take one of the routes below.
        </p>
      {/if}
      <div class="ways">
        <a class="btn" href="/">Back to the home route</a>
        <a class="btn btn-secondary" href="/solutions">Solutions explorer</a>
        <a class="btn btn-secondary" href="/contact">Get in Touch</a>
      </div>
    </div>
  </div>
</section>

<style>
  .notfound {
    padding: 34px;
  }
  .ways {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
</style>
