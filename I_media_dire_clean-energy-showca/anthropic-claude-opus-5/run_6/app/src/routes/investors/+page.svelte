<script>
	import { onMount } from 'svelte';
	import { api, post, ApiError } from '$lib/api.js';
	import { auth } from '$lib/stores.js';
	import { reveal } from '$lib/scroll.js';
	import Plate from '$lib/art/Plate.svelte';

	let request = null;
	let loading = true;
	let organisation = '';
	let role_title = '';
	let busy = false;
	let banner = null;
	let touched = { organisation: false, role_title: false };

	$: orgError = touched.organisation && !organisation.trim() ? 'Name the organisation.' : '';
	$: roleError = touched.role_title && !role_title.trim() ? 'Give your role there.' : '';

	const ROADMAP = [
		{ when: 'Since 1998', what: 'The reference test reactor runs, and keeps running. Operating data, not projections.' },
		{ when: '2024', what: 'Modernized module design frozen; helium loop qualification campaign opens.' },
		{ when: '2026', what: 'First licensing step cleared; the operating record accepted as evidence.' },
		{ when: '2027', what: 'Fuel qualification package and passive decay heat argument submitted.' },
		{ when: '2028', what: 'Factory build of the first module sections; site works in parallel.' },
		{ when: '2030', what: 'First deployment delivering energy under a long term contract.' }
	];

	const COMPARE = [
		['Outlet temperature', 'Zettajoule module: 750 C', 'Light water reactor: about 300 C'],
		['Products', 'Heat, hydrogen, heat and power, electricity', 'Electricity, mostly'],
		['Deployment', 'Factory built modules, one or several', 'Large single site build'],
		['Ownership', 'We own, run and staff it; you buy energy', 'The customer becomes an operator'],
		['Evidence base', 'A reactor that has run since the late 1990s', 'Varies by design']
	];

	async function loadRequest() {
		loading = true;
		if (!$auth.token) {
			request = null;
			loading = false;
			return;
		}
		try {
			request = await api('/access-request');
		} catch (err) {
			request = null;
		} finally {
			loading = false;
		}
	}

	async function submit() {
		touched = { organisation: true, role_title: true };
		banner = null;
		if (!organisation.trim() || !role_title.trim()) return;
		busy = true;
		try {
			request = await post('/access-request', {
				organisation: organisation.trim(),
				role_title: role_title.trim()
			});
			banner = {
				kind: 'pending',
				text: `Recorded as ${request.reference}. It reads pending until it is approved; the document room opens then.`
			};
			organisation = '';
			role_title = '';
			touched = { organisation: false, role_title: false };
		} catch (err) {
			banner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not record that request.'
			};
		} finally {
			busy = false;
		}
	}

	onMount(loadRequest);
</script>

<svelte:head><title>Investors | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Investors</p>
		<h1>A proven machine, sold as energy.</h1>
		<p class="lede">
			The world needs hundreds of exajoules a year and industry cannot decarbonise on electricity
			alone. High-temperature heat is the gap, and the machine that fills it already exists.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap two" use:reveal>
		<div>
			<h2>The size of the need</h2>
			<p>
				Roughly a quarter of global energy demand is industrial heat, and most of it is above the
				temperature a water-cooled reactor can reach. That is why it is still burned rather than
				electrified: not because nobody wants to change it, but because there has been nothing to
				change it to.
			</p>
			<p>
				A module is 250 MW thermal running 8000 hours a year, which is 2000 GWh delivered annually
				and roughly 900000 tonnes of carbon avoided against a fired alternative.
			</p>
			<h2>Why the business is strong</h2>
			<p>
				We do not sell reactors, we sell energy on long term contracts. The customer takes no
				nuclear licensing risk and needs no nuclear staff; we own the asset, operate it and crew it
				from our own Operations Academy. That turns a one-off capital sale into a contracted
				revenue stream with an asset behind it.
			</p>
		</div>
		<div>
			<Plate seed="investors-case" ratio="4 / 3" label="Generated plate: the investment case" />
		</div>
	</div>
</section>

<section class="section compare-band">
	<div class="wrap" use:reveal>
		<h2>How it stacks up</h2>
		<div class="table-scroll">
			<table class="data">
				<caption class="sr-only">Comparison against a conventional water-cooled reactor</caption>
				<thead>
					<tr><th scope="col">Dimension</th><th scope="col">This module</th><th scope="col">The alternative</th></tr>
				</thead>
				<tbody>
					{#each COMPARE as [dim, ours, theirs]}
						<tr><th scope="row">{dim}</th><td>{ours}</td><td>{theirs}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 use:reveal>From a proven test reactor to first deployment</h2>
		<ol class="timeline">
			{#each ROADMAP as step, i}
				<li use:reveal={{ stagger: i }}>
					<span class="t-when">{step.when}</span>
					<span class="t-what">{step.what}</span>
				</li>
			{/each}
		</ol>
	</div>
</section>

<section class="section access-band">
	<div class="wrap-narrow">
		<h2>The document room</h2>
		<p class="lede">
			Serious investors can request access to the private material: the deck, the technology dossier
			and the licensing roadmap.
		</p>

		{#if loading}
			<p aria-busy="true"><span class="spinner" aria-hidden="true"></span> Checking your request…</p>
		{:else if !$auth.token}
			<div class="banner">
				<strong>Sign in first</strong>
				An access request belongs to an account, so we know who to open the room for.
			</div>
			<a class="btn btn-primary" href="/signin?next=%2Finvestors">Sign in to request access</a>
			<a class="btn" href="/signup?next=%2Finvestors">Create an account</a>
		{:else if request}
			{#if banner}
				<div class="banner banner-{banner.kind}" role="status">
					<strong>{banner.kind === 'error' ? 'Not recorded' : 'Request recorded'}</strong>{banner.text}
				</div>
			{/if}
			<div class="card req">
				<div>
					<span class="mono ref">{request.reference}</span>
					<p class="muted" style="margin:4px 0 0">
						{request.organisation} · {request.role_title}
					</p>
				</div>
				<span
					class="pill {request.status === 'approved'
						? 'pill-success'
						: request.status === 'declined'
							? 'pill-danger'
							: 'pill-pending'}">{request.status}</span
				>
			</div>
			{#if request.status === 'approved'}
				<p style="margin-top:14px"><a class="btn btn-primary" href="/investors/room">Open the document room</a></p>
			{:else if request.status === 'pending'}
				<div class="banner banner-pending" style="margin-top:14px">
					<strong>Pending</strong>
					Your request is with us. It reads pending until it is approved, and the room opens then.
				</div>
			{:else}
				<div class="banner banner-error" style="margin-top:14px">
					<strong>Declined</strong>
					This request was declined. Get in touch if you believe that is a mistake.
				</div>
			{/if}
		{:else}
			{#if banner}
				<div class="banner banner-{banner.kind}" role="status">
					<strong>{banner.kind === 'error' ? 'Not recorded' : 'Request recorded'}</strong>{banner.text}
				</div>
			{/if}
			<form class="card" on:submit|preventDefault={submit} novalidate>
				<div class="field">
					<label for="org">Organisation</label>
					<input
						id="org"
						class="input"
						bind:value={organisation}
						on:blur={() => (touched.organisation = true)}
						aria-invalid={orgError ? 'true' : undefined}
						aria-describedby={orgError ? 'org-err' : undefined}
					/>
					{#if orgError}<p class="error-text" id="org-err">{orgError}</p>{/if}
				</div>
				<div class="field">
					<label for="role">Your role</label>
					<input
						id="role"
						class="input"
						bind:value={role_title}
						on:blur={() => (touched.role_title = true)}
						aria-invalid={roleError ? 'true' : undefined}
						aria-describedby={roleError ? 'role-err' : undefined}
					/>
					{#if roleError}<p class="error-text" id="role-err">{roleError}</p>{/if}
				</div>
				<button class="btn btn-primary" type="submit" disabled={busy}>
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Request access
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.two {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: start;
	}
	.compare-band {
		background: var(--paper-2);
	}
	.table-scroll {
		overflow-x: auto;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
	}
	.table-scroll table {
		min-width: 620px;
	}
	.timeline {
		list-style: none;
		padding: 0;
		margin: 22px 0 0;
		border-left: 2px solid var(--rule);
	}
	.timeline li {
		position: relative;
		padding: 0 0 22px 24px;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -7px;
		top: 6px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--paper);
	}
	.t-when {
		display: block;
		font-family: var(--font-head);
		font-size: 0.95rem;
	}
	.t-what {
		display: block;
		color: var(--ink-muted);
		font-size: 0.92rem;
		max-width: 62ch;
	}
	.access-band {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
	}
	.req {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
	}
	.ref {
		font-weight: 700;
	}
	.access-band .btn {
		margin-right: 8px;
	}
	@media (max-width: 860px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
