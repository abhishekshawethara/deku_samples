<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.js';
	import { token, saveToken, compareList } from '$lib/session.js';

	export let data;

	let saves = [];
	let loading = true;
	let banner = data.rejected ? { kind: 'error', title: 'Fifth rejected.', text: data.rejected } : null;

	$: chosen = data.solutions;

	async function loadSaves() {
		loading = true;
		try {
			if ($token) saves = await api('/api/saves', { token: $token });
			else if ($saveToken) saves = await api(`/api/saves?save_token=${encodeURIComponent($saveToken)}`);
			else saves = [];
		} catch {
			saves = [];
		} finally {
			loading = false;
		}
	}
	onMount(loadSaves);

	function go(slugs) {
		compareList.set(slugs);
		goto(`/compare${slugs.length ? '?slugs=' + slugs.join(',') : ''}`, { noScroll: true });
	}

	function add(slug) {
		banner = null;
		const current = data.slugs;
		if (current.includes(slug)) return;
		if (current.length >= 4) {
			banner = {
				kind: 'error',
				title: 'Fifth rejected.',
				text: `The comparison holds at most four saves. "${slug}" was rejected as invalid and the four below are still compared.`
			};
			return;
		}
		go([...current, slug]);
	}

	function remove(slug) {
		banner = null;
		go(data.slugs.filter((s) => s !== slug));
	}

	$: available = saves.filter((s) => !data.slugs.includes(s.slug));
	const ROWS = [
		['Industry', (s) => s.industry],
		['Headline', (s) => s.title],
		['Output', (s) => s.output_kind],
		['Temperature band', (s) => s.temperature_band],
		['Deployment', (s) => s.deployment],
		['Modules', (s) => String(s.module_count)],
		['Thermal duty', (s) => `${s.module_count * 250} MW`],
		['Summary', (s) => s.summary]
	];
</script>

<svelte:head><title>Compare, Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap">
		<p class="eyebrow">Compare</p>
		<h1>Four saves, side by side</h1>
		<p class="lede">The comparison holds at most four. A fifth is rejected as invalid and the four stay put.</p>

		{#if banner}
			<div class="banner banner-error" role="alert" data-testid="compare-banner">
				<strong>{banner.title}</strong> {banner.text}
			</div>
		{/if}

		<div class="picker">
			<h2 class="picker-title">Add from your saves</h2>
			{#if loading}
				<p class="loading-note"><span class="spinner" aria-hidden="true"></span> Reading your saved solutions</p>
			{:else if saves.length === 0}
				<div class="empty-state">
					<h3>You have not saved a solution yet</h3>
					<p>Nothing to compare until you save something. <a href="/solutions">Open the explorer</a> and save what fits.</p>
				</div>
			{:else}
				<ul class="chips">
					{#each available as s (s.slug)}
						<li>
							<button type="button" class="chip" on:click={() => add(s.slug)}>
								+ {s.title || s.slug}<span class="visually-hidden">, add to the comparison</span>
							</button>
						</li>
					{/each}
					{#if available.length === 0}
						<li class="dense muted">Every saved solution is already in the comparison.</li>
					{/if}
				</ul>
			{/if}
		</div>

		{#if chosen.length === 0}
			<div class="empty-state">
				<h3>Nothing is being compared</h3>
				<p>Choose up to four saved solutions above, or <a href="/solutions">explore the eight</a>.</p>
			</div>
		{:else}
			<p class="count dense" role="status" data-testid="compare-count">
				Comparing {chosen.length} of a maximum of 4
			</p>
			<div class="table-scroll">
				<table class="data" data-testid="compare-table">
					<thead>
						<tr>
							<th scope="col">Attribute</th>
							{#each chosen as s (s.slug)}
								<th scope="col">
									{s.industry}
									<button type="button" class="btn btn-quiet btn-sm remove" on:click={() => remove(s.slug)}>
										Remove<span class="visually-hidden"> {s.industry} from the comparison</span>
									</button>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each ROWS as [label, get]}
							<tr>
								<th scope="row">{label}</th>
								{#each chosen as s (s.slug)}<td>{get(s)}</td>{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>

<style>
	.picker {
		margin: 20px 0 24px;
	}
	.picker-title {
		font-size: 1.05rem;
	}
	.chips {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 0.85rem;
		min-height: 40px;
		padding: 8px 14px;
		border-radius: 999px;
		border: 1px solid var(--rule-strong);
		background: #fff;
		color: var(--ink);
		cursor: pointer;
	}
	.chip:hover {
		background: var(--sky);
		border-color: var(--accent-hover);
		color: var(--accent-hover);
	}
	.muted {
		color: var(--ink-muted);
	}
	.count {
		color: var(--ink-muted);
	}
	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}
	table.data th[scope='col'] {
		white-space: nowrap;
	}
	.remove {
		display: block;
		margin-top: 6px;
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--accent);
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
	}
</style>
