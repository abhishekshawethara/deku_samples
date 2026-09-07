<script>
	export let data;
	let q = '';
	let category = '';

	$: categories = [...new Set(data.faqs.map((f) => f.category))];
	$: matches = data.faqs.filter((f) => {
		const text = (f.question + ' ' + f.answer).toLowerCase();
		return (!q.trim() || text.includes(q.trim().toLowerCase())) && (!category || f.category === category);
	});
</script>

<svelte:head><title>FAQ, Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap faq">
		<p class="eyebrow">FAQ</p>
		<h1>Common questions</h1>

		<form class="controls" role="search" on:submit|preventDefault>
			<div class="field">
				<label for="faq-q">Search the questions</label>
				<input id="faq-q" type="search" bind:value={q} placeholder="helium, licence, temperature" />
			</div>
			<div class="field">
				<label for="faq-cat">Category</label>
				<select id="faq-cat" bind:value={category}>
					<option value="">Every category</option>
					{#each categories as c}<option value={c}>{c}</option>{/each}
				</select>
			</div>
		</form>

		<p class="count dense" role="status">Showing {matches.length} of {data.faqs.length} questions</p>

		{#if matches.length === 0}
			<div class="empty-state">
				<h3>No question matches that search</h3>
				<p>Nothing here answers it yet. <a href="/contact">Send the question in</a> and a person will answer it.</p>
				<button type="button" class="btn btn-secondary" on:click={() => ((q = ''), (category = ''))}>Clear the search</button>
			</div>
		{:else}
			<ul class="list">
				{#each matches as f (f.question)}
					<li>
						<details>
							<summary>
								<span class="q">{f.question}</span>
								<span class="cat mono">{f.category}</span>
							</summary>
							<p>{f.answer}</p>
						</details>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.faq {
		max-width: 820px;
	}
	.controls {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 14px;
		margin: 20px 0 8px;
	}
	.count {
		color: var(--ink-muted);
	}
	.list {
		list-style: none;
		margin: 12px 0 0;
		padding: 0;
		border-top: 1px solid var(--rule);
	}
	.list li {
		border-bottom: 1px solid var(--rule);
	}
	summary {
		cursor: pointer;
		padding: 16px 4px;
		display: flex;
		justify-content: space-between;
		gap: 16px;
		align-items: center;
	}
	summary:hover .q {
		color: var(--accent-hover);
	}
	.q {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.05rem;
	}
	.cat {
		font-size: 0.76rem;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		padding: 2px 9px;
		color: var(--ink-muted);
		white-space: nowrap;
	}
	details p {
		margin: 0 0 18px;
		color: var(--ink-muted);
		max-width: 70ch;
	}
	@media (max-width: 600px) {
		.controls {
			grid-template-columns: 1fr;
		}
	}
</style>
