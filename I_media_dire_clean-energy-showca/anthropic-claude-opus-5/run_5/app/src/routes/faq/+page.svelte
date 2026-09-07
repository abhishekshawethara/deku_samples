
<script>
	import { apiData, qs } from '$lib/api';

	let q = $state('');
	let category = $state('');
	let faqs = $state([]);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		const key = `${q}|${category}`;
		void key;
		loading = true;
		error = '';
		apiData(`/faqs${qs({ q, category })}`, { auth: false })
			.then((d) => (faqs = d || []))
			.catch((err) => {
				error = err.message || 'The questions could not load.';
				faqs = [];
			})
			.finally(() => (loading = false));
	});

	const CATEGORIES = ['Technology', 'Deployment'];
</script>

<svelte:head><title>Common questions, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">FAQ</p>
		<h1>Common questions</h1>
		<p class="lede">
			What the machine is, how hot it runs, who operates it and how many modules a site needs.
			Search the set or filter it by category.
		</p>
	</div>
</div>

<div class="wrap-narrow section-tight faq">
	<form class="controls" onsubmit={(e) => e.preventDefault()}>
		<div class="field">
			<label for="q-search">Search the questions</label>
			<input id="q-search" type="search" bind:value={q} placeholder="for example, helium" />
		</div>
		<div class="field">
			<label for="q-cat">Category</label>
			<select id="q-cat" bind:value={category}>
				<option value="">All categories</option>
				{#each CATEGORIES as c}<option value={c}>{c}</option>{/each}
			</select>
		</div>
	</form>

	{#if error}
		<div class="banner banner-fail" role="alert">
			<strong>The questions could not load.</strong>
			{error} Clear the search and try again.
		</div>
	{/if}

	{#if loading}
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading questions</div>
	{:else if faqs.length === 0}
		<div class="empty">
			<h3>No question matches that search</h3>
			<p>Nothing here answers "{q || category}". Clear it, or ask us directly.</p>
			<button
				class="btn btn-sm btn-secondary"
				type="button"
				onclick={() => {
					q = '';
					category = '';
				}}>Clear the search</button
			>
			<a class="btn btn-sm btn-quiet" href="/contact">Ask a question</a>
		</div>
	{:else}
		<p class="count muted" aria-live="polite">
			{faqs.length} question{faqs.length === 1 ? '' : 's'}
		</p>
		<ul class="qs" data-testid="faq-list">
			{#each faqs as f (f.question)}
				<li>
					<details>
						<summary>
							<span>{f.question}</span>
							<span class="pill">{f.category}</span>
						</summary>
						<p>{f.answer}</p>
					</details>
				</li>
			{/each}
		</ul>
	{/if}

	<hr class="rule" />
	<p class="muted">
		Still unanswered? <a href="/contact">Send an enquiry</a> and you get a reference back straight
		away.
	</p>
</div>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 42px 0 32px;
	}
	.faq {
		padding-bottom: 60px;
	}
	.controls {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: 14px;
		margin-bottom: 18px;
	}
	.count {
		font-size: 0.88rem;
		margin: 0 0 10px;
	}
	.qs {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--hair) solid var(--rule);
	}
	.qs li {
		border-bottom: var(--hair) solid var(--rule);
	}
	details summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 15px 2px;
		cursor: pointer;
		font-weight: 650;
		min-height: 44px;
	}
	details summary:hover {
		color: var(--accent-hover);
	}
	details p {
		margin: 0 0 16px;
		color: var(--ink-muted);
		max-width: 68ch;
	}
	.empty .btn {
		margin: 0 4px;
	}
	@media (max-width: 620px) {
		.controls {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
