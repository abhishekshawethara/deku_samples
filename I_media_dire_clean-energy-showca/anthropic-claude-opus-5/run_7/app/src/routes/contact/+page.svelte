<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiData, getAccount, getToken } from '$lib/api';

  const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
  const COUNTRIES = [
    ['+31', 'Netherlands +31'],
    ['+1', 'United States +1'],
    ['+81', 'Japan +81'],
    ['+44', 'United Kingdom +44'],
    ['+49', 'Germany +49'],
    ['+33', 'France +33'],
    ['+971', 'United Arab Emirates +971'],
    ['+61', 'Australia +61']
  ];

  let form = {
    name: '',
    email: '',
    phone_country: '+31',
    phone: '',
    topic: 'Technology',
    message: ''
  };
  let touched = {};
  let busy = false;
  let banner = null;
  let sent = null;
  let offices = [];

  onMount(async () => {
    const acct = getAccount();
    if (acct) {
      form.name = acct.display_name;
      form.email = acct.email;
    }
    const t = $page.url.searchParams.get('topic');
    if (t && TOPICS.includes(t)) form.topic = t;
    const subject = $page.url.searchParams.get('subject');
    if (subject) form.message = `About ${subject}: `;
    try {
      offices = await apiData('/offices', { auth: false });
    } catch {
      offices = [];
    }
  });

  $: nameError = touched.name && !form.name.trim() ? 'Tell us who you are.' : '';
  $: emailError =
    touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? 'Enter an email address in the form name@example.com. The acknowledgement goes there.'
      : '';
  $: messageError = touched.message && !form.message.trim() ? 'Write us a message.' : '';
  $: valid =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.message.trim() &&
    TOPICS.includes(form.topic);

  async function submit(e) {
    e.preventDefault();
    touched = { name: true, email: true, message: true };
    if (!valid) {
      banner = {
        tone: 'failure',
        title: 'Not sent',
        text: 'Three fields need attention before this can go: your name, your email and the message.'
      };
      return;
    }
    busy = true;
    banner = null;
    try {
      const data = await apiData('/enquiries', {
        method: 'POST',
        auth: !!getToken(),
        body: { ...form, name: form.name.trim(), email: form.email.trim(), message: form.message.trim() }
      });
      sent = data;
      form = { ...form, message: '', phone: '' };
      touched = {};
    } catch (err) {
      banner = { tone: 'failure', title: 'Not sent', text: `${err.message} Nothing was recorded.` };
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Contact, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Contact</p>
    <h1>Get in Touch</h1>
    <p class="lede">
      This form is for careers, investor and supplier enquiries as well as technical questions. You
      get a reference back on the page and an acknowledgement carrying it in your inbox.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap contact">
    <div>
      {#if sent}
        <div class="banner banner-success" role="status" data-testid="enquiry-sent">
          <strong>Enquiry received</strong>
          Your reference is <b data-testid="enquiry-reference">{sent.reference}</b>. It is stored as
          <b>{sent.status}</b> and an acknowledgement carrying that reference has been sent to
          {form.email || 'your address'}. Quote the reference if you write again.
        </div>
        <p><a href="/account">See it in your account</a>, or send another below.</p>
      {/if}
      {#if banner}
        <div class="banner banner-{banner.tone}" role="alert" data-testid="enquiry-banner">
          <strong>{banner.title}</strong>{banner.text}
        </div>
      {/if}

      <form on:submit={submit} novalidate>
        <div class="field">
          <label for="c-name">Your name</label>
          <input
            id="c-name"
            type="text"
            autocomplete="name"
            bind:value={form.name}
            on:blur={() => (touched = { ...touched, name: true })}
            aria-invalid={!!nameError}
            data-testid="name"
          />
          {#if nameError}<p class="field-error">{nameError}</p>{/if}
        </div>
        <div class="field">
          <label for="c-email">Email</label>
          <input
            id="c-email"
            type="email"
            autocomplete="email"
            bind:value={form.email}
            on:blur={() => (touched = { ...touched, email: true })}
            aria-invalid={!!emailError}
            data-testid="email"
          />
          {#if emailError}<p class="field-error">{emailError}</p>{/if}
        </div>
        <div class="phone">
          <div class="field">
            <label for="c-country">Country code</label>
            <select id="c-country" bind:value={form.phone_country} data-testid="phone_country">
              {#each COUNTRIES as [code, label] (code)}<option value={code}>{label}</option>{/each}
            </select>
          </div>
          <div class="field">
            <label for="c-phone">Phone, optional</label>
            <input id="c-phone" type="tel" autocomplete="tel" bind:value={form.phone} data-testid="phone" />
          </div>
        </div>
        <div class="field">
          <label for="c-topic">Topic</label>
          <select id="c-topic" bind:value={form.topic} data-testid="topic">
            {#each TOPICS as t (t)}<option value={t}>{t}</option>{/each}
          </select>
        </div>
        <div class="field">
          <label for="c-message">Message</label>
          <textarea
            id="c-message"
            bind:value={form.message}
            on:blur={() => (touched = { ...touched, message: true })}
            aria-invalid={!!messageError}
            data-testid="message"
          ></textarea>
          {#if messageError}<p class="field-error">{messageError}</p>{/if}
        </div>
        <button class="btn" type="submit" disabled={busy} data-testid="send">
          {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Send enquiry
        </button>
      </form>
    </div>

    <aside>
      <h2>Offices</h2>
      {#if offices.length === 0}
        <p class="muted small">Office list unavailable right now. The form still works.</p>
      {:else}
        <ul class="offices">
          {#each offices as o (o.city)}
            <li>
              <strong>{o.city}</strong>
              <span class="small muted">{o.country}, {o.role_label}</span>
            </li>
          {/each}
        </ul>
      {/if}
      <h2>What happens next</h2>
      <p class="small muted">
        Every enquiry gets a reference of the form ENQ- and eight characters, is stored as received,
        and is answered by a person at the address you gave us. You can close your own enquiry from
        your account at any time.
      </p>
    </aside>
  </div>
</section>

<style>
  .contact {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 34px;
    align-items: start;
  }
  form {
    max-width: 520px;
  }
  .phone {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 12px;
  }
  .offices {
    list-style: none;
    padding: 0;
    margin: 0 0 22px;
  }
  .offices li {
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    border-bottom: 1px solid var(--rule);
  }
  @media (max-width: 820px) {
    .contact {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 480px) {
    .phone {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
