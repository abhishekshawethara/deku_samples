<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import Plate from '$lib/art/Plate.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import { api, post, ApiError } from '$lib/api.js';
	import { auth } from '$lib/stores.js';
	import { OUTPUTS, TEMP_BANDS, DEPLOYMENTS, labelForOutput } from '$lib/nav.js';

	export let data;

	let industry = data.initial.industry;
	let output_kind = data.initial.output_kind;
	let temperature_band = data.initial.temperature_band;
	let deployment = data.initial.deployment;
	let q = data.initial.q;

	let rows = data.solutions;
	let total = data.solutions.length;
	let loading = false;
	let loadError = '';
	let firstRun = true;

	let searchName = '';
	let searchBusy = false;
	let searchBanner = null;

	$: industries = [...new Set(data.solutions.map((s) => s.industry))].sort();
	$: activeCount = [industry, output_kind, temperature_band, deployment, q].filter(Boolean).length;

	function queryString() {
		const p = new URLSearchParams();
		if (industry) p.set('industry', industry);
		if (output_kind) p.set('output_kind', output_kind);
		if (temperature_band) p.set('temperature_band', temperature_band);
		if (deployment) p.set('deployment', deployment);
		if (q) p.set('q', q);
		return p.toString();
	}

	async function refresh() {
		loading = true;
		loadError = '';
		const qs = queryString();
		try {
			const res = await api(`/solutions${qs ? `?${qs}` : ''}`, { raw: true, anonymous: true });
			rows = res.data;
			total = Number(res.headers.get('X-Total-Count') ?? res.data.length);
			if (browser) replaceState(qs ? `?${qs}` : location.pathname, {});
		} catch (err) {
			loadError = err instanceof ApiError ? err.message : 'Could not load solutions. Try again.';
		} finally {
			loading = false;
		}
	}

	$: if (browser && (industry || output_kind || temperature_band || deployment || q || true)) {
		trigger(industry, output_kind, temperature_band, deployment, q);
	}
	let t;
	function trigger(...args) {
		if (firstRun) {
			firstRun = false;
			return;
		}
		clearTimeout(t);
		t = setTimeout(refresh, 60);
	}

	function clearAll() {
		industry = '';
		output_kind = '';
		temperature_band = '';
		deployment = '';
		q = '';
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
			await post('/searches', {
				name,
				query: q || null,
				industry: industry || null,
				output_kind: output_kind || null,
				temperature_band: temperature_band || null,
				deployment: deployment || null
			});
			searchBanner = { kind: 'success', text: `Saved as "${name}". It is in your account.` };
			searchName = '';
		} catch (err) {
			searchBanner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not save that search.'
			};
		} finally {
			searchBusy = false;
		}
	}

	onMount(() => {
		if (queryString()) refresh();
	});
</script>

<svelte:head><title>Solutions | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Solutions</p>
		<h1>What can this power?</h1>
		<p class="lede">
			Eight industries, one machine. Choose an industry, what you want out of it, how hot you need
			it, and how it would be deployed.
		</p>
	</div>
</section>

<section class="explorer">
	<div class="wrap">
		<form class="filters" role="search" aria-label="Filter solutions" on:submit|preventDefault={refresh}>
			<div class="field">
				<label for="f-q">Search</label>
				<input id="f-q" class="input" type="search" bind:value={q} placeholder="e.g. hydrogen, steam" />
			</div>
			<div class="field">
				<label for="f-ind">Industry</label>
				<select id="f-ind" class="select" bind:value={industry}>
					<option value="">All industries</option>
					{#each industries as i}<option value={i}>{i}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="f-out">What you need out</label>
				<select id="f-out" class="select" bind:value={output_kind}>
					<option value="">All outputs</option>
					{#each OUTPUTS as o}<option value={o.kind}>{o.label}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="f-temp">How hot</label>
				<select id="f-temp" class="select" bind:value={temperature_band}>
					<option value="">All temperatures</option>
					{#each TEMP_BANDS as b}<option value={b}>{b}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="f-dep">Deployment</label>
				<select id="f-dep" class="select" bind:value={deployment}>
					<option value="">Either</option>
					{#each DEPLOYMENTS as d}<option value={d}>{d}</option>{/each}
				</select>
			</div>
		</form>

		<div class="count-bar">
			<p class="count" role="status" aria-live="polite" data-testid="result-count">
				{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
				Showing <strong>{total}</strong> of {data.solutions.length} solutions
				{#if activeCount}<span class="muted"> ({activeCount} filter{activeCount === 1 ? '' : 's'} on)</span>{/if}
			</p>
			<div class="count-actions">
				{#if activeCount}
					<button class="btn btn-sm" type="button" on:click={clearAll}>Clear filters</button>
				{/if}
				<a class="btn btn-sm" href="/compare">Compare saved</a>
			</div>
		</div>

		{#if $auth.token}
			<div class="save-search">
				{#if searchBanner}
					<div class="banner banner-{searchBanner.kind}" role="status">
						<strong>{searchBanner.kind === 'error' ? 'Not saved' : 'Saved'}</strong>
						{searchBanner.text}
					</div>
				{/if}
				<form class="ss-row" on:submit|preventDefault={saveSearch}>
					<div class="field ss-field">
						<label for="ss-name">Save this search as</label>
						<input id="ss-name" class="input" bind:value={searchName} placeholder="e.g. Hydrogen sites" />
					</div>
					<button class="btn" type="submit" disabled={searchBusy}>
						{#if searchBusy}<span class="spinner" aria-hidden="true"></span>{/if}Save search
					</button>
				</form>
			</div>
		{/if}

		{#if loadError}
			<div class="banner banner-error" role="alert">
				<strong>Could not load</strong>{loadError}
				<p style="margin:8px 0 0"><button class="btn btn-sm" type="button" on:click={refresh}>Try again</button></p>
			</div>
		{/if}

		{#if loading && !rows.length}
			<ul class="cards" aria-busy="true">
				{#each Array(4) as _}
					<li class="card"><div class="skeleton" style="height:120px"></div></li>
				{/each}
			</ul>
		{:else if rows.length === 0}
			<div class="empty">
				<h2>No solution matches those filters</h2>
				<p>
					Nothing in the eight fits that combination. Widen a filter, or clear them and start
					again.
				</p>
				<button class="btn btn-primary" type="button" on:click={clearAll}>Clear all filters</button>
			</div>
		{:else}
			<ul class="cards">
				{#each rows as s (s.slug)}
					<li class="s-card">
						<a class="plate-link" href="/solutions/{s.slug}" tabindex="-1" aria-hidden="true">
							<Plate seed={s.slug} ratio="16 / 7" />
						</a>
						<div class="s-body">
							<p class="s-ind">{s.industry}</p>
							<h2><a href="/solutions/{s.slug}">{s.title}</a></h2>
							<p class="s-sum">{s.summary}</p>
							<ul class="tags" aria-label="Attributes">
								<li>{labelForOutput(s.output_kind)}</li>
								<li>{s.temperature_band}</li>
								<li>{s.deployment}</li>
								<li>{s.module_count} module{s.module_count === 1 ? '' : 's'}</li>
							</ul>
							<div class="s-actions">
								<SaveButton slug={s.slug} compact={true} />
								<a class="btn btn-sm" href="/solutions/{s.slug}">Open</a>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<!-- plain list version, so nothing is only reachable by aiming -->
			<details class="plain">
				<summary>Read these results as a plain list</summary>
				<ol>
					{#each rows as s}
						<li>
							{s.industry}: {s.title}. Output {labelForOutput(s.output_kind)}, {s.temperature_band},
							{s.deployment}, {s.module_count} modules.
						</li>
					{/each}
				</ol>
			</details>
		{/if}
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.explorer {
		padding-block: 26px 70px;
	}
	.filters {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
		gap: 14px;
		padding: 18px 0 4px;
	}
	.filters .field {
		margin-bottom: 0;
	}
	.count-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
		padding: 12px 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
		margin-bottom: 18px;
	}
	.count {
		margin: 0;
		font-size: 0.95rem;
	}
	.count strong {
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.count-actions {
		display: flex;
		gap: 8px;
	}
	.save-search {
		margin-bottom: 18px;
	}
	.ss-row {
		display: flex;
		gap: 10px;
		align-items: flex-end;
		flex-wrap: wrap;
	}
	.ss-field {
		margin-bottom: 0;
		flex: 1;
		min-width: 220px;
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
		gap: 14px;
	}
	.s-card {
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
		background: var(--paper);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.plate-link {
		display: block;
	}
	.s-body {
		padding: 12px 14px 14px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.s-ind {
		margin: 0 0 4px;
		font-family: var(--font-head);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	.s-body h2 {
		font-size: 1.02rem;
		margin: 0 0 6px;
		line-height: 1.22;
	}
	.s-body h2 a {
		color: var(--ink);
		text-decoration: none;
	}
	.s-body h2 a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.s-sum {
		font-size: 0.85rem;
		color: var(--ink-muted);
		margin: 0 0 10px;
		line-height: 1.45;
	}
	.tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		padding: 0;
		margin: 0 0 12px;
	}
	.tags li {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 2px 7px;
		border: 1px solid var(--rule);
		border-radius: 999px;
		background: var(--paper-2);
		color: var(--ink-muted);
	}
	.s-actions {
		display: flex;
		gap: 8px;
		margin-top: auto;
		flex-wrap: wrap;
	}
	.plain {
		margin-top: 26px;
		border-top: 1px solid var(--rule);
		padding-top: 14px;
	}
	.plain summary {
		cursor: pointer;
		font-weight: 600;
	}
	.plain ol {
		margin: 12px 0 0;
		padding-left: 20px;
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	@media (max-width: 900px) {
		.filters {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 560px) {
		.filters {
			grid-template-columns: 1fr;
		}
		.cards {
			grid-auto-flow: row;
			grid-template-columns: 1fr;
		}
	}
</style>
