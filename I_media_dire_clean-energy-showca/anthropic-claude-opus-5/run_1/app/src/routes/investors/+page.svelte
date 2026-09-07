<script>
	import { onMount } from 'svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { account, authReady, currentToken, loadAccount } from '$lib/session.js';

	let { data } = $props();

	let request = $state(null);
	let checking = $state(true);
	let organisation = $state('');
	let role_title = $state('');
	let busy = $state(false);
	let banner = $state(null);
	let touched = $state({ org: false, role: false });

	onMount(async () => {
		await loadAccount();
		await check();
	});

	async function check() {
		checking = true;
		const t = currentToken();
		if (!t) {
			request = null;
			checking = false;
			return;
		}
		try {
			const { data: r } = await api('/api/access-request', { token: t });
			request = r;
			organisation = r.organisation;
			role_title = r.role_title;
		} catch {
			request = null;
		} finally {
			checking = false;
		}
	}

	const orgError = $derived(
		touched.org && organisation.trim().length < 2 ? 'Name the organisation you represent.' : ''
	);
	const roleError = $derived(
		touched.role && role_title.trim().length < 2 ? 'Give your role there.' : ''
	);

	async function submit(event) {
		event.preventDefault();
		touched = { org: true, role: true };
		if (organisation.trim().length < 2 || role_title.trim().length < 2) return;
		busy = true;
		banner = null;
		try {
			const { data: r } = await api('/api/access-request', {
				method: 'POST',
				token: currentToken(),
				body: { organisation: organisation.trim(), role_title: role_title.trim() }
			});
			request = r;
			banner = {
				kind: r.status === 'approved' ? 'success' : 'pending',
				text: `Request ${r.reference} recorded and it reads ${r.status}. An account holds one request; asking again updates this one rather than adding another.`
			};
		} catch (err) {
			banner = {
				kind: 'error',
				text:
					err instanceof ApiError && err.status === 401
						? 'Sign in first, then request access.'
						: err.message || 'The request could not be recorded. Try again in a moment.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Investors, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Investors</p>
		<h1>{data.copy.lede?.heading}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap grid-3 case">
		{#each ['market', 'model', 'compare'] as key}
			<Reveal>
				<article class="card">
					<h2>{data.copy[key]?.heading}</h2>
					<p>{data.copy[key]?.body}</p>
				</article>
			</Reveal>
		{/each}
	</div>
</section>

<section class="section roadmap-section">
	<div class="wrap">
		<h2>The roadmap, from a proven test reactor to first deployment</h2>
		<ol class="timeline">
			{#each data.roadmap as r}
				<li>
					<span class="year mono">{r.year}</span>
					<div class="dot" aria-hidden="true"></div>
					<div>
						<h3>{r.title}</h3>
						<p>{r.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<section class="section room-section">
	<div class="wrap-narrow">
		<h2>The private document room</h2>
		<p class="lede">
			Three documents sit behind an approval: the investor deck, the technology dossier and the
			licensing roadmap. Request access here; it reads pending until it is approved, and only an
			account whose own request is approved sees the room.
		</p>

		{#if checking}
			<p class="loading"><span class="spinner" aria-hidden="true"></span> Checking your request</p>
		{:else if !$account}
			<div class="empty">
				<h3>No account signed in</h3>
				<p>An access request belongs to an account, so sign in or create one first.</p>
				<a class="btn btn-primary btn-sm" href="/signin?next=/investors">Sign in</a>
			</div>
		{:else}
			{#if banner}
				<p
					class={`banner banner-${banner.kind}`}
					role={banner.kind === 'error' ? 'alert' : 'status'}
					data-testid="access-banner"
				>
					{banner.text}
				</p>
			{/if}

			{#if request}
				<div class="req card" data-testid="access-state">
					<p class="req-top">
						<span class="mono"><strong>{request.reference}</strong></span>
						<span class={`badge badge-${request.status}`}>{request.status}</span>
					</p>
					<p class="muted">{request.organisation} &middot; {request.role_title}</p>
					{#if request.status === 'approved'}
						<p>Approved. The room is open to you.</p>
						<a class="btn btn-primary" href="/investors/room">Open the document room</a>
					{:else if request.status === 'pending'}
						<p>
							Pending until it is approved. The room stays closed and answers as though it never
							existed until then.
						</p>
					{:else}
						<p>Declined. The room is closed. Write to us if you think that is wrong.</p>
					{/if}
				</div>
			{/if}

			<form onsubmit={submit} novalidate class="req-form">
				<h3>{request ? 'Update your request' : 'Request access'}</h3>
				<div class="field">
					<label for="org">Organisation</label>
					<input
						id="org"
						type="text"
						bind:value={organisation}
						onblur={() => (touched.org = true)}
						aria-invalid={orgError ? 'true' : 'false'}
						aria-describedby={orgError ? 'org-error' : undefined}
						data-testid="org"
					/>
					{#if orgError}<p class="field-error" id="org-error">{orgError}</p>{/if}
				</div>
				<div class="field">
					<label for="role">Your role</label>
					<input
						id="role"
						type="text"
						bind:value={role_title}
						onblur={() => (touched.role = true)}
						aria-invalid={roleError ? 'true' : 'false'}
						aria-describedby={roleError ? 'role-error' : undefined}
						data-testid="role"
					/>
					{#if roleError}<p class="field-error" id="role-error">{roleError}</p>{/if}
				</div>
				<button class="btn btn-primary" type="submit" disabled={busy} data-testid="access-submit">
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
					{busy ? 'Sending' : request ? 'Update the request' : 'Request access'}
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.head {
		padding: 40px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.case .card h2 {
		font-size: 1.15rem;
	}
	.case .card p {
		color: var(--ink-muted);
		font-size: 0.95rem;
		margin: 0;
	}
	.roadmap-section {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.timeline {
		list-style: none;
		margin: 26px 0 0;
		padding: 0;
	}
	.timeline li {
		display: grid;
		grid-template-columns: 76px 22px 1fr;
		gap: 14px;
		padding-bottom: 22px;
		position: relative;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: 86px;
		top: 20px;
		bottom: 0;
		width: 1px;
		background: var(--rule);
	}
	.timeline li:last-child::before {
		display: none;
	}
	.year {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1rem;
		padding-top: 2px;
	}
	.dot {
		width: 13px;
		height: 13px;
		border-radius: 50%;
		border: 2px solid var(--accent);
		background: var(--surface);
		margin-top: 6px;
	}
	.timeline h3 {
		font-size: 1.02rem;
		margin-bottom: 4px;
	}
	.timeline p {
		color: var(--ink-muted);
		font-size: 0.93rem;
		margin: 0;
	}
	.loading {
		display: inline-flex;
		gap: 10px;
		align-items: center;
		color: var(--ink-muted);
	}
	.req {
		margin: 18px 0;
	}
	.req-top {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 4px;
	}
	.req-form {
		margin-top: 26px;
		padding-top: 20px;
		border-top: 1px solid var(--rule);
	}
	.req-form h3 {
		font-size: 1.05rem;
	}
</style>
