<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { post, ApiError } from '$lib/api.js';
	import { setSession, setSaveToken, currentSaveToken, savedSlugs } from '$lib/stores.js';

	let display_name = '';
	let email = '';
	let password = '';
	let busy = false;
	let banner = null;
	let touched = { display_name: false, email: false, password: false };

	$: next = $page.url.searchParams.get('next') || '/account';
	$: nameError = touched.display_name && !display_name.trim() ? 'Tell us what to call you.' : '';
	$: emailError =
		touched.email && !email.trim()
			? 'An email address is required.'
			: touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
				? 'That does not look like an email address.'
				: '';
	$: passwordError =
		touched.password && password.length < 8 ? 'Use at least 8 characters.' : '';

	async function submit() {
		touched = { display_name: true, email: true, password: true };
		banner = null;
		if (!display_name.trim() || !email.trim() || password.length < 8 || emailError) return;
		busy = true;
		try {
			const body = {
				display_name: display_name.trim(),
				email: email.trim().toLowerCase(),
				password
			};
			const st = currentSaveToken();
			if (st) body.save_token = st;
			const res = await post('/auth/signup', body, { anonymous: true });
			setSession(res.access_token, {
				id: res.id,
				email: res.email,
				display_name: res.display_name
			});
			if (st) setSaveToken(null);
			savedSlugs.set(new Set());
			await goto(next.startsWith('/') ? next : '/account');
		} catch (err) {
			banner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not reach the server. Try again.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create an account | Zettajoule</title></svelte:head>

<section class="section">
	<div class="auth-wrap">
		<div class="card">
			<p class="eyebrow">Account</p>
			<h1>Create an account</h1>
			<p class="muted">
				Anything you have already saved comes with you. Signing up is free and takes a moment.
			</p>

			{#if banner}
				<div class="banner banner-{banner.kind}" role="alert">
					<strong>Could not create the account</strong>{banner.text}
				</div>
			{/if}

			<form on:submit|preventDefault={submit} novalidate>
				<div class="field">
					<label for="name">Your name</label>
					<input
						id="name"
						class="input"
						autocomplete="name"
						bind:value={display_name}
						on:blur={() => (touched.display_name = true)}
						aria-invalid={nameError ? 'true' : undefined}
						aria-describedby={nameError ? 'name-err' : undefined}
					/>
					{#if nameError}<p class="error-text" id="name-err">{nameError}</p>{/if}
				</div>
				<div class="field">
					<label for="email">Email</label>
					<input
						id="email"
						class="input"
						type="email"
						autocomplete="email"
						bind:value={email}
						on:blur={() => (touched.email = true)}
						aria-invalid={emailError ? 'true' : undefined}
						aria-describedby={emailError ? 'email-err' : undefined}
					/>
					{#if emailError}<p class="error-text" id="email-err">{emailError}</p>{/if}
				</div>
				<div class="field">
					<label for="password">Password</label>
					<input
						id="password"
						class="input"
						type="password"
						autocomplete="new-password"
						bind:value={password}
						on:blur={() => (touched.password = true)}
						aria-invalid={passwordError ? 'true' : undefined}
						aria-describedby="pw-hint {passwordError ? 'pw-err' : ''}"
					/>
					<p class="hint" id="pw-hint">At least 8 characters.</p>
					{#if passwordError}<p class="error-text" id="pw-err">{passwordError}</p>{/if}
				</div>
				<button class="btn btn-primary full" type="submit" disabled={busy}>
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Create account
				</button>
			</form>

			<p class="alt">
				Already have one?
				<a href="/signin{next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}">Sign in</a>
			</p>
		</div>
	</div>
</section>

<style>
	.auth-wrap {
		width: 100%;
		max-width: 460px;
		margin: 0 auto;
		padding-inline: var(--gut);
	}
	.card {
		padding: clamp(22px, 4vw, 34px);
	}
	.card h1 {
		font-size: clamp(1.7rem, 3.4vw, 2.2rem);
	}
	.card .muted {
		font-size: 0.9rem;
		margin-bottom: 20px;
	}
	.full {
		width: 100%;
	}
	.alt {
		margin: 18px 0 0;
		font-size: 0.9rem;
		text-align: center;
		color: var(--ink-muted);
	}
</style>
