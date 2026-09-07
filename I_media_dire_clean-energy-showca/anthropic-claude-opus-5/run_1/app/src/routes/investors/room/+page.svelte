<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api.js';
	import { currentToken, loadAccount, token, account } from '$lib/session.js';

	let state_ = $state('loading'); // loading | open | notfound
	let documents = $state([]);

	onMount(async () => {
		const acct = await loadAccount();
		if (!acct) {
			await goto('/signin?next=/investors/room');
			return;
		}
		try {
			const { data } = await api('/api/documents', { token: currentToken() });
			documents = data;
			state_ = 'open';
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				token.set(null);
				account.set(null);
				await goto('/signin?next=/investors/room');
				return;
			}
			// a room that never existed: the not-found answer, no document in it
			documents = [];
			state_ = 'notfound';
		}
	});

	function fmt(d) {
		return d ? new Date(d).toISOString().slice(0, 10) : '';
	}
</script>

<svelte:head>
	<title>{state_ === 'open' ? 'Document room' : 'We cannot find that page'}, Zettajoule</title>
</svelte:head>

{#if state_ === 'loading'}
	<section class="section">
		<div class="wrap">
			<p class="loading"><span class="spinner" aria-hidden="true"></span> Checking your access</p>
		</div>
	</section>
{:else if state_ === 'notfound'}
	<section class="section">
		<div class="wrap-narrow">
			<div class="card nf" data-testid="not-found">
				<p class="eyebrow">404</p>
				<h1>We cannot find that page</h1>
				<p class="lede">
					The address you asked for is not one of ours. Nothing is broken; there is simply nothing
					here.
				</p>
				<div class="row">
					<a class="btn btn-primary" href="/">Back to the home page</a>
					<a class="btn btn-quiet" href="/investors">Investors</a>
				</div>
			</div>
		</div>
	</section>
{:else}
	<section class="head">
		<div class="wrap">
			<p class="eyebrow"><a href="/investors">Investors</a> / Document room</p>
			<h1>The document room</h1>
			<p class="lede">
				Your access request is approved, so these are open to you. They are confidential and for your
				own review.
			</p>
		</div>
	</section>

	<section class="section">
		<div class="wrap">
			{#if documents.length === 0}
				<div class="empty">
					<h3>No documents published yet</h3>
					<p>The room is open to you but nothing has been placed in it.</p>
					<a class="btn btn-primary btn-sm" href="/investors">Back to investors</a>
				</div>
			{:else}
				<ul class="docs" data-testid="documents">
					{#each documents as d (d.slug)}
						<li>
							<div class="doc-mark" aria-hidden="true">
								<svg viewBox="0 0 40 48" width="34" height="41" focusable="false">
									<path
										d="M4 4 h22 l10 10 v30 H4 Z"
										fill="none"
										stroke="var(--ink)"
										stroke-width="1.6"
									/>
									<path d="M26 4 v10 h10" fill="none" stroke="var(--ink)" stroke-width="1.6" />
									<path
										d="M10 24 h20 M10 30 h20 M10 36 h13"
										stroke="var(--accent)"
										stroke-width="1.4"
									/>
								</svg>
							</div>
							<div>
								<h2>{d.title}</h2>
								<p class="meta"><span class="badge">{d.category}</span> {fmt(d.published_at)}</p>
								<p class="muted">{d.summary}</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>
{/if}

<style>
	.head {
		padding: 40px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.loading {
		display: inline-flex;
		gap: 10px;
		align-items: center;
		color: var(--ink-muted);
	}
	.nf {
		padding: 34px;
	}
	.row {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.docs li {
		display: flex;
		gap: 18px;
		align-items: flex-start;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 18px 20px;
	}
	.docs h2 {
		font-size: 1.1rem;
		margin-bottom: 6px;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--ink-muted);
		margin-bottom: 6px;
	}
	.docs p.muted {
		margin: 0;
		font-size: 0.93rem;
	}
	.doc-mark {
		flex: none;
	}
</style>
