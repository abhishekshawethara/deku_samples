<script>
	import { api, ApiError } from '$lib/api.js';

	let { data } = $props();

	let q = $state('');
	let category = $state('');
	// null until the visitor searches, so the server-rendered set is what shows.
	let searched = $state(null);
	let busy = $state(false);
	let error = $state('');

	$effect(() => {
		data.faqs;
		searched = null;
	});

	const rows = $derived(searched ?? data.faqs);
	const categories = $derived([...new Set(data.faqs.map((f) => f.category))]);

	async function run() {
		busy = true;
		error = '';
		try {
			const p = new URLSearchParams();
			if (q.trim()) p.set('q', q.trim());
			if (category) p.set('category', category);
			const qs = p.toString();
			const { data: out } = await api(`/api/faqs${qs ? `?${qs}` : ''}`);
			searched = out;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'The search could not run.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>FAQ, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap-narrow">
		<p class="eyebrow">FAQ</p>
		<h1>{data.copy.lede?.heading || 'Common questions'}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap-narrow">
		<form
			class="search"
			role="search"
			onsubmit={(e) => {
				e.preventDefault();
				run();
			}}
		>
			<div class="f">
				<label for="faq-q">Search the questions</label>
				<input
					id="faq-q"
					type="search"
					bind:value={q}
					onchange={run}
					placeholder="helium, licence, land"
					data-testid="faq-search"
				/>
			</div>
			<div class="f">
				<label for="faq-cat">Category</label>
				<select
					id="faq-cat"
					bind:value={category}
					onchange={run}
				>
					<option value="">All categories</option>
					{#each categories as c}
						<option value={c}>{c}</option>
					{/each}
				</select>
			</div>
			<button class="btn btn-quiet" type="submit" disabled={busy}>
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				Search
			</button>
		</form>

		{#if error}
			<p class="banner banner-error" role="alert">{error}</p>
		{/if}

		<p class="count mono" aria-live="polite">
			{rows.length} question{rows.length === 1 ? '' : 's'}
		</p>

		{#if rows.length === 0}
			<div class="empty">
				<h3>Nothing matches that</h3>
				<p>No question here uses those words. Clear the search, or ask us directly.</p>
				<div class="row">
					<button
						class="btn btn-primary btn-sm"
						type="button"
						onclick={() => {
							q = '';
							category = '';
							run();
						}}>Clear the search</button
					>
					<a class="btn btn-quiet btn-sm" href="/contact">Ask us</a>
				</div>
			</div>
		{:else}
			<ul class="faqs" data-testid="faq-list">
				{#each rows as f (f.question)}
					<li>
						<details>
							<summary>
								<span>{f.question}</span>
								<span class="badge">{f.category}</span>
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
	.head {
		padding: 40px 0 24px;
		border-bottom: 1px solid var(--rule);
	}
	.search {
		display: grid;
		grid-template-columns: 1.5fr 1fr auto;
		gap: 12px;
		align-items: end;
		margin-bottom: 18px;
	}
	.count {
		color: var(--ink-muted);
		font-size: 0.86rem;
	}
	.faqs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	details {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 4px 16px;
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		cursor: pointer;
		padding: 13px 0;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1rem;
		min-height: 44px;
	}
	details p {
		color: var(--ink-muted);
		margin: 0 0 14px;
		max-width: 68ch;
	}
	.row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	@media (max-width: 700px) {
		.search {
			grid-template-columns: 1fr;
		}
	}
</style>
