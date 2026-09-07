
<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { apiData, getToken } from '$lib/api';

	let state_ = $state('loading'); // loading | documents | notfound
	let documents = $state([]);

	$effect(() => {
		if (!browser) return;
		if (!getToken()) {
			goto('/signin?next=%2Finvestors%2Froom');
			return;
		}
		apiData('/documents')
			.then((rows) => {
				documents = rows || [];
				state_ = 'documents';
			})
			.catch(() => {
				// any caller without their own approved request meets the answer a
				// room that never existed gives, with no document in the payload
				documents = [];
				state_ = 'notfound';
			});
	});

	function fmtDate(v) {
		if (!v) return '';
		return new Date(v).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{state_ === 'documents' ? 'Document room, Zettajoule' : 'We cannot find that page'}</title>
</svelte:head>

{#if state_ === 'loading'}
	<div class="wrap section">
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Opening the document room</div>
	</div>
{:else if state_ === 'notfound'}
	<div class="wrap section">
		<div class="card nf" data-testid="notfound">
			<h1>We cannot find that page</h1>
			<p class="lede">
				There is nothing at this address for this account. If you were expecting the investor
				document room, it opens only while your own access request is approved.
			</p>
			<div class="nf-actions">
				<a class="btn" href="/">Back to the home route</a>
				<a class="btn btn-secondary" href="/investors">See where your request stands</a>
			</div>
		</div>
	</div>
{:else}
	<div class="head">
		<div class="wrap">
			<p class="eyebrow">Investors / Document room</p>
			<h1>The private document room</h1>
			<p class="lede">
				Your access request is approved, so this room is open to your account. These documents are
				confidential to the organisation named on your request.
			</p>
		</div>
	</div>

	<div class="wrap section-tight">
		{#if documents.length === 0}
			<div class="empty">
				<h3>No document is published yet</h3>
				<p>The room is open to you, but nothing has been placed in it. We will write when it is.</p>
				<a class="btn btn-sm btn-secondary" href="/contact">Ask about the material</a>
			</div>
		{:else}
			<ul class="docs" data-testid="document-list">
				{#each documents as d (d.slug)}
					<li class="card doc">
						<div class="doc-mark" aria-hidden="true">
							<svg viewBox="0 0 40 48" width="34" height="41" focusable="false">
								<g fill="none" stroke="var(--ink)" stroke-width="1.5">
									<path d="M6 3 H26 L34 11 V45 H6 Z" />
									<path d="M26 3 V11 H34" />
									<path d="M12 20 H28 M12 27 H28 M12 34 H22" />
								</g>
							</svg>
						</div>
						<div>
							<h2>{d.title}</h2>
							<p class="meta">
								<span class="pill">{d.category}</span>
								<span class="muted">Published {fmtDate(d.published_at)}</span>
							</p>
						</div>
					</li>
				{/each}
			</ul>
			<p class="muted count">
				{documents.length} document{documents.length === 1 ? '' : 's'} in the room.
			</p>
		{/if}
	</div>
{/if}

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 40px 0 32px;
	}
	.nf {
		text-align: center;
		padding: 44px 26px;
	}
	.nf .lede {
		margin: 0 auto 20px;
	}
	.nf-actions {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 12px;
		padding-bottom: 8px;
	}
	.doc {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.doc-mark {
		flex: none;
	}
	.doc h2 {
		font-size: 1.1rem;
		margin: 0 0 6px;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		margin: 0;
		font-size: 0.86rem;
	}
	.count {
		margin-top: 14px;
		padding-bottom: 40px;
		font-size: 0.9rem;
	}
</style>
