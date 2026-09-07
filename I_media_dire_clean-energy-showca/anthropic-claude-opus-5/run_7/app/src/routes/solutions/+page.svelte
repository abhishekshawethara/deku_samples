<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Plate from '$lib/components/Plate.svelte';
  import SaveButton from '$lib/components/SaveButton.svelte';
  import { api, apiData, getSaveToken, getToken } from '$lib/api';

  const INDUSTRIES = [
    'Oil and Gas',
    'Chemicals',
    'Transport',
    'Steel',
    'Mining',
    'Data Centres',
    'Communities',
    'Desalination'
  ];
  const OUTPUT_KINDS = [
    ['heat', 'Heat'],
    ['heat-and-power', 'Heat and power'],
    ['hydrogen', 'Hydrogen'],
    ['electricity', 'Electricity']
  ];
  const BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
  const DEPLOYMENTS = [
    ['single-module', 'Single module'],
    ['multi-module', 'Multi module']
  ];

  let filters = { industry: '', output_kind: '', temperature_band: '', deployment: '', q: '' };
  let solutions = [];
  let total = 0;
  let loading = true;
  let error = '';
  let savedBySlug = {};
  let signedIn = false;

  let searchName = '';
  let searchBusy = false;
  let searchMsg = null;
  let lastQs = null;

  function readUrl(url) {
    filters = {
      industry: url.searchParams.get('industry') || '',
      output_kind: url.searchParams.get('output_kind') || '',
      temperature_band: url.searchParams.get('temperature_band') || '',
      deployment: url.searchParams.get('deployment') || '',
      q: url.searchParams.get('q') || ''
    };
  }

  $: readUrl($page.url);
  $: qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  $: if (typeof window !== 'undefined') load(qs);

  async function load(currentQs) {
    if (currentQs === lastQs) return;
    lastQs = currentQs;
    loading = true;
    error = '';
    try {
      const { data, headers } = await api(`/solutions${currentQs ? '?' + currentQs : ''}`, {
        auth: false
      });
      solutions = data;
      total = Number(headers.get('X-Total-Count') ?? data.length);
    } catch (err) {
      error = err.message || 'The explorer could not load.';
      solutions = [];
      total = 0;
    } finally {
      loading = false;
    }
  }

  async function loadSaves() {
    try {
      const token = getToken();
      signedIn = !!token;
      const st = getSaveToken();
      if (!token && !st) {
        savedBySlug = {};
        return;
      }
      const data = await apiData(
        `/saves${!token && st ? `?save_token=${encodeURIComponent(st)}` : ''}`
      );
      savedBySlug = Object.fromEntries(data.map((r) => [r.slug, r.id]));
    } catch {
      savedBySlug = {};
    }
  }

  onMount(() => {
    load(qs);
    loadSaves();
  });

  function setFilter(key, value) {
    const next = new URLSearchParams(
      Object.entries({ ...filters, [key]: value }).filter(([, v]) => v)
    );
    goto(`/solutions${next.toString() ? '?' + next.toString() : ''}`, {
      replaceState: true,
      keepFocus: true,
      noScroll: true
    });
  }

  function clearAll() {
    goto('/solutions', { replaceState: true, keepFocus: true, noScroll: true });
  }

  function onSaveChange({ slug, saved, id }) {
    savedBySlug = saved
      ? { ...savedBySlug, [slug]: id }
      : Object.fromEntries(Object.entries(savedBySlug).filter(([k]) => k !== slug));
  }

  async function saveSearch(e) {
    e.preventDefault();
    if (!searchName.trim()) {
      searchMsg = { tone: 'failure', text: 'Name the search before you save it.' };
      return;
    }
    searchBusy = true;
    searchMsg = null;
    try {
      const data = await apiData('/searches', {
        method: 'POST',
        body: {
          name: searchName.trim(),
          query: filters.q,
          industry: filters.industry,
          output_kind: filters.output_kind,
          temperature_band: filters.temperature_band,
          deployment: filters.deployment
        }
      });
      searchMsg = {
        tone: 'success',
        text: `Saved as "${data.name}". The same name replaces its filters rather than adding a row.`
      };
      searchName = '';
    } catch (err) {
      searchMsg = {
        tone: 'failure',
        text:
          err.status === 401
            ? 'Sign in to keep a search. Your filters stay where they are.'
            : err.message
      };
    } finally {
      searchBusy = false;
    }
  }

  $: activeCount = Object.values(filters).filter(Boolean).length;
</script>

<svelte:head><title>Solutions explorer, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Solutions</p>
    <h1>What can this power?</h1>
    <p class="lede">
      Eight industries, one machine. Choose an industry, what you want out of it, how hot you need
      it and how it would be deployed. The count reads how many of the eight are showing.
    </p>
  </div>
</section>

<section class="filters-bar">
  <div class="wrap">
    <form class="filters" on:submit|preventDefault>
      <div class="f">
        <label for="f-industry">Industry</label>
        <select
          id="f-industry"
          value={filters.industry}
          on:change={(e) => setFilter('industry', e.currentTarget.value)}
          data-testid="filter-industry"
        >
          <option value="">All industries</option>
          {#each INDUSTRIES as i}<option value={i}>{i}</option>{/each}
        </select>
      </div>
      <div class="f">
        <label for="f-output">Output</label>
        <select
          id="f-output"
          value={filters.output_kind}
          on:change={(e) => setFilter('output_kind', e.currentTarget.value)}
          data-testid="filter-output"
        >
          <option value="">All outputs</option>
          {#each OUTPUT_KINDS as [v, l]}<option value={v}>{l}</option>{/each}
        </select>
      </div>
      <div class="f">
        <label for="f-band">Temperature</label>
        <select
          id="f-band"
          value={filters.temperature_band}
          on:change={(e) => setFilter('temperature_band', e.currentTarget.value)}
          data-testid="filter-band"
        >
          <option value="">Any temperature</option>
          {#each BANDS as b}<option value={b}>{b}</option>{/each}
        </select>
      </div>
      <div class="f">
        <label for="f-deploy">Deployment</label>
        <select
          id="f-deploy"
          value={filters.deployment}
          on:change={(e) => setFilter('deployment', e.currentTarget.value)}
          data-testid="filter-deployment"
        >
          <option value="">Either deployment</option>
          {#each DEPLOYMENTS as [v, l]}<option value={v}>{l}</option>{/each}
        </select>
      </div>
      <div class="f f-wide">
        <label for="f-q">Search</label>
        <input
          id="f-q"
          type="search"
          placeholder="Plain language, for example hydrogen mill"
          value={filters.q}
          on:change={(e) => setFilter('q', e.currentTarget.value)}
          data-testid="filter-q"
        />
      </div>
    </form>

    <div class="count-row">
      <p class="count" aria-live="polite" data-testid="result-count">
        Showing <strong>{total}</strong> of 8 solutions
      </p>
      {#if activeCount}
        <button type="button" class="btn btn-secondary btn-sm" on:click={clearAll}>
          Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
        </button>
      {/if}
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    {#if error}
      <div class="banner banner-failure" role="alert">
        <strong>The explorer could not load</strong>
        {error} Reload the page, or <a href="/contact">tell us</a> if it keeps happening.
      </div>
    {/if}

    {#if loading}
      <div class="grid grid-4 grid-dense" data-testid="grid-loading">
        {#each [1, 2, 3, 4] as n (n)}
          <div class="skeleton">
            <span class="spinner" aria-hidden="true"></span> Loading solutions…
          </div>
        {/each}
      </div>
    {:else if solutions.length === 0}
      <div class="empty" data-testid="grid-empty">
        <p><strong>No solution matches those filters.</strong></p>
        <p>Nothing in the eight combines what you have chosen. Widen one filter, or clear them all.</p>
        <button type="button" class="btn btn-secondary" on:click={clearAll}>Clear the filters</button>
      </div>
    {:else}
      <div class="grid grid-4 grid-dense cards" data-testid="solution-grid">
        {#each solutions as s (s.slug)}
          <article class="scard" data-slug={s.slug}>
            <Plate seed={s.slug} height="92px" label={`Generated plate for ${s.industry}`} />
            <h2><a href={`/solutions/${s.slug}`}>{s.industry}</a></h2>
            <p class="stitle">{s.title}</p>
            <ul class="meta">
              <li><span>Output</span>{s.output_kind}</li>
              <li><span>Heat</span>{s.temperature_band}</li>
              <li><span>Build</span>{s.deployment}</li>
              <li><span>Modules</span>{s.module_count}</li>
            </ul>
            <div class="scard-actions">
              <SaveButton
                slug={s.slug}
                small
                saved={!!savedBySlug[s.slug]}
                saveId={savedBySlug[s.slug] ?? null}
                onChange={onSaveChange}
              />
              <a class="btn btn-secondary btn-sm" href={`/solutions/${s.slug}`}>Open</a>
            </div>
          </article>
        {/each}
      </div>

      <details class="plain">
        <summary>Read the filtered set as a list</summary>
        <ol>
          {#each solutions as s (s.slug)}
            <li>
              {s.industry}: {s.title}. {s.output_kind}, {s.temperature_band}, {s.deployment},
              {s.module_count} modules.
            </li>
          {/each}
        </ol>
      </details>
    {/if}
  </div>
</section>

<section class="section-tight section-sky">
  <div class="wrap">
    <h2>Keep this search</h2>
    <p class="muted small">
      A saved search is unique by name in your account: reusing a name replaces its filters rather
      than adding a second row.
    </p>
    {#if searchMsg}
      <div class="banner banner-{searchMsg.tone === 'success' ? 'success' : 'failure'}" role="status">
        <strong>{searchMsg.tone === 'success' ? 'Search saved' : 'Not saved'}</strong>
        {searchMsg.text}
        {#if searchMsg.tone === 'failure' && !signedIn}
          <a href="/signin?next=/solutions">Sign in</a>
        {/if}
      </div>
    {/if}
    <form class="save-search" on:submit={saveSearch}>
      <div class="f f-wide">
        <label for="search-name">Name this search</label>
        <input
          id="search-name"
          type="text"
          bind:value={searchName}
          placeholder="Hydrogen sites"
          data-testid="search-name"
        />
      </div>
      <button class="btn" type="submit" disabled={searchBusy} data-testid="save-search">
        {#if searchBusy}<span class="spinner" aria-hidden="true"></span>{/if} Save this search
      </button>
    </form>
  </div>
</section>

<style>
  .filters-bar {
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    background: var(--paper-warm);
    padding: 14px 0;
    position: sticky;
    top: var(--bar-h);
    z-index: 30;
  }
  .filters {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 1.4fr;
    gap: 12px;
  }
  .f label {
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .count-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .count {
    margin: 0;
    font-family: var(--font-head);
    font-size: 0.95rem;
  }
  @media (max-width: 900px) {
    .filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .filters-bar {
      position: static;
    }
  }
  @media (max-width: 520px) {
    .filters {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .scard {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--paper);
  }
  .scard h2 {
    font-size: 1.05rem;
    margin: 0;
  }
  .scard h2 a {
    text-decoration: none;
    color: var(--ink);
  }
  .scard h2 a:hover {
    color: var(--accent-hover);
    text-decoration: underline;
  }
  .stitle {
    margin: 0;
    font-size: 0.85rem;
    color: var(--ink-muted);
    line-height: 1.4;
  }
  .meta {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.78rem;
    border-top: 1px solid var(--rule);
  }
  .meta li {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px solid var(--rule);
  }
  .meta li span {
    color: var(--ink-muted);
  }
  .scard-actions {
    margin-top: auto;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .plain {
    margin-top: 22px;
    color: var(--ink-muted);
    font-size: 0.9rem;
  }
  .plain summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--accent);
  }
  .save-search {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
  }
  .save-search .f {
    flex: 1 1 260px;
  }
  @media (max-width: 640px) {
    .cards {
      grid-auto-flow: column;
      grid-auto-columns: 84%;
      grid-template-columns: none;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 10px;
    }
    .scard {
      scroll-snap-align: start;
    }
  }
</style>
