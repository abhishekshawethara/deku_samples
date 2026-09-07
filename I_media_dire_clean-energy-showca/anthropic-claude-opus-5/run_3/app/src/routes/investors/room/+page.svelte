<script>
	// The room answers only while the caller's own request is approved. Anything
	// else meets the answer a room that never existed gives, with no document in
	// the payload.
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';
	import { token } from '$lib/auth.js';

	let documents = $state([]);
	let state_ = $state('loading'); // loading | open | denied

	$effect(() => {
		if (!browser) return;
		if (!$token) {
			goto(`/signin?next=${encodeURIComponent($page.url.pathname)}`, { replaceState: true });
			return;
		}
		state_ = 'loading';
		api('/documents')
			.then(({ data }) => {
				documents = data;
				state_ = 'open';
			})
			.catch(() => {
				documents = [];
				state_ = 'denied';
			});
	});
</script>

<svelte:head>
	<title>{state_ === 'open' ? 'Document room · Zettajoule' : 'We cannot find that page · Zettajoule'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if state_ === 'loading'}
	<section class="wrap room">
		<p class="loading-row"><span class="spinner" aria-hidden="true"></span> Opening the room…</p>
	</section>
{:else if state_ === 'denied'}
	<!-- the not-found card, the same answer a room that never existed gives -->
	<section class="section wrap notfound">
		<div class="card card--pad">
			<p class="eyebrow">404</p>
			<h1>We cannot find that page</h1>
			<p class="lede">
				The address you asked for is not one of ours, or it is a room your account cannot open.
			</p>
			<div class="row">
				<a class="btn" href="/">Back to home</a>
				<a class="btn btn--ghost" href="/investors">Investors</a>
			</div>
		</div>
	</section>
{:else}
	<section class="head">
		<div class="wrap">
			<p class="eyebrow">Investors / Document room</p>
			<h1>The private document room</h1>
			<p class="lede">
				Your access request is approved. These {documents.length} documents are the full case.
			</p>
		</div>
	</section>

	<section class="wrap room">
		<ul class="docs">
			{#each documents as d (d.slug)}
				<li class="doc">
					<div class="doc__mark" aria-hidden="true">
						<svg viewBox="0 0 40 50" width="34" height="42" focusable="false">
							<path
								d="M4 2 h22 l10 10 v36 h-32 Z"
								fill="none"
								stroke="var(--ink)"
								stroke-width="1.6"
								stroke-linejoin="round"
							/>
							<path d="M26 2 v10 h10" fill="none" stroke="var(--ink)" stroke-width="1.6" />
							<path d="M10 24 h20 M10 31 h20 M10 38 h13" stroke="var(--accent)" stroke-width="1.6" />
						</svg>
					</div>
					<div>
						<h2>{d.title}</h2>
						<p class="doc__meta">
							{d.category} · published {new Date(d.published_at).toLocaleDateString('en-GB', {
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}
						</p>
						{#if d.summary}
							<p class="doc__summary">{d.summary}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		<p class="muted small">
			These documents are held in the room and read here; nothing is downloaded and no file is
			attached anywhere in this product.
		</p>
	</section>
{/if}

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.room,
	.notfound {
		padding-top: 2rem;
		padding-bottom: 4rem;
	}
	.notfound {
		padding-top: calc(var(--bar-h) + 4rem);
		max-width: 720px;
	}
	.docs {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}
	.doc {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		padding: 1rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		background: var(--paper);
	}
	.doc h2 {
		font-size: 1.1rem;
		margin: 0 0 0.2rem;
	}
	.doc__meta {
		margin: 0 0 0.4rem;
		font-size: 0.82rem;
		color: var(--ink-muted);
	}
	.doc__summary {
		margin: 0;
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.small {
		font-size: 0.84rem;
	}
</style>
