<script>
  import { onMount } from 'svelte';
  import { apiData } from '$lib/api';

  let q = '';
  let category = '';
  let faqs = [];
  let loading = true;
  let error = '';
  let timer;

  async function load() {
    loading = true;
    error = '';
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (category) params.set('category', category);
      faqs = await apiData(`/faqs${params.toString() ? '?' + params : ''}`, { auth: false });
    } catch (err) {
      error = err.message || 'The questions could not be loaded.';
      faqs = [];
    } finally {
      loading = false;
    }
  }

  onMount(load);

  function onSearch() {
    clearTimeout(timer);
    timer = setTimeout(load, 180);
  }

  function setCategory(c) {
    category = c;
    load();
  }
</script>

<svelte:head><title>Questions, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">FAQ</p>
    <h1>Common questions</h1>
    <p class="lede">Search the questions people ask most, on the technology and on deployment.</p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap wrap-narrow">
    <div class="controls">
      <div class="field grow">
        <label for="faq-q">Search the questions</label>
        <input id="faq-q" type="search" bind:value={q} on:input={onSearch} placeholder="helium, licence, land" data-testid="faq-search" />
      </div>
      <div class="field">
        <label for="faq-cat">Category</label>
        <select id="faq-cat" bind:value={category} on:change={(e) => setCategory(e.currentTarget.value)} data-testid="faq-category">
          <option value="">All categories</option>
          <option value="Technology">Technology</option>
          <option value="Deployment">Deployment</option>
        </select>
      </div>
    </div>

    {#if error}
      <div class="banner banner-failure" role="alert"><strong>Could not load</strong>{error} Reload the page.</div>
    {/if}

    {#if loading}
      <div class="skeleton"><span class="spinner" aria-hidden="true"></span> Loading questions…</div>
    {:else if faqs.length === 0}
      <div class="empty" data-testid="faq-empty">
        <p><strong>No question matches that search.</strong></p>
        <p>Try a shorter word, clear the category, or ask us directly.</p>
        <a class="btn btn-secondary" href="/contact">Ask us instead</a>
      </div>
    {:else}
      <p class="small muted" aria-live="polite" data-testid="faq-count">{faqs.length} questions.</p>
      <ul class="faqs" data-testid="faq-list">
        {#each faqs as f (f.id)}
          <li>
            <details>
              <summary>
                <span class="pill">{f.category}</span>
                {f.question}
              </summary>
              <p>{f.answer}</p>
            </details>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .controls {
    display: flex;
    gap: 14px;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .grow {
    flex: 1 1 260px;
  }
  .faqs {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .faqs li {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    margin-bottom: 10px;
  }
  summary {
    cursor: pointer;
    padding: 14px 16px;
    font-weight: 600;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  summary:hover {
    background: var(--paper-warm);
  }
  details p {
    padding: 0 16px 16px;
    margin: 0;
    color: var(--ink-muted);
  }
</style>
