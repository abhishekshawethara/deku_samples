<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api.js';
	import { setSession, clearSaveToken, currentSaveToken, loadAccount } from '$lib/session.js';

	let display_name = $state('');
	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let error = $state('');
	let touched = $state({ name: false, email: false, password: false });

	const next = $derived($page.url.searchParams.get('next') || '/account');

	const nameError = $derived(
		touched.name && display_name.trim().length < 2 ? 'Enter the name to put on the account.' : ''
	);
	const emailError = $derived(
		touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
			? 'Enter an email address in the form name@example.com.'
			: ''
	);
	const passwordError = $derived(
		touched.password && password.length < 8 ? 'Use at least 8 characters.' : ''
	);

	async function submit(event) {
		event.preventDefault();
		touched = { name: true, email: true, password: true };
		if (nameError || emailError || passwordError) return;
		if (!display_name.trim() || !email.trim() || password.length < 8) return;
		busy = true;
		error = '';
		try {
			const st = currentSaveToken();
			const { data } = await api('/api/auth/signup', {
				method: 'POST',
				body: {
					email: email.trim(),
					password,
					display_name: display_name.trim(),
					...(st ? { save_token: st } : {})
				}
			});
			setSession(data.access_token, {
				id: data.id,
				email: data.email,
				display_name: data.display_name
			});
			clearSaveToken();
			await loadAccount();
			await goto(next.startsWith('/') ? next : '/account');
		} catch (err) {
			error =
				err instanceof ApiError && err.status === 409
					? 'An account already uses that email. Sign in instead, or use another address.'
					: err.message || 'We could not create the account. Try again in a moment.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create an account, Zettajoule</title></svelte:head>

<section class="section">
	<div class="auth">
		<p class="eyebrow">Account</p>
		<h1>Create an account</h1>
		<p class="lede">
			Signing up keeps your saved solutions, searches, enquiries and access request in one place.
			Anything you saved before signing up moves onto the account.
		</p>

		{#if error}
			<p class="banner banner-error" role="alert" data-testid="signup-error">
				<strong>We could not create that account.</strong>
				{error}
			</p>
		{/if}

		<form onsubmit={submit} novalidate>
			<div class="field">
				<label for="display_name">Name</label>
				<input
					id="display_name"
					type="text"
					autocomplete="name"
					bind:value={display_name}
					onblur={() => (touched.name = true)}
					aria-invalid={nameError ? 'true' : 'false'}
					aria-describedby={nameError ? 'name-error' : undefined}
					data-testid="display-name"
				/>
				{#if nameError}<p class="field-error" id="name-error">{nameError}</p>{/if}
			</div>
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
					autocomplete="new-password"
					bind:value={password}
					onblur={() => (touched.password = true)}
					aria-invalid={passwordError ? 'true' : 'false'}
					aria-describedby="password-hint"
					data-testid="password"
				/>
				{#if passwordError}
					<p class="field-error" id="password-hint">{passwordError}</p>
				{:else}
					<p class="field-hint" id="password-hint">At least 8 characters.</p>
				{/if}
			</div>
			<button class="btn btn-primary" type="submit" disabled={busy} data-testid="signup-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Creating' : 'Create account'}
			</button>
		</form>

		<p class="alt">
			Already have one? <a href={`/signin?next=${encodeURIComponent(next)}`}>Sign in</a>.
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
