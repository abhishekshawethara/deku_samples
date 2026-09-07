<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';
	import { setSession, currentSaveToken } from '$lib/session.js';

	let email = '';
	let password = '';
	let busy = false;
	let banner = null;
	let touched = {};

	$: next = $page.url.searchParams.get('next') || '/account';
	$: emailError = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter the email on the account.';
	$: passwordError = password ? '' : 'Enter your password.';

	async function submit() {
		touched = { email: true, password: true };
		banner = null;
		if (emailError || passwordError) return;
		busy = true;
		try {
			const res = await api('/api/auth/login', {
				method: 'POST',
				body: { email: email.trim(), password, save_token: currentSaveToken() || undefined }
			});
			setSession(res.access_token, res.account);
			await goto(next.startsWith('/') ? next : '/account');
		} catch (err) {
			banner = {
				kind: 'error',
				title: 'Not signed in.',
				text: err.message || 'That email and password did not match. Check them and try again.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Sign in, Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap auth">
		<p class="eyebrow">Account</p>
		<h1>Sign in</h1>
		<p class="lede">Anything you saved while signed out follows you in.</p>

		{#if banner}
			<div class="banner banner-error" role="alert" data-testid="signin-banner">
				<strong>{banner.title}</strong> {banner.text}
			</div>
		{/if}

		<form class="card" on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="si-email">Email</label>
				<input
					id="si-email"
					type="email"
					bind:value={email}
					on:blur={() => (touched = { ...touched, email: true })}
					autocomplete="email"
					data-testid="signin-email"
				/>
				{#if touched.email && emailError}<p class="field-error">{emailError}</p>{/if}
			</div>
			<div class="field">
				<label for="si-password">Password</label>
				<input
					id="si-password"
					type="password"
					bind:value={password}
					on:blur={() => (touched = { ...touched, password: true })}
					autocomplete="current-password"
					data-testid="signin-password"
				/>
				{#if touched.password && passwordError}<p class="field-error">{passwordError}</p>{/if}
			</div>
			<button class="btn" type="submit" disabled={busy} data-testid="signin-submit">
				{busy ? 'Signing in' : 'Sign in'}
			</button>
		</form>

		<p class="alt">
			No account yet? <a href={`/signup?next=${encodeURIComponent(next)}`}>Create one</a>. It takes a moment and
			it is free.
		</p>
	</div>
</section>

<style>
	.auth {
		max-width: 460px;
	}
	.alt {
		margin-top: 18px;
		color: var(--ink-muted);
	}
</style>
