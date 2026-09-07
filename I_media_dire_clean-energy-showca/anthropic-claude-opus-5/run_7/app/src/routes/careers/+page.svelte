<script>
  import { onMount } from 'svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Plate from '$lib/components/Plate.svelte';
  import { apiData, getAccount, getToken } from '$lib/api';

  export let data;
  $: jobs = data.jobs ?? [];

  let applying = null;
  let form = { name: '', email: '', note: '' };
  let busy = false;
  let modalBanner = null;
  let pageBanner = null;
  let touched = {};
  let account = null;

  onMount(() => {
    account = getAccount();
  });

  function openApply(job) {
    applying = job;
    modalBanner = null;
    touched = {};
    form = { name: account?.display_name ?? '', email: account?.email ?? '', note: '' };
  }

  $: nameError = touched.name && !form.name.trim() ? 'Tell us your name.' : '';
  $: emailError =
    touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? 'Enter an email address in the form name@example.com.'
      : '';
  $: noteError = touched.note && !form.note.trim() ? 'The note is the whole application. Write it.' : '';

  async function submit(e) {
    e.preventDefault();
    touched = { name: true, email: true, note: true };
    if (!form.name.trim() || emailError || !form.email.trim() || !form.note.trim()) {
      modalBanner = { tone: 'failure', title: 'Not sent', text: 'Fill in every field before applying.' };
      return;
    }
    if (!getToken()) {
      modalBanner = {
        tone: 'failure',
        title: 'Sign in first',
        text: 'An application belongs to an account, so it stays yours alone.'
      };
      return;
    }
    busy = true;
    modalBanner = null;
    try {
      const res = await apiData('/applications', {
        method: 'POST',
        body: {
          job_slug: applying.slug,
          name: form.name.trim(),
          email: form.email.trim(),
          note: form.note.trim()
        }
      });
      const title = applying.title;
      applying = null;
      pageBanner = {
        tone: 'success',
        title: 'Application received',
        text: `Your application for ${title} is stored as ${res.status} and an acknowledgement has been sent to ${res.email}. Applying again updates it rather than adding a second.`
      };
    } catch (err) {
      modalBanner = {
        tone: 'failure',
        title: 'Not sent',
        text:
          err.status === 401
            ? 'Sign in first: an application belongs to an account.'
            : `${err.message} Nothing was recorded.`
      };
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Careers, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Careers</p>
    <h1>help us build what's next in nuclear energy</h1>
    <p class="lede">
      We try to do right by our partners, the planet and the people who work here, in that order
      only when the three agree and in plain conversation when they do not.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap culture">
    <div>
      <h2>How it is here</h2>
      <p>
        We are a small company doing something that has to be exactly right, so we work slowly on
        the parts that carry a safety case and quickly on everything else. Engineers speak to
        customers. Nobody is protected from the consequences of their own drawing. Claims trace to
        measurements, and when the data does not support the schedule we change the schedule.
      </p>
      <p>
        We are in Rotterdam, Chicago and Tokyo, and we hire people who have run real plants as
        readily as people who have designed them.
      </p>
    </div>
    <Plate seed="careers-culture" height="220px" label="Generated plate for the workplace" />
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2>Open roles</h2>
    {#if pageBanner}
      <div class="banner banner-{pageBanner.tone}" role="status" data-testid="apply-banner">
        <strong>{pageBanner.title}</strong>{pageBanner.text}
        <a href="/account">See it in your account</a>
      </div>
    {/if}
    {#if jobs.length === 0}
      <div class="empty">
        <p><strong>No roles are open right now.</strong></p>
        <p>Nothing is advertised at the moment. Write to us and we will keep your note on file.</p>
        <a class="btn btn-secondary" href="/contact?topic=Careers">Send an enquiry</a>
      </div>
    {:else}
      <ul class="jobs" data-testid="job-list">
        {#each jobs as job (job.slug)}
          <li class="job">
            <div>
              <h3>{job.title}</h3>
              <p class="small muted">{job.location}, {job.team}</p>
              <p class="small">{job.description}</p>
            </div>
            <button class="btn" type="button" on:click={() => openApply(job)} data-testid={`apply-${job.slug}`}>
              Apply<span class="sr-only"> for {job.title}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<section class="section-tight section-sky">
  <div class="wrap wrap-narrow">
    <h2>The Operations Academy</h2>
    <p>
      Because we own and run the reactors we sell energy from, we have to be able to produce
      operators at the rate we produce modules. The Operations Academy is that answer: eighteen
      months of classroom work, simulator time and secondments to operating plants, taking process
      operators, marine engineers and graduates through to licensed operation. It is why a customer
      never has to hire a nuclear operator.
    </p>
  </div>
</section>

<Modal
  open={!!applying}
  title={applying ? `Apply: ${applying.title}` : ''}
  labelledBy="apply-title"
  onClose={() => (applying = null)}
>
  {#if applying}
    <p class="small muted">
      {applying.location}, {applying.team}. The note is the whole application; there is no file to
      attach.
    </p>
    {#if modalBanner}
      <div class="banner banner-{modalBanner.tone}" role="alert" data-testid="apply-modal-banner">
        <strong>{modalBanner.title}</strong>{modalBanner.text}
        {#if !account}<a href={`/signin?next=/careers`}>Sign in</a>{/if}
      </div>
    {/if}
    <form on:submit={submit} novalidate>
      <div class="field">
        <label for="a-name">Your name</label>
        <input id="a-name" type="text" bind:value={form.name} on:blur={() => (touched = { ...touched, name: true })} data-autofocus data-testid="apply-name" />
        {#if nameError}<p class="field-error">{nameError}</p>{/if}
      </div>
      <div class="field">
        <label for="a-email">Email</label>
        <input id="a-email" type="email" bind:value={form.email} on:blur={() => (touched = { ...touched, email: true })} data-testid="apply-email" />
        {#if emailError}<p class="field-error">{emailError}</p>{/if}
      </div>
      <div class="field">
        <label for="a-note">Your note</label>
        <textarea id="a-note" bind:value={form.note} on:blur={() => (touched = { ...touched, note: true })} data-testid="apply-note"></textarea>
        {#if noteError}<p class="field-error">{noteError}</p>{/if}
      </div>
      <button class="btn" type="submit" disabled={busy} data-testid="apply-submit">
        {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Send application
      </button>
    </form>
  {/if}
</Modal>

<style>
  .culture {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 30px;
    align-items: center;
  }
  .jobs {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 14px;
  }
  .job {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: space-between;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px;
  }
  .job h3 {
    margin: 0 0 4px;
    font-size: 1.1rem;
  }
  .job p {
    margin: 0 0 6px;
  }
  @media (max-width: 760px) {
    .culture {
      grid-template-columns: minmax(0, 1fr);
    }
    .job {
      flex-direction: column;
    }
  }
</style>
