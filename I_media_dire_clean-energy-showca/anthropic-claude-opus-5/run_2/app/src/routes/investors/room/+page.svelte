<script>
	// The document room answers only while the caller's own request is approved.
	// Anything else meets the answer a room that never existed gives.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { token } from '$lib/session.js';
	import { api } from '$lib/api.js';

	let state = 'loading'; // loading | open | missing
	let documents = [];
	let request = null;

	onMount(async () => {
		if (!$token) {
			await goto('/signin?next=%2Finvestors%2Froom');
			return;
		}
		try {
			documents = await api('/api/documents', { token: $token });
			try {
				request = await api('/api/access-request', { token: $token });
			} catch {
				request = null;
			}
			state = 'open';
		} catch (err) {
			if (err.status === 401) {
				await goto('/signin?next=%2Finvestors%2Froom');
				return;
			}
			state = 'missing';
		}
	});
</script>

<svelte:head><title>{state === 'open' ? 'Document room' : 'We cannot find that page'}</title></svelte:head>

<section class="section">
	<div class="wrap">
		{#if state === 'loading'}
			<p class="loading-note"><span class="spinner" aria-hidden="true"></span> Checking your access</p>
		{:else if state === 'missing'}
			<div class="card notfound">
				<p class="eyebrow">404</p>
				<h1>We cannot find that page</h1>
				<p class="lede">
					The address you asked for is not one of ours. Nothing has broken; there is simply nothing here.
				</p>
				<a class="btn" href="/">Back to the home page</a>
			</div>
		{:else}
			<p class="eyebrow"><a href="/investors">Investors</a> / Document room</p>
			<h1>Document room</h1>
			{#if request}
				<div class="banner banner-success" role="status">
					<strong>Access approved.</strong> Request {request.reference} for {request.organisation} is approved.
				</div>
			{/if}
			{#if documents.length === 0}
				<div class="empty-state">
					<h3>No documents are published yet</h3>
					<p>The room is open to you but nothing has been filed. <a href="/contact">Ask us</a> what is coming.</p>
				</div>
			{:else}
				<ul class="docs" data-testid="document-list">
					{#each documents as d (d.slug)}
						<li>
							<svg viewBox="0 0 32 40" width="30" height="38" aria-hidden="true" focusable="false">
								<path d="M4 2h16l8 8v28H4z" fill="none" stroke="var(--accent)" stroke-width="1.6" />
								<path d="M20 2v8h8" fill="none" stroke="var(--accent)" stroke-width="1.6" />
								<path d="M9 20h14M9 26h14M9 32h9" stroke="var(--rule-strong)" stroke-width="1.4" />
							</svg>
							<div>
								<h2>{d.title}</h2>
								<p class="dense">{d.category} &middot; published {String(d.published_at).slice(0, 10)}</p>
							</div>
							<span class="status-pill status-approved">Available</span>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</section>

<style>
	.notfound {
		max-width: 600px;
		margin: 20px auto;
	}
	.docs {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.docs li {
		display: flex;
		align-items: center;
		gap: 16px;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 14px 16px;
		background: #fff;
	}
	.docs h2 {
		font-size: 1.1rem;
		margin: 0 0 2px;
	}
	.docs p {
		margin: 0;
		color: var(--ink-muted);
	}
	.docs li > div {
		flex: 1;
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--accent);
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
	}
</style>
