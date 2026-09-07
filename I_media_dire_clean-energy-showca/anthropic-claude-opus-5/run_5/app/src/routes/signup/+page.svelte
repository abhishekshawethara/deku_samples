
<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { apiData, setSession, getSaveToken, clearSaveToken } from '$lib/api';

	let display_name = $state('');
	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let failure = $state('');
	let touched = $state({});

	let next = $derived(page.url.searchParams.get('next') || '');

	let errors = $derived({
		display_name: display_name.trim() ? '' : 'Enter the name to show on your account.',
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter a valid email address.',
		password: password.length >= 8 ? '' : 'Use at least 8 characters.'
	});
	let valid = $derived(Object.values(errors).every((e) => !e));

	async function submit(e) {
		e.preventDefault();
		touched = { display_name: true, email: true, password: true };
		failure = '';
		if (!valid) return;
		busy = true;
		try {
			const saveToken = getSaveToken();
			const res = await apiData('/auth/signup', {
				method: 'POST',
				auth: false,
				body: {
					display_name: display_name.trim(),
					email: email.trim(),
					password,
					...(saveToken ? { save_token: saveToken } : {})
				}
			});
			setSession(res.access_token, {
				id: res.id,
				email: res.email,
				display_name: res.display_name
			});
			if (saveToken) clearSaveToken();
			await goto(next || '/account');
		} catch (err) {
			failure = err.message || 'That account could not be created.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create an account, Zettajoule</title></svelte:head>

<div class="wrap-narrow auth">
	<p class="eyebrow">Account</p>
	<h1>Create an account</h1>
	<p class="lede">
		Signing up claims anything you saved before you had an account, and keeps it to yourself.
	</p>

	<form class="card" onsubmit={submit} novalidate>
		{#if failure}
			<div class="banner banner-fail" role="alert" data-testid="signup-error">
				<strong>That account was not created.</strong>
				{failure} Correct the field it names and try again.
			</div>
		{/if}

		<div class="field">
			<label for="u-name">Your name</label>
			<input
				id="u-name"
				type="text"
				bind:value={display_name}
				onblur={() => (touched.display_name = true)}
				aria-invalid={touched.display_name && errors.display_name ? 'true' : undefined}
				autocomplete="name"
			/>
			{#if touched.display_name && errors.display_name}
				<p class="field-error">{errors.display_name}</p>
			{/if}
		</div>

		<div class="field">
			<label for="u-email">Email</label>
			<input
				id="u-email"
				type="email"
				bind:value={email}
				onblur={() => (touched.email = true)}
				aria-invalid={touched.email && errors.email ? 'true' : undefined}
				autocomplete="email"
			/>
			{#if touched.email && errors.email}<p class="field-error">{errors.email}</p>{/if}
		</div>

		<div class="field">
			<label for="u-password">Password</label>
			<input
				id="u-password"
				type="password"
				bind:value={password}
				onblur={() => (touched.password = true)}
				aria-invalid={touched.password && errors.password ? 'true' : undefined}
				autocomplete="new-password"
			/>
			{#if touched.password && errors.password}
				<p class="field-error">{errors.password}</p>
			{:else}
				<p class="muted hint">At least 8 characters.</p>
			{/if}
		</div>

		<button class="btn" type="submit" disabled={busy} data-testid="signup-submit">
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
			{busy ? 'Creating your account' : 'Create account'}
		</button>
	</form>

	<p class="alt">
		Already have an account?
		<a href="/signin{next ? `?next=${encodeURIComponent(next)}` : ''}">Sign in</a>.
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
	.hint {
		font-size: 0.82rem;
		margin: 5px 0 0;
	}
</style>
