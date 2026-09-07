<script>
  import { onMount } from 'svelte';
  import Plate from '$lib/components/Plate.svelte';
  import SaveButton from '$lib/components/SaveButton.svelte';
  import { apiData, getSaveToken, getToken } from '$lib/api';

  export let data;
  $: s = data.solution;

  let savedId = null;
  let ready = false;

  onMount(async () => {
    try {
      const token = getToken();
      const st = getSaveToken();
      if (!token && !st) return;
      const rows = await apiData(
        `/saves${!token && st ? `?save_token=${encodeURIComponent(st)}` : ''}`
      );
      savedId = rows.find((r) => r.slug === s.slug)?.id ?? null;
    } catch {
      savedId = null;
    } finally {
      ready = true;
    }
  });

  const BLOCKS = [
    {
      key: 'source',
      title: 'The module',
      body: 'A high-temperature gas-cooled reactor module. Helium leaves the core at 750 degrees Celsius carrying 250 MW thermal.'
    },
    {
      key: 'interface',
      title: 'The interface',
      body: 'An intermediate heat exchanger keeps the primary circuit separate from anything on your side of the fence.'
    },
    {
      key: 'use',
      title: 'The duty',
      body: 'Downstream the energy takes the form the site actually buys, delivered against a long term supply agreement.'
    }
  ];
</script>

<svelte:head><title>{s.industry}, Zettajoule solutions</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow"><a href="/solutions">Solutions</a> / {s.industry}</p>
    <h1>{s.title}</h1>
    <p class="lede">{s.summary}</p>
    <div class="actions">
      <SaveButton slug={s.slug} saved={!!savedId} saveId={savedId} />
      <a class="btn btn-secondary" href={`/contact?topic=Solutions&subject=${encodeURIComponent(s.industry)}`}>Enquire about {s.industry}</a>
      <a class="btn btn-secondary" href="/compare">Compare saves</a>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap detail">
    <div>
      <table class="data spec">
        <caption class="sr-only">Specification for the {s.industry} solution</caption>
        <tbody>
          <tr><th scope="row">Industry</th><td>{s.industry}</td></tr>
          <tr><th scope="row">Output kind</th><td>{s.output_kind}</td></tr>
          <tr><th scope="row">Temperature band</th><td>{s.temperature_band}</td></tr>
          <tr><th scope="row">Deployment</th><td>{s.deployment}</td></tr>
          <tr><th scope="row">Modules</th><td>{s.module_count}</td></tr>
        </tbody>
      </table>
    </div>
    <Plate seed={s.slug} height="220px" label={`Generated plate for ${s.industry}`} />
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2>What the reactor does for {s.industry}, block by block</h2>
    <div class="blocks">
      {#each BLOCKS as b, i (b.key)}
        <div class="block">
          <svg viewBox="0 0 160 90" class="diagram" role="img" aria-label={`Line diagram, block ${i + 1}: ${b.title}`}>
            <g fill="none" stroke="var(--navy)" stroke-width="1.3">
              <rect x="10" y="22" width="52" height="46" rx="5" />
              <rect x="98" y="22" width="52" height="46" rx="5" />
              <path d="M62 45 h36" />
              <path d="M92 40 l6 5 l-6 5" />
              {#if i === 0}
                <circle cx="36" cy="45" r="12" />
                <path d="M36 33 v24 M24 45 h24" />
              {:else if i === 1}
                <path d="M18 34 h36 M18 45 h36 M18 56 h36" />
              {:else}
                <path d="M106 60 v-14 h10 v-12 h10 v-8 h10 v34 z" />
              {/if}
            </g>
          </svg>
          <h3>{b.title}</h3>
          <p>{b.body}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="section-tight section-warm">
  <div class="wrap wrap-narrow">
    <h2>In full</h2>
    <p>{s.detail}</p>
    <p><a href="/calculator">Size a plant for this duty in the calculator</a></p>
  </div>
</section>

<style>
  .actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: flex-start;
    margin-top: 18px;
  }
  .detail {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 26px;
    align-items: start;
  }
  .blocks {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .block {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px;
  }
  .diagram {
    width: 100%;
    height: 90px;
    margin-bottom: 8px;
  }
  .block h3 {
    font-size: 1rem;
  }
  .block p {
    font-size: 0.9rem;
    color: var(--ink-muted);
    margin: 0;
  }
  @media (max-width: 800px) {
    .detail,
    .blocks {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
