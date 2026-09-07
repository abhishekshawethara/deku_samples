<script>
  import { onMount } from 'svelte';
  import Reactor from '$lib/components/Reactor.svelte';

  const FACTS = [
    'High-temperature gas-cooled reactor',
    '250 MW thermal a module',
    '750 degrees Celsius at the outlet'
  ];

  let turn = 55;
  let progress = 0.62;

  onMount(() => {
    const onScroll = () => {
      const el = document.getElementById('diagram');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = window.innerHeight || 800;
      progress = Math.max(0, Math.min(1, 1 - (rect.top + rect.height * 0.2) / h));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<svelte:head><title>Technology, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Technology</p>
    <h1>Helium at 750 degrees, out of a core that cannot melt.</h1>
    <ul class="facts">
      {#each FACTS as f (f)}<li>{f}</li>{/each}
    </ul>
  </div>
</section>

<section class="section-tight" id="diagram">
  <div class="wrap diagram-row">
    <div class="stage" style={`--turn:${turn - 50}deg`}>
      <Reactor {progress} interactive height={430} idPrefix="tech" />
    </div>
    <div>
      <h2>Pick the diagram apart</h2>
      <p class="small muted">
        Choose a part to read what it does, or turn the drawing with the slider. Everything the
        drawing says is also written out below it.
      </p>
      <div class="field">
        <label for="turn">Turn the diagram</label>
        <input id="turn" type="range" min="0" max="100" bind:value={turn} data-testid="turn" />
        <p class="small muted">Rotation {turn - 50} degrees.</p>
      </div>
    </div>
  </div>
</section>

<section class="section-tight section-warm">
  <div class="wrap grid grid-3">
    <div class="card">
      <h2>The fuel</h2>
      <p class="small">
        Tiny grains of uranium, each wrapped in layers of carbon and silicon carbide that act as
        their own pressure vessel. The coatings hold together far above any temperature the reactor
        can reach, so the fission products stay where they are made even with all cooling removed.
      </p>
    </div>
    <div class="card">
      <h2>The graphite</h2>
      <p class="small">
        Graphite surrounds the fuel, slows the neutrons and holds an enormous amount of heat. Its
        thermal mass is why the core responds in hours rather than seconds, and why there is time
        for physics to settle an upset without a pump running.
      </p>
    </div>
    <div class="card">
      <h2>The helium</h2>
      <p class="small">
        Helium carries the heat out. It is chemically inert, so it corrodes nothing and reacts with
        nothing, it does not change phase at any temperature the plant sees, and it barely activates
        in the neutron flux. It is the reason the outlet can be this hot at all.
      </p>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap two">
    <div>
      <h2>A living digital copy</h2>
      <p>
        Every module has a digital twin fed by its own instrumentation, running the same physics as
        the plant. It spots a drifting bearing or a fouling exchanger before either becomes an
        outage, schedules maintenance against real condition rather than the calendar, and keeps the
        cost of operating a fleet flat as the fleet grows.
      </p>
    </div>
    <div>
      <h2>The safety case</h2>
      <p>
        Ours is not a paper argument. It rests on a real high-temperature test reactor that has been
        running since the late 1990s, on the operating record that machine has produced, and on fuel
        that has been irradiated and tested to the conditions the case claims. That is the whole
        reason a regulator can move faster on this than on a concept.
      </p>
    </div>
    <div>
      <h2>Built in modules</h2>
      <p>
        A module is built in a factory and finished on site, so the programme is licensing and site
        works rather than a decade of construction. A site that needs more energy later adds a
        module. The tenth plant is a repeat, not a first of a kind, and cost follows repetition.
      </p>
    </div>
    <div>
      <h2>What comes out</h2>
      <p>
        Heat, heat and power, hydrogen or electricity, depending on what the site buys. The
        <a href="/solutions">solutions explorer</a> shows all eight industries we serve and the
        <a href="/calculator">calculator</a> turns a site need into a module count.
      </p>
    </div>
  </div>
</section>

<style>
  .facts {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .facts li {
    padding: 16px;
    font-family: var(--font-head);
  }
  .facts li + li {
    border-left: 1px solid var(--rule);
  }
  .diagram-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    align-items: center;
  }
  .stage {
    display: flex;
    justify-content: center;
    transform: perspective(900px) rotateY(var(--turn));
  }
  .two {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px;
  }
  input[type='range'] {
    width: 100%;
    min-height: 44px;
  }
  @media (max-width: 800px) {
    .facts,
    .diagram-row,
    .two {
      grid-template-columns: minmax(0, 1fr);
    }
    .facts li + li {
      border-left: 0;
      border-top: 1px solid var(--rule);
    }
  }
</style>
