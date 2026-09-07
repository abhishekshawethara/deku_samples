<script>
	import { onMount } from 'svelte';
	import { api, ApiError } from '$lib/api.js';
	import { auth, currentSaveToken } from '$lib/stores.js';
	import { labelForOutput } from '$lib/nav.js';

	const MAX = 4;

	let saves = [];
	let selected = [];
	let compared = [];
	let loading = true;
	let error = '';
	let banner = null;
	let allSolutions = [];

	async function loadSaves() {
		loading = true;
		error = '';
		try {
			const token = $auth.token;
			const st = token ? null : currentSaveToken();
			if (!token && !st) {
				saves = [];
			} else {
				const qs = st ? `?save_token=${encodeURIComponent(st)}` : '';
				saves = await api(`/saves${qs}`);
			}
			allSolutions = await api('/solutions', { anonymous: true });
			selected = saves.slice(0, MAX).map((s) => s.slug);
			await refresh();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not load your saved solutions.';
		} finally {
			loading = false;
		}
	}

	async function refresh() {
		if (!selected.length) {
			compared = [];
			return;
		}
		try {
			compared = await api(`/compare?slugs=${encodeURIComponent(selected.join(','))}`, {
				anonymous: true
			});
		} catch (err) {
			banner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not build that comparison.'
			};
		}
	}

	async function toggle(slug) {
		banner = null;
		if (selected.includes(slug)) {
			selected = selected.filter((s) => s !== slug);
			await refresh();
			return;
		}
		if (selected.length >= MAX) {
			/* The refusal appears in place; the four already compared stay compared. */
			banner = {
				kind: 'error',
				text: `The comparison holds at most ${MAX} solutions. Remove one before adding ${slug}.`
			};
			return;
		}
		selected = [...selected, slug];
		await refresh();
	}

	onMount(loadSaves);
</script>

<svelte:head><title>Compare | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Compare</p>
		<h1>Four saved solutions, side by side</h1>
		<p class="lede">Pick up to {MAX} of the solutions you have saved and read them across.</p>
	</div>
</section>

<section class="section-tight">
	<div class="wrap">
		{#if banner}
			<div class="banner banner-{banner.kind}" role="alert" data-testid="compare-banner">
				<strong>{banner.kind === 'error' ? 'Cannot add that' : 'Done'}</strong>
				{banner.text}
			</div>
		{/if}

		{#if loading}
			<p aria-busy="true"><span class="spinner" aria-hidden="true"></span> Loading your saved solutions…</p>
		{:else if error}
			<div class="banner banner-error" role="alert">
				<strong>Could not load</strong>{error}
				<p style="margin:8px 0 0"><button class="btn btn-sm" type="button" on:click={loadSaves}>Try again</button></p>
			</div>
		{:else if !saves.length}
			<div class="empty">
				<h2>You have not saved a solution yet</h2>
				<p>
					Nothing is waiting to be compared. Save a solution from the explorer and it will appear
					here, whether or not you have an account.
				</p>
				<a class="btn btn-primary" href="/solutions">Open the solutions explorer</a>
			</div>
		{:else}
			<div class="picker">
				<h2 class="pick-h">Your saved solutions</h2>
				<p class="muted count-note" role="status" data-testid="compare-count">
					{selected.length} of {MAX} in the comparison
				</p>
				<ul class="chips">
					{#each saves as s}
						{@const on = selected.includes(s.slug)}
						<li>
							<button
								class="chip"
								class:on
								type="button"
								aria-pressed={on}
								on:click={() => toggle(s.slug)}
							>
								{#if on}
									<svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
										<path d="M2.5 8.5 L6.2 12 L13.5 4.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								{/if}
								{s.title || s.slug}
								<span class="sr-only">{on ? '(in the comparison)' : '(not in the comparison)'}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>

			{#if compared.length}
				<div class="table-scroll">
					<table class="data compare">
						<caption class="sr-only">Comparison of {compared.length} solutions</caption>
						<thead>
							<tr>
								<th scope="col">Attribute</th>
								{#each compared as c}<th scope="col">{c.industry}</th>{/each}
							</tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row">Title</th>
								{#each compared as c}<td><a href="/solutions/{c.slug}">{c.title}</a></td>{/each}
							</tr>
							<tr>
								<th scope="row">Output</th>
								{#each compared as c}<td>{labelForOutput(c.output_kind)}</td>{/each}
							</tr>
							<tr>
								<th scope="row">Temperature</th>
								{#each compared as c}<td>{c.temperature_band}</td>{/each}
							</tr>
							<tr>
								<th scope="row">Deployment</th>
								{#each compared as c}<td>{c.deployment}</td>{/each}
							</tr>
							<tr>
								<th scope="row">Modules</th>
								{#each compared as c}<td>{c.module_count}</td>{/each}
							</tr>
							<tr>
								<th scope="row">Summary</th>
								{#each compared as c}<td class="sum">{c.summary}</td>{/each}
							</tr>
						</tbody>
					</table>
				</div>
			{:else}
				<div class="empty">
					<h2>Nothing selected</h2>
					<p>Choose up to {MAX} of your saved solutions above to read them side by side.</p>
				</div>
			{/if}
		{/if}
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.picker {
		margin-bottom: 22px;
	}
	.pick-h {
		font-size: 1.05rem;
		margin-bottom: 4px;
	}
	.count-note {
		margin: 0 0 10px;
		font-size: 0.88rem;
	}
	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 0;
		margin: 0;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 40px;
		padding: 6px 13px;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: var(--paper);
		cursor: pointer;
		font-size: 0.88rem;
		font-weight: 600;
	}
	.chip:hover {
		background: var(--paper-3);
	}
	.chip.on {
		border-color: var(--accent);
		background: var(--accent-tint);
		color: var(--accent-hover);
	}
	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
	}
	.compare {
		min-width: 640px;
	}
	.compare th[scope='row'] {
		width: 130px;
		white-space: nowrap;
	}
	.compare .sum {
		font-size: 0.84rem;
		color: var(--ink-muted);
		min-width: 200px;
	}
</style>
