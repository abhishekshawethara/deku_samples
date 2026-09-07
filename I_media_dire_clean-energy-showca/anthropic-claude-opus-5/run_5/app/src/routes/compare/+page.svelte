
<script>
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { apiData, getToken, getSaveToken, ApiError } from '$lib/api';

	const MAX = 4;
	const OUT = {
		heat: 'Heat',
		'heat-and-power': 'Heat and power',
		hydrogen: 'Hydrogen',
		electricity: 'Electricity'
	};

	let slugs = $state(
		(page.url.searchParams.get('slugs') || '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	);
	let compared = $state([]);
	let saves = $state([]);
	let loading = $state(true);
	let refusal = $state('');
	let error = $state('');

	async function loadSaves() {
		const token = getToken();
		const st = getSaveToken();
		if (!token && !st) {
			saves = [];
			return;
		}
		try {
			saves = (await apiData(`/saves${!token && st ? `?save_token=${encodeURIComponent(st)}` : ''}`)) || [];
		} catch {
			saves = [];
		}
	}

	async function loadCompare() {
		loading = true;
		error = '';
		try {
			const q = slugs.length ? `?slugs=${slugs.map(encodeURIComponent).join(',')}` : '';
			compared = (await apiData(`/compare${q}`, { auth: false })) || [];
		} catch (err) {
			error = err.message || 'The comparison could not load.';
			compared = [];
		} finally {
			loading = false;
		}
	}

	let mounted = $state(false);

	$effect(() => {
		if (!browser) return;
		mounted = true;
		loadSaves();
		const on = () => loadSaves();
		window.addEventListener('zj:saves', on);
		window.addEventListener('zj:session', on);
		return () => {
			window.removeEventListener('zj:saves', on);
			window.removeEventListener('zj:session', on);
		};
	});

	$effect(() => {
		const key = slugs.join(',');
		void key;
		loadCompare();
		if (browser && mounted) {
			try {
				replaceState(`/compare${key ? `?slugs=${key}` : ''}`, {});
			} catch {
				/* the router is not ready yet; the comparison still holds */
			}
		}
	});

	async function add(slug) {
		refusal = '';
		if (slugs.includes(slug)) {
			refusal = `${slug} is already in the comparison.`;
			return;
		}
		const next = [...slugs, slug];
		if (next.length > MAX) {
			// the server is the authority: ask it and show its refusal in place
			try {
				await apiData(`/compare?slugs=${next.map(encodeURIComponent).join(',')}`, { auth: false });
			} catch (err) {
				refusal =
					err instanceof ApiError
						? `${err.message}. The four already compared are unchanged; remove one first.`
						: 'The comparison holds at most four solutions.';
				return;
			}
			refusal = 'The comparison holds at most four solutions. Remove one first.';
			return;
		}
		slugs = next;
	}

	function remove(slug) {
		refusal = '';
		slugs = slugs.filter((s) => s !== slug);
	}

	let addable = $derived(saves.filter((s) => !slugs.includes(s.slug)));
</script>

<svelte:head><title>Compare saved solutions, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Compare</p>
		<h1>Four saves side by side</h1>
		<p class="lede">
			The comparison holds at most four solutions at once. Add from your saves below; a fifth is
			refused and the four already compared stay as they are.
		</p>
	</div>
</div>

<div class="wrap section-tight">
	<div class="tray card">
		<div class="tray-head">
			<h2>Your saved solutions</h2>
			<p class="muted" data-testid="compare-count">
				<strong>{slugs.length}</strong> of {MAX} compared
			</p>
		</div>

		{#if saves.length === 0}
			<div class="empty">
				<h3>You have not saved a solution yet</h3>
				<p>Save a card in the explorer and it appears here, with or without an account.</p>
				<a class="btn btn-secondary" href="/solutions">Open the explorer</a>
			</div>
		{:else}
			<ul class="tray-list">
				{#each saves as s (s.slug)}
					<li>
						<span>{s.title}</span>
						{#if slugs.includes(s.slug)}
							<button class="btn btn-sm btn-secondary" type="button" onclick={() => remove(s.slug)}>
								Remove<span class="visually-hidden"> {s.title} from the comparison</span>
							</button>
						{:else}
							<button
								class="btn btn-sm btn-quiet"
								type="button"
								onclick={() => add(s.slug)}
								data-testid="add-{s.slug}"
							>
								Add<span class="visually-hidden"> {s.title} to the comparison</span>
							</button>
						{/if}
					</li>
				{/each}
			</ul>
			{#if addable.length === 0 && slugs.length}
				<p class="muted small">Everything you have saved is already in the comparison.</p>
			{/if}
		{/if}

		{#if refusal}
			<div class="banner banner-fail" role="alert" data-testid="compare-refusal">
				<strong>That fifth solution was not added.</strong>
				{refusal}
			</div>
		{/if}
	</div>
</div>

<div class="wrap section-tight">
	{#if loading}
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading the comparison</div>
	{:else if error}
		<div class="banner banner-fail" role="alert">
			<strong>The comparison could not load.</strong>
			{error} Remove a solution and try again.
		</div>
	{:else if compared.length === 0}
		<div class="empty">
			<h3>Nothing is being compared</h3>
			<p>Add up to four saved solutions above and they line up here attribute by attribute.</p>
			<a class="btn btn-secondary" href="/solutions">Find solutions to save</a>
		</div>
	{:else}
		<div class="table-scroll">
			<table data-testid="compare-table">
				<caption class="visually-hidden">Saved solutions compared attribute by attribute</caption>
				<thead>
					<tr>
						<th scope="col">Attribute</th>
						{#each compared as c (c.slug)}
							<th scope="col">{c.title}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope="row">Industry</th>
						{#each compared as c (c.slug)}<td>{c.industry}</td>{/each}
					</tr>
					<tr>
						<th scope="row">Output</th>
						{#each compared as c (c.slug)}<td>{OUT[c.output_kind] ?? c.output_kind}</td>{/each}
					</tr>
					<tr>
						<th scope="row">Temperature band</th>
						{#each compared as c (c.slug)}<td>{c.temperature_band}</td>{/each}
					</tr>
					<tr>
						<th scope="row">Deployment</th>
						{#each compared as c (c.slug)}
							<td>{c.deployment === 'single-module' ? 'Single module' : 'Multi module'}</td>
						{/each}
					</tr>
					<tr>
						<th scope="row">Modules</th>
						{#each compared as c (c.slug)}<td>{c.module_count}</td>{/each}
					</tr>
					<tr>
						<th scope="row">Summary</th>
						{#each compared as c (c.slug)}<td class="sum">{c.summary}</td>{/each}
					</tr>
					<tr>
						<th scope="row"><span class="visually-hidden">Actions</span></th>
						{#each compared as c (c.slug)}
							<td>
								<a class="btn btn-sm btn-secondary" href="/solutions/{c.slug}">Open</a>
								<button class="btn btn-sm btn-quiet" type="button" onclick={() => remove(c.slug)}>
									Remove<span class="visually-hidden"> {c.title}</span>
								</button>
							</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 40px 0 32px;
	}
	.tray-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 14px;
		flex-wrap: wrap;
	}
	.tray-head h2 {
		font-size: 1.15rem;
		margin: 0 0 10px;
	}
	.tray-list {
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
		display: grid;
		gap: 6px;
	}
	.tray-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 0;
		border-top: var(--hair) solid var(--rule);
		font-size: 0.92rem;
	}
	.small {
		font-size: 0.85rem;
	}
	.table-scroll {
		overflow-x: auto;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius-lg);
	}
	table {
		border-collapse: collapse;
		width: 100%;
		min-width: 620px;
		font-size: 0.9rem;
	}
	th,
	td {
		text-align: left;
		padding: 11px 14px;
		border-bottom: var(--hair) solid var(--rule);
		vertical-align: top;
	}
	thead th {
		font-family: var(--font-head);
		font-size: 0.95rem;
		background: var(--surface-sunk);
	}
	tbody th {
		font-weight: 650;
		color: var(--ink-muted);
		white-space: nowrap;
		width: 160px;
	}
	.sum {
		min-width: 200px;
		color: var(--ink-muted);
	}
	td .btn {
		margin: 0 4px 4px 0;
	}
</style>
