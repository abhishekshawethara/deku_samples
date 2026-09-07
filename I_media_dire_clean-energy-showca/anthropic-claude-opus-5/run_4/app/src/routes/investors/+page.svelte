<script>
	import { onMount } from 'svelte';
	import { api, getToken, ApiError } from '$lib/api.js';
	import { account } from '$lib/session.js';
	import Plate from '$lib/components/Plate.svelte';

	let request = null;
	let checked = false;
	let organisation = '';
	let roleTitle = '';
	let busy = false;
	let banner = null;
	let touched = {};

	const ROADMAP = [
		{ year: '1998', title: 'The proven ancestor', body: 'The test reactor our design modernizes goes critical and begins the operating record the whole case rests on.' },
		{ year: '2024', title: 'Helium loop programme', body: 'Full-scale component testing at outlet conditions: circulator, seals and the process heat exchanger.' },
		{ year: '2026', title: 'Licensing step cleared', body: 'The design description and safety approach are accepted, closing the first formal step of the route.' },
		{ year: '2027', title: 'First module order', body: 'A firm multi-module order converts the engineering programme into a delivery date.' },
		{ year: '2029', title: 'First deployment', body: 'First energy delivered under a supply contract: we own it, we run it, we staff it.' }
	];

	const COMPARISON = [
		['Outlet temperature', '750 C', '300 C', 'Flame, variable'],
		['Carbon at the site', 'None', 'None', 'Substantial'],
		['Industrial process heat', 'Yes', 'Rarely', 'Yes'],
		['Hydrogen by electrolysis', 'Efficient', 'Electrical only', 'Not applicable'],
		['Deployment', 'Factory modules', 'Bespoke build', 'Bespoke build']
	];

	$: errors = {
		organisation: !organisation.trim() ? 'Name the organisation you represent.' : '',
		roleTitle: !roleTitle.trim() ? 'Give your role there.' : ''
	};
	$: valid = !errors.organisation && !errors.roleTitle;

	async function loadRequest() {
		if (!getToken()) {
			checked = true;
			return;
		}
		try {
			request = await api('/access-request');
		} catch {
			request = null;
		} finally {
			checked = true;
		}
	}

	async function submit() {
		touched = { organisation: true, roleTitle: true };
		banner = null;
		if (!valid) {
			banner = { kind: 'fail', title: 'Check the form', text: 'Both fields are needed before this can be sent.' };
			return;
		}
		busy = true;
		try {
			const res = await api('/access-request', {
				method: 'POST',
				body: { organisation: organisation.trim(), role_title: roleTitle.trim() }
			});
			request = res;
			banner = {
				kind: 'pending',
				title: 'Request recorded',
				text: `Your reference is ${res.reference} and its status is ${res.status}. The document room stays shut until it is approved. An account holds at most one request: asking again updates this one.`
			};
			organisation = '';
			roleTitle = '';
			touched = {};
		} catch (err) {
			banner = {
				kind: 'fail',
				title: 'That request was refused',
				text: err instanceof ApiError ? err.message : 'The server could not be reached.'
			};
		} finally {
			busy = false;
		}
	}

	onMount(loadRequest);
</script>

<svelte:head>
	<title>Investors, Zettajoule</title>
	<meta name="description" content="The investment case for Zettajoule: a modernized proven reactor sold as energy." />
</svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Investors</p>
	<h1>A proven machine, sold as energy</h1>
	<p class="lede">
		The world uses roughly six hundred exajoules of primary energy a year and the number keeps climbing. The
		part of it that is high-grade industrial heat has almost no clean answer today. That is the gap this
		company was built for.
	</p>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div>
			<h2>Why this is a business</h2>
			<p>
				We do not sell reactors. We own them, run them and staff them, and sell the energy under a long
				supply contract. That keeps the licence, the fuel and the crew with the people who designed the
				machine, and it turns a capital sale into a recurring revenue line with an industrial counterparty.
			</p>
			<p>
				The design modernizes a test reactor that has been running since the late 1990s, so the regulator is
				reviewing a modernization rather than a concept. That is the schedule advantage, and schedule is
				where most new nuclear ventures die.
			</p>
		</div>
		<Plate seed="investor-case" label="Generated plate: the investment case" ratio="4 / 3" />
	</div>
</section>

<section class="section wrap" aria-labelledby="stack-heading">
	<h2 id="stack-heading">How it stacks up</h2>
	<div class="tablewrap">
		<table>
			<caption class="visually-hidden">Zettajoule against the alternatives</caption>
			<thead>
				<tr><th scope="col">Measure</th><th scope="col">Zettajoule</th><th scope="col">Water-cooled nuclear</th><th scope="col">Fired heat</th></tr>
			</thead>
			<tbody>
				{#each COMPARISON as row}
					<tr>
						<th scope="row">{row[0]}</th>
						<td class="strong">{row[1]}</td>
						<td>{row[2]}</td>
						<td>{row[3]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="section wrap" aria-labelledby="roadmap-heading">
	<h2 id="roadmap-heading">The roadmap</h2>
	<ol class="timeline">
		{#each ROADMAP as step}
			<li>
				<span class="timeline__year mono">{step.year}</span>
				<div>
					<h3>{step.title}</h3>
					<p>{step.body}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>

<section class="section wrap" aria-labelledby="access-heading">
	<div class="access card">
		<h2 id="access-heading">The document room</h2>
		<p>
			Serious investors can request access to the private material: the deck, the technology dossier and the
			licensing roadmap. Access is granted by us, outside this product, and stays pending until then.
		</p>

		{#if banner}
			<div class="banner banner--{banner.kind}" role="status" data-testid="access-banner">
				<span class="banner__title">{banner.title}</span>{banner.text}
			</div>
		{/if}

		{#if !$account}
			<div class="banner banner--info">
				<span class="banner__title">Sign in first</span>
				A request belongs to an account. <a href="/signin?next=%2Finvestors">Sign in</a> or
				<a href="/signup?next=%2Finvestors">create an account</a> to make one.
			</div>
		{:else if !checked}
			<p><span class="spinner" aria-hidden="true"></span> Checking your request</p>
		{:else if request}
			<div class="current" data-testid="access-current">
				<p class="mono"><strong>{request.reference}</strong></p>
				<p class="sub">{request.organisation} &middot; {request.role_title}</p>
				<p>
					<span class="chip {request.status === 'approved' ? 'chip--ok' : request.status === 'pending' ? 'chip--pending' : 'chip--fail'}">
						{request.status}
					</span>
				</p>
				{#if request.status === 'approved'}
					<a class="btn" href="/investors/room">Open the document room</a>
				{:else if request.status === 'pending'}
					<div class="banner banner--pending">
						<span class="banner__title">Pending</span>
						It stays pending until approved, and the room stays shut meanwhile.
					</div>
				{:else}
					<div class="banner banner--fail">
						<span class="banner__title">Declined</span>
						This request was declined. <a href="/contact">Get in touch</a> if that looks wrong.
					</div>
				{/if}
				<details class="again">
					<summary>Update this request</summary>
					<p class="sub">An account holds at most one request. Sending again updates this one, never adds a second.</p>
					<form on:submit|preventDefault={submit} novalidate>
						<div class="field">
							<label for="org2">Organisation</label>
							<input id="org2" type="text" bind:value={organisation} on:blur={() => (touched.organisation = true)} />
							{#if touched.organisation && errors.organisation}<p class="field__error">{errors.organisation}</p>{/if}
						</div>
						<div class="field">
							<label for="role2">Your role</label>
							<input id="role2" type="text" bind:value={roleTitle} on:blur={() => (touched.roleTitle = true)} />
							{#if touched.roleTitle && errors.roleTitle}<p class="field__error">{errors.roleTitle}</p>{/if}
						</div>
						<button class="btn btn--ghost" type="submit" disabled={busy}>
							{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Update request
						</button>
					</form>
				</details>
			</div>
		{:else}
			<form on:submit|preventDefault={submit} novalidate>
				<div class="field">
					<label for="org">Organisation</label>
					<input
						id="org"
						type="text"
						bind:value={organisation}
						on:blur={() => (touched.organisation = true)}
						aria-invalid={touched.organisation && errors.organisation ? 'true' : 'false'}
						data-testid="access-org"
					/>
					{#if touched.organisation && errors.organisation}<p class="field__error">{errors.organisation}</p>{/if}
				</div>
				<div class="field">
					<label for="role">Your role</label>
					<input
						id="role"
						type="text"
						bind:value={roleTitle}
						on:blur={() => (touched.roleTitle = true)}
						aria-invalid={touched.roleTitle && errors.roleTitle ? 'true' : 'false'}
						data-testid="access-role"
					/>
					{#if touched.roleTitle && errors.roleTitle}<p class="field__error">{errors.roleTitle}</p>{/if}
				</div>
				<button class="btn" type="submit" disabled={busy} data-testid="access-submit">
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
					Request access
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.tablewrap {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}
	table {
		min-width: 620px;
	}
	.strong {
		font-weight: 700;
		color: var(--accent-hover);
	}
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		border-left: 2px solid var(--rule);
	}
	.timeline li {
		display: grid;
		grid-template-columns: 5rem 1fr;
		gap: 1rem;
		padding: 0 0 1.5rem 1.5rem;
		position: relative;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -7px;
		top: 8px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--paper);
	}
	.timeline__year {
		font-weight: 700;
		color: var(--accent-hover);
	}
	.timeline h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
	}
	.timeline p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.access {
		max-width: 640px;
		padding: 1.5rem;
	}
	.sub {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
	.current p {
		margin: 0 0 0.5rem;
	}
	.again {
		margin-top: 1.25rem;
		border-top: 1px solid var(--rule);
		padding-top: 0.9rem;
	}
	.again summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9rem;
	}
	@media (max-width: 560px) {
		.timeline li {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}
	}
</style>
