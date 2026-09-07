<script>
  export let data;
  $: documents = data.documents ?? [];
  const dt = (v) => (v ? String(v).slice(0, 10) : '');
</script>

<svelte:head><title>Document room, Zettajoule investors</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow"><a href="/investors">Investors</a> / Document room</p>
    <h1>The document room</h1>
    <p class="lede">
      This room answers only while your own access request reads approved. Everything here is
      confidential to the account that opened it.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    {#if documents.length === 0}
      <div class="empty">
        <p><strong>No documents are published yet.</strong></p>
        <p>Your access is approved but the room is empty. We will write to you when it fills.</p>
        <a class="btn btn-secondary" href="/investors">Back to the investor case</a>
      </div>
    {:else}
      <ul class="docs" data-testid="document-list">
        {#each documents as d (d.slug)}
          <li class="doc" data-slug={d.slug}>
            <svg viewBox="0 0 40 52" class="mark" role="img" aria-label={`Document mark for ${d.title}`}>
              <path d="M4 2 h22 l10 10 v38 h-32 z" fill="none" stroke="var(--navy)" stroke-width="1.6" />
              <path d="M26 2 v10 h10" fill="none" stroke="var(--navy)" stroke-width="1.6" />
              <path d="M10 22 h20 M10 30 h20 M10 38 h13" stroke="var(--rule-strong)" stroke-width="1.4" />
            </svg>
            <div>
              <h2>{d.title}</h2>
              <p class="small muted">{d.category}, published {dt(d.published_at)}</p>
              {#if d.summary}<p class="small">{d.summary}</p>{/if}
            </div>
          </li>
        {/each}
      </ul>
      <p class="small muted">{documents.length} documents. Ask us for a walkthrough of any of them.</p>
    {/if}
  </div>
</section>

<style>
  .docs {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: grid;
    gap: 14px;
  }
  .doc {
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 16px;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px;
    align-items: start;
  }
  .mark {
    width: 40px;
    height: 52px;
  }
  .doc h2 {
    font-size: 1.05rem;
    margin: 0 0 4px;
  }
  .doc p {
    margin: 0 0 4px;
  }
</style>
