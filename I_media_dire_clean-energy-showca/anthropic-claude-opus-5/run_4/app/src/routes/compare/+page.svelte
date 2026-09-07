<script>
	/* The comparison holds at most four saves; a fifth is rejected as invalid
	   and the four already compared stay compared. */
	import { onMount } from 'svelte';
	import { api, apiWithCount, getToken, getSaveToken, ApiError } from '$lib/api.js';
	import { savedSlugs, refreshSaves } from '$lib/session.js';

	const MAX = 4;

	let loading = true;
	let saves = [];
	let chosen = [];
	let rows = [];
	let banner = null;
	let error = '';

	async function loadSaves() {
		loading = true;
		error = '';
		try {
			const token = getToken();
			const saveToken = getSaveToken();
			if (!token && !saveToken) {
				saves = [];
				chosen = [];
				rows = [];
				return;
			}
			saves = await api(`/saves${!token && saveToken ? `?save_token=${encodeURIComponent(saveToken)}` : ''}`);
			chosen = saves.slice(0, MAX).map((s) => s.slug);
			await compare();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Saved solutions could not be loaded.';
		} finally {
			loading = false;
		}
	}

	async function compare() {
		if (!chosen.length) {
			rows = [];
			return;
		}
		try {
			rows = await api(`/compare?slugs=${encodeURIComponent(chosen.join(','))}`);
		} catch (err) {
			// The server rejects a fifth slug; the four already compared stay compared.
			banner = {
				kind: 'fail',
				title: 'That comparison was refused',
				text: err instanceof ApiError ? err.message : 'The comparison could not be built.'
			};
		}
	}

	async function toggle(slug) {
		banner = null;
		if (chosen.includes(slug)) {
			chosen = chosen.filter((s) => s !== slug);
			await compare();
			return;
		}
		if (chosen.length >= MAX) {
			// Ask the server anyway so the refusal is the server's, not the UI's.
			try {
				await api(`/compare?slugs=${encodeURIComponent([...chosen, slug].join(','))}`);
			} catch (err) {
				banner = {
					kind: 'fail',
					title: 'Four is the limit',
					text:
						(err instanceof ApiError ? err.message : 'You can compare at most four saved solutions.') +
						' Remove one from the comparison to add another.'
				};
				return;
			}
			return;
		}
		chosen = [...chosen, slug];
		await compare();
	}

	onMount(async () => {
		await refreshSaves();
		await loadSaves();
	});

	const FIELDS = [
		['industry', 'Industry'],
		['output_kind', 'Output'],
		['temperature_band', 'Temperature band'],
		['deployment', 'Deployment'],
		['module_count', 'Modules']
	];
</script>

<svelte:head><title>Compare saved solutions, Zettajoule</title></svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Compare</p>
	<h1>Four saves, side by side</h1>
	<p class="lede">
		Pick up to four of your saved solutions and read them against each other. A fifth is refused: remove one
		first.
	</p>
</section>

<section class="wrap section--tight">
	{#if banner}
		<div class="banner banner--fail" role="alert" data-testid="compare-banner">
			<span class="banner__title">{banner.title}</span>
			{banner.text}
		</div>
	{/if}
	{#if error}
		<div class="banner banner--fail" role="alert">
			<span class="banner__title">Could not load your saves</span>{error}
		</div>
	{/if}

	{#if loading}
		<div class="card"><span class="spinner" aria-hidden="true"></span> Loading your saved solutions</div>
	{:else if saves.length === 0}
		<div class="empty">
			<p><strong>You have not saved a solution yet.</strong></p>
			<p>Save works before you have an account, and signing in brings your saves with you.</p>
			<a class="btn" href="/solutions">Open the explorer</a>
		</div>
	{:else}
		<div class="picker">
			<p class="picker__count" role="status" aria-live="polite">
				Comparing <strong data-testid="compare-count">{chosen.length}</strong> of {MAX}
			</p>
			<ul class="picker__list">
				{#each saves as save (save.id)}
					<li>
						<button
							type="button"
							class="pill"
							class:pill--on={chosen.includes(save.slug)}
							aria-pressed={chosen.includes(save.slug)}
							on:click={() => toggle(save.slug)}
							data-testid="compare-toggle-{save.slug}"
						>
							{#if chosen.includes(save.slug)}
								<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
									<path d="M2 6.5 L5 9.5 L10 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							{/if}
							{save.slug}
						</button>
					</li>
				{/each}
			</ul>
		</div>

		{#if rows.length}
			<div class="tablewrap">
				<table data-testid="compare-table">
					<caption class="visually-hidden">Saved solutions compared field by field</caption>
					<thead>
						<tr>
							<th scope="col">Field</th>
							{#each rows as r}
								<th scope="col">{r.industry}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each FIELDS as [key, label]}
							<tr>
								<th scope="row">{label}</th>
								{#each rows as r}
									<td>{r[key]}</td>
								{/each}
							</tr>
						{/each}
						<tr>
							<th scope="row">Summary</th>
							{#each rows as r}
								<td class="sum">{r.summary}</td>
							{/each}
						</tr>
						<tr>
							<th scope="row">Open</th>
							{#each rows as r}
								<td><a href="/solutions/{r.slug}">{r.slug}</a></td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		{:else}
			<div class="empty">
				<p><strong>Nothing selected to compare.</strong></p>
				<p>Choose up to four of the saves above.</p>
			</div>
		{/if}
	{/if}
</section>

<style>
	.picker {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.9rem;
		margin-bottom: 1.25rem;
	}
	.picker__count {
		margin: 0 0 0.6rem;
		font-size: 0.9rem;
	}
	.picker__count strong {
		font-family: var(--font-head);
	}
	.picker__list {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 40px;
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: var(--paper);
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--ink);
		cursor: pointer;
	}
	.pill:hover {
		border-color: var(--ink-muted);
		background: var(--paper-grey);
	}
	.pill--on {
		background: var(--accent-tint);
		border-color: var(--accent);
		color: var(--accent-hover);
		font-weight: 700;
	}
	.tablewrap {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}
	table {
		min-width: 620px;
	}
	.sum {
		font-size: 0.82rem;
		color: var(--ink-muted);
		min-width: 200px;
	}
</style>
