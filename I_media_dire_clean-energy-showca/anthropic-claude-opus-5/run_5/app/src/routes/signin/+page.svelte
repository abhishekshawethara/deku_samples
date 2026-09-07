
<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { apiData, setSession, getSaveToken, clearSaveToken } from '$lib/api';

	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let failure = $state('');
	let touched = $state({});

	let next = $derived(page.url.searchParams.get('next') || '');

	let errors = $derived({
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter the email on your account.',
		password: password.length ? '' : 'Enter your password.'
	});
	let valid = $derived(!errors.email && !errors.password);

	async function submit(e) {
		e.preventDefault();
		touched = { email: true, password: true };
		failure = '';
		if (!valid) return;
		busy = true;
		try {
			const saveToken = getSaveToken();
			const res = await apiData('/auth/login', {
				method: 'POST',
				auth: false,
				body: {
					email: email.trim(),
					password,
					...(saveToken ? { save_token: saveToken } : {})
				}
			});
			setSession(res.access_token, res.account);
			// signing in claims those saves and empties the anonymous basket
			if (saveToken) clearSaveToken();
			await goto(next || '/account');
		} catch (err) {
			failure = err.message || 'That sign in was refused.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Sign in, Zettajoule</title></svelte:head>

<div class="wrap-narrow auth">
	<p class="eyebrow">Account</p>
	<h1>Sign in</h1>
	<p class="lede">
		Your saves, searches, enquiries, access request and applications belong to your account alone.
	</p>

	{#if next}
		<div class="banner banner-info" role="status">
			Sign in to continue to <span class="mono">{next}</span>.
		</div>
	{/if}

	<form class="card" onsubmit={submit} novalidate>
		{#if failure}
			<div class="banner banner-fail" role="alert" data-testid="signin-error">
				<strong>That sign in was refused.</strong>
				{failure} Check the address and password, then try again.
			</div>
		{/if}

		<div class="field">
			<label for="s-email">Email</label>
			<input
				id="s-email"
				type="email"
				bind:value={email}
				onblur={() => (touched.email = true)}
				aria-invalid={touched.email && errors.email ? 'true' : undefined}
				autocomplete="email"
			/>
			{#if touched.email && errors.email}<p class="field-error">{errors.email}</p>{/if}
		</div>

		<div class="field">
			<label for="s-password">Password</label>
			<input
				id="s-password"
				type="password"
				bind:value={password}
				onblur={() => (touched.password = true)}
				aria-invalid={touched.password && errors.password ? 'true' : undefined}
				autocomplete="current-password"
			/>
			{#if touched.password && errors.password}<p class="field-error">{errors.password}</p>{/if}
		</div>

		<button class="btn" type="submit" disabled={busy} data-testid="signin-submit">
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
			{busy ? 'Signing in' : 'Sign in'}
		</button>
	</form>

	<p class="alt">
		No account yet?
		<a href="/signup{next ? `?next=${encodeURIComponent(next)}` : ''}">Create one</a>. Anything you
		saved before signing in follows you in.
	</p>
</div>

<style>
	.auth {
		padding: 46px 20px 70px;
	}
	.alt {
		margin-top: 18px;
		color: var(--ink-muted);
	}
</style>
