<script>
	import { api, ApiError } from '$lib/api.js';
	import { browser } from '$app/environment';

	export let data;

	let q = '';
	let category = '';
	let rows = data.faqs;
	let loading = false;
	let error = '';
	let first = true;

	$: categories = [...new Set(data.faqs.map((f) => f.category))];

	async function refresh() {
		loading = true;
		error = '';
		try {
			const p = new URLSearchParams();
			if (q.trim()) p.set('q', q.trim());
			if (category) p.set('category', category);
			const qs = p.toString();
			rows = await api(`/faqs${qs ? `?${qs}` : ''}`, { anonymous: true });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not search the questions.';
		} finally {
			loading = false;
		}
	}

	let t;
	$: if (browser && (q !== undefined || category !== undefined)) {
		if (first) first = false;
		else {
			clearTimeout(t);
			t = setTimeout(refresh, 140);
		}
	}
</script>

<svelte:head><title>FAQ | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">FAQ</p>
		<h1>Common questions</h1>
		<p class="lede">The things people ask us most, about the machine and about deploying it.</p>
	</div>
</section>

<section class="section-tight">
	<div class="wrap-narrow">
		<form class="filters" role="search" aria-label="Search questions" on:submit|preventDefault={refresh}>
			<div class="field">
				<label for="faq-q">Search the questions</label>
				<input id="faq-q" class="input" type="search" bind:value={q} placeholder="e.g. helium, operator" />
			</div>
			<div class="field">
				<label for="faq-cat">Category</label>
				<select id="faq-cat" class="select" bind:value={category}>
					<option value="">All categories</option>
					{#each categories as c}<option value={c}>{c}</option>{/each}
				</select>
			</div>
		</form>

		<p class="count muted" role="status" aria-live="polite">
			{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
			{rows.length} question{rows.length === 1 ? '' : 's'}
		</p>

		{#if error}
			<div class="banner banner-error" role="alert">
				<strong>Could not search</strong>{error}
				<p style="margin:8px 0 0"><button class="btn btn-sm" type="button" on:click={refresh}>Try again</button></p>
			</div>
		{:else if !rows.length}
			<div class="empty">
				<h2>Nothing matches that search</h2>
				<p>No question here uses those words. Clear the search, or ask us directly.</p>
				<button class="btn" type="button" on:click={() => { q = ''; category = ''; }}>Clear the search</button>
				<a class="btn btn-primary" href="/contact">Ask us</a>
			</div>
		{:else}
			<ul class="faqs">
				{#each rows as f (f.question)}
					<li>
						<details>
							<summary>
								<span class="q-text">{f.question}</span>
								<span class="q-cat">{f.category}</span>
							</summary>
							<p>{f.answer}</p>
						</details>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="more card">
			<h2>Still stuck?</h2>
			<p class="muted">If the answer is not here, ask us directly and we will come back to you.</p>
			<a class="btn btn-primary" href="/contact">Get in Touch</a>
		</div>
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.filters {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 14px;
	}
	.filters .field {
		margin-bottom: 0;
	}
	.count {
		font-size: 0.88rem;
		margin: 16px 0 10px;
	}
	.faqs {
		list-style: none;
		padding: 0;
		margin: 0 0 30px;
		border-top: 1px solid var(--rule);
	}
	.faqs li {
		border-bottom: 1px solid var(--rule);
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 15px 2px;
		cursor: pointer;
		min-height: 44px;
	}
	.q-text {
		font-weight: 600;
	}
	.q-cat {
		flex: none;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-muted);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 2px 9px;
		background: var(--paper-2);
	}
	details p {
		margin: 0 0 16px;
		color: var(--ink-muted);
	}
	.more h2 {
		font-size: 1.1rem;
	}
	.more p {
		margin-bottom: 14px;
	}
	@media (max-width: 560px) {
		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>
