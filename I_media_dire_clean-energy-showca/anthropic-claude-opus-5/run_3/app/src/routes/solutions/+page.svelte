<script>
	// The explorer. Four filters combine, each narrowing the last, and the grid
	// states how many of the eight it is showing. The filters are a hydrated
	// island: the first paint is complete server-rendered HTML.
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Plate from '$lib/Plate.svelte';
	import SaveButton from '$lib/SaveButton.svelte';
	import Reveal from '$lib/Reveal.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { isSignedIn } from '$lib/auth.js';
	import { refreshSaves, savedSlugs } from '$lib/saves.js';

	let { data } = $props();

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

	const industries = $derived([...new Set(data.all.map((s) => s.industry))].sort());

	let filters = $state({ ...data.filters });
	let busy = $state(false);
	let banner = $state(null);

	// saved-search island
	let searchName = $state('');
	let savingSearch = $state(false);

	$effect(() => {
		filters = { ...data.filters };
	});

	$effect(() => {
		if (browser) refreshSaves();
	});

	async function apply(next) {
		filters = { ...filters, ...next };
		const params = new URLSearchParams();
		for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
		busy = true;
		const qs = params.toString();
		await goto(`/solutions${qs ? `?${qs}` : ''}`, { keepFocus: true, noScroll: true });
		busy = false;
	}

	function clearAll() {
		apply({ industry: '', output_kind: '', temperature_band: '', deployment: '', q: '' });
	}

	const activeCount = $derived(Object.values(filters).filter(Boolean).length);

	async function saveSearch(event) {
		event.preventDefault();
		const name = searchName.trim();
		if (!name) {
			banner = { kind: 'fail', text: 'Give the search a name so you can find it again.' };
			return;
		}
		savingSearch = true;
		banner = null;
		try {
			const { data: row } = await api('/searches', {
				method: 'POST',
				body: {
					name,
					query: filters.q || '',
					industry: filters.industry || '',
					output_kind: filters.output_kind || '',
					temperature_band: filters.temperature_band || '',
					deployment: filters.deployment || ''
				}
			});
			banner = {
				kind: 'ok',
				text: `Saved the search “${row.name}”. Reusing that name replaces its filters rather than adding a second.`
			};
			searchName = '';
		} catch (e) {
			banner = {
				kind: 'fail',
				text:
					e instanceof ApiError && e.status === 401
						? 'Sign in first and this search will be kept on your account.'
						: e.message
			};
		} finally {
			savingSearch = false;
		}
	}
</script>

<svelte:head>
	<title>Solutions · Zettajoule</title>
	<meta name="description" content="Eight industries, four filters. Find the ones that fit your site." />
</svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Solutions</p>
		<Reveal as="h1" text="What can this power?" />
		<p class="lede">
			Eight industries, each wanting a different temperature and a different output. Narrow them to
			the ones that fit your site.
		</p>
	</div>
</section>

<section class="wrap explorer">
	<form class="filters" aria-label="Filter the solutions" onsubmit={(e) => e.preventDefault()}>
		<div class="filters__grid">
			<div class="field">
				<label for="f-industry">Industry</label>
				<select
					id="f-industry"
					value={filters.industry}
					onchange={(e) => apply({ industry: e.currentTarget.value })}
				>
					<option value="">All industries</option>
					{#each industries as i}
						<option value={i}>{i}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="f-output">What you want out</label>
				<select
					id="f-output"
					value={filters.output_kind}
					onchange={(e) => apply({ output_kind: e.currentTarget.value })}
				>
					<option value="">Any output</option>
					{#each OUTPUT_KINDS as [value, label]}
						<option {value}>{label}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="f-band">How hot you need it</label>
				<select
					id="f-band"
					value={filters.temperature_band}
					onchange={(e) => apply({ temperature_band: e.currentTarget.value })}
				>
					<option value="">Any temperature</option>
					{#each BANDS as b}
						<option value={b}>{b}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="f-deploy">How it would be deployed</label>
				<select
					id="f-deploy"
					value={filters.deployment}
					onchange={(e) => apply({ deployment: e.currentTarget.value })}
				>
					<option value="">Any deployment</option>
					{#each DEPLOYMENTS as [value, label]}
						<option {value}>{label}</option>
					{/each}
				</select>
			</div>

			<div class="field filters__search">
				<label for="f-q">Search in plain language</label>
				<input
					id="f-q"
					type="search"
					placeholder="hydrogen for a steel works"
					value={filters.q}
					onchange={(e) => apply({ q: e.currentTarget.value })}
				/>
			</div>
		</div>

		<div class="filters__foot">
			<p class="count" role="status" aria-live="polite">
				{#if busy}
					<span class="spinner" aria-hidden="true"></span>
				{/if}
				<strong>Showing {data.total} of {data.universe}</strong>
				{#if activeCount}
					<span class="muted"
						>· {activeCount}
						{activeCount === 1 ? 'filter' : 'filters'} applied</span
					>
				{/if}
			</p>
			<button
				class="btn btn--ghost btn--sm"
				type="button"
				onclick={clearAll}
				disabled={activeCount === 0}
			>
				Clear filters
			</button>
		</div>
	</form>

	{#if banner}
		<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
			<strong>{banner.kind === 'ok' ? 'Saved' : 'Not saved'}</strong>
			<span>{banner.text}</span>
		</div>
	{/if}

	<form class="save-search" onsubmit={saveSearch}>
		<label for="search-name">Save this search</label>
		<div class="save-search__row">
			<input
				id="search-name"
				type="text"
				placeholder="Hydrogen sites"
				bind:value={searchName}
				autocomplete="off"
			/>
			<button class="btn btn--ghost" type="submit" disabled={savingSearch}>
				{#if savingSearch}<span class="spinner" aria-hidden="true"></span>{/if}
				Save search
			</button>
		</div>
		<p class="field__hint">
			{#if $isSignedIn}
				A name is unique on your account: reusing one replaces its filters.
			{:else}
				<a href="/signin?next=/solutions">Sign in</a> to keep a search under a name.
			{/if}
		</p>
	</form>

	{#if data.solutions.length === 0}
		<div class="empty-state">
			<h2>No solution matches those four filters</h2>
			<p>
				Nothing in the eight fits that exact combination. Widen the temperature band, or clear the
				filters and start again.
			</p>
			<button class="btn" type="button" onclick={clearAll}>Clear filters</button>
		</div>
	{:else}
		<ul class="cards" data-count={data.total}>
			{#each data.solutions as s (s.slug)}
				<li class="card-item">
					<article class="sol">
						<a class="sol__plate" href={`/solutions/${s.slug}`} tabindex="-1" aria-hidden="true">
							<Plate seed={s.slug} ratio="16 / 9" />
						</a>
						<h2 class="sol__industry">
							<a href={`/solutions/${s.slug}`}>{s.industry}</a>
						</h2>
						<p class="sol__title">{s.title}</p>
						<p class="sol__summary">{s.summary}</p>
						<ul class="sol__meta">
							<li>{s.output_kind}</li>
							<li>{s.temperature_band}</li>
							<li>{s.deployment}</li>
							<li>{s.module_count} {s.module_count === 1 ? 'module' : 'modules'}</li>
						</ul>
						<div class="sol__actions">
							<SaveButton
								slug={s.slug}
								compact
								onmessage={(m) => (banner = { kind: m.kind, text: m.text })}
							/>
							<a class="btn btn--ghost btn--sm" href={`/solutions/${s.slug}`}>Open</a>
						</div>
					</article>
				</li>
			{/each}
		</ul>
	{/if}

	<!-- The grid also exists as a plain list, so nothing here is reachable only
	     by aiming at a card. -->
	<details class="plain">
		<summary>Read the {data.total} matching {data.total === 1 ? 'solution' : 'solutions'} as a list</summary>
		<table class="data">
			<thead>
				<tr>
					<th scope="col">Industry</th>
					<th scope="col">Output</th>
					<th scope="col">Temperature</th>
					<th scope="col">Deployment</th>
					<th scope="col">Modules</th>
				</tr>
			</thead>
			<tbody>
				{#each data.solutions as s}
					<tr>
						<th scope="row"><a href={`/solutions/${s.slug}`}>{s.industry}</a></th>
						<td>{s.output_kind}</td>
						<td>{s.temperature_band}</td>
						<td>{s.deployment}</td>
						<td>{s.module_count}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>

	<p class="compare-link">
		{$savedSlugs.size} saved. <a href="/compare">Compare up to four side by side</a>.
	</p>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1.5rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.explorer {
		padding-bottom: 4rem;
	}
	.filters {
		position: sticky;
		top: var(--bar-h);
		z-index: 20;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
		margin-bottom: 1rem;
	}
	.filters__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}
	.filters .field {
		margin-bottom: 0;
	}
	.filters__search {
		grid-column: 1 / -1;
	}
	.filters__foot {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.85rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--rule);
	}
	.count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 0.95rem;
	}

	.save-search {
		margin-bottom: 1.25rem;
	}
	.save-search__row {
		display: flex;
		gap: 0.5rem;
		max-width: 460px;
	}
	.save-search__row input {
		flex: 1;
	}

	/* compact card grid: a full filtered set fits one screen */
	.cards {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
		gap: 0.75rem;
	}
	.sol {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		height: 100%;
		padding: 0.7rem;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		background: var(--paper);
	}
	.sol:hover {
		border-color: var(--rule-strong);
	}
	.sol__plate {
		display: block;
	}
	.sol__industry {
		font-size: 1.1rem;
		margin: 0.4rem 0 0;
	}
	.sol__industry a {
		color: var(--ink);
		text-decoration: none;
	}
	.sol__industry a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.sol__title {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--ink-muted);
	}
	.sol__summary {
		margin: 0;
		font-size: 0.84rem;
		color: var(--ink-muted);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.sol__meta {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin: 0.35rem 0 0;
		padding: 0;
	}
	.sol__meta li {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		padding: 0.12rem 0.4rem;
		border: 1px solid var(--rule);
		border-radius: 999px;
		color: var(--ink-muted);
	}
	.sol__actions {
		display: flex;
		gap: 0.4rem;
		margin-top: auto;
		padding-top: 0.6rem;
	}

	.plain {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
	}
	.plain summary {
		cursor: pointer;
		font-weight: 600;
	}
	.plain table {
		margin-top: 0.75rem;
	}
	.compare-link {
		font-size: 0.92rem;
		color: var(--ink-muted);
	}

	@media (max-width: 560px) {
		/* the row becomes a single-card swipe on a phone */
		.cards {
			grid-template-columns: 1fr;
		}
		.filters {
			position: static;
		}
	}
</style>
