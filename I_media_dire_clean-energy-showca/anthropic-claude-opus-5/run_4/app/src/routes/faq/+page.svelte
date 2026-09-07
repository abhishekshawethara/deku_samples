<script>
	import { api, ApiError } from '$lib/api.js';

	export let data;

	let q = '';
	let category = '';
	let results = data.faqs;
	let loading = false;
	let error = '';

	const categories = [...new Set(data.faqs.map((f) => f.category))];

	let timer;
	function onSearch() {
		clearTimeout(timer);
		timer = setTimeout(run, 180);
	}

	async function run() {
		loading = true;
		error = '';
		const qs = new URLSearchParams();
		if (q.trim()) qs.set('q', q.trim());
		if (category) qs.set('category', category);
		try {
			results = await api(`/faqs${qs.toString() ? `?${qs}` : ''}`);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'The questions could not be searched.';
		} finally {
			loading = false;
		}
	}

	function clear() {
		q = '';
		category = '';
		run();
	}
</script>

<svelte:head>
	<title>Common questions, Zettajoule</title>
	<meta name="description" content="Common questions about the technology and about deployment." />
</svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">FAQ</p>
	<h1>Common questions</h1>
	<p class="lede">The things people ask most about the machine and about getting one onto a site.</p>
</section>

<section class="wrap section--tight">
	<div class="controls">
		<div class="field">
			<label for="faq-q">Search the questions</label>
			<input id="faq-q" type="search" bind:value={q} on:input={onSearch} placeholder="For example helium, fuel, deployment" />
		</div>
		<div class="field">
			<label for="faq-cat">Category</label>
			<select id="faq-cat" bind:value={category} on:change={run}>
				<option value="">All categories</option>
				{#each categories as c}
					<option value={c}>{c}</option>
				{/each}
			</select>
		</div>
	</div>

	<p class="count" role="status" aria-live="polite">
		{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
		{results.length} question{results.length === 1 ? '' : 's'}
	</p>

	{#if error}
		<div class="banner banner--fail" role="alert"><span class="banner__title">Search failed</span>{error}</div>
	{/if}

	{#if results.length === 0}
		<div class="empty">
			<p><strong>No question matches that search.</strong></p>
			<p>Nothing in the list mentions it. Try a broader word, or ask us directly.</p>
			<button class="btn btn--ghost" type="button" on:click={clear}>Clear the search</button>
			<a class="btn" href="/contact">Ask a question</a>
		</div>
	{:else}
		<ul class="faqs">
			{#each results as faq (faq.question)}
				<li>
					<details>
						<summary>
							<span class="q">{faq.question}</span>
							<span class="chip">{faq.category}</span>
						</summary>
						<p>{faq.answer}</p>
					</details>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.controls {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
		margin-bottom: 1rem;
	}
	.controls .field {
		margin: 0;
	}
	.count {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.faqs {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--rule);
	}
	.faqs li {
		border-bottom: 1px solid var(--rule);
	}
	details summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 0;
		cursor: pointer;
		min-height: 44px;
	}
	.q {
		font-family: var(--font-head);
		font-size: 1.02rem;
	}
	details p {
		margin: 0 0 1rem;
		color: var(--ink-muted);
		max-width: 70ch;
	}
	@media (max-width: 640px) {
		.controls {
			grid-template-columns: 1fr;
		}
	}
</style>
