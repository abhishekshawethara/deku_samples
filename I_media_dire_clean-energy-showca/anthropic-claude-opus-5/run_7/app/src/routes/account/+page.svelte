<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Modal from '$lib/components/Modal.svelte';
  import { api, apiData, getToken, ApiError } from '$lib/api';

  let ready = false;
  let account = null;
  let saves = [];
  let searches = [];
  let enquiries = [];
  let accessRequest = null;
  let applications = [];
  let banner = null;
  let loadError = '';
  let confirm = null; // { kind, id, label }
  let busyId = null;

  function flash(tone, title, text) {
    banner = { tone, title, text };
  }

  async function loadAll() {
    loadError = '';
    try {
      const [me, s1, s2, e1, a1] = await Promise.all([
        apiData('/accounts/me'),
        apiData('/saves'),
        apiData('/searches'),
        apiData('/enquiries'),
        apiData('/applications')
      ]);
      account = me;
      saves = s1;
      searches = s2;
      enquiries = e1;
      applications = a1;
      try {
        accessRequest = await apiData('/access-request');
      } catch (err) {
        accessRequest = err instanceof ApiError && err.status === 404 ? null : accessRequest;
      }
    } catch (err) {
      if (err.status === 401) {
        goto('/signin?next=/account');
        return;
      }
      loadError = err.message || 'Your account could not be loaded.';
    } finally {
      ready = true;
    }
  }

  onMount(() => {
    if (!getToken()) {
      goto('/signin?next=/account');
      return;
    }
    loadAll();
  });

  function askRemoveSave(row) {
    confirm = {
      kind: 'save',
      id: row.id,
      label: `Remove ${row.industry} from your saved solutions?`,
      detail: 'This removes the row from your account. You can save it again from the explorer.'
    };
  }

  function askRemoveSearch(row) {
    confirm = {
      kind: 'search',
      id: row.id,
      label: `Delete the saved search "${row.name}"?`,
      detail: 'The filters are forgotten. The solutions themselves are untouched.'
    };
  }

  async function runConfirm() {
    const c = confirm;
    confirm = null;
    if (!c) return;
    busyId = `${c.kind}-${c.id}`;
    try {
      if (c.kind === 'save') {
        await api(`/saves/${c.id}`, { method: 'DELETE' });
        saves = saves.filter((r) => r.id !== c.id);
        flash('success', 'Removed', 'That saved solution is gone from your account.');
      } else {
        await api(`/searches/${c.id}`, { method: 'DELETE' });
        searches = searches.filter((r) => r.id !== c.id);
        flash('success', 'Deleted', 'That saved search is gone from your account.');
      }
    } catch (err) {
      flash('failure', 'Not removed', `${err.message} Nothing was changed.`);
    } finally {
      busyId = null;
    }
  }

  async function closeEnquiry(row) {
    busyId = `enq-${row.id}`;
    banner = null;
    try {
      const data = await apiData(`/enquiries/${row.id}/close`, { method: 'POST' });
      enquiries = enquiries.map((e) => (e.id === row.id ? { ...e, status: data.status } : e));
      flash('success', 'Enquiry closed', `${data.reference} is now closed. Closing it again records one close, not two.`);
    } catch (err) {
      flash('failure', 'Not closed', `${err.message} The enquiry is unchanged.`);
    } finally {
      busyId = null;
    }
  }

  const dt = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');
</script>

<svelte:head><title>Your account, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Account</p>
    <h1>{account ? account.display_name : 'Your account'}</h1>
    {#if account}
      <p class="lede">{account.email}. Five lists, all of them yours alone.</p>
    {/if}

    {#if banner}
      <div class="banner banner-{banner.tone}" role="status" data-testid="account-banner">
        <strong>{banner.title}</strong>{banner.text}
      </div>
    {/if}
    {#if loadError}
      <div class="banner banner-failure" role="alert">
        <strong>Could not load your account</strong>{loadError} Reload the page or sign in again.
      </div>
    {/if}
  </div>
</section>

{#if !ready}
  <section class="section-tight">
    <div class="wrap">
      <div class="skeleton"><span class="spinner" aria-hidden="true"></span> Loading your lists…</div>
    </div>
  </section>
{:else}
  <section class="section-tight">
    <div class="wrap lists">
      <!-- Saved solutions -->
      <article class="list" data-testid="list-saves">
        <header>
          <h2>Saved solutions</h2>
          <span class="pill">{saves.length}</span>
        </header>
        {#if saves.length === 0}
          <div class="empty">
            <p><strong>No saved solutions yet.</strong></p>
            <p>Nothing has been kept from the explorer.</p>
            <a class="btn btn-secondary btn-sm" href="/solutions">Open the explorer</a>
          </div>
        {:else}
          <ul>
            {#each saves as row (row.id)}
              <li>
                <div>
                  <a href={`/solutions/${row.slug}`}>{row.industry}</a>
                  <span class="small muted">{row.output_kind}, {row.temperature_band}</span>
                </div>
                <button
                  class="btn btn-danger btn-sm"
                  type="button"
                  on:click={() => askRemoveSave(row)}
                  disabled={busyId === `save-${row.id}`}
                >Remove<span class="sr-only"> {row.industry} from saved solutions</span></button>
              </li>
            {/each}
          </ul>
          <a class="btn btn-secondary btn-sm" href="/compare">Compare up to four</a>
        {/if}
      </article>

      <!-- Saved searches -->
      <article class="list" data-testid="list-searches">
        <header>
          <h2>Saved searches</h2>
          <span class="pill">{searches.length}</span>
        </header>
        {#if searches.length === 0}
          <div class="empty">
            <p><strong>No saved searches yet.</strong></p>
            <p>Filter the explorer and name the result to keep it.</p>
            <a class="btn btn-secondary btn-sm" href="/solutions">Filter the explorer</a>
          </div>
        {:else}
          <ul>
            {#each searches as row (row.id)}
              <li>
                <div>
                  <a
                    href={`/solutions?${new URLSearchParams(
                      Object.entries({
                        industry: row.industry || '',
                        output_kind: row.output_kind || '',
                        temperature_band: row.temperature_band || '',
                        deployment: row.deployment || '',
                        q: row.query || ''
                      }).filter(([, v]) => v)
                    ).toString()}`}>{row.name}</a>
                  <span class="small muted">
                    {[row.industry, row.output_kind, row.temperature_band, row.deployment, row.query]
                      .filter(Boolean)
                      .join(', ') || 'No filters'}
                  </span>
                </div>
                <button
                  class="btn btn-danger btn-sm"
                  type="button"
                  on:click={() => askRemoveSearch(row)}
                  disabled={busyId === `search-${row.id}`}
                >Delete<span class="sr-only"> the saved search {row.name}</span></button>
              </li>
            {/each}
          </ul>
        {/if}
      </article>

      <!-- Enquiries -->
      <article class="list wide" data-testid="list-enquiries">
        <header>
          <h2>Enquiries</h2>
          <span class="pill">{enquiries.length}</span>
        </header>
        {#if enquiries.length === 0}
          <div class="empty">
            <p><strong>No enquiries sent.</strong></p>
            <p>Nothing has been asked from this account yet.</p>
            <a class="btn btn-secondary btn-sm" href="/contact">Send an enquiry</a>
          </div>
        {:else}
          <ul>
            {#each enquiries as row (row.id)}
              <li data-reference={row.reference}>
                <div>
                  <strong>{row.reference}</strong>
                  <span class="small muted">{row.topic}, sent {dt(row.created_at)}</span>
                </div>
                <div class="right">
                  <span class="pill pill-{row.status}">{row.status}</span>
                  {#if row.status !== 'closed'}
                    <button
                      class="btn btn-secondary btn-sm"
                      type="button"
                      on:click={() => closeEnquiry(row)}
                      disabled={busyId === `enq-${row.id}`}
                      data-testid={`close-${row.reference}`}
                    >
                      {#if busyId === `enq-${row.id}`}<span class="spinner" aria-hidden="true"></span>{/if}
                      Close<span class="sr-only"> enquiry {row.reference}</span>
                    </button>
                  {:else}
                    <button class="btn btn-sm" type="button" disabled aria-disabled="true">
                      Closed<span class="sr-only">, this enquiry is already closed</span>
                    </button>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </article>

      <!-- Access request -->
      <article class="list" data-testid="list-access">
        <header>
          <h2>Investor access</h2>
          {#if accessRequest}<span class="pill pill-{accessRequest.status}">{accessRequest.status}</span>{/if}
        </header>
        {#if !accessRequest}
          <div class="empty">
            <p><strong>No access request made.</strong></p>
            <p>The document room stays shut until a request of yours is approved.</p>
            <a class="btn btn-secondary btn-sm" href="/investors">Request access</a>
          </div>
        {:else}
          <dl class="kv">
            <dt>Reference</dt><dd data-testid="access-reference">{accessRequest.reference}</dd>
            <dt>Organisation</dt><dd>{accessRequest.organisation}</dd>
            <dt>Role</dt><dd>{accessRequest.role_title}</dd>
            <dt>Status</dt><dd><span class="pill pill-{accessRequest.status}">{accessRequest.status}</span></dd>
          </dl>
          {#if accessRequest.status === 'approved'}
            <a class="btn btn-sm" href="/investors/room">Open the document room</a>
          {:else if accessRequest.status === 'pending'}
            <p class="small muted">Pending. The room answers only once this request is approved.</p>
          {:else}
            <p class="small muted">Declined. Write to us if your situation has changed.</p>
          {/if}
        {/if}
      </article>

      <!-- Applications -->
      <article class="list" data-testid="list-applications">
        <header>
          <h2>Job applications</h2>
          <span class="pill">{applications.length}</span>
        </header>
        {#if applications.length === 0}
          <div class="empty">
            <p><strong>No applications sent.</strong></p>
            <p>Nothing has been applied for from this account.</p>
            <a class="btn btn-secondary btn-sm" href="/careers">See the open jobs</a>
          </div>
        {:else}
          <ul>
            {#each applications as row (row.id)}
              <li>
                <div>
                  <a href="/careers">{row.job_title}</a>
                  <span class="small muted">{row.location}, sent {dt(row.created_at)}</span>
                </div>
                <span class="pill pill-{row.status}">{row.status}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </article>
    </div>
  </section>
{/if}

<Modal
  open={!!confirm}
  title="Confirm this removal"
  labelledBy="confirm-title"
  onClose={() => (confirm = null)}
>
  {#if confirm}
    <p><strong>{confirm.label}</strong></p>
    <p class="muted">{confirm.detail}</p>
    <div class="confirm-actions">
      <button class="btn btn-danger" type="button" on:click={runConfirm} data-autofocus>Yes, remove it</button>
      <button class="btn btn-secondary" type="button" on:click={() => (confirm = null)}>Keep it</button>
    </div>
  {/if}
</Modal>

<style>
  .lists {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  .list {
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px;
  }
  .list.wide {
    grid-column: 1 / -1;
  }
  .list header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 8px;
    margin-bottom: 10px;
  }
  .list h2 {
    font-size: 1.05rem;
    margin: 0;
  }
  .list ul {
    list-style: none;
    margin: 0 0 12px;
    padding: 0;
  }
  .list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--rule);
    font-size: 0.92rem;
  }
  .list li > div {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .list li span.small {
    color: var(--ink-muted);
  }
  .right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
  }
  .kv {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 14px;
    margin: 0 0 12px;
    font-size: 0.92rem;
  }
  .kv dt {
    color: var(--ink-muted);
  }
  .kv dd {
    margin: 0;
  }
  .confirm-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  @media (max-width: 760px) {
    .lists {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
