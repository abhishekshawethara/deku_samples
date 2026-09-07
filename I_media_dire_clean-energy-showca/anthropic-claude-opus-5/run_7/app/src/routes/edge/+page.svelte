<script>
  const OUTPUTS = [
    ['heat', 'Heat', 'Straight into the steam header a plant already runs.'],
    ['heat-and-power', 'Heat and power', 'Both duties from one plant, split to follow the site.'],
    ['hydrogen', 'Hydrogen', 'High temperature electrolysis, cheaper per kilogram because heat does part of the work.'],
    ['electricity', 'Electricity', 'Firm carbon free power behind the meter, flat profile, no grid queue.']
  ];
</script>

<svelte:head><title>Our Edge, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Our Edge</p>
    <h1>Not a concept. A machine that already ran.</h1>
    <p class="lede">
      Most advanced reactor companies are asking a regulator and a customer to believe a drawing.
      Ours is a modernised version of a high-temperature gas-cooled reactor that has been operating
      since the late 1990s, which is a completely different conversation.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap grid grid-2">
    <div class="card">
      <h2>Proven, then modernised</h2>
      <p class="small">
        The physics, the fuel and the coolant have an operating record behind them. We modernised
        the plant around them: factory build, digital twin, modular deployment. A regulator reviewing
        this is checking a modernisation against data, not adjudicating a claim.
      </p>
    </div>
    <div class="card">
      <h2>Hotter than the fleet</h2>
      <p class="small">
        A pressurised water reactor leaves its core near 300 degrees Celsius. Ours leaves at 750.
        That difference is not incremental: it is the line between making electricity and making
        steel, ammonia, refined product and hydrogen.
      </p>
    </div>
    <div class="card">
      <h2>One module or several</h2>
      <p class="small">
        A remote mine takes one. A steel mill takes eight. The same module, repeated, so a site
        scales by adding rather than by starting again, and the factory gets better at building it
        every time.
      </p>
    </div>
    <div class="card">
      <h2>You buy energy, not a reactor</h2>
      <p class="small">
        We own the plant, we run it and we staff it from our own Operations Academy. The customer
        signs an energy supply agreement. No nuclear licence, no fuel procurement, no operators to
        hire, no decommissioning liability.
      </p>
    </div>
  </div>
</section>

<section class="section-tight section-warm">
  <div class="wrap">
    <h2>Temperature is the whole argument</h2>
    <div class="scale" role="img" aria-label="Temperature scale: water-cooled reactors reach about 300 degrees Celsius, this reactor reaches 750 degrees Celsius, which covers district heat, desalination, refining, chemicals and hydrogen">
      <div class="track">
        <div class="span pwr"><span>Water-cooled, to about 300 C</span></div>
        <div class="span zj"><span>Zettajoule, to 750 C</span></div>
      </div>
      <ul class="ticks">
        <li>0 C</li><li>250 C</li><li>550 C</li><li>750 C</li>
      </ul>
    </div>
    <p class="small muted">
      Below 250 degrees sits district heat and desalination. Between 250 and 550 sits refining and
      much of chemicals. Above 550 sits hydrogen and the hardest chemical duties. A water-cooled
      plant reaches the first band only.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2>The four outputs</h2>
    <div class="grid grid-4">
      {#each OUTPUTS as [kind, label, note] (kind)}
        <a class="output" href={`/solutions?output_kind=${encodeURIComponent(kind)}`}>
          <span class="olabel">{label}</span>
          <span class="small muted">{note}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .scale {
    margin: 20px 0 14px;
  }
  .track {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    height: 56px;
    position: relative;
  }
  .span {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
    padding: 4px;
  }
  .pwr {
    grid-column: 1 / 3;
    background: var(--paper-grey);
    border: 1px solid var(--rule-strong);
    color: var(--ink-muted);
  }
  .zj {
    grid-column: 1 / 5;
    background: var(--sky);
    border: 1px solid var(--accent);
    color: var(--accent-hover);
    position: absolute;
    inset: auto 0 0 0;
    height: 26px;
  }
  .ticks {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0;
    margin: 6px 0 0;
    font-size: 0.75rem;
    color: var(--ink-muted);
  }
  .ticks li {
    text-align: center;
  }
  .output {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px;
    text-decoration: none;
    color: var(--ink);
  }
  .output:hover {
    border-color: var(--accent-hover);
    background: var(--sky-soft);
    color: var(--ink);
  }
  .olabel {
    font-family: var(--font-head);
    font-size: 1.1rem;
    color: var(--accent);
  }
</style>
