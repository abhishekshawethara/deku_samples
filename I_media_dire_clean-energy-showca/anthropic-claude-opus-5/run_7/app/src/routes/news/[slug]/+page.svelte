<script>
  import Plate from '$lib/components/Plate.svelte';
  export let data;
  $: s = data.story;
  $: paragraphs = (s.body || '').split('\n\n').filter(Boolean);
  const dt = (v) => (v ? String(v).slice(0, 10) : '');
</script>

<svelte:head><title>{s.title}, Zettajoule news</title></svelte:head>

<section class="section-tight">
  <div class="wrap wrap-narrow">
    <p class="eyebrow"><a href="/news">News</a> / {s.outlet}</p>
    <h1>{s.title}</h1>
    <p class="lede">{s.outlet}, published {dt(s.published_at)}{s.featured ? ', featured story' : ''}</p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap wrap-narrow">
    <Plate seed={s.slug} height="230px" label={`Generated plate for ${s.title}`} />
    <div class="body">
      {#each paragraphs as p, i (i)}<p>{p}</p>{/each}
    </div>
    <p><a href="/news">Back to the newsroom</a></p>
  </div>
</section>

<style>
  .body {
    margin-top: 22px;
    font-size: 1.05rem;
  }
</style>
