
<script>
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { api, apiData, qs, getToken } from '$lib/api';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import Plate from '$lib/components/Plate.svelte';

	const INDUSTRIES = [
		'Oil and Gas',
		'Chemicals',
		'Transport',
		'Steel',
		'Mining',
		'Data Centres',
		'Communities',
		'Desalination'
	];
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

	let filters = $state({
		industry: page.url.searchParams.get('industry') || '',
		output_kind: page.url.searchParams.get('output_kind') || '',
		temperature_band: page.url.searchParams.get('temperature_band') || '',
		deployment: page.url.searchParams.get('deployment') || '',
		q: page.url.searchParams.get('q') || ''
	});

	let solutions = $state([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');

	let saveName = $state('');
	let saveBusy = $state(false);
	let saveMsg = $state(null);
	let signedIn = $state(false);
	let searches = $state([]);

	async function load() {
		loading = true;
		error = '';
		try {
			const res = await api(`/solutions${qs(filters)}`, { auth: false });
			solutions = res.data || [];
			total = Number(res.headers.get('X-Total-Count') ?? solutions.length);
		} catch (err) {
			error = err.message || 'The explorer could not load its results.';
			solutions = [];
			total = 0;
		} finally {
			loading = false;
		}
	}

	async function loadSearches() {
		if (!getToken()) {
			searches = [];
			return;
		}
		try {
			searches = (await apiData('/searches')) || [];
		} catch {
			searches = [];
		}
	}

	let mounted = $state(false);

	$effect(() => {
		// re-runs whenever any filter changes; each narrows the last
		const key = `${filters.industry}|${filters.output_kind}|${filters.temperature_band}|${filters.deployment}|${filters.q}`;
		void key;
		load();
		if (browser && mounted) {
			try {
				replaceState(`/solutions${qs(filters)}`, {});
			} catch {
				/* the router is not ready yet; the filters still hold */
			}
		}
	});

	$effect(() => {
		if (!browser) return;
		mounted = true;
		signedIn = !!getToken();
		loadSearches();
		const on = () => {
			signedIn = !!getToken();
			loadSearches();
		};
		window.addEventListener('zj:session', on);
		return () => window.removeEventListener('zj:session', on);
	});

	function clearAll() {
		filters = { industry: '', output_kind: '', temperature_band: '', deployment: '', q: '' };
	}

	let anyFilter = $derived(
		!!(
			filters.industry ||
			filters.output_kind ||
			filters.temperature_band ||
			filters.deployment ||
			filters.q
		)
	);

	async function saveSearch(e) {
		e.preventDefault();
		saveMsg = null;
		const name = saveName.trim();
		if (!name) {
			saveMsg = { kind: 'fail', text: 'Give the search a name before saving it.' };
			return;
		}
		saveBusy = true;
		try {
			const row = await apiData('/searches', { method: 'POST', body: { name, ...filters } });
			saveMsg = {
				kind: 'ok',
				text: `Saved as "${row.name}". Saving under the same name replaces its filters rather than adding a row.`
			};
			saveName = '';
			await loadSearches();
		} catch (err) {
			saveMsg = { kind: 'fail', text: err.message || 'That search could not be saved.' };
		} finally {
			saveBusy = false;
		}
	}

	function applySearch(s) {
		filters = {
			industry: s.industry || '',
			output_kind: s.output_kind || '',
			temperature_band: s.temperature_band || '',
			deployment: s.deployment || '',
			q: s.query || ''
		};
	}
</script>

<svelte:head>
	<title>Solutions, the industry explorer, Zettajoule</title>
</svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Solutions</p>
		<h1>What can this power?</h1>
		<p class="lede">
			Eight industries, one machine. Choose an industry, what you want out of it, how hot you need
			it and how it would be deployed. The grid narrows as you go.
		</p>
	</div>
</div>

<div class="wrap explorer">
	<form class="filters" aria-label="Filter the solutions" onsubmit={(e) => e.preventDefault()}>
		<div class="f">
			<label for="f-industry">Industry</label>
			<select id="f-industry" bind:value={filters.industry}>
				<option value="">All industries</option>
				{#each INDUSTRIES as i}<option value={i}>{i}</option>{/each}
			</select>
		</div>
		<div class="f">
			<label for="f-output">What you want out of it</label>
			<select id="f-output" bind:value={filters.output_kind}>
				<option value="">Any output</option>
				{#each OUTPUT_KINDS as [v, l]}<option value={v}>{l}</option>{/each}
			</select>
		</div>
		<div class="f">
			<label for="f-band">How hot you need it</label>
			<select id="f-band" bind:value={filters.temperature_band}>
				<option value="">Any temperature</option>
				{#each BANDS as b}<option value={b}>{b}</option>{/each}
			</select>
		</div>
		<div class="f">
			<label for="f-deploy">How it would be deployed</label>
			<select id="f-deploy" bind:value={filters.deployment}>
				<option value="">Any deployment</option>
				{#each DEPLOYMENTS as [v, l]}<option value={v}>{l}</option>{/each}
			</select>
		</div>
		<div class="f f-search">
			<label for="f-q">Search in plain language</label>
			<input
				id="f-q"
				type="search"
				bind:value={filters.q}
				placeholder="for example, hydrogen for a mill"
			/>
		</div>
		<div class="f f-clear">
			<button class="btn btn-secondary btn-sm" type="button" onclick={clearAll} disabled={!anyFilter}>
				Clear filters
			</button>
		</div>
	</form>

	<div class="count-row">
		<p class="count" aria-live="polite" data-testid="result-count">
			{#if loading}
				Counting the solutions that fit
			{:else}
				Showing <strong>{total}</strong> of 8 solutions
			{/if}
		</p>
		{#if signedIn}
			<form class="save-search" onsubmit={saveSearch}>
				<label class="visually-hidden" for="search-name">Name this search</label>
				<input
					id="search-name"
					type="text"
					bind:value={saveName}
					placeholder="Name this search"
					maxlength="80"
				/>
				<button class="btn btn-sm btn-quiet" type="submit" disabled={saveBusy}>
					{#if saveBusy}<span class="spinner" aria-hidden="true"></span>{/if}
					Save search
				</button>
			</form>
		{:else}
			<p class="muted small"><a href="/signin?next=/solutions">Sign in</a> to save this search.</p>
		{/if}
	</div>

	{#if saveMsg}
		<div class="banner banner-{saveMsg.kind === 'ok' ? 'ok' : 'fail'}" role="status">
			{saveMsg.text}
		</div>
	{/if}

	{#if searches.length}
		<div class="saved-strip">
			<span class="muted small">Saved searches:</span>
			{#each searches as s}
				<button class="chip" type="button" onclick={() => applySearch(s)}>{s.name}</button>
			{/each}
		</div>
	{/if}

	{#if error}
		<div class="banner banner-fail" role="alert">
			<strong>The explorer could not load.</strong>
			{error} Adjust a filter or reload the page to try again.
		</div>
	{/if}

	{#if loading}
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading solutions</div>
		<div class="cards" aria-hidden="true">
			{#each [1, 2, 3, 4] as n (n)}
				<div class="card card-tight"><div class="skeleton" style="height:150px"></div></div>
			{/each}
		</div>
	{:else if solutions.length === 0}
		<div class="empty">
			<h3>No solution matches those filters</h3>
			<p>
				Nothing in the eight fits that combination of industry, output, temperature and deployment.
			</p>
			<button class="btn btn-secondary" type="button" onclick={clearAll}>Clear the filters</button>
		</div>
	{:else}
		<ul class="cards" data-testid="solution-grid">
			{#each solutions as s (s.slug)}
				<li class="card card-tight sol" data-slug={s.slug}>
					<Plate seed={s.slug} height={78} />
					<h2><a href="/solutions/{s.slug}">{s.title}</a></h2>
					<p class="sol-summary">{s.summary}</p>
					<ul class="tags" aria-label="Attributes of {s.title}">
						<li class="pill">
							{OUTPUT_KINDS.find((o) => o[0] === s.output_kind)?.[1] ?? s.output_kind}
						</li>
						<li class="pill">{s.temperature_band}</li>
						<li class="pill">{s.deployment === 'single-module' ? 'Single module' : 'Multi module'}</li>
						<li class="pill">{s.module_count} {s.module_count === 1 ? 'module' : 'modules'}</li>
					</ul>
					<div class="sol-actions">
						<SaveButton slug={s.slug} title={s.title} />
						<a class="btn btn-sm btn-secondary" href="/solutions/{s.slug}">Open</a>
					</div>
				</li>
			{/each}
		</ul>

		<!-- a plain list version, so no information is only reachable by aiming -->
		<details class="plain">
			<summary>Read these {total} results as a plain list</summary>
			<ol>
				{#each solutions as s (s.slug)}
					<li>
						<strong>{s.title}</strong>, output {s.output_kind}, temperature {s.temperature_band},
						{s.deployment}, {s.module_count} modules.
					</li>
				{/each}
			</ol>
		</details>
	{/if}

	<p class="foot-note muted">
		Saved solutions sit side by side at <a href="/compare">/compare</a>, up to four at a time. You can
		save before you have an account.
	</p>
</div>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 42px 0 34px;
	}
	.head h1 {
		margin-bottom: 10px;
	}
	.explorer {
		padding-top: 22px;
		padding-bottom: 60px;
	}
	.filters {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		align-items: end;
		padding: 16px;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	.f-search {
		grid-column: span 3;
	}
	.f-clear {
		display: flex;
		align-items: flex-end;
	}
	.count-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
		margin: 16px 0 10px;
	}
	.count {
		margin: 0;
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.save-search {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.save-search input {
		min-width: 190px;
		min-height: 38px;
	}
	.small {
		font-size: 0.87rem;
		margin: 0;
	}
	.saved-strip {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}
	.chip {
		border: var(--hair) solid var(--rule);
		background: var(--surface-sunk);
		border-radius: 999px;
		padding: 5px 13px;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		min-height: 32px;
	}
	.chip:hover {
		border-color: var(--accent);
		color: var(--accent-hover);
	}

	/* compact density: a full filtered set fits one screen */
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}
	.sol h2 {
		font-size: 1.02rem;
		margin: 10px 0 5px;
	}
	.sol h2 a {
		color: var(--ink);
		text-decoration: none;
	}
	.sol h2 a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.sol-summary {
		font-size: 0.82rem;
		color: var(--ink-muted);
		line-height: 1.45;
		margin: 0 0 9px;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin: 0 0 11px;
		padding: 0;
	}
	.tags .pill {
		font-size: 0.68rem;
		padding: 2px 8px;
	}
	.sol-actions {
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
		align-items: center;
	}
	.plain {
		margin-top: 22px;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius);
		padding: 12px 16px;
	}
	.plain summary {
		cursor: pointer;
		font-weight: 650;
	}
	.foot-note {
		margin-top: 26px;
		font-size: 0.9rem;
	}

	@media (max-width: 1080px) {
		.cards {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@media (max-width: 880px) {
		.filters {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.f-search {
			grid-column: span 2;
		}
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 620px) {
		.filters {
			grid-template-columns: minmax(0, 1fr);
		}
		.f-search {
			grid-column: span 1;
		}
		/* the row becomes a single-card swipe on a phone. `contain: paint` keeps
		   the scrolled row out of the document scroll width, so the layout holds
		   with no horizontal scrollbar on the page itself. */
		.cards {
			display: flex;
			width: 100%;
			max-width: 100%;
			min-width: 0;
			overflow-x: auto;
			contain: paint;
			scroll-snap-type: x mandatory;
			-webkit-overflow-scrolling: touch;
		}
		.cards > li {
			flex: 0 0 86%;
			min-width: 0;
			scroll-snap-align: start;
		}
	}
</style>
