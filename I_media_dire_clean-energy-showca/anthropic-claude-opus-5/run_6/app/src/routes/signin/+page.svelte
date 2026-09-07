<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { post, ApiError } from '$lib/api.js';
	import { setSession, setSaveToken, currentSaveToken, savedSlugs } from '$lib/stores.js';

	let email = '';
	let password = '';
	let busy = false;
	let banner = null;
	let touched = { email: false, password: false };

	$: next = $page.url.searchParams.get('next') || '/account';
	$: emailError =
		touched.email && !email.trim()
			? 'Enter the email address on the account.'
			: touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
				? 'That does not look like an email address.'
				: '';
	$: passwordError = touched.password && !password ? 'Enter your password.' : '';

	async function submit() {
		touched = { email: true, password: true };
		banner = null;
		if (emailError || passwordError || !email.trim() || !password) return;
		busy = true;
		try {
			const body = { email: email.trim().toLowerCase(), password };
			const st = currentSaveToken();
			if (st) body.save_token = st;
			const res = await post('/auth/login', body, { anonymous: true });
			setSession(res.access_token, res.account);
			if (st) setSaveToken(null);
			savedSlugs.set(new Set());
			await goto(next.startsWith('/') ? next : '/account');
		} catch (err) {
			banner = {
				kind: 'error',
				text:
					err instanceof ApiError
						? err.message
						: 'Could not reach the server. Check your connection and try again.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Sign in | Zettajoule</title></svelte:head>

<section class="section">
	<div class="auth-wrap">
		<div class="card">
			<p class="eyebrow">Account</p>
			<h1>Sign in</h1>
			<p class="muted">
				Your saved solutions, searches, enquiries and access request live here. Anything you saved
				before signing in follows you in.
			</p>

			{#if banner}
				<div class="banner banner-{banner.kind}" role="alert">
					<strong>Could not sign in</strong>{banner.text}
				</div>
			{/if}

			<form on:submit|preventDefault={submit} novalidate>
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
						autocomplete="current-password"
						bind:value={password}
						on:blur={() => (touched.password = true)}
						aria-invalid={passwordError ? 'true' : undefined}
						aria-describedby={passwordError ? 'pw-err' : undefined}
					/>
					{#if passwordError}<p class="error-text" id="pw-err">{passwordError}</p>{/if}
				</div>
				<button class="btn btn-primary full" type="submit" disabled={busy}>
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Sign in
				</button>
			</form>

			<p class="alt">
				No account yet?
				<a href="/signup{next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}">Create one</a>
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
