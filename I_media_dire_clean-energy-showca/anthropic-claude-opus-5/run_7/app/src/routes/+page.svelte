<script>
  import { onMount } from 'svelte';
  import Reactor from '$lib/components/Reactor.svelte';
  import Plate from '$lib/components/Plate.svelte';

  const OUTPUTS = [
    { kind: 'heat', label: 'Heat', note: 'Process heat straight into an existing steam header.' },
    { kind: 'heat-and-power', label: 'Heat and power', note: 'Both duties from one plant, split to follow the site.' },
    { kind: 'hydrogen', label: 'Hydrogen', note: 'High temperature electrolysis, at mill and corridor scale.' },
    { kind: 'electricity', label: 'Electricity', note: 'Firm carbon free power behind the meter.' }
  ];

  const FACTS = [
    'High-temperature gas-cooled reactor',
    '250 MW thermal a module',
    '750 degrees Celsius at the outlet'
  ];

  const INDUSTRIES = [
    { slug: 'steel', name: 'Steel' },
    { slug: 'chemicals', name: 'Chemicals' },
    { slug: 'data-centres', name: 'Data Centres' },
    { slug: 'transport', name: 'Transport' },
    { slug: 'mining', name: 'Mining' },
    { slug: 'desalination', name: 'Desalination' }
  ];

  let progress = 0;
  let hinted = false;
  let heroEl;

  onMount(() => {
    const onScroll = () => {
      const h = window.innerHeight || 800;
      const span = h * 1.4;
      progress = Math.max(0, Math.min(1, window.scrollY / span));
      hinted = window.scrollY > 40;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<svelte:head><title>Zettajoule, powering the world</title></svelte:head>

<section
  class="hero"
  bind:this={heroEl}
  style={`--settle:${Math.min(1, progress * 2.2)}`}
  data-testid="hero"
>
  <div class="wrap hero-inner">
    <h1 class="display">Powering the World</h1>
    <p class="promise">
      Small high-temperature reactor modules, owned and run by us. You buy the heat, the hydrogen or
      the electricity.
    </p>
    <div class="reactor-stage">
      <Reactor {progress} height={430} idPrefix="home" />
    </div>
    <div class="hint" class:gone={hinted} aria-hidden="true">
      <svg width="22" height="30" viewBox="0 0 22 30" focusable="false"><path d="M11 2 v22 M4 18 l7 7 l7 -7" fill="none" stroke="currentColor" stroke-width="2" /></svg>
    </div>
    <p class="sr-only">Scroll to take the reactor apart. The same sequence is written out below.</p>
  </div>
</section>

<section class="section" id="facts">
  <div class="wrap">
    <p class="eyebrow">The module</p>
    <h2>One engineered object that comes apart to explain itself.</h2>
    <ul class="facts">
      {#each FACTS as fact}
        <li>{fact}</li>
      {/each}
    </ul>
    <div class="grid grid-4 outputs">
      {#each OUTPUTS as o}
        <a class="output" href={`/solutions?output_kind=${encodeURIComponent(o.kind)}`}>
          <span class="output-label">{o.label}</span>
          <span class="output-note">{o.note}</span>
          <span class="output-go" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 16 16" focusable="false"><path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="2" /></svg>
          </span>
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="section section-warm">
  <div class="wrap wrap-narrow">
    <p class="eyebrow">The name and the need</p>
    <h2>A zettajoule is the unit the future is measured in.</h2>
    <p>
      The world uses somewhere around six hundred exajoules of primary energy a year, and industry
      takes a quarter of it as heat rather than as electricity. Put the growth of the next few
      decades on top and the number stops being an exajoule problem and starts being a zettajoule
      problem. That is where the name comes from: the unit of the energy the world will need, not
      the unit of anything we have built yet.
    </p>
    <p>
      Almost none of that industrial heat can be delivered by a water-cooled reactor, because a
      water-cooled reactor stops around three hundred degrees Celsius. Ours leaves the core at seven
      hundred and fifty, which is the temperature at which steel, chemicals, refining and hydrogen
      all become possible.
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow">Industries</p>
    <h2>Eight industries, one machine.</h2>
    <div class="rail">
      {#each INDUSTRIES as ind}
        <a class="ind" href={`/solutions/${ind.slug}`}>
          <Plate seed={ind.slug} height="120px" label={`Generated plate for ${ind.name}`} />
          <span>{ind.name}</span>
        </a>
      {/each}
    </div>
    <p><a href="/solutions">Open the solutions explorer, all eight</a></p>
  </div>
</section>

<section class="section section-dark" data-testid="dark-beat">
  <div class="wrap wrap-narrow">
    <p class="eyebrow">Unmatched heat</p>
    <h2 class="big">750 degrees. Nothing else in the fleet gets close.</h2>
    <p>
      A pressurised water reactor tops out around three hundred degrees Celsius. That is enough for
      electricity and nothing else. Helium carries heat out of our core at seven hundred and fifty,
      which is the line between making power and making steel, ammonia, fuel and hydrogen. Cross
      that line and the whole industrial base is in range.
    </p>
    <a class="btn" href="/technology">Read the technology</a>
  </div>
</section>

<section class="section">
  <div class="wrap tech-preview">
    <div>
      <p class="eyebrow">Technology</p>
      <h2>Proven, then modernised.</h2>
      <p>
        The design is a modernised version of a high-temperature gas-cooled reactor that has been
        running since the late 1990s, not a paper concept. Coated particle fuel, a graphite core and
        helium coolant, built in modules so a site can add capacity a module at a time.
      </p>
      <a class="btn btn-secondary" href="/edge">Why this is different</a>
    </div>
    <Plate seed="technology-preview" height="240px" label="Generated technical ground" />
  </div>
</section>

<style>
  .hero {
    position: relative;
    padding: 40px 0 60px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--sky) calc(100% - var(--settle) * 100%), var(--paper-grey)) 0%,
      color-mix(in srgb, #f7efe2 calc(100% - var(--settle) * 100%), var(--paper-grey)) 100%
    );
  }
  .hero-inner {
    position: relative;
    text-align: center;
  }
  .display {
    font-weight: 200;
    font-size: clamp(2.6rem, 11vw, 8.5rem);
    letter-spacing: -0.045em;
    line-height: 0.95;
    margin: 10px 0 6px;
  }
  .promise {
    margin: 0 auto 6px;
    max-width: 46ch;
    color: var(--ink-muted);
    font-size: 1.05rem;
  }
  .reactor-stage {
    display: flex;
    justify-content: center;
    margin-top: -10px;
  }
  .hint {
    color: var(--ink-muted);
    display: flex;
    justify-content: center;
    animation: zj-hint 1600ms ease-in-out infinite;
  }
  .hint.gone {
    visibility: hidden;
  }
  @keyframes zj-hint {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.55;
    }
    50% {
      transform: translateY(7px);
      opacity: 1;
    }
  }

  .facts {
    list-style: none;
    padding: 0;
    margin: 0 0 32px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .facts li {
    padding: 18px;
    font-family: var(--font-head);
    font-size: 1rem;
  }
  .facts li + li {
    border-left: 1px solid var(--rule);
  }
  @media (max-width: 700px) {
    .facts {
      grid-template-columns: minmax(0, 1fr);
    }
    .facts li + li {
      border-left: 0;
      border-top: 1px solid var(--rule);
    }
  }

  .output {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--ink);
    background: var(--paper);
    position: relative;
  }
  .output:hover {
    border-color: var(--accent-hover);
    background: var(--sky-soft);
    color: var(--ink);
  }
  .output-label {
    font-family: var(--font-head);
    font-size: 1.15rem;
    color: var(--accent);
  }
  .output:hover .output-label {
    color: var(--accent-hover);
  }
  .output-note {
    font-size: 0.9rem;
    color: var(--ink-muted);
  }
  .output-go {
    position: absolute;
    top: 16px;
    right: 16px;
    color: var(--accent);
  }

  .rail {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(210px, 1fr);
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 12px;
    scroll-snap-type: x mandatory;
  }
  .ind {
    text-decoration: none;
    color: var(--ink);
    scroll-snap-align: start;
  }
  .ind span {
    display: block;
    margin-top: 8px;
    font-family: var(--font-head);
  }
  .ind:hover span {
    color: var(--accent-hover);
  }
  @media (max-width: 600px) {
    .rail {
      grid-auto-columns: 82%;
    }
  }

  .big {
    font-size: clamp(1.9rem, 5.5vw, 3.4rem);
  }
  .tech-preview {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 32px;
    align-items: center;
  }
  @media (max-width: 760px) {
    .tech-preview {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hint {
      animation: none;
    }
  }
</style>
