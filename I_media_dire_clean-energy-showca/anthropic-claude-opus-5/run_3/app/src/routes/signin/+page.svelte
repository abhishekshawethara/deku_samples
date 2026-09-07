<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { login } from '$lib/api.js';
	import { ApiError } from '$lib/api.js';
	import { refreshSaves } from '$lib/saves.js';
	import { saveTokenStore } from '$lib/auth.js';

	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let failure = $state('');

	const next = $derived($page.url.searchParams.get('next') || '/account');
	const hadSaves = $derived(Boolean($saveTokenStore));

	async function submit(event) {
		event.preventDefault();
		failure = '';
		if (!email.trim() || !password) {
			failure = 'Enter your email and password.';
			return;
		}
		busy = true;
		try {
			await login(email.trim(), password);
			await refreshSaves();
			await goto(next);
		} catch (e) {
			failure =
				e instanceof ApiError && e.status === 401
					? 'Email or password is incorrect. Try again, or create an account.'
					: 'We could not sign you in just now. Try again in a moment.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Sign in · Zettajoule</title></svelte:head>

<section class="wrap auth">
	<div class="card card--pad">
		<p class="eyebrow">Account</p>
		<h1>Sign in</h1>
		{#if hadSaves}
			<div class="banner banner--info">
				<strong>Your saves are waiting</strong>
				<span>Sign in and the solutions you saved before signing in move onto your account.</span>
			</div>
		{/if}

		{#if failure}
			<div class="banner banner--fail" role="alert">
				<strong>Not signed in</strong>
				<span>{failure}</span>
			</div>
		{/if}

		<form onsubmit={submit} novalidate>
			<div class="field">
				<label for="email">Email</label>
				<input id="email" type="email" autocomplete="email" bind:value={email} required />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					required
				/>
			</div>
			<button class="btn btn--block" type="submit" disabled={busy}>
				{#if busy}<span class="spinner" aria-hidden="true"></span> Signing in{:else}Sign in{/if}
			</button>
		</form>

		<p class="muted alt">
			No account yet?
			<a href={`/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}
				>Create one</a
			>. It takes an email and a password.
		</p>
	</div>
</section>

<style>
	.auth {
		max-width: 480px;
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 4rem;
	}
	.alt {
		margin: 1rem 0 0;
		font-size: 0.9rem;
	}
</style>
