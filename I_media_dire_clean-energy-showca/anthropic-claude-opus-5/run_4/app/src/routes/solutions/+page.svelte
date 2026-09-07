<script>
	/* The explorer. Four filters combine, each narrowing the last, and the grid
	   states how many of the eight it shows. */
	import { onMount } from 'svelte';
	import { apiWithCount, api, getToken, ApiError } from '$lib/api.js';
	import { account } from '$lib/session.js';
	import Plate from '$lib/components/Plate.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';

	export let data;

	const OUTPUT_KINDS = [
		{ value: 'heat', label: 'Heat' },
		{ value: 'heat-and-power', label: 'Heat and power' },
		{ value: 'hydrogen', label: 'Hydrogen' },
		{ value: 'electricity', label: 'Electricity' }
	];
	const BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
	const DEPLOYMENTS = [
		{ value: 'single-module', label: 'Single module' },
		{ value: 'multi-module', label: 'Multi module' }
	];

	let filters = { ...data.filters };
	let solutions = data.solutions;
	let total = data.total;
	let totalAll = data.all.length;
	let loading = false;
	let error = '';
	let mounted = false;

	const industries = [...new Set(data.all.map((s) => s.industry))].sort();

	// saved-search island state
	let searchName = '';
	let searchBusy = false;
	let searchBanner = null;

	function queryString(f) {
		const qs = new URLSearchParams();
		for (const [k, v] of Object.entries(f)) if (v) qs.set(k, v);
		return qs.toString();
	}

	async function apply() {
		loading = true;
		error = '';
		const qs = queryString(filters);
		try {
			const res = await apiWithCount(`/solutions${qs ? `?${qs}` : ''}`);
			solutions = res.items;
			total = res.total;
			if (typeof history !== 'undefined') {
				history.replaceState({}, '', qs ? `/solutions?${qs}` : '/solutions');
			}
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'The explorer could not reach the server. Try again.';
		} finally {
			loading = false;
		}
	}

	function onFilterChange() {
		if (!mounted) return;
		apply();
	}

	function clearAll() {
		filters = { industry: '', output_kind: '', temperature_band: '', deployment: '', q: '' };
		apply();
	}

	async function saveSearch() {
		searchBanner = null;
		if (!searchName.trim()) {
			searchBanner = { kind: 'fail', text: 'Give the search a name before saving it.' };
			return;
		}
		searchBusy = true;
		try {
			const row = await api('/searches', {
				method: 'POST',
				body: {
					name: searchName.trim(),
					query: filters.q,
					industry: filters.industry,
					output_kind: filters.output_kind,
					temperature_band: filters.temperature_band,
					deployment: filters.deployment
				}
			});
			searchBanner = { kind: 'ok', text: `Saved as "${row.name}". Reusing the same name replaces its filters.` };
			searchName = '';
		} catch (err) {
			searchBanner = {
				kind: 'fail',
				text: err instanceof ApiError ? err.message : 'The search could not be saved.'
			};
		} finally {
			searchBusy = false;
		}
	}

	onMount(() => {
		mounted = true;
	});

	$: activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'q').length;
</script>

<svelte:head>
	<title>Solutions explorer, Zettajoule</title>
	<meta name="description" content="Filter eight industry solutions by industry, output, temperature band and deployment." />
</svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Solutions</p>
	<h1>What can this power?</h1>
	<p class="lede">
		Eight industries, one module family. Choose an industry, what you want out of it, how hot you need it and
		how it would be deployed. The count below reads how many of the eight are showing.
	</p>
</section>

<section class="wrap explorer" aria-labelledby="filters-heading">
	<h2 id="filters-heading" class="visually-hidden">Filters</h2>
	<div class="filters">
		<div class="filters__row">
			<div class="filters__field">
				<label for="f-industry">Industry</label>
				<select id="f-industry" bind:value={filters.industry} on:change={onFilterChange}>
					<option value="">All industries</option>
					{#each industries as industry}
						<option value={industry}>{industry}</option>
					{/each}
				</select>
			</div>
			<div class="filters__field">
				<label for="f-output">Output</label>
				<select id="f-output" bind:value={filters.output_kind} on:change={onFilterChange}>
					<option value="">All outputs</option>
					{#each OUTPUT_KINDS as o}
						<option value={o.value}>{o.label}</option>
					{/each}
				</select>
			</div>
			<div class="filters__field">
				<label for="f-band">Temperature</label>
				<select id="f-band" bind:value={filters.temperature_band} on:change={onFilterChange}>
					<option value="">Any temperature</option>
					{#each BANDS as band}
						<option value={band}>{band}</option>
					{/each}
				</select>
			</div>
			<div class="filters__field">
				<label for="f-deployment">Deployment</label>
				<select id="f-deployment" bind:value={filters.deployment} on:change={onFilterChange}>
					<option value="">Any deployment</option>
					{#each DEPLOYMENTS as d}
						<option value={d.value}>{d.label}</option>
					{/each}
				</select>
			</div>
			<div class="filters__field filters__field--wide">
				<label for="f-q">Search</label>
				<input
					id="f-q"
					type="search"
					placeholder="Plain language, for example hydrogen steel"
					bind:value={filters.q}
					on:input={onFilterChange}
				/>
			</div>
		</div>

		<div class="filters__foot">
			<p class="count" role="status" aria-live="polite" data-testid="result-count">
				{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
				Showing <strong data-testid="count-shown">{total}</strong> of {totalAll} solutions
				{#if activeCount}<span class="count__filters">({activeCount} filter{activeCount === 1 ? '' : 's'} applied)</span>{/if}
			</p>
			{#if activeCount || filters.q}
				<button class="btn btn--ghost btn--small" type="button" on:click={clearAll}>Clear filters</button>
			{/if}
		</div>

		{#if $account}
			<div class="savesearch">
				<label for="save-search-name">Save this search</label>
				<div class="savesearch__row">
					<input id="save-search-name" type="text" bind:value={searchName} placeholder="For example Hydrogen sites" />
					<button class="btn btn--small" type="button" on:click={saveSearch} disabled={searchBusy}>
						{#if searchBusy}<span class="spinner" aria-hidden="true"></span>{/if}
						Save search
					</button>
				</div>
				{#if searchBanner}
					<div class="banner banner--{searchBanner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
						{searchBanner.text}
					</div>
				{/if}
			</div>
		{:else}
			<p class="savesearch__hint">
				<a href="/signin?next=%2Fsolutions">Sign in</a> to save this search and come back to it.
			</p>
		{/if}
	</div>

	{#if error}
		<div class="banner banner--fail" role="alert">
			<span class="banner__title">The explorer could not load</span>
			{error} Adjust a filter or reload the page.
		</div>
	{/if}

	{#if loading}
		<div class="grid grid--3" aria-hidden="true">
			{#each [1, 2, 3] as i}
				<div class="card"><div class="skeleton" style="height:120px"></div><div class="skeleton"></div><div class="skeleton" style="width:60%"></div></div>
			{/each}
		</div>
	{:else if solutions.length === 0}
		<div class="empty">
			<p><strong>No solution matches those four filters.</strong></p>
			<p>Nothing in the eight fits that combination of output, temperature and deployment.</p>
			<button class="btn" type="button" on:click={clearAll}>Clear the filters</button>
		</div>
	{:else}
		<ul class="cards" data-testid="solution-grid">
			{#each solutions as solution (solution.slug)}
				<li class="scard" data-slug={solution.slug}>
					<a class="scard__link" href="/solutions/{solution.slug}">
						<Plate seed={solution.slug} label="Generated plate for {solution.industry}" ratio="16 / 9" />
						<span class="scard__industry">{solution.industry}</span>
						<span class="scard__title">{solution.title}</span>
					</a>
					<p class="scard__summary">{solution.summary}</p>
					<ul class="scard__meta">
						<li><span class="k">Output</span> {solution.output_kind}</li>
						<li><span class="k">Temperature</span> {solution.temperature_band}</li>
						<li><span class="k">Deployment</span> {solution.deployment}</li>
						<li><span class="k">Modules</span> {solution.module_count}</li>
					</ul>
					<div class="scard__actions">
						<SaveButton slug={solution.slug} small />
						<a class="btn btn--ghost btn--small" href="/solutions/{solution.slug}">Open</a>
					</div>
				</li>
			{/each}
		</ul>

		<!-- The plain list version of the grid, so nothing is only in the cards. -->
		<details class="plainlist">
			<summary>Read this result as a plain list</summary>
			<ol>
				{#each solutions as s}
					<li>
						<strong>{s.industry}</strong>: {s.title}. Output {s.output_kind}, temperature
						{s.temperature_band}, {s.deployment}, {s.module_count} module{s.module_count === 1 ? '' : 's'}.
					</li>
				{/each}
			</ol>
		</details>
	{/if}
</section>

<section class="section wrap">
	<div class="banner banner--info">
		<span class="banner__title">Comparing</span>
		Save up to four solutions and put them side by side at <a href="/compare">/compare</a>. Saving works before
		you have an account; signing in brings your saves with you.
	</div>
</section>

<style>
	.explorer {
		padding-bottom: 2rem;
	}
	.filters {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
		margin-bottom: 1.25rem;
		background: var(--paper);
	}
	.filters__row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}
	.filters__field--wide {
		grid-column: span 2;
	}
	.filters__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-top: 0.9rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--rule);
	}
	.count {
		margin: 0;
		font-size: 0.95rem;
	}
	.count strong {
		font-family: var(--font-head);
		font-size: 1.15rem;
	}
	.count__filters {
		color: var(--ink-muted);
		font-size: 0.85rem;
	}
	.savesearch {
		margin-top: 0.9rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--rule);
	}
	.savesearch__row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.savesearch__row input {
		flex: 1;
		min-width: 200px;
	}
	.savesearch .banner {
		margin: 0.6rem 0 0;
	}
	.savesearch__hint {
		margin: 0.9rem 0 0;
		padding-top: 0.9rem;
		border-top: 1px solid var(--rule);
		font-size: 0.88rem;
		color: var(--ink-muted);
	}

	/* compact card-grid work surface */
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 0.75rem;
	}
	.scard {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		background: var(--paper);
	}
	.scard:hover {
		border-color: var(--rule-strong);
	}
	.scard__link {
		text-decoration: none;
		color: var(--ink);
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.scard__link:hover .scard__industry {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.scard__industry {
		font-family: var(--font-head);
		font-size: 1.05rem;
		margin-top: 0.4rem;
	}
	.scard__title {
		font-size: 0.85rem;
		color: var(--ink-muted);
		line-height: 1.35;
	}
	.scard__summary {
		font-size: 0.82rem;
		color: var(--ink-muted);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.scard__meta {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0 0;
		border-top: 1px solid var(--rule);
		font-size: 0.76rem;
		font-family: var(--font-mono);
		color: var(--ink-muted);
	}
	.scard__meta .k {
		display: inline-block;
		min-width: 6.5em;
		color: var(--ink-faint);
	}
	.scard__actions {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
		padding-top: 0.5rem;
	}
	.plainlist {
		margin-top: 1.5rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
	}
	.plainlist summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.plainlist ol {
		margin: 0.75rem 0 0;
		padding-left: 1.2rem;
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.plainlist li {
		margin-bottom: 0.4rem;
	}

	@media (max-width: 640px) {
		.filters__field--wide {
			grid-column: span 1;
		}
		.cards {
			grid-template-columns: 1fr;
		}
	}
</style>
