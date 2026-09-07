<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';
	import { setSession, currentSaveToken } from '$lib/session.js';

	let display_name = '';
	let email = '';
	let password = '';
	let busy = false;
	let banner = null;
	let touched = {};

	$: next = $page.url.searchParams.get('next') || '/account';
	$: errors = {
		display_name: display_name.trim() ? '' : 'Tell us what to call you.',
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter a valid email address.',
		password: password.length >= 8 ? '' : 'Use at least eight characters.'
	};

	async function submit() {
		touched = { display_name: true, email: true, password: true };
		banner = null;
		if (Object.values(errors).some(Boolean)) return;
		busy = true;
		try {
			const res = await api('/api/auth/signup', {
				method: 'POST',
				body: {
					email: email.trim(),
					password,
					display_name: display_name.trim(),
					save_token: currentSaveToken() || undefined
				}
			});
			setSession(res.access_token, { id: res.id, email: res.email, display_name: res.display_name });
			await goto(next.startsWith('/') ? next : '/account');
		} catch (err) {
			banner = {
				kind: 'error',
				title: 'Account not created.',
				text: err.message || 'That account could not be created. Try again.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create an account, Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap auth">
		<p class="eyebrow">Account</p>
		<h1>Create an account</h1>
		<p class="lede">Everything you saved while signed out moves onto the new account.</p>

		{#if banner}
			<div class="banner banner-error" role="alert" data-testid="signup-banner">
				<strong>{banner.title}</strong> {banner.text}
			</div>
		{/if}

		<form class="card" on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="su-name">Your name</label>
				<input id="su-name" type="text" bind:value={display_name} on:blur={() => (touched = { ...touched, display_name: true })} autocomplete="name" data-testid="signup-name" />
				{#if touched.display_name && errors.display_name}<p class="field-error">{errors.display_name}</p>{/if}
			</div>
			<div class="field">
				<label for="su-email">Email</label>
				<input id="su-email" type="email" bind:value={email} on:blur={() => (touched = { ...touched, email: true })} autocomplete="email" data-testid="signup-email" />
				{#if touched.email && errors.email}<p class="field-error">{errors.email}</p>{/if}
			</div>
			<div class="field">
				<label for="su-password">Password</label>
				<input id="su-password" type="password" bind:value={password} on:blur={() => (touched = { ...touched, password: true })} autocomplete="new-password" data-testid="signup-password" />
				<p class="field-hint">At least eight characters.</p>
				{#if touched.password && errors.password}<p class="field-error">{errors.password}</p>{/if}
			</div>
			<button class="btn" type="submit" disabled={busy} data-testid="signup-submit">
				{busy ? 'Creating' : 'Create the account'}
			</button>
		</form>

		<p class="alt">Already have one? <a href={`/signin?next=${encodeURIComponent(next)}`}>Sign in</a>.</p>
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
