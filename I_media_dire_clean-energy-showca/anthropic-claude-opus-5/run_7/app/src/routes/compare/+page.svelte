<script>
  import { onMount } from 'svelte';
  import { apiData, api, getSaveToken, getToken } from '$lib/api';

  const LIMIT = 4;
  let saves = [];
  let chosen = [];
  let rows = [];
  let ready = false;
  let banner = null;
  let signedIn = false;
  let loadError = '';

  async function loadSaves() {
    try {
      const token = getToken();
      signedIn = !!token;
      const st = getSaveToken();
      if (!token && !st) {
        saves = [];
        return;
      }
      saves = await apiData(`/saves${!token && st ? `?save_token=${encodeURIComponent(st)}` : ''}`);
      chosen = saves.slice(0, LIMIT).map((r) => r.slug);
      await refresh();
    } catch (err) {
      loadError = err.message || 'Your saves could not be read.';
    } finally {
      ready = true;
    }
  }

  async function refresh() {
    if (!chosen.length) {
      rows = [];
      return;
    }
    try {
      rows = await apiData(`/compare?slugs=${encodeURIComponent(chosen.join(','))}`, { auth: false });
    } catch (err) {
      banner = { tone: 'failure', title: 'Comparison refused', text: err.message };
    }
  }

  async function toggle(slug) {
    banner = null;
    if (chosen.includes(slug)) {
      chosen = chosen.filter((s) => s !== slug);
      await refresh();
      return;
    }
    const attempt = [...chosen, slug];
    // The server is the authority: ask it, and keep the four already compared if it refuses.
    try {
      const data = await apiData(`/compare?slugs=${encodeURIComponent(attempt.join(','))}`, {
        auth: false
      });
      chosen = attempt;
      rows = data;
    } catch (err) {
      banner = {
        tone: 'failure',
        title: 'A fifth was refused',
        text: `${err.message} The four already compared are unchanged. Remove one to swap it out.`
      };
    }
  }

  onMount(loadSaves);

  const FIELDS = [
    ['industry', 'Industry'],
    ['title', 'What it does'],
    ['output_kind', 'Output kind'],
    ['temperature_band', 'Temperature band'],
    ['deployment', 'Deployment'],
    ['module_count', 'Modules']
  ];
</script>

<svelte:head><title>Compare saved solutions, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Compare</p>
    <h1>Four saves, side by side</h1>
    <p class="lede">
      The comparison holds at most four saved solutions. A fifth is refused and the four already
      compared stay exactly where they are.
    </p>

    {#if banner}
      <div class="banner banner-{banner.tone}" role="alert" data-testid="compare-banner">
        <strong>{banner.title}</strong>{banner.text}
      </div>
    {/if}
    {#if loadError}
      <div class="banner banner-failure" role="alert"><strong>Could not load</strong>{loadError}</div>
    {/if}
  </div>
</section>

{#if !ready}
  <section class="section-tight">
    <div class="wrap"><div class="skeleton"><span class="spinner" aria-hidden="true"></span> Loading your saves…</div></div>
  </section>
{:else}
  <section class="section-tight">
    <div class="wrap">
      {#if saves.length === 0}
        <div class="empty" data-testid="compare-empty">
          <p><strong>Nothing saved to compare.</strong></p>
          <p>
            The comparison draws from your saved solutions.
            {#if !signedIn}You can save before you have an account.{/if}
          </p>
          <a class="btn btn-secondary" href="/solutions">Open the explorer</a>
        </div>
      {:else}
        <div class="tray" data-testid="compare-tray">
          <p class="tray-label" id="tray-label">
            Your saves, {chosen.length} of {LIMIT} in the comparison
          </p>
          <ul aria-labelledby="tray-label">
            {#each saves as row (row.id)}
              <li>
                <button
                  type="button"
                  class="chip"
                  class:on={chosen.includes(row.slug)}
                  aria-pressed={chosen.includes(row.slug)}
                  on:click={() => toggle(row.slug)}
                  data-testid={`chip-${row.slug}`}
                >
                  <span class="tick" aria-hidden="true">
                    {#if chosen.includes(row.slug)}
                      <svg width="13" height="13" viewBox="0 0 16 16" focusable="false"><path d="M3 8.5 L6.5 12 L13 4" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>
                    {/if}
                  </span>
                  {row.industry}
                </button>
              </li>
            {/each}
          </ul>
        </div>

        {#if rows.length}
          <div class="scroller">
            <table class="data compare" data-testid="compare-table">
              <caption class="sr-only">Saved solutions compared side by side</caption>
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  {#each rows as r (r.slug)}
                    <th scope="col"><a href={`/solutions/${r.slug}`}>{r.industry}</a></th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each FIELDS as [key, label] (key)}
                  <tr>
                    <th scope="row">{label}</th>
                    {#each rows as r (r.slug)}
                      <td>{r[key]}</td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="small muted" data-testid="compare-count">{rows.length} solutions compared.</p>
        {:else}
          <div class="empty">
            <p><strong>Nothing chosen.</strong></p>
            <p>Pick up to four of your saves above to put them side by side.</p>
          </div>
        {/if}
      {/if}
    </div>
  </section>
{/if}

<style>
  .tray {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 12px 14px;
    margin-bottom: 18px;
    background: var(--paper-warm);
  }
  .tray-label {
    margin: 0 0 8px;
    font-family: var(--font-head);
    font-size: 0.85rem;
  }
  .tray ul {
    list-style: none;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--rule-strong);
    background: var(--paper);
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
  }
  .chip:hover {
    border-color: var(--ink-muted);
  }
  .chip.on {
    border-color: var(--accent);
    background: var(--sky-soft);
    color: var(--accent-hover);
  }
  .tick {
    width: 15px;
    display: inline-flex;
  }
  .scroller {
    overflow-x: auto;
  }
  .compare {
    min-width: 620px;
  }
  .compare th[scope='row'] {
    width: 160px;
  }
</style>
