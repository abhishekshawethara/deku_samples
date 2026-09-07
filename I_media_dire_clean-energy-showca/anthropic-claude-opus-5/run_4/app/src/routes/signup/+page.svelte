<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signUp } from '$lib/session.js';
	import { ApiError, getSaveToken } from '$lib/api.js';
	import { onMount } from 'svelte';

	let displayName = '';
	let email = '';
	let password = '';
	let busy = false;
	let banner = null;
	let touched = {};
	let pendingSaves = false;

	$: next = $page.url.searchParams.get('next') || '/account';

	$: errors = {
		displayName: !displayName.trim() ? 'Enter the name you want to be known by.' : '',
		email: !email.trim()
			? 'Enter your email address.'
			: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
				? 'That does not look like an email address.'
				: '',
		password: !password
			? 'Choose a password.'
			: password.length < 8
				? 'Use at least 8 characters.'
				: ''
	};
	$: valid = !errors.displayName && !errors.email && !errors.password;

	onMount(() => {
		pendingSaves = !!getSaveToken();
	});

	async function submit() {
		touched = { displayName: true, email: true, password: true };
		banner = null;
		if (!valid) {
			banner = { kind: 'fail', title: 'Check the form', text: 'Some fields still need attention.' };
			return;
		}
		busy = true;
		try {
			await signUp(email.trim(), password, displayName.trim());
			await goto(next, { replaceState: true });
		} catch (err) {
			banner = {
				kind: 'fail',
				title: 'Could not create the account',
				text:
					err instanceof ApiError
						? `${err.message}`
						: 'The server could not be reached. Try again in a moment.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create an account, Zettajoule</title></svelte:head>

<section class="section wrap">
	<div class="auth card">
		<p class="eyebrow">Account</p>
		<h1>Create an account</h1>
		<p class="lede">
			An account keeps your saved solutions and searches, follows your enquiries and carries your investor
			access request.
		</p>

		{#if pendingSaves}
			<div class="banner banner--info" data-testid="pending-saves">
				<span class="banner__title">Saves waiting</span>
				The solutions you saved before signing up move onto this account as it is created.
			</div>
		{/if}

		{#if banner}
			<div class="banner banner--fail" role="alert" data-testid="signup-banner">
				<span class="banner__title">{banner.title}</span>{banner.text}
			</div>
		{/if}

		<form on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="name">Display name</label>
				<input
					id="name"
					type="text"
					bind:value={displayName}
					on:blur={() => (touched.displayName = true)}
					aria-invalid={touched.displayName && errors.displayName ? 'true' : 'false'}
					autocomplete="name"
					data-testid="signup-name"
				/>
				{#if touched.displayName && errors.displayName}<p class="field__error">{errors.displayName}</p>{/if}
			</div>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					on:blur={() => (touched.email = true)}
					aria-invalid={touched.email && errors.email ? 'true' : 'false'}
					autocomplete="email"
					data-testid="signup-email"
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
					autocomplete="new-password"
					aria-describedby="pw-hint"
					data-testid="signup-password"
				/>
				<p class="field__hint" id="pw-hint">At least 8 characters.</p>
				{#if touched.password && errors.password}<p class="field__error">{errors.password}</p>{/if}
			</div>
			<button class="btn" type="submit" disabled={busy} data-testid="signup-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Creating' : 'Create account'}
			</button>
		</form>

		<p class="alt">
			Already have one? <a href="/signin{next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}">Sign in</a>.
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
