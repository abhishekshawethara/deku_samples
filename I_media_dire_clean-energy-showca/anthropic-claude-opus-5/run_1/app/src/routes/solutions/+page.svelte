<script>
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import Plate from '$lib/components/Plate.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { account, currentToken } from '$lib/session.js';

	let { data } = $props();

	const OUTPUTS = [
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

	// `live` holds what the visitor has filtered to in the browser. Until they
	// touch a filter it is null and the server-rendered result is what shows, so
	// following an already-filtered link into this route lands on the right set.
	let live = $state(null);
	let loading = $state(false);
	let error = $state('');
	let hydrated = $state(false);
	let searchName = $state('');
	let searchBusy = $state(false);
	let searchNote = $state(null);
	let queryText = $state(null);

	const filters = $derived(live?.filters ?? data.filters);
	const solutions = $derived(live?.solutions ?? data.solutions);
	const total = $derived(live?.total ?? data.total);
	const allCount = $derived(data.allCount || 8);
	const active = $derived(Object.values(filters).filter(Boolean).length);

	// A fresh load from the server supersedes anything filtered in the browser.
	$effect(() => {
		data.solutions;
		live = null;
		error = '';
	});

	onMount(() => {
		hydrated = true;
	});

	function queryString(f) {
		const p = new URLSearchParams();
		for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
		return p.toString();
	}

	async function apply(next) {
		const f = next ?? filters;
		const qs = queryString(f);
		loading = true;
		error = '';
		try {
			const { data: rows, headers } = await api(`/api/solutions${qs ? `?${qs}` : ''}`);
			live = {
				filters: { ...f },
				solutions: rows,
				total: Number(headers.get('x-total-count') ?? rows.length)
			};
			replaceState(qs ? `/solutions?${qs}` : '/solutions', {});
		} catch (err) {
			error =
				err instanceof ApiError
					? err.message
					: 'The filters could not be applied. Check your connection and try again.';
		} finally {
			loading = false;
		}
	}

	function set(key, value) {
		apply({ ...filters, [key]: value });
	}

	function clearAll() {
		apply({ industry: '', output_kind: '', temperature_band: '', deployment: '', q: '' });
	}

	async function saveSearch(event) {
		event.preventDefault();
		if (searchBusy) return;
		const name = searchName.trim();
		if (!name) {
			searchNote = { kind: 'error', text: 'Give the search a name before saving it.' };
			return;
		}
		searchBusy = true;
		searchNote = null;
		try {
			const { data: row } = await api('/api/searches', {
				method: 'POST',
				token: currentToken(),
				body: { name, ...filters }
			});
			searchNote = {
				kind: 'success',
				text: `Saved as "${row.name}". It is on your account page, one row per name.`
			};
			searchName = '';
		} catch (err) {
			searchNote = {
				kind: 'error',
				text:
					err instanceof ApiError && err.status === 401
						? 'Sign in to save a search to your account.'
						: err.message || 'That search could not be saved.'
			};
		} finally {
			searchBusy = false;
		}
	}
</script>

<svelte:head><title>Solutions, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Solutions</p>
		<h1>{data.copy.lede?.heading || 'What can this power?'}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="explorer">
	<div class="wrap">
		<form
			class="filters"
			role="search"
			aria-label="Filter solutions"
			onsubmit={(e) => {
				e.preventDefault();
				apply({ ...filters, q: queryText ?? filters.q });
			}}
		>
			<div class="f">
				<label for="f-industry">Industry</label>
				<select
					id="f-industry"
					value={filters.industry}
					onchange={(e) => set('industry', e.currentTarget.value)}
				>
					<option value="">All industries</option>
					{#each data.industries as ind}
						<option value={ind}>{ind}</option>
					{/each}
				</select>
			</div>
			<div class="f">
				<label for="f-output">Output</label>
				<select
					id="f-output"
					value={filters.output_kind}
					onchange={(e) => set('output_kind', e.currentTarget.value)}
				>
					<option value="">Any output</option>
					{#each OUTPUTS as o}
						<option value={o.value}>{o.label}</option>
					{/each}
				</select>
			</div>
			<div class="f">
				<label for="f-band">Temperature</label>
				<select
					id="f-band"
					value={filters.temperature_band}
					onchange={(e) => set('temperature_band', e.currentTarget.value)}
				>
					<option value="">Any temperature</option>
					{#each BANDS as b}
						<option value={b}>{b}</option>
					{/each}
				</select>
			</div>
			<div class="f">
				<label for="f-deploy">Deployment</label>
				<select
					id="f-deploy"
					value={filters.deployment}
					onchange={(e) => set('deployment', e.currentTarget.value)}
				>
					<option value="">Any deployment</option>
					{#each DEPLOYMENTS as d}
						<option value={d.value}>{d.label}</option>
					{/each}
				</select>
			</div>
			<div class="f f-wide">
				<label for="f-q">Search</label>
				<div class="row">
					<input
						id="f-q"
						type="search"
						placeholder="hydrogen, refinery, district heat"
						value={filters.q}
						oninput={(e) => (queryText = e.currentTarget.value)}
						onchange={(e) => set('q', e.currentTarget.value)}
					/>
					<button class="btn btn-quiet" type="submit">Search</button>
				</div>
			</div>
		</form>

		<div class="count-row">
			<p class="count" data-testid="result-count" aria-live="polite">
				{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
				Showing <strong>{total}</strong> of {allCount} solutions
			</p>
			<div class="count-actions">
				{#if active > 0}
					<button class="btn btn-quiet btn-sm" type="button" onclick={clearAll}
						>Clear filters</button
					>
				{/if}
				<a class="btn btn-quiet btn-sm" href="/compare">Compare saves</a>
			</div>
		</div>

		{#if error}
			<p class="banner banner-error" role="alert">
				<strong>That did not work.</strong>
				{error}
			</p>
		{/if}

		{#if hydrated}
			<form class="save-search" onsubmit={saveSearch}>
				<label for="search-name">Save this search</label>
				<div class="row">
					<input
						id="search-name"
						type="text"
						placeholder="Hydrogen sites"
						bind:value={searchName}
						maxlength="120"
					/>
					<button class="btn btn-quiet" type="submit" disabled={searchBusy}>
						{#if searchBusy}<span class="spinner" aria-hidden="true"></span>{/if}
						{searchBusy ? 'Saving' : 'Save search'}
					</button>
				</div>
				<p class="field-hint">
					{#if $account}
						Saved under your account. The same name replaces its filters rather than adding a row.
					{:else}
						<a href="/signin?next=/solutions">Sign in</a> to keep a search on your account.
					{/if}
				</p>
				{#if searchNote}
					<p
						class={`banner ${searchNote.kind === 'error' ? 'banner-error' : 'banner-success'}`}
						role={searchNote.kind === 'error' ? 'alert' : 'status'}
					>
						{searchNote.text}
					</p>
				{/if}
			</form>
		{/if}

		{#if solutions.length === 0}
			<div class="empty">
				<h3>No solution matches those four filters</h3>
				<p>
					Nothing in the eight fits that combination. Widen a filter, or clear them all and start
					again.
				</p>
				<button class="btn btn-primary btn-sm" type="button" onclick={clearAll}
					>Clear the filters</button
				>
			</div>
		{:else}
			<ul class="grid-cards" data-testid="solution-grid">
				{#each solutions as s (s.slug)}
					<li class="scard" data-slug={s.slug}>
						<a class="scard-link" href={`/solutions/${s.slug}`}>
							<Plate seed={s.slug} ratio="16 / 9" />
							<h2>{s.industry}</h2>
							<p>{s.summary}</p>
						</a>
						<dl class="specs">
							<div><dt>Output</dt><dd>{s.output_kind}</dd></div>
							<div><dt>Temperature</dt><dd>{s.temperature_band}</dd></div>
							<div><dt>Deployment</dt><dd>{s.deployment}</dd></div>
							<div><dt>Modules</dt><dd>{s.module_count}</dd></div>
						</dl>
						<div class="scard-actions">
							<SaveButton slug={s.slug} small />
							<a class="btn btn-quiet btn-sm" href={`/contact?topic=Solutions&solution=${s.slug}`}
								>Enquire</a
							>
						</div>
					</li>
				{/each}
			</ul>

			<!-- the plain list version of the grid, so nothing is only in the cards -->
			<details class="plain">
				<summary>Read the matching solutions as a plain list</summary>
				<ol>
					{#each solutions as s}
						<li>
							<strong>{s.industry}</strong>: {s.output_kind}, {s.temperature_band}, {s.deployment},
							{s.module_count} module{s.module_count === 1 ? '' : 's'}. {s.summary}
						</li>
					{/each}
				</ol>
			</details>
		{/if}
	</div>
</section>

<style>
	.head {
		padding: 40px 0 22px;
		border-bottom: 1px solid var(--rule);
	}
	.explorer {
		padding: 22px 0 72px;
	}
	.filters {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px 16px;
		padding: 16px 0 18px;
		border-bottom: 1px solid var(--rule);
	}
	.f-wide {
		grid-column: 1 / -1;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.row .btn {
		flex: none;
	}
	.count-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding: 14px 0;
	}
	.count {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.92rem;
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.count strong {
		font-family: var(--font-heading);
		font-size: 1.15rem;
	}
	.count-actions {
		display: flex;
		gap: 8px;
	}
	.save-search {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 14px 16px;
		margin-bottom: 20px;
		background: var(--surface-soft);
	}
	.save-search .field-hint {
		margin-bottom: 0;
	}
	.save-search .banner {
		margin: 10px 0 0;
	}

	.grid-cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}
	.scard {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		background: var(--surface);
		padding: 10px;
		display: flex;
		flex-direction: column;
	}
	.scard:hover {
		border-color: var(--accent);
	}
	.scard-link {
		text-decoration: none;
		color: var(--ink);
		display: block;
	}
	.scard h2 {
		font-size: 1.05rem;
		margin: 10px 0 5px;
	}
	.scard p {
		font-size: 0.84rem;
		color: var(--ink-muted);
		margin: 0 0 8px;
		line-height: 1.45;
	}
	.specs {
		margin: 0 0 10px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px 8px;
		font-size: 0.72rem;
		border-top: 1px solid var(--rule);
		padding-top: 8px;
	}
	.specs dt {
		color: var(--ink-faint);
		font-size: 0.64rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.specs dd {
		margin: 0;
		font-family: var(--font-mono);
		color: var(--ink);
		font-size: 0.72rem;
	}
	.scard-actions {
		margin-top: auto;
		display: flex;
		gap: 8px;
		align-items: flex-start;
		flex-wrap: wrap;
	}
	.plain {
		margin-top: 26px;
		border-top: 1px solid var(--rule);
		padding-top: 14px;
	}
	.plain summary {
		cursor: pointer;
		font-weight: 700;
	}
	.plain ol {
		color: var(--ink-muted);
		font-size: 0.92rem;
		padding-left: 20px;
	}
	.plain li {
		margin-bottom: 8px;
	}

	@media (max-width: 1080px) {
		.grid-cards {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@media (max-width: 860px) {
		.filters {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.grid-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 620px) {
		.filters {
			grid-template-columns: 1fr;
		}
		/* the row becomes a single-card swipe on a phone */
		.grid-cards {
			grid-template-columns: none;
			grid-auto-flow: column;
			grid-auto-columns: 86%;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			padding-bottom: 10px;
		}
		.scard {
			scroll-snap-align: start;
		}
	}
</style>
