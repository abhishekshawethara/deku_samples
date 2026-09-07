<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn } from '$lib/session.js';
	import { ApiError, getSaveToken } from '$lib/api.js';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let busy = false;
	let banner = null;
	let touched = {};
	let pendingSaves = false;

	$: next = $page.url.searchParams.get('next') || '/account';

	$: errors = {
		email: !email.trim()
			? 'Enter your email address.'
			: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
				? 'That does not look like an email address.'
				: '',
		password: !password ? 'Enter your password.' : ''
	};
	$: valid = !errors.email && !errors.password;

	onMount(() => {
		pendingSaves = !!getSaveToken();
	});

	async function submit() {
		touched = { email: true, password: true };
		banner = null;
		if (!valid) {
			banner = { kind: 'fail', title: 'Check the form', text: 'Enter both your email and your password.' };
			return;
		}
		busy = true;
		try {
			await signIn(email.trim(), password);
			await goto(next, { replaceState: true });
		} catch (err) {
			banner = {
				kind: 'fail',
				title: 'Could not sign in',
				text:
					err instanceof ApiError
						? `${err.message} Check the address and try again, or create an account.`
						: 'The server could not be reached. Try again in a moment.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Sign in, Zettajoule</title></svelte:head>

<section class="section wrap">
	<div class="auth card">
		<p class="eyebrow">Account</p>
		<h1>Sign in</h1>
		<p class="lede">Your saved solutions, searches, enquiries and access request live behind this door.</p>

		{#if pendingSaves}
			<div class="banner banner--info">
				<span class="banner__title">Saves waiting</span>
				You saved solutions before signing in. They move onto your account the moment you do.
			</div>
		{/if}

		{#if banner}
			<div class="banner banner--fail" role="alert" data-testid="signin-banner">
				<span class="banner__title">{banner.title}</span>{banner.text}
			</div>
		{/if}

		<form on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					on:blur={() => (touched.email = true)}
					aria-invalid={touched.email && errors.email ? 'true' : 'false'}
					autocomplete="email"
					data-testid="signin-email"
				/>
				{#if touched.email && errors.email}<p class="field__error">{errors.email}</p>{/if}
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					on:blur={() => (touched.password = true)}
					aria-invalid={touched.password && errors.password ? 'true' : 'false'}
					autocomplete="current-password"
					data-testid="signin-password"
				/>
				{#if touched.password && errors.password}<p class="field__error">{errors.password}</p>{/if}
			</div>
			<button class="btn" type="submit" disabled={busy} data-testid="signin-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Signing in' : 'Sign in'}
			</button>
		</form>

		<p class="alt">
			No account yet? <a href="/signup{next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}">Create one</a>.
		</p>
	</div>
</section>

<style>
	.auth {
		max-width: 460px;
		margin: 0 auto;
		padding: 1.75rem;
	}
	.alt {
		margin: 1.25rem 0 0;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
		font-size: 0.9rem;
	}
</style>
