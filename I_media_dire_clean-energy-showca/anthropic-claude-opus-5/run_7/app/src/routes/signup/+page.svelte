<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { apiData, setSession, getSaveToken, clearSaveToken } from '$lib/api';

  let display_name = '';
  let email = '';
  let password = '';
  let busy = false;
  let banner = null;
  let touched = { display_name: false, email: false, password: false };

  $: next = $page.url.searchParams.get('next') || '/account';
  $: nameError = touched.display_name && !display_name.trim() ? 'Tell us what to call you.' : '';
  $: emailError =
    touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? 'Enter an email address in the form name@example.com.'
      : '';
  $: passwordError =
    touched.password && password.length < 8 ? 'Use at least 8 characters.' : '';

  async function submit(e) {
    e.preventDefault();
    touched = { display_name: true, email: true, password: true };
    if (!display_name.trim() || nameError || emailError || passwordError || password.length < 8)
      return;
    busy = true;
    banner = null;
    try {
      const saveToken = getSaveToken();
      const data = await apiData('/auth/signup', {
        method: 'POST',
        auth: false,
        body: {
          display_name: display_name.trim(),
          email: email.trim(),
          password,
          save_token: saveToken || undefined
        }
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
        title: 'Account not created',
        text:
          err.status === 409
            ? `${err.message} Sign in instead.`
            : `${err.message} Correct the field and try again.`
      };
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Create an account, Zettajoule</title></svelte:head>

<section class="section">
  <div class="wrap wrap-narrow">
    <p class="eyebrow">Account</p>
    <h1>Create an account</h1>
    <p class="lede">
      Anything you have already saved comes with you. Signup is open and creates a visitor account.
    </p>

    {#if banner}
      <div class="banner banner-failure" role="alert" data-testid="signup-banner">
        <strong>{banner.title}</strong>{banner.text}
      </div>
    {/if}

    <form on:submit={submit} novalidate>
      <div class="field">
        <label for="name">Your name</label>
        <input
          id="name"
          type="text"
          autocomplete="name"
          bind:value={display_name}
          on:blur={() => (touched.display_name = true)}
          aria-invalid={!!nameError}
          data-testid="display_name"
        />
        {#if nameError}<p class="field-error">{nameError}</p>{/if}
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          autocomplete="email"
          bind:value={email}
          on:blur={() => (touched.email = true)}
          aria-invalid={!!emailError}
          data-testid="email"
        />
        {#if emailError}<p class="field-error">{emailError}</p>{/if}
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          autocomplete="new-password"
          bind:value={password}
          on:blur={() => (touched.password = true)}
          aria-invalid={!!passwordError}
          aria-describedby="pw-hint"
          data-testid="password"
        />
        <p class="small muted" id="pw-hint">At least 8 characters.</p>
        {#if passwordError}<p class="field-error">{passwordError}</p>{/if}
      </div>
      <button class="btn" type="submit" disabled={busy} data-testid="submit">
        {#if busy}<span class="spinner" aria-hidden="true"></span>{/if} Create account
      </button>
    </form>

    <p class="small muted">
      Already have one? <a href={`/signin?next=${encodeURIComponent(next)}`}>Sign in</a>.
    </p>
  </div>
</section>

<style>
  form {
    max-width: 420px;
    margin-bottom: 18px;
  }
</style>
