<script>
  import Plate from '$lib/components/Plate.svelte';

  export let data;
  const PAGE = 3;
  let shown = PAGE;

  $: featured = data.featured;
  $: wall = data.wall ?? [];
  $: visible = wall.slice(0, shown);
  $: remaining = Math.max(0, wall.length - shown);

  const dt = (v) => (v ? String(v).slice(0, 10) : '');
</script>

<svelte:head><title>Newsroom, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <h1 class="giant">latest news</h1>
    <p class="lede">Browse company news, press coverage and media.</p>
  </div>
</section>

{#if featured}
  <section class="section-tight">
    <div class="wrap">
      <a class="featured" href={`/news/${featured.slug}`} data-testid="featured-story">
        <Plate seed={featured.slug} height="240px" label={`Generated plate for ${featured.title}`} />
        <div>
          <p class="eyebrow">Featured, {featured.outlet}, {dt(featured.published_at)}</p>
          <h2>{featured.title}</h2>
          <span class="more">Read the story</span>
        </div>
      </a>
    </div>
  </section>
{/if}

<section class="section-tight">
  <div class="wrap">
    <h2>The wall</h2>
    {#if wall.length === 0}
      <div class="empty">
        <p><strong>No stories on the wall yet.</strong></p>
        <p>Nothing beyond the featured story has been published.</p>
        <a class="btn btn-secondary" href="/company">Read about the company instead</a>
      </div>
    {:else}
      <div class="grid grid-3" data-testid="story-wall">
        {#each visible as s (s.slug)}
          <a class="story" href={`/news/${s.slug}`}>
            <Plate seed={s.slug} height="130px" label={`Generated plate for ${s.title}`} />
            <p class="meta small muted">{s.outlet}, {dt(s.published_at)}</p>
            <h3>{s.title}</h3>
          </a>
        {/each}
      </div>
      <p class="small muted" aria-live="polite" data-testid="wall-count">
        Showing {visible.length} of {wall.length} stories.
      </p>
      {#if remaining > 0}
        <button class="btn btn-secondary" type="button" on:click={() => (shown += PAGE)} data-testid="load-more">
          More stories, {Math.min(PAGE, remaining)} of {remaining} left
        </button>
      {/if}
    {/if}
  </div>
</section>

<style>
  .giant {
    font-size: clamp(2.6rem, 12vw, 7rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    margin-bottom: 8px;
  }
  .featured {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 26px;
    align-items: center;
    text-decoration: none;
    color: var(--ink);
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 18px;
  }
  .featured:hover {
    border-color: var(--accent-hover);
    background: var(--sky-soft);
  }
  .featured h2 {
    font-size: clamp(1.4rem, 3.2vw, 2.2rem);
  }
  .more {
    color: var(--accent);
    font-weight: 600;
  }
  .story {
    text-decoration: none;
    color: var(--ink);
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 12px;
    display: block;
  }
  .story:hover {
    border-color: var(--accent-hover);
    background: var(--sky-soft);
  }
  .story h3 {
    font-size: 1.05rem;
    margin: 0;
  }
  .story .meta {
    margin: 8px 0 4px;
  }
  @media (max-width: 760px) {
    .featured {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
