<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { api, ApiError } from '$lib/api.js';
	import { setSession, clearSaveToken, currentSaveToken, loadAccount } from '$lib/session.js';

	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let error = $state('');
	let touched = $state({ email: false, password: false });

	const next = $derived($page.url.searchParams.get('next') || '/account');

	const emailError = $derived(
		touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
			? 'Enter an email address in the form name@example.com.'
			: ''
	);
	const passwordError = $derived(
		touched.password && password.length === 0 ? 'Enter your password.' : ''
	);

	async function submit(event) {
		event.preventDefault();
		touched = { email: true, password: true };
		if (emailError || passwordError || !email.trim() || !password) return;
		busy = true;
		error = '';
		try {
			const st = currentSaveToken();
			const { data } = await api('/api/auth/login', {
				method: 'POST',
				body: { email: email.trim(), password, ...(st ? { save_token: st } : {}) }
			});
			setSession(data.access_token, data.account);
			clearSaveToken();
			await loadAccount();
			await goto(next.startsWith('/') ? next : '/account');
		} catch (err) {
			error =
				err instanceof ApiError && err.status === 401
					? 'Those details do not match an account. Check the email and password and try again.'
					: err.message || 'We could not sign you in. Try again in a moment.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Sign in, Zettajoule</title></svelte:head>

<section class="section">
	<div class="auth">
		<p class="eyebrow">Account</p>
		<h1>Sign in</h1>
		<p class="lede">
			Your saved solutions, searches, enquiries, access request and applications live on your
			account. Anything you saved before signing in comes with you.
		</p>

		{#if error}
			<p class="banner banner-error" role="alert" data-testid="signin-error">
				<strong>We could not sign you in.</strong>
				{error}
			</p>
		{/if}

		<form onsubmit={submit} novalidate>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					autocomplete="email"
					bind:value={email}
					onblur={() => (touched.email = true)}
					aria-invalid={emailError ? 'true' : 'false'}
					aria-describedby={emailError ? 'email-error' : undefined}
					data-testid="email"
				/>
				{#if emailError}<p class="field-error" id="email-error">{emailError}</p>{/if}
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					onblur={() => (touched.password = true)}
					aria-invalid={passwordError ? 'true' : 'false'}
					aria-describedby={passwordError ? 'password-error' : undefined}
					data-testid="password"
				/>
				{#if passwordError}<p class="field-error" id="password-error">{passwordError}</p>{/if}
			</div>
			<button class="btn btn-primary" type="submit" disabled={busy} data-testid="signin-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Signing in' : 'Sign in'}
			</button>
		</form>

		<p class="alt">
			No account yet? <a href={`/signup?next=${encodeURIComponent(next)}`}>Create one</a>. It takes
			an email, a password and a name.
		</p>
	</div>
</section>

<style>
	.auth {
		width: 100%;
		max-width: 460px;
		margin: 0 auto;
		padding: 0 24px;
	}
	.alt {
		margin-top: 22px;
		padding-top: 16px;
		border-top: 1px solid var(--rule);
		color: var(--ink-muted);
		font-size: 0.93rem;
	}
</style>
