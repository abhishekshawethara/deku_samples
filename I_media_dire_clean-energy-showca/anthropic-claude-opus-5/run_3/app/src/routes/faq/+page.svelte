<script>
	import { api } from '$lib/api.js';

	let { data } = $props();

	let query = $state('');
	let category = $state('');
	let rows = $state([...data.faqs]);
	let busy = $state(false);

	const categories = $derived([...new Set(data.faqs.map((f) => f.category))]);

	async function search() {
		busy = true;
		try {
			const params = new URLSearchParams();
			if (query.trim()) params.set('q', query.trim());
			if (category) params.set('category', category);
			const qs = params.toString();
			const { data: found } = await api(`/faqs${qs ? `?${qs}` : ''}`, { auth: false });
			rows = found;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>FAQ · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">FAQ</p>
		<h1>Common questions</h1>
		<p class="lede">The technology and how a deployment actually works.</p>
	</div>
</section>

<section class="wrap faq">
	<form class="faq__filters" onsubmit={(e) => (e.preventDefault(), search())} role="search">
		<div class="field">
			<label for="q">Search the questions</label>
			<input
				id="q"
				type="search"
				bind:value={query}
				oninput={search}
				placeholder="helium, fuel, modules"
			/>
		</div>
		<div class="field">
			<label for="cat">Category</label>
			<select id="cat" bind:value={category} onchange={search}>
				<option value="">All categories</option>
				{#each categories as c}
					<option value={c}>{c}</option>
				{/each}
			</select>
		</div>
	</form>

	<p class="count" role="status" aria-live="polite">
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		Showing {rows.length} of {data.faqs.length}
	</p>

	{#if rows.length === 0}
		<div class="empty-state">
			<p><strong>No question matches that.</strong> Nothing here answers what you typed.</p>
			<div class="row" style="justify-content:center">
				<button
					class="btn btn--ghost"
					type="button"
					onclick={() => {
						query = '';
						category = '';
						search();
					}}>Clear the search</button
				>
				<a class="btn" href="/contact">Ask us directly</a>
			</div>
		</div>
	{:else}
		<ul class="qs">
			{#each rows as f (f.question)}
				<li>
					<details>
						<summary>
							<span class="q">{f.question}</span>
							<span class="cat">{f.category}</span>
						</summary>
						<p>{f.answer}</p>
					</details>
				</li>
			{/each}
		</ul>
	{/if}

	<p class="muted">
		Still stuck? <a href="/contact">Send an enquiry</a> and you will get a reference back.
	</p>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.faq {
		padding-bottom: 4rem;
		max-width: 860px;
	}
	.faq__filters {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 0.75rem;
	}
	.count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.92rem;
		color: var(--ink-muted);
	}
	.qs {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		border-top: 1px solid var(--rule);
	}
	.qs li {
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
	.cat {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--ink-muted);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
		flex: none;
	}
	details p {
		margin: 0 0 1rem;
		color: var(--ink-muted);
	}
	@media (max-width: 560px) {
		.faq__filters {
			grid-template-columns: 1fr;
		}
	}
</style>
