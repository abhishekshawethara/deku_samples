<script>
	/* The room answers only while the caller's own request is approved. Anything
	   else meets the answer a room that never existed gives, with no document in
	   the payload: the server decides, this page only reports. */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api, getToken, ApiError } from '$lib/api.js';

	let state = 'loading'; // loading | open | notfound | error
	let documents = [];
	let message = '';

	function fmtDate(d) {
		return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
	}

	onMount(async () => {
		if (!getToken()) {
			await goto('/signin?next=%2Finvestors%2Froom', { replaceState: true });
			return;
		}
		try {
			documents = await api('/documents');
			state = 'open';
		} catch (err) {
			if (err instanceof ApiError && err.status === 404) {
				state = 'notfound';
			} else if (err instanceof ApiError && err.status === 401) {
				await goto('/signin?next=%2Finvestors%2Froom', { replaceState: true });
			} else {
				state = 'error';
				message = err instanceof ApiError ? err.message : 'The room could not be reached.';
			}
		}
	});
</script>

<svelte:head>
	<title>{state === 'open' ? 'Document room, Zettajoule' : 'We cannot find that page, Zettajoule'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if state === 'loading'}
	<section class="section wrap">
		<div class="card"><span class="spinner" aria-hidden="true"></span> Checking your access</div>
	</section>
{:else if state === 'notfound'}
	<!-- Identical to the not-found card: a room that never existed. -->
	<section class="section wrap">
		<div class="card notfound" data-testid="room-notfound">
			<p class="eyebrow">Error 404</p>
			<h1>We cannot find that page</h1>
			<p class="lede">
				The address you asked for is not one of ours. Nothing was lost; the route simply does not exist.
			</p>
			<a class="btn" href="/">Back to the home route</a>
		</div>
	</section>
{:else if state === 'error'}
	<section class="section wrap">
		<div class="banner banner--fail" role="alert">
			<span class="banner__title">The room could not be opened</span>
			{message} Reload the page, or <a href="/contact">get in touch</a> if it keeps happening.
		</div>
	</section>
{:else}
	<section class="section section--tight wrap">
		<p class="eyebrow"><a href="/investors">Investors</a> / Document room</p>
		<h1>Document room</h1>
		<p class="lede">
			Your access request is approved, so the private material is open to you. These documents are listed from
			the database and belong to this account's approval alone.
		</p>
	</section>

	<section class="wrap section--tight">
		{#if documents.length === 0}
			<div class="empty">
				<p><strong>No documents are published yet.</strong></p>
				<p>The room is open to you but nothing has been filed in it.</p>
				<a class="btn" href="/investors">Back to investors</a>
			</div>
		{:else}
			<ul class="docs" data-testid="document-list">
				{#each documents as doc (doc.slug)}
					<li class="doc">
						<svg class="doc__mark" viewBox="0 0 40 52" aria-hidden="true" focusable="false">
							<path d="M4 2h22l10 10v38H4z" fill="none" stroke="var(--navy)" stroke-width="1.6" stroke-linejoin="round" />
							<path d="M26 2v10h10" fill="none" stroke="var(--navy)" stroke-width="1.6" stroke-linejoin="round" />
							<path d="M11 22h18M11 29h18M11 36h11" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" />
						</svg>
						<div>
							<strong>{doc.title}</strong>
							<span class="sub">{doc.category} &middot; published {fmtDate(doc.published_at)}</span>
							<span class="sub mono">{doc.slug}</span>
						</div>
					</li>
				{/each}
			</ul>
			<p class="count" role="status">{documents.length} documents in the room.</p>
		{/if}
	</section>
{/if}

<style>
	.notfound {
		max-width: 620px;
		margin: 2rem auto;
		text-align: center;
		padding: 2.5rem 1.5rem;
	}
	.notfound .lede {
		margin: 0 auto 1.5rem;
	}
	.docs {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
	}
	.doc {
		display: flex;
		gap: 0.9rem;
		align-items: flex-start;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
	}
	.doc__mark {
		width: 34px;
		height: 44px;
		flex: none;
	}
	.doc div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}
	.doc strong {
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.sub {
		font-size: 0.82rem;
		color: var(--ink-muted);
	}
	.count {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
</style>
