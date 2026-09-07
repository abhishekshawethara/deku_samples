
<script>
	import { browser } from '$app/environment';
	import { apiData, getToken } from '$lib/api';
	import { scrollBound } from '$lib/scroll';

	let signedIn = $state(false);
	let request = $state(null);
	let loading = $state(true);
	let organisation = $state('');
	let role_title = $state('');
	let busy = $state(false);
	let failure = $state('');
	let touched = $state({});

	const roadmap = [
		['1998', 'The test reactor this design modernizes reaches first criticality.'],
		['2024', 'Modernized design frozen and the digital twin validated against loop data.'],
		['2026', 'First tranche of the design submission accepted by a national regulator.'],
		['2027', 'Fuel qualification complete and module manufacturing arrangements licensed.'],
		['2029', 'First module manufactured, shipped and commissioned on an industrial site.'],
		['2031', 'First deployment at full multi-module scale, energy sold by contract.']
	];

	const against = [
		['Zettajoule module', '750 C outlet, factory built, owned and operated by us, heat and power and hydrogen.'],
		['Water cooled reactor', 'About 320 C, site built, sold as plant, electricity only.'],
		['Gas fired heat', 'Any temperature, cheap to build, carbon at the stack, fuel price risk forever.'],
		['Wind and solar with storage', 'Zero carbon, intermittent, no process heat above roughly 100 C.']
	];

	async function load() {
		loading = true;
		if (!getToken()) {
			signedIn = false;
			request = null;
			loading = false;
			return;
		}
		signedIn = true;
		try {
			request = await apiData('/access-request');
		} catch {
			request = null;
		}
		loading = false;
	}

	$effect(() => {
		if (!browser) return;
		load();
		const on = () => load();
		window.addEventListener('zj:session', on);
		return () => window.removeEventListener('zj:session', on);
	});

	let errors = $derived({
		organisation: organisation.trim() ? '' : 'Name the organisation you are asking on behalf of.',
		role_title: role_title.trim() ? '' : 'State your role there.'
	});
	let valid = $derived(!errors.organisation && !errors.role_title);

	async function submit(e) {
		e.preventDefault();
		touched = { organisation: true, role_title: true };
		failure = '';
		if (!valid) return;
		busy = true;
		try {
			request = await apiData('/access-request', {
				method: 'POST',
				body: { organisation: organisation.trim(), role_title: role_title.trim() }
			});
			organisation = '';
			role_title = '';
			touched = {};
		} catch (err) {
			failure = err.message || 'That request was refused.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Investors, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Investors</p>
		<h1>A proven machine, sold as a service</h1>
		<p class="lede">
			The world will want several hundred zettajoules of energy a year, and roughly a quarter of
			that is industrial process heat that no water cooled reactor can deliver. We modernized a
			reactor that already exists, and we sell what comes out of it.
		</p>
	</div>
</div>

<section class="section wrap">
	<div class="grid g3">
		<div class="card">
			<h2>The size of the need</h2>
			<p class="muted">
				Industrial process heat is roughly a quarter of final energy demand and is almost entirely
				met by burning fuel today. There is no incumbent clean option above 550 degrees Celsius at
				industrial scale. That gap is the market.
			</p>
		</div>
		<div class="card">
			<h2>Why the business is strong</h2>
			<p class="muted">
				We own the plant, run it and staff it, and sell energy on long contracts. That turns a
				capital sale into a decades long revenue stream, and it removes the reason industrial
				customers say no, which is that they do not want to become nuclear operators.
			</p>
		</div>
		<div class="card">
			<h2>Why the licensing risk is lower</h2>
			<p class="muted">
				The design is a modernized version of a test reactor operating since the late 1990s. The
				safety case rests on an operating record rather than on a paper concept, which is what makes
				the regulatory path believable and shorter.
			</p>
		</div>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap">
		<h2>How it stacks up</h2>
		<div class="table-scroll">
			<table>
				<caption class="visually-hidden">Zettajoule compared with the alternatives</caption>
				<thead>
					<tr><th scope="col">Option</th><th scope="col">What it gives you</th></tr>
				</thead>
				<tbody>
					{#each against as [name, note]}
						<tr><th scope="row">{name}</th><td>{note}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<section class="section wrap">
	<h2>Roadmap, from the proven test reactor to first deployment</h2>
	<ol class="timeline">
		{#each roadmap as [year, note], i}
			<li class="on-scroll" use:scrollBound={{ start: 0.95, end: 0.6 }}>
				<span class="year">{year}</span>
				<span class="dot" aria-hidden="true"></span>
				<span class="note">{note}</span>
			</li>
		{/each}
	</ol>
</section>

<section class="section section-sunk" id="request-access">
	<div class="wrap-narrow">
		<h2>The private document room</h2>
		{#if loading}
			<div class="loading">
				<span class="spinner" aria-hidden="true"></span> Checking your access request
			</div>
		{:else if !signedIn}
			<div class="banner banner-info">
				<strong>Sign in to request access.</strong> The document room belongs to the account that was
				approved for it, so we need to know who is asking.
			</div>
			<a class="btn" href="/signin?next=%2Finvestors">Sign in</a>
		{:else if request}
			<div
				class="banner banner-{request.status === 'approved'
					? 'ok'
					: request.status === 'declined'
						? 'fail'
						: 'pending'}"
				role="status"
				data-testid="access-state"
			>
				<p>
					<strong>Your request is {request.status}.</strong>
					Reference <span class="mono">{request.reference}</span> for
					{request.organisation}, {request.role_title}.
				</p>
				{#if request.status === 'pending'}
					<p>
						It reads pending until it is approved. Approval happens outside the product; nothing
						here can approve it for you.
					</p>
				{:else if request.status === 'approved'}
					<p>The room is open to this account.</p>
				{:else}
					<p>This request was declined, so the room stays closed to this account.</p>
				{/if}
			</div>
			{#if request.status === 'approved'}
				<a class="btn" href="/investors/room">Open the document room</a>
			{/if}
			<details class="update">
				<summary>Update the organisation on this request</summary>
				<p class="muted small">
					An account holds at most one request. Sending this again updates the one you have; it
					never adds a second.
				</p>
				<form onsubmit={submit} novalidate>
					<div class="field">
						<label for="a-org2">Organisation</label>
						<input id="a-org2" type="text" bind:value={organisation} />
					</div>
					<div class="field">
						<label for="a-role2">Your role</label>
						<input id="a-role2" type="text" bind:value={role_title} />
					</div>
					<button class="btn btn-secondary" type="submit" disabled={busy}>
						{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
						Update request
					</button>
				</form>
			</details>
		{:else}
			<p class="lede">
				Serious investors request access here. A new request is <strong>pending</strong> until it is
				approved, and only an account whose own request is approved sees the room.
			</p>
			<form class="card" onsubmit={submit} novalidate>
				{#if failure}
					<div class="banner banner-fail" role="alert">
						<strong>That request was refused.</strong>
						{failure} Correct the field it names and send it again.
					</div>
				{/if}
				<div class="field">
					<label for="a-org">Organisation</label>
					<input
						id="a-org"
						type="text"
						bind:value={organisation}
						onblur={() => (touched.organisation = true)}
						aria-invalid={touched.organisation && errors.organisation ? 'true' : undefined}
					/>
					{#if touched.organisation && errors.organisation}
						<p class="field-error">{errors.organisation}</p>
					{/if}
				</div>
				<div class="field">
					<label for="a-role">Your role there</label>
					<input
						id="a-role"
						type="text"
						bind:value={role_title}
						onblur={() => (touched.role_title = true)}
						aria-invalid={touched.role_title && errors.role_title ? 'true' : undefined}
					/>
					{#if touched.role_title && errors.role_title}
						<p class="field-error">{errors.role_title}</p>
					{/if}
				</div>
				<button class="btn" type="submit" disabled={busy} data-testid="access-submit">
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
					{busy ? 'Sending the request' : 'Request access'}
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 44px 0 34px;
	}
	.card h2 {
		font-size: 1.1rem;
	}
	.table-scroll {
		overflow-x: auto;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	table {
		border-collapse: collapse;
		width: 100%;
		min-width: 520px;
		font-size: 0.92rem;
	}
	th,
	td {
		text-align: left;
		padding: 12px 15px;
		border-bottom: var(--hair) solid var(--rule);
	}
	thead th {
		font-family: var(--font-head);
		background: var(--surface-sunk);
	}
	tbody th {
		white-space: nowrap;
		font-weight: 650;
		width: 220px;
	}
	.timeline {
		list-style: none;
		margin: 22px 0 0;
		padding: 0;
	}
	.timeline li {
		display: grid;
		grid-template-columns: 76px 22px minmax(0, 1fr);
		gap: 12px;
		align-items: start;
		padding: 14px 0;
		border-top: var(--hair) solid var(--rule);
	}
	.year {
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.dot {
		width: 11px;
		height: 11px;
		border-radius: 999px;
		background: var(--accent);
		margin-top: 6px;
	}
	.note {
		color: var(--ink-muted);
	}
	.update {
		margin-top: 20px;
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius);
		padding: 12px 16px;
		background: var(--surface);
	}
	.update summary {
		cursor: pointer;
		font-weight: 650;
	}
	.small {
		font-size: 0.85rem;
	}
	.banner p {
		margin: 0 0 6px;
	}
	.banner p:last-child {
		margin: 0;
	}
	@media (max-width: 620px) {
		.timeline li {
			grid-template-columns: 66px 16px minmax(0, 1fr);
			gap: 8px;
		}
	}
</style>
