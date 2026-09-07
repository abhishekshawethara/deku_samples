<script>
  import { apiData } from '$lib/api';

  let need = '251';
  let kind = 'thermal';
  let result = null;
  let busy = false;
  let banner = null;
  let touched = false;

  $: needError =
    touched && !(Number(need) > 0) ? 'Enter a need in megawatts greater than zero.' : '';

  async function submit(e) {
    e?.preventDefault();
    touched = true;
    if (!(Number(need) > 0)) {
      banner = {
        tone: 'failure',
        title: 'Nothing to size',
        text: 'A need of zero or less is not a plant. Enter a positive figure in megawatts.'
      };
      return;
    }
    busy = true;
    banner = null;
    try {
      result = await apiData('/calculator', {
        method: 'POST',
        auth: false,
        body: { need_mw: Number(need), kind }
      });
    } catch (err) {
      banner = { tone: 'failure', title: 'Not calculated', text: err.message };
      result = null;
    } finally {
      busy = false;
    }
  }

  const fmt = (n) => new Intl.NumberFormat('en-GB').format(n);

  // bar chart scale, three bars normalised against their own maxima
  $: bars = result
    ? [
        { label: 'Modules', value: result.modules_required, max: 12, unit: 'modules' },
        { label: 'Clean energy', value: result.annual_clean_energy_gwh, max: 24000, unit: 'GWh a year' },
        { label: 'Carbon avoided', value: result.annual_co2_avoided_tonnes, max: 10800000, unit: 'tonnes a year' }
      ]
    : [];
</script>

<svelte:head><title>Energy calculator, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Calculator</p>
    <h1>How many modules does your site need?</h1>
    <p class="lede">
      One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs
      8000 hours a year. Each GWh delivered avoids 450 tonnes of carbon. Modules round up, and the
      energy figure follows the modules built rather than the need you asked for.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap calc">
    <form on:submit={submit} novalidate>
      {#if banner}
        <div class="banner banner-{banner.tone}" role="alert" data-testid="calc-banner">
          <strong>{banner.title}</strong>{banner.text}
        </div>
      {/if}
      <div class="field">
        <label for="need">Site need, in megawatts</label>
        <input
          id="need"
          type="number"
          min="1"
          step="any"
          bind:value={need}
          on:blur={() => (touched = true)}
          aria-invalid={!!needError}
          data-testid="need"
        />
        {#if needError}<p class="field-error">{needError}</p>{/if}
      </div>
      <div class="field">
        <label for="kind">Output kind</label>
        <select id="kind" bind:value={kind} data-testid="kind">
          <option value="thermal">Thermal, 250 MW a module</option>
          <option value="electrical">Electrical, 100 MW a module</option>
        </select>
      </div>
      <button class="btn" type="submit" disabled={busy} data-testid="calculate">
        {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Calculate
      </button>
    </form>

    <div class="results" aria-live="polite">
      {#if result}
        <div class="figures">
          <div class="figure">
            <span class="fkey">Modules required</span>
            <span class="fval" data-testid="modules_required">{fmt(result.modules_required)}</span>
          </div>
          <div class="figure">
            <span class="fkey">Annual clean energy, GWh</span>
            <span class="fval" data-testid="annual_clean_energy_gwh">{fmt(result.annual_clean_energy_gwh)}</span>
          </div>
          <div class="figure">
            <span class="fkey">Annual carbon avoided, tonnes</span>
            <span class="fval" data-testid="annual_co2_avoided_tonnes">{fmt(result.annual_co2_avoided_tonnes)}</span>
          </div>
        </div>

        <div class="chart" role="img" aria-label={`Bar chart: ${bars.map((b) => `${b.label} ${fmt(b.value)} ${b.unit}`).join('; ')}`}>
          {#each bars as b (b.label)}
            <div class="bar-row">
              <span class="bar-label">{b.label}</span>
              <span class="bar-track">
                <span class="bar-fill" style={`width:${Math.max(2, Math.min(100, (b.value / b.max) * 100))}%`}></span>
              </span>
              <span class="bar-value">{fmt(b.value)}</span>
            </div>
          {/each}
        </div>

        <table class="data plain-table">
          <caption class="sr-only">The same three figures as a table</caption>
          <tbody>
            <tr><th scope="row">Need asked for</th><td>{fmt(result.need_mw)} MW {result.kind}</td></tr>
            <tr><th scope="row">Per module</th><td>{fmt(result.per_module_mw)} MW</td></tr>
            <tr><th scope="row">Modules required</th><td>{fmt(result.modules_required)}</td></tr>
            <tr><th scope="row">Annual clean energy</th><td>{fmt(result.annual_clean_energy_gwh)} GWh</td></tr>
            <tr><th scope="row">Annual carbon avoided</th><td>{fmt(result.annual_co2_avoided_tonnes)} tonnes</td></tr>
          </tbody>
        </table>
      {:else}
        <div class="empty">
          <p><strong>No figures yet.</strong></p>
          <p>Enter a need in megawatts and choose thermal or electrical, then calculate.</p>
        </div>
      {/if}
    </div>
  </div>
</section>

<section class="section-tight section-warm">
  <div class="wrap">
    <h2>Worked rows</h2>
    <table class="data">
      <caption class="sr-only">Worked examples of the calculator arithmetic</caption>
      <thead>
        <tr><th scope="col">Need</th><th scope="col">Kind</th><th scope="col">Modules</th><th scope="col">GWh a year</th><th scope="col">Tonnes avoided</th></tr>
      </thead>
      <tbody>
        <tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr>
        <tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr>
        <tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr>
        <tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr>
      </tbody>
    </table>
  </div>
</section>

<style>
  .calc {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 30px;
    align-items: start;
  }
  .figures {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }
  .figure {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .fkey {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .fval {
    font-family: var(--font-head);
    font-size: clamp(1.3rem, 3vw, 2rem);
    color: var(--accent);
  }
  .chart {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 22px;
  }
  .bar-row {
    display: grid;
    grid-template-columns: 130px 1fr 120px;
    gap: 10px;
    align-items: center;
    font-size: 0.85rem;
  }
  .bar-track {
    height: 18px;
    background: var(--paper-grey);
    border: 1px solid var(--rule);
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    display: block;
    height: 100%;
    background: var(--accent);
  }
  .bar-value {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .plain-table {
    max-width: 520px;
  }
  @media (max-width: 820px) {
    .calc {
      grid-template-columns: minmax(0, 1fr);
    }
    .figures {
      grid-template-columns: minmax(0, 1fr);
    }
    .bar-row {
      grid-template-columns: 96px 1fr 90px;
    }
  }
</style>
