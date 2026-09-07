<script>
  import Plate from '$lib/components/Plate.svelte';
  export let data;
  $: offices = data.offices ?? [];
</script>

<svelte:head><title>Company, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Company</p>
    <h1 class="opening">clean heat and electricity to power a world of industrial applications</h1>
  </div>
</section>

<section class="section-tight">
  <div class="wrap grid grid-3">
    <div class="card">
      <h2>The vision</h2>
      <p class="small">
        A world where industry runs on clean, firm, high-temperature energy, because the alternative
        is a decarbonisation plan that quietly leaves out a quarter of all energy use.
      </p>
    </div>
    <div class="card">
      <h2>The mission</h2>
      <p class="small">
        To provide clean, reliable heat and power at the temperatures industry actually needs, on
        contracts that make the decision an energy purchase rather than a nuclear project.
      </p>
    </div>
    <div class="card">
      <h2>The name</h2>
      <p class="small">
        A zettajoule is a thousand exajoules. The world uses around six hundred exajoules of primary
        energy a year, and the growth of the next few decades makes zettajoules the honest unit for
        the need. The name is built from the units of the energy the world will need.
      </p>
    </div>
  </div>
</section>

<section class="section-tight section-warm">
  <div class="wrap story">
    <div>
      <h2>Where this came from</h2>
      <p>
        Zettajoule started in Rotterdam with a simple observation: industrial heat is the largest
        piece of the energy system that nobody has a clean answer for, and there is already a
        reactor design that reaches those temperatures and has been running since the late 1990s.
        The work was never to invent a reactor. It was to modernise one that already worked, put it
        in a factory, and sell what comes out of it.
      </p>
      <p>
        That decision shapes the company more than anything else on this site. Because we sell the
        energy, we carry the licence, the fuel, the operations and the risk that a customer would
        otherwise have to learn to carry.
      </p>
    </div>
    <Plate seed="company-story" height="230px" label="Generated plate for the company story" />
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2>Where we are</h2>
    {#if offices.length === 0}
      <div class="empty">
        <p><strong>Office list unavailable.</strong></p>
        <p>We could not read the offices just now. Write to us and we will point you at the nearest.</p>
        <a class="btn btn-secondary" href="/contact">Get in Touch</a>
      </div>
    {:else}
      <div class="grid grid-3" data-testid="office-list">
        {#each offices as o (o.city)}
          <div class="office">
            <svg viewBox="0 0 60 44" class="pinmark" role="img" aria-label={`Mark for the ${o.city} office`}>
              <g fill="none" stroke="var(--navy)" stroke-width="1.4">
                <rect x="6" y="14" width="20" height="28" />
                <rect x="30" y="4" width="24" height="38" />
                <path d="M10 20 h12 M10 27 h12 M10 34 h12 M34 10 h16 M34 18 h16 M34 26 h16 M34 34 h16" stroke="var(--rule-strong)" />
              </g>
            </svg>
            <h3>{o.city}</h3>
            <p class="small muted">{o.country}</p>
            <span class="pill">{o.role_label}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<section class="section-tight section-sky">
  <div class="wrap wrap-narrow">
    <h2>We do not only build the reactor.</h2>
    <p>
      We own it, we run it and we staff it. The customer buys heat, hydrogen or electricity against
      a long term energy supply agreement and never holds a nuclear licence, never procures fuel and
      never hires a reactor operator. Our own Operations Academy trains the people who run the
      plants, which is why the model scales at all.
    </p>
    <a class="btn" href="/edge">See why that matters</a>
  </div>
</section>

<style>
  .opening {
    font-size: clamp(1.8rem, 5vw, 3.6rem);
    max-width: 20ch;
  }
  .story {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 30px;
    align-items: center;
  }
  .office {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px;
  }
  .pinmark {
    width: 60px;
    height: 44px;
    margin-bottom: 8px;
  }
  .office h3 {
    margin: 0 0 2px;
    font-size: 1.1rem;
  }
  .office p {
    margin: 0 0 8px;
  }
  @media (max-width: 760px) {
    .story {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
