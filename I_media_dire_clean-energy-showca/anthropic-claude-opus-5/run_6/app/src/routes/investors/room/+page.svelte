<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api.js';
	import { auth } from '$lib/stores.js';

	let state = 'loading'; // loading | ok | denied
	let documents = [];

	onMount(async () => {
		if (!$auth.token) {
			await goto('/signin?next=%2Finvestors%2Froom', { replaceState: true });
			return;
		}
		try {
			documents = await api('/documents');
			state = 'ok';
		} catch (err) {
			/* A request that is not approved meets the answer a room that never
			   existed gives: the not-found page, with no document in the payload. */
			state = 'denied';
		}
	});
</script>

<svelte:head>
	<title>{state === 'ok' ? 'Document room | Zettajoule' : 'We cannot find that page | Zettajoule'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if state === 'loading'}
	<section class="section">
		<div class="wrap">
			<p aria-busy="true"><span class="spinner" aria-hidden="true"></span> Opening the document room…</p>
		</div>
	</section>
{:else if state === 'denied'}
	<section class="section">
		<div class="wrap-narrow">
			<div class="card notfound">
				<p class="eyebrow">Error 404</p>
				<h1>We cannot find that page</h1>
				<p class="lede">
					The address you asked for is not one of ours. Nothing has been lost.
				</p>
				<a class="btn btn-primary" href="/">Back to the home page</a>
			</div>
		</div>
	</section>
{:else}
	<section class="head-band">
		<div class="wrap">
			<p class="eyebrow">Investors</p>
			<h1>Document room</h1>
			<p class="lede">
				Private material for approved investors. Please treat these as confidential.
			</p>
		</div>
	</section>

	<section class="section-tight">
		<div class="wrap">
			{#if !documents.length}
				<div class="empty">
					<h2>No documents are published yet</h2>
					<p>The room is open to you but nothing has been filed in it. We will be in touch when it is.</p>
					<a class="btn btn-primary" href="/contact">Get in Touch</a>
				</div>
			{:else}
				<ul class="docs">
					{#each documents as d}
						<li class="doc">
							<div class="d-mark" aria-hidden="true">
								<svg width="30" height="38" viewBox="0 0 30 38" focusable="false">
									<path d="M3 2h16l8 8v26H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
									<path d="M19 2v8h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
									<path d="M8 20h14M8 26h14M8 14h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
								</svg>
							</div>
							<div class="d-body">
								<h2>{d.title}</h2>
								<p class="muted">
									{d.category} · published {new Date(d.published_at).toLocaleDateString('en-GB', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</p>
							</div>
							<span class="pill pill-success">approved</span>
						</li>
					{/each}
				</ul>
				<p class="muted foot-note">
					Showing {documents.length} document{documents.length === 1 ? '' : 's'}. Questions go
					through <a href="/contact">Get in Touch</a>.
				</p>
			{/if}
		</div>
	</section>
{/if}

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(30px, 5vw, 56px);
	}
	.notfound {
		padding: clamp(28px, 6vw, 56px);
		text-align: center;
	}
	.notfound .lede {
		margin-inline: auto;
		margin-bottom: 22px;
	}
	.docs {
		list-style: none;
		padding: 0;
		margin: 0 0 18px;
		display: grid;
		gap: 12px;
	}
	.doc {
		display: flex;
		align-items: center;
		gap: 16px;
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
		padding: 16px 18px;
		background: var(--paper);
	}
	.d-mark {
		color: var(--accent);
		flex: none;
	}
	.d-body {
		flex: 1;
		min-width: 0;
	}
	.d-body h2 {
		margin: 0;
		font-size: 1.05rem;
	}
	.d-body p {
		margin: 3px 0 0;
		font-size: 0.85rem;
	}
	.foot-note {
		font-size: 0.88rem;
	}
	@media (max-width: 560px) {
		.doc {
			flex-wrap: wrap;
		}
	}
</style>
