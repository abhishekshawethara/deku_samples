<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { apiData, setSession, getSaveToken, clearSaveToken } from '$lib/api';

  let email = '';
  let password = '';
  let busy = false;
  let banner = null;
  let touched = { email: false, password: false };

  $: next = $page.url.searchParams.get('next') || '/account';
  $: emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? 'Enter an email address in the form name@example.com.'
    : '';
  $: passwordError = touched.password && !password ? 'Enter your password.' : '';

  async function submit(e) {
    e.preventDefault();
    touched = { email: true, password: true };
    if (emailError || passwordError || !email.trim() || !password) return;
    busy = true;
    banner = null;
    try {
      const saveToken = getSaveToken();
      const data = await apiData('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email: email.trim(), password, save_token: saveToken || undefined }
      });
      setSession(data.access_token, {
        id: data.id,
        email: data.email,
        display_name: data.display_name
      });
      if (saveToken) clearSaveToken();
      goto(next.startsWith('/') ? next : '/account');
    } catch (err) {
      banner = {
        tone: 'failure',
        title: 'Not signed in',
        text: `${err.message} Check the address and try again, or create an account.`
      };
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Sign in, Zettajoule</title></svelte:head>

<section class="section">
  <div class="wrap auth">
    <div>
      <p class="eyebrow">Account</p>
      <h1>Sign in</h1>
      <p class="lede">
        Your saved solutions, searches, enquiries, access request and applications live in your
        account and nowhere else.
      </p>

      {#if banner}
        <div class="banner banner-{banner.tone}" role="alert" data-testid="signin-banner">
          <strong>{banner.title}</strong>{banner.text}
        </div>
      {/if}

      <form on:submit={submit} novalidate>
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="email"
            bind:value={email}
            on:blur={() => (touched.email = true)}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-err' : undefined}
            data-testid="email"
          />
          {#if emailError}<p class="field-error" id="email-err">{emailError}</p>{/if}
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            bind:value={password}
            on:blur={() => (touched.password = true)}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? 'pw-err' : undefined}
            data-testid="password"
          />
          {#if passwordError}<p class="field-error" id="pw-err">{passwordError}</p>{/if}
        </div>
        <button class="btn" type="submit" disabled={busy} data-testid="submit">
          {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Sign in
        </button>
      </form>

      <p class="small muted">
        No account yet? <a href={`/signup?next=${encodeURIComponent(next)}`}>Create one</a>. Saves
        made before you sign in follow you in.
      </p>
    </div>

    <aside class="card">
      <h2>Demo accounts</h2>
      <p class="small muted">Fixture data for this build, not a secret.</p>
      <ul class="creds">
        <li><code>visitor@example.com</code> Ada Moreau</li>
        <li><code>visitor2@example.com</code> Ken Adeyemi</li>
        <li>Password <code>deku-demo-pw-2026</code></li>
      </ul>
    </aside>
  </div>
</section>

<style>
  .auth {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 32px;
    align-items: start;
    max-width: 940px;
  }
  form {
    max-width: 420px;
    margin-bottom: 18px;
  }
  .creds {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
  }
  .creds li {
    padding: 6px 0;
    border-bottom: 1px solid var(--rule);
  }
  @media (max-width: 780px) {
    .auth {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
