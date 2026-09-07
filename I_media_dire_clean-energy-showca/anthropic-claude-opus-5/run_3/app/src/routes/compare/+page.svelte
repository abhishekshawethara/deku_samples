<script>
	// The comparison holds at most four saves. A fifth is rejected as invalid
	// by the server and the four already compared stay compared.
	import { browser } from '$app/environment';
	import Plate from '$lib/Plate.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { saves, refreshSaves, savesLoading } from '$lib/saves.js';
	import { isSignedIn } from '$lib/auth.js';

	const MAX = 4;

	let chosen = $state([]);
	let rows = $state([]);
	let loading = $state(false);
	let banner = $state(null);

	$effect(() => {
		if (browser) refreshSaves();
	});

	// Start with the first four saved solutions.
	let seeded = false;
	$effect(() => {
		if (!browser || seeded) return;
		const list = $saves;
		if (list.length) {
			seeded = true;
			chosen = list.slice(0, MAX).map((r) => r.slug);
			compare(chosen);
		}
	});

	async function compare(slugs) {
		loading = true;
		try {
			const { data } = await api(`/compare?slugs=${encodeURIComponent(slugs.join(','))}`, {
				auth: false
			});
			rows = data;
		} catch (e) {
			banner = { kind: 'fail', text: e.message };
		} finally {
			loading = false;
		}
	}

	async function add(slug) {
		if (chosen.includes(slug)) return;
		const next = [...chosen, slug];
		banner = null;
		// Ask the server: it is the server that refuses a fifth, not the button.
		try {
			const { data } = await api(`/compare?slugs=${encodeURIComponent(next.join(','))}`, {
				auth: false
			});
			chosen = next;
			rows = data;
			banner = { kind: 'ok', text: `Added. ${next.length} of ${MAX} compared.` };
		} catch (e) {
			banner = {
				kind: 'fail',
				text:
					e instanceof ApiError && e.status === 400
						? `${e.message} You are still comparing ${chosen.length}.`
						: 'Could not add that just now.'
			};
		}
	}

	function remove(slug) {
		chosen = chosen.filter((s) => s !== slug);
		rows = rows.filter((r) => r.slug !== slug);
		banner = { kind: 'ok', text: `Removed. ${chosen.length} of ${MAX} compared.` };
	}

	const available = $derived($saves.filter((r) => !chosen.includes(r.slug)));
	const FIELDS = [
		['industry', 'Industry'],
		['output_kind', 'Output'],
		['temperature_band', 'Temperature'],
		['deployment', 'Deployment'],
		['module_count', 'Modules']
	];
</script>

<svelte:head><title>Compare · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Compare</p>
		<h1>Four saves, side by side</h1>
		<p class="lede">
			The comparison holds at most four. A fifth is refused, and the four you have stay where they
			are.
		</p>
	</div>
</section>

<section class="wrap section--tight">
	{#if banner}
		<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
			<strong>{banner.kind === 'ok' ? 'Comparison updated' : 'Refused'}</strong>
			<span>{banner.text}</span>
		</div>
	{/if}

	<p class="tray-count" role="status">
		<strong>{chosen.length} of {MAX}</strong> compared.
	</p>

	{#if $savesLoading}
		<p class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading your saves…</p>
	{:else if $saves.length === 0}
		<div class="empty-state">
			<h2>Nothing saved yet</h2>
			<p>
				{#if $isSignedIn}
					Save a solution from the explorer and it appears here to compare.
				{:else}
					Save a solution from the explorer, then sign in and it follows you here.
				{/if}
			</p>
			<a class="btn" href="/solutions">Open the explorer</a>
		</div>
	{:else}
		{#if available.length}
			<div class="tray">
				<p class="label">Add another save</p>
				<div class="row">
					{#each available as r}
						<button class="btn btn--ghost btn--sm" type="button" onclick={() => add(r.slug)}>
							Add {r.slug}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if loading}
			<p class="loading-row"><span class="spinner" aria-hidden="true"></span> Comparing…</p>
		{/if}

		{#if rows.length}
			<div class="scroller">
				<table class="data compare-table">
					<caption class="visually-hidden">
						Saved solutions compared across industry, output, temperature, deployment and module
						count.
					</caption>
					<thead>
						<tr>
							<th scope="col">Field</th>
							{#each rows as r}
								<th scope="col">
									<Plate seed={r.slug} ratio="16 / 9" />
									<a href={`/solutions/${r.slug}`}>{r.industry}</a>
									<button class="btn btn--danger btn--sm" type="button" onclick={() => remove(r.slug)}>
										Remove
										<span class="visually-hidden">{r.industry} from the comparison</span>
									</button>
								</th>
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
								<td class="summary-cell">{r.summary}</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.tray {
		margin-bottom: 1rem;
	}
	.tray-count {
		font-size: 0.95rem;
	}
	.scroller {
		overflow-x: auto;
		padding-bottom: 2rem;
	}
	.compare-table {
		min-width: 620px;
	}
	.compare-table thead th {
		width: 22%;
		vertical-align: bottom;
	}
	.compare-table thead th a {
		display: block;
		font-family: var(--font-head);
		font-size: 1rem;
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink);
		margin: 0.5rem 0 0.4rem;
	}
	.summary-cell {
		font-size: 0.84rem;
		color: var(--ink-muted);
		min-width: 180px;
	}
</style>
