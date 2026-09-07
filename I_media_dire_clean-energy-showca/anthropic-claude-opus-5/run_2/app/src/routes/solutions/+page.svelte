<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { api } from '$lib/api.js';
	import { token, saveToken, compareList, account } from '$lib/session.js';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import Plate from '$lib/components/Plate.svelte';

	export let data;

	const OUTPUT_KINDS = [
		['heat', 'Heat'],
		['heat-and-power', 'Heat and power'],
		['hydrogen', 'Hydrogen'],
		['electricity', 'Electricity']
	];
	const BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
	const DEPLOYMENTS = [
		['single-module', 'Single module'],
		['multi-module', 'Multi module']
	];

	let solutions = data.solutions;
	let total = data.total || 8;
	let filters = { ...data.filters };
	let industries = [...new Set(data.industries)].sort();
	let loading = false;
	let error = '';
	let savesById = new Map();
	let saveError = '';
	let searchName = '';
	let searchBusy = false;
	let searchBanner = null;

	$: filters = { ...data.filters };
	$: solutions = data.solutions;
	$: total = data.total || 8;
	$: activeCount = Object.values(filters).filter(Boolean).length;

	async function apply(next) {
		const params = new URLSearchParams();
		for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
		loading = true;
		await goto(`/solutions${params.toString() ? '?' + params.toString() : ''}`, {
			keepFocus: true,
			noScroll: true
		});
		loading = false;
	}

	function setFilter(key, value) {
		apply({ ...filters, [key]: value });
	}

	function clearAll() {
		apply({ industry: '', output_kind: '', temperature_band: '', deployment: '', q: '' });
	}

	async function loadSaves() {
		try {
			let rows = [];
			if ($token) rows = await api('/api/saves', { token: $token });
			else if ($saveToken) rows = await api(`/api/saves?save_token=${encodeURIComponent($saveToken)}`);
			savesById = new Map(rows.map((r) => [r.slug, r.id]));
		} catch (err) {
			savesById = new Map();
		}
	}

	onMount(loadSaves);

	function onSaved(e) {
		const { slug, saved, id } = e.detail;
		const next = new Map(savesById);
		if (saved) next.set(slug, id);
		else next.delete(slug);
		savesById = next;
	}

	function toggleCompare(slug) {
		saveError = '';
		const list = [...$compareList];
		const at = list.indexOf(slug);
		if (at >= 0) {
			list.splice(at, 1);
			compareList.set(list);
			return;
		}
		if (list.length >= 4) {
			saveError = `The comparison holds at most four solutions. Remove one before adding ${slug}.`;
			return;
		}
		compareList.set([...list, slug]);
	}

	async function saveSearch() {
		searchBanner = null;
		const name = searchName.trim();
		if (!name) {
			searchBanner = { kind: 'error', text: 'Give the search a name before saving it.' };
			return;
		}
		searchBusy = true;
		try {
			const row = await api('/api/searches', {
				method: 'POST',
				token: $token,
				body: {
					name,
					query: filters.q || null,
					industry: filters.industry || null,
					output_kind: filters.output_kind || null,
					temperature_band: filters.temperature_band || null,
					deployment: filters.deployment || null
				}
			});
			searchBanner = { kind: 'success', text: `Saved the search "${row.name}". Find it in your account.` };
			searchName = '';
		} catch (err) {
			searchBanner = { kind: 'error', text: err.message || 'That search could not be saved.' };
		} finally {
			searchBusy = false;
		}
	}
</script>

<svelte:head><title>Solutions, the industry explorer</title></svelte:head>

<section class="section-tight head-band">
	<div class="wrap">
		<p class="eyebrow">Solutions</p>
		<h1>What can this power?</h1>
		<p class="lede">
			Eight industries. Choose an industry, what you want out of the module, how hot you need it and how it would
			be deployed. The grid narrows as you go.
		</p>
	</div>
</section>

<section class="explorer">
	<div class="wrap">
		<form class="filters" role="search" aria-label="Filter the solutions" on:submit|preventDefault>
			<div class="filter">
				<label for="f-industry">Industry</label>
				<select
					id="f-industry"
					value={filters.industry}
					on:change={(e) => setFilter('industry', e.currentTarget.value)}
				>
					<option value="">Any industry</option>
					{#each industries as ind}<option value={ind}>{ind}</option>{/each}
				</select>
			</div>
			<div class="filter">
				<label for="f-output">Output</label>
				<select
					id="f-output"
					value={filters.output_kind}
					on:change={(e) => setFilter('output_kind', e.currentTarget.value)}
				>
					<option value="">Any output</option>
					{#each OUTPUT_KINDS as [value, label]}<option {value}>{label}</option>{/each}
				</select>
			</div>
			<div class="filter">
				<label for="f-band">Temperature</label>
				<select
					id="f-band"
					value={filters.temperature_band}
					on:change={(e) => setFilter('temperature_band', e.currentTarget.value)}
				>
					<option value="">Any temperature</option>
					{#each BANDS as b}<option value={b}>{b}</option>{/each}
				</select>
			</div>
			<div class="filter">
				<label for="f-deploy">Deployment</label>
				<select
					id="f-deploy"
					value={filters.deployment}
					on:change={(e) => setFilter('deployment', e.currentTarget.value)}
				>
					<option value="">Any deployment</option>
					{#each DEPLOYMENTS as [value, label]}<option {value}>{label}</option>{/each}
				</select>
			</div>
			<div class="filter filter-q">
				<label for="f-q">Search</label>
				<input
					id="f-q"
					type="search"
					placeholder="hydrogen, steam, remote site"
					value={filters.q}
					on:change={(e) => setFilter('q', e.currentTarget.value)}
				/>
			</div>
		</form>

		<div class="count-row">
			<p class="count" role="status" aria-live="polite" data-testid="result-count">
				Showing <strong>{solutions.length}</strong> of {total} solutions
			</p>
			<div class="row">
				{#if activeCount > 0}
					<button type="button" class="btn btn-quiet btn-sm" on:click={clearAll}>Clear filters</button>
				{/if}
				{#if $token}
					<div class="save-search">
						<label class="visually-hidden" for="search-name">Name this search</label>
						<input id="search-name" type="text" placeholder="Name this search" bind:value={searchName} />
						<button type="button" class="btn btn-secondary btn-sm" on:click={saveSearch} disabled={searchBusy}>
							Save search
						</button>
					</div>
				{:else}
					<a class="btn btn-quiet btn-sm" href="/signin?next=/solutions">Sign in to save a search</a>
				{/if}
			</div>
		</div>

		{#if searchBanner}
			<div class="banner banner-{searchBanner.kind}" role="status">
				<strong>{searchBanner.kind === 'error' ? 'Not saved.' : 'Saved.'}</strong>
				{searchBanner.text}
			</div>
		{/if}
		{#if saveError}
			<div class="banner banner-error" role="alert"><strong>Cannot compare.</strong> {saveError}</div>
		{/if}

		{#if loading}
			<p class="loading-note"><span class="spinner" aria-hidden="true"></span> Narrowing the grid</p>
		{/if}

		{#if solutions.length === 0}
			<div class="empty-state">
				<h3>No solution matches those four filters</h3>
				<p>Nothing in the eight fits that combination. Widen one of the filters, or start again.</p>
				<button type="button" class="btn btn-secondary" on:click={clearAll}>Clear the filters</button>
			</div>
		{:else}
			<ul class="cards" data-testid="solution-grid">
				{#each solutions as s (s.slug)}
					<li class="scard">
						<a class="scard-open" href={`/solutions/${s.slug}`}>
							<Plate seed={s.slug} ratio="5 / 2" kind="industry" />
							<h2>{s.industry}</h2>
							<p class="scard-title">{s.title}</p>
							<p class="scard-summary dense">{s.summary}</p>
						</a>
						<dl class="specs dense">
							<div><dt>Output</dt><dd>{s.output_kind}</dd></div>
							<div><dt>Temperature</dt><dd>{s.temperature_band}</dd></div>
							<div><dt>Deployment</dt><dd>{s.deployment}</dd></div>
							<div><dt>Modules</dt><dd>{s.module_count}</dd></div>
						</dl>
						<div class="scard-actions">
							<SaveButton
								slug={s.slug}
								compact={true}
								saved={savesById.has(s.slug)}
								savedId={savesById.get(s.slug) ?? null}
								on:changed={onSaved}
							/>
							<button
								type="button"
								class="btn btn-quiet btn-sm"
								aria-pressed={$compareList.includes(s.slug)}
								on:click={() => toggleCompare(s.slug)}
							>
								{$compareList.includes(s.slug) ? 'In comparison' : 'Compare'}
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		<details class="plain">
			<summary>The grid as a plain list</summary>
			<ul>
				{#each solutions as s}
					<li>
						{s.industry}: {s.title}. Output {s.output_kind}, temperature {s.temperature_band}, deployment
						{s.deployment}, {s.module_count} modules.
					</li>
				{/each}
			</ul>
		</details>
	</div>
</section>

{#if $compareList.length}
	<div class="tray" role="region" aria-label="Comparison tray">
		<div class="wrap tray-inner">
			<p class="dense">
				<strong>{$compareList.length} of 4</strong> in the comparison: {$compareList.join(', ')}
			</p>
			<div class="row">
				<a class="btn btn-sm" href={`/compare?slugs=${$compareList.join(',')}`}>Compare them</a>
				<button type="button" class="btn btn-quiet btn-sm" on:click={() => compareList.set([])}>Clear</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.head-band {
		border-bottom: 1px solid var(--rule);
	}
	.explorer {
		padding: 24px 0 72px;
		background: #fff;
	}
	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
		padding: 16px 0 18px;
		border-bottom: 1px solid var(--rule);
	}
	.filter-q {
		grid-column: span 1;
	}
	.count-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding: 14px 0;
	}
	.count {
		margin: 0;
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1rem;
	}
	.count strong {
		font-size: 1.25rem;
	}
	.save-search {
		display: flex;
		gap: 8px;
	}
	.save-search input {
		min-width: 190px;
		min-height: 36px;
		padding: 6px 10px;
	}
	.cards {
		list-style: none;
		margin: 8px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
		gap: 14px;
	}
	.scard {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: #fff;
	}
	.scard:hover {
		border-color: var(--rule-strong);
	}
	.scard-open {
		text-decoration: none;
		color: var(--ink);
		display: block;
	}
	.scard h2 {
		font-size: 1.18rem;
		margin: 10px 0 2px;
	}
	.scard-title {
		font-weight: 600;
		margin: 0 0 6px;
		font-size: 0.95rem;
	}
	.scard-summary {
		color: var(--ink-muted);
		margin: 0;
	}
	.specs {
		margin: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px 10px;
		border-top: 1px solid var(--rule);
		padding-top: 10px;
	}
	.specs div {
		display: flex;
		gap: 6px;
	}
	.specs dt {
		color: var(--ink-muted);
	}
	.specs dd {
		margin: 0;
		font-weight: 600;
	}
	.scard-actions {
		display: flex;
		gap: 8px;
		margin-top: auto;
		flex-wrap: wrap;
	}
	.plain {
		margin-top: 32px;
		border-top: 1px solid var(--rule);
		padding-top: 14px;
		color: var(--ink-muted);
		font-size: 0.94rem;
	}
	.plain summary {
		cursor: pointer;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--ink);
	}
	.tray {
		position: sticky;
		bottom: 0;
		background: var(--navy);
		color: #e8eefb;
		padding: 12px 0;
		z-index: 90;
	}
	.tray-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}
	.tray p {
		margin: 0;
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--accent);
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
	}
	@media (max-width: 640px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}
</style>
