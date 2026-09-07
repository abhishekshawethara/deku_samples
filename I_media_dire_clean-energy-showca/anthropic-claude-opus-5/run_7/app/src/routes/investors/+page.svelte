<script>
  import { onMount } from 'svelte';
  import { apiData, getToken, ApiError } from '$lib/api';

  const ROADMAP = [
    ['1998', 'Test reactor first criticality', 'The machine this design modernises begins operating, and has run since.'],
    ['2024', 'Company founded', 'Zettajoule forms in Rotterdam around an energy-as-a-service model.'],
    ['2026', 'Licensing step cleared', 'The fuel qualification basis and the safety case approach are accepted in pre-application review.'],
    ['2027', 'Topical reports submitted', 'Intermediate heat exchanger and helium circuit reports go to the regulator.'],
    ['2029', 'Construction permit', 'First site permitted, long lead items already in the factory.'],
    ['2032', 'First deployment', 'First module delivering heat under a twenty year energy supply agreement.']
  ];

  const COMPARISON = [
    ['Zettajoule module', '750 C', 'Heat, hydrogen, power', 'Modular, factory built', 'Owned and run by us'],
    ['Water-cooled SMR', 'About 300 C', 'Power only', 'Modular', 'Sold to the customer'],
    ['Gas boiler or fired heater', 'Any temperature', 'Heat only', 'Site built', 'Owned by the customer'],
    ['Wind or solar plus storage', 'Not thermal', 'Power, intermittent', 'Land hungry', 'Owned by the customer']
  ];

  let request = null;
  let ready = false;
  let signedIn = false;
  let organisation = '';
  let role_title = '';
  let busy = false;
  let banner = null;
  let touched = {};

  async function load() {
    signedIn = !!getToken();
    if (!signedIn) {
      ready = true;
      return;
    }
    try {
      request = await apiData('/access-request');
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        banner = { tone: 'failure', title: 'Could not read your request', text: err.message };
      }
      request = null;
    } finally {
      ready = true;
    }
  }

  onMount(load);

  async function submit(e) {
    e.preventDefault();
    touched = { organisation: true, role_title: true };
    if (!organisation.trim() || !role_title.trim()) {
      banner = {
        tone: 'failure',
        title: 'Not requested',
        text: 'Both the organisation and your role title are needed before we can log a request.'
      };
      return;
    }
    busy = true;
    banner = null;
    try {
      const data = await apiData('/access-request', {
        method: 'POST',
        body: { organisation: organisation.trim(), role_title: role_title.trim() }
      });
      request = data;
      banner = {
        tone: 'pending',
        title: 'Request logged as pending',
        text: `Your reference is ${data.reference}. Your account holds at most one request, so asking again updates this one rather than adding another. The document room stays shut until it is approved.`
      };
    } catch (err) {
      banner = {
        tone: 'failure',
        title: 'Not requested',
        text:
          err.status === 401
            ? 'Sign in first: a request belongs to an account.'
            : `${err.message} Nothing was recorded.`
      };
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Investors, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Investors</p>
    <h1>A proven machine, sold as a service.</h1>
    <p class="lede">
      The world will need energy measured in zettajoules, and a quarter of what industry uses is
      heat no water-cooled reactor can make. We modernise a reactor that already runs, build it in
      modules, own it, staff it and sell the energy on long contracts.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap grid grid-3">
    <div class="card">
      <h2>The size of it</h2>
      <p class="small">
        Global primary energy sits near six hundred exajoules a year. Industrial heat is roughly a
        quarter of it and is almost entirely fossil today, because the temperature has not been
        available from anything clean and firm.
      </p>
    </div>
    <div class="card">
      <h2>Why the model works</h2>
      <p class="small">
        Selling energy rather than reactors puts the licence, the fuel and the operators on our side
        of the fence. The customer signs an energy supply agreement, not a nuclear project, which is
        the difference between a decision that takes months and one that takes a decade.
      </p>
    </div>
    <div class="card">
      <h2>Repeat, do not reinvent</h2>
      <p class="small">
        Factory-built modules mean the tenth plant is not a first of a kind. Cost falls with
        repetition, and a site that grows adds a module instead of starting a new programme.
      </p>
    </div>
  </div>
</section>

<section class="section-tight section-warm">
  <div class="wrap">
    <h2>How we stack up</h2>
    <div class="scroller">
      <table class="data">
        <caption class="sr-only">Zettajoule compared with the alternatives</caption>
        <thead>
          <tr><th scope="col">Option</th><th scope="col">Temperature</th><th scope="col">Products</th><th scope="col">Build</th><th scope="col">Ownership</th></tr>
        </thead>
        <tbody>
          {#each COMPARISON as row (row[0])}
            <tr>
              <th scope="row">{row[0]}</th>
              <td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2>Roadmap, from the proven test reactor to first deployment</h2>
    <ol class="timeline">
      {#each ROADMAP as [year, title, body] (year + title)}
        <li>
          <span class="year">{year}</span>
          <div>
            <h3>{title}</h3>
            <p class="small muted">{body}</p>
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>

<section class="section-tight section-sky" id="access">
  <div class="wrap wrap-narrow">
    <h2>The private document room</h2>
    <p>
      Serious investors request access from here. A request is logged as pending and stays pending
      until it is approved outside this product; the room answers only while your own request is
      approved.
    </p>

    {#if banner}
      <div class="banner banner-{banner.tone === 'pending' ? 'pending' : banner.tone === 'failure' ? 'failure' : 'success'}" role="status" data-testid="access-banner">
        <strong>{banner.title}</strong>{banner.text}
      </div>
    {/if}

    {#if !ready}
      <div class="skeleton"><span class="spinner" aria-hidden="true"></span> Checking your request…</div>
    {:else if !signedIn}
      <div class="empty">
        <p><strong>No account signed in.</strong></p>
        <p>An access request belongs to an account, so it can be yours and no one else's.</p>
        <a class="btn" href="/signin?next=/investors">Sign in to request access</a>
      </div>
    {:else if request}
      <dl class="kv">
        <dt>Reference</dt><dd data-testid="access-reference">{request.reference}</dd>
        <dt>Organisation</dt><dd>{request.organisation}</dd>
        <dt>Role</dt><dd>{request.role_title}</dd>
        <dt>Status</dt><dd><span class="pill pill-{request.status}" data-testid="access-status">{request.status}</span></dd>
      </dl>
      {#if request.status === 'approved'}
        <a class="btn" href="/investors/room">Open the document room</a>
      {:else if request.status === 'pending'}
        <p class="small muted">
          Pending. Nothing more is needed from you; the room opens the moment this reads approved.
        </p>
      {:else}
        <p class="small muted">Declined. Write to us if your situation has changed.</p>
      {/if}
      <details class="again">
        <summary>Update this request</summary>
        <p class="small muted">
          Your account holds at most one request. Sending this updates the one above rather than
          adding a second.
        </p>
        <form on:submit={submit} novalidate>
          <div class="field">
            <label for="org2">Organisation</label>
            <input id="org2" type="text" bind:value={organisation} data-testid="organisation-update" />
          </div>
          <div class="field">
            <label for="role2">Your role title</label>
            <input id="role2" type="text" bind:value={role_title} data-testid="role_title-update" />
          </div>
          <button class="btn btn-secondary" type="submit" disabled={busy}>
            {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Update the request
          </button>
        </form>
      </details>
    {:else}
      <form on:submit={submit} novalidate>
        <div class="field">
          <label for="org">Organisation</label>
          <input
            id="org"
            type="text"
            bind:value={organisation}
            on:blur={() => (touched = { ...touched, organisation: true })}
            aria-invalid={touched.organisation && !organisation.trim()}
            data-testid="organisation"
          />
          {#if touched.organisation && !organisation.trim()}
            <p class="field-error">Name the organisation you are asking on behalf of.</p>
          {/if}
        </div>
        <div class="field">
          <label for="role">Your role title</label>
          <input
            id="role"
            type="text"
            bind:value={role_title}
            on:blur={() => (touched = { ...touched, role_title: true })}
            aria-invalid={touched.role_title && !role_title.trim()}
            data-testid="role_title"
          />
          {#if touched.role_title && !role_title.trim()}
            <p class="field-error">Tell us your role there.</p>
          {/if}
        </div>
        <button class="btn" type="submit" disabled={busy} data-testid="request-access">
          {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Request access
        </button>
      </form>
    {/if}
  </div>
</section>

<style>
  .timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 2px solid var(--rule-strong);
  }
  .timeline li {
    display: grid;
    grid-template-columns: 84px 1fr;
    gap: 16px;
    padding: 0 0 22px 22px;
    position: relative;
  }
  .timeline li::before {
    content: '';
    position: absolute;
    left: -7px;
    top: 6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent);
  }
  .year {
    font-family: var(--font-head);
    color: var(--accent);
  }
  .timeline h3 {
    font-size: 1rem;
    margin: 0 0 4px;
  }
  .kv {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 14px;
    margin: 0 0 16px;
  }
  .kv dt {
    color: var(--ink-muted);
  }
  .kv dd {
    margin: 0;
  }
  form {
    max-width: 440px;
  }
  .again {
    margin-top: 18px;
  }
  .again summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--accent);
  }
  .scroller {
    overflow-x: auto;
  }
  .scroller table {
    min-width: 640px;
  }
  @media (max-width: 560px) {
    .timeline li {
      grid-template-columns: minmax(0, 1fr);
      gap: 4px;
    }
  }
</style>
