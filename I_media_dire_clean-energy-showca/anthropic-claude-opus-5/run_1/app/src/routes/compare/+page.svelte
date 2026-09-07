<script>
	import { onMount } from 'svelte';
	import { api, ApiError } from '$lib/api.js';
	import { currentToken, currentSaveToken, account, authReady } from '$lib/session.js';

	const MAX = 4;

	let saves = $state([]);
	let chosen = $state([]);
	let rows = $state([]);
	let loading = $state(true);
	let error = $state('');
	let refusal = $state('');

	onMount(load);

	async function load() {
		loading = true;
		error = '';
		try {
			const t = currentToken();
			const st = currentSaveToken();
			if (!t && !st) {
				saves = [];
				loading = false;
				return;
			}
			const path = t ? '/api/saves' : `/api/saves?save_token=${encodeURIComponent(st)}`;
			const { data } = await api(path, { token: t || undefined });
			saves = data;
			chosen = data.slice(0, MAX).map((s) => s.slug);
			await compare();
		} catch (err) {
			error =
				err instanceof ApiError && err.status === 401
					? 'Sign in, or save a solution first, to build a comparison.'
					: 'We could not read your saved solutions. Try again in a moment.';
		} finally {
			loading = false;
		}
	}

	async function compare() {
		refusal = '';
		if (!chosen.length) {
			rows = [];
			return;
		}
		try {
			const { data } = await api(`/api/compare?slugs=${encodeURIComponent(chosen.join(','))}`);
			rows = data;
		} catch (err) {
			rows = [];
			error = err instanceof ApiError ? err.message : 'The comparison could not be built.';
		}
	}

	async function toggle(slug) {
		refusal = '';
		if (chosen.includes(slug)) {
			chosen = chosen.filter((s) => s !== slug);
			await compare();
			return;
		}
		if (chosen.length >= MAX) {
			// the refusal appears in place and four are still compared
			refusal = `The comparison holds at most ${MAX} saves. Remove one before adding ${slug}.`;
			return;
		}
		chosen = [...chosen, slug];
		await compare();
	}

	const FIELDS = [
		{ key: 'industry', label: 'Industry' },
		{ key: 'output_kind', label: 'Output' },
		{ key: 'temperature_band', label: 'Temperature band' },
		{ key: 'deployment', label: 'Deployment' },
		{ key: 'module_count', label: 'Modules' },
		{ key: 'summary', label: 'In short' }
	];
</script>

<svelte:head><title>Compare, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Compare</p>
		<h1>Four saves, side by side</h1>
		<p class="lede">
			Pick up to {MAX} of your saved solutions and read them against each other. A fifth is refused
			and the four already chosen stay compared.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap">
		{#if loading}
			<p class="loading"><span class="spinner" aria-hidden="true"></span> Loading your saves</p>
		{:else if error}
			<p class="banner banner-error" role="alert"><strong>We hit a problem.</strong> {error}</p>
			<p><a class="btn btn-primary" href="/solutions">Go to the explorer</a></p>
		{:else if saves.length === 0}
			<div class="empty">
				<h3>Nothing saved yet</h3>
				<p>
					You have not saved a solution, so there is nothing here to compare. Save one from the
					explorer, with or without an account.
				</p>
				<a class="btn btn-primary btn-sm" href="/solutions">Browse the eight solutions</a>
			</div>
		{:else}
			<fieldset class="picker">
				<legend>Your saved solutions, choose up to {MAX}</legend>
				<ul>
					{#each saves as s (s.id)}
						<li>
							<label class="check">
								<input
									type="checkbox"
									checked={chosen.includes(s.slug)}
									onchange={() => toggle(s.slug)}
									data-testid={`compare-${s.slug}`}
								/>
								<span class="box" aria-hidden="true">
									<svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
										<path
											d="M3 8.5 L6.5 12 L13 4.5"
											stroke="currentColor"
											stroke-width="2.4"
											fill="none"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</span>
								<span class="txt">{s.title || s.slug}</span>
							</label>
						</li>
					{/each}
				</ul>
			</fieldset>

			{#if refusal}
				<p class="banner banner-error" role="alert" data-testid="compare-refusal">
					<strong>That is one too many.</strong>
					{refusal}
				</p>
			{/if}

			<p class="count mono" aria-live="polite" data-testid="compare-count">
				Comparing {rows.length} of {MAX}
			</p>

			{#if rows.length === 0}
				<div class="empty">
					<h3>Nothing selected</h3>
					<p>Tick a saved solution above to put it in the comparison.</p>
				</div>
			{:else}
				<div class="table-scroll">
					<table class="data" data-testid="compare-table">
						<caption class="visually-hidden">Saved solutions compared side by side</caption>
						<thead>
							<tr>
								<th scope="col">Field</th>
								{#each rows as r}
									<th scope="col">{r.title}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each FIELDS as f}
								<tr>
									<th scope="row">{f.label}</th>
									{#each rows as r}
										<td>{r[f.key]}</td>
									{/each}
								</tr>
							{/each}
							<tr>
								<th scope="row">Read more</th>
								{#each rows as r}
									<td><a href={`/solutions/${r.slug}`}>Open {r.industry}</a></td>
								{/each}
							</tr>
						</tbody>
					</table>
				</div>
			{/if}
		{/if}

		{#if $authReady && !$account}
			<p class="field-hint">
				<a href="/signin?next=/compare">Sign in</a> and any solution you saved without an account comes
				with you.
			</p>
		{/if}
	</div>
</section>

<style>
	.head {
		padding: 40px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.loading {
		display: inline-flex;
		gap: 10px;
		align-items: center;
		color: var(--ink-muted);
	}
	.picker {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 14px 16px 16px;
		margin: 0 0 18px;
	}
	.picker legend {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 0.76rem;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--ink-muted);
		padding: 0 6px;
	}
	.picker ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px 18px;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		min-height: 44px;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 500;
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink);
		margin: 0;
	}
	.check input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}
	.box {
		width: 22px;
		height: 22px;
		border: 1px solid var(--rule-strong);
		border-radius: 5px;
		display: inline-grid;
		place-items: center;
		background: var(--surface);
		color: transparent;
		flex: none;
	}
	.check input:checked + .box {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.check input:focus-visible + .box {
		box-shadow: var(--focus);
	}
	.count {
		margin: 0 0 12px;
		color: var(--ink-muted);
	}
	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}
	table.data th[scope='row'] {
		white-space: nowrap;
		width: 160px;
	}
</style>
