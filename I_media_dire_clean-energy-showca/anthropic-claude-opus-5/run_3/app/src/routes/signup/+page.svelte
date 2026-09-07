<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signup, ApiError } from '$lib/api.js';
	import { refreshSaves } from '$lib/saves.js';
	import { saveTokenStore } from '$lib/auth.js';

	let display_name = $state('');
	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let failure = $state('');
	let touched = $state({});

	const next = $derived($page.url.searchParams.get('next') || '/account');
	const hadSaves = $derived(Boolean($saveTokenStore));

	const errors = $derived({
		display_name: display_name.trim() ? '' : 'Tell us what to call you.',
		email: !email.trim()
			? 'An email is required.'
			: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
				? ''
				: 'That does not look like an email address.',
		password:
			password.length >= 8 ? '' : 'Use at least 8 characters so the account is worth having.'
	});
	const valid = $derived(!errors.display_name && !errors.email && !errors.password);

	async function submit(event) {
		event.preventDefault();
		touched = { display_name: true, email: true, password: true };
		failure = '';
		if (!valid) return;
		busy = true;
		try {
			await signup(email.trim(), password, display_name.trim());
			await refreshSaves();
			await goto(next);
		} catch (e) {
			failure =
				e instanceof ApiError && e.status === 409
					? 'An account with that email already exists. Sign in instead.'
					: e instanceof ApiError
						? e.message
						: 'We could not create the account just now.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create an account · Zettajoule</title></svelte:head>

<section class="wrap auth">
	<div class="card card--pad">
		<p class="eyebrow">Account</p>
		<h1>Create an account</h1>
		<p class="muted">
			An account keeps your saved solutions, your searches, your enquiries and your investor access
			request.
		</p>

		{#if hadSaves}
			<div class="banner banner--info">
				<strong>Your saves come with you</strong>
				<span>The solutions you saved before signing up move onto the new account.</span>
			</div>
		{/if}

		{#if failure}
			<div class="banner banner--fail" role="alert">
				<strong>Account not created</strong>
				<span>{failure}</span>
			</div>
		{/if}

		<form onsubmit={submit} novalidate>
			<div class="field">
				<label for="name">Your name</label>
				<input
					id="name"
					type="text"
					autocomplete="name"
					bind:value={display_name}
					onblur={() => (touched = { ...touched, display_name: true })}
					aria-invalid={touched.display_name && errors.display_name ? 'true' : undefined}
				/>
				{#if touched.display_name && errors.display_name}
					<p class="field__error">{errors.display_name}</p>
				{/if}
			</div>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					autocomplete="email"
					bind:value={email}
					onblur={() => (touched = { ...touched, email: true })}
					aria-invalid={touched.email && errors.email ? 'true' : undefined}
				/>
				{#if touched.email && errors.email}
					<p class="field__error">{errors.email}</p>
				{/if}
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					autocomplete="new-password"
					bind:value={password}
					onblur={() => (touched = { ...touched, password: true })}
					aria-invalid={touched.password && errors.password ? 'true' : undefined}
					aria-describedby="pw-hint"
				/>
				{#if touched.password && errors.password}
					<p class="field__error">{errors.password}</p>
				{:else}
					<p class="field__hint" id="pw-hint">At least 8 characters.</p>
				{/if}
			</div>
			<button class="btn btn--block" type="submit" disabled={busy}>
				{#if busy}<span class="spinner" aria-hidden="true"></span> Creating{:else}Create account{/if}
			</button>
		</form>

		<p class="muted alt">
			Already have one?
			<a href={`/signin${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign in</a
			>.
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
