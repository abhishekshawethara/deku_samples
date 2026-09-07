<script>
	import { onMount } from 'svelte';
	import { token, account } from '$lib/session.js';
	import { api } from '$lib/api.js';
	import { reveal } from '$lib/scroll.js';

	const ROADMAP = [
		['1998', 'Test reactor first criticality', 'The high-temperature gas-cooled reactor this design modernizes begins operating.'],
		['2024', 'Company founded', 'Zettajoule forms around the energy-as-a-service model rather than reactor sales.'],
		['2025', 'Helium supply secured', 'A multi year agreement covers first inventory and make up for the initial fleet.'],
		['2026', 'Licensing step cleared', 'The fuel qualification package is accepted for regulatory review.'],
		['2027', 'Module line commissioned', 'Series manufacture of transportable sections begins.'],
		['2028', 'First module deployment', 'The first commercial module delivers heat and power under an energy agreement.']
	];

	let request = null;
	let loading = true;
	let organisation = '';
	let role_title = '';
	let busy = false;
	let banner = null;

	async function loadRequest() {
		loading = true;
		if (!$token) {
			request = null;
			loading = false;
			return;
		}
		try {
			request = await api('/api/access-request', { token: $token });
		} catch (err) {
			request = null;
		} finally {
			loading = false;
		}
	}

	onMount(loadRequest);

	async function submit() {
		banner = null;
		if (!organisation.trim() || !role_title.trim()) {
			banner = { kind: 'error', title: 'Not sent.', text: 'Both your organisation and your role are needed.' };
			return;
		}
		busy = true;
		try {
			const row = await api('/api/access-request', {
				method: 'POST',
				token: $token,
				body: { organisation: organisation.trim(), role_title: role_title.trim() }
			});
			request = row;
			banner = {
				kind: 'pending',
				title: 'Request recorded.',
				text: `Reference ${row.reference}. It reads pending until it is approved; the document room stays shut until then.`
			};
		} catch (err) {
			banner = { kind: 'error', title: 'Not sent.', text: err.message || 'That request could not be recorded.' };
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Investors, Zettajoule</title></svelte:head>

<section class="section lead">
	<div class="wrap">
		<p class="eyebrow">Investors</p>
		<h1>A proven reactor, sold as energy, into a market measured in zettajoules.</h1>
	</div>
</section>

<section class="section">
	<div class="wrap split">
		<div use:reveal>
			<h2>The size of the need</h2>
			<p class="lede">
				World primary energy demand already runs past six hundred exajoules a year and rises as electrification,
				hydrogen and desalination arrive together. More than half of it is heat, and most of that heat is above
				the temperature a water cooled reactor can reach. Every credible decarbonisation path leaves a very
				large high-temperature hole, and there is almost nothing in it.
			</p>
		</div>
		<div use:reveal>
			<h2>Why the business is strong</h2>
			<p class="lede">
				A modernized version of an operating reactor shortens the licensing path and removes first-of-a-kind
				technology risk. Selling energy rather than reactors turns a lumpy capital sale into a long term
				contracted revenue stream with an industrial counterparty, and keeps the fleet, the operators and the
				learning curve inside the company.
			</p>
		</div>
	</div>
</section>

<section class="section band">
	<div class="wrap">
		<h2>How we stack up</h2>
		<table class="data compare">
			<thead>
				<tr><th scope="col">Approach</th><th scope="col">Outlet temperature</th><th scope="col">Operating record</th><th scope="col">Who runs it</th></tr>
			</thead>
			<tbody>
				<tr><td>Zettajoule module</td><td>750 C</td><td>Test reactor since the late 1990s</td><td>We do</td></tr>
				<tr><td>Water cooled small modular reactor</td><td>About 300 C</td><td>Extensive, at large scale</td><td>The customer or a utility</td></tr>
				<tr><td>Molten salt or fast concept</td><td>High, on paper</td><td>Demonstration or none</td><td>Undecided</td></tr>
				<tr><td>Gas boiler with capture</td><td>High</td><td>Extensive</td><td>The customer</td></tr>
			</tbody>
		</table>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2>The roadmap</h2>
		<ol class="timeline">
			{#each ROADMAP as [year, title, text]}
				<li use:reveal>
					<span class="year mono">{year}</span>
					<div>
						<h3>{title}</h3>
						<p class="dense">{text}</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<section class="section band" id="access">
	<div class="wrap access">
		<h2>The private document room</h2>
		{#if loading}
			<p class="loading-note"><span class="spinner" aria-hidden="true"></span> Checking your access</p>
		{:else if !$token}
			<div class="banner banner-info">
				<strong>Sign in first.</strong> Investor access is tied to an account, so we know who is asking.
			</div>
			<a class="btn" href="/signin?next=/investors">Sign in to request access</a>
		{:else if request}
			<div class="banner banner-{request.status === 'approved' ? 'success' : request.status === 'declined' ? 'error' : 'pending'}" role="status">
				<strong>Status: {request.status}.</strong>
				{#if request.status === 'approved'}
					Your request {request.reference} is approved. The document room is open to you.
				{:else if request.status === 'declined'}
					Your request {request.reference} was declined. Send an enquiry if the circumstances have changed.
				{:else}
					Your request {request.reference} reads pending. It stays pending until it is approved, and the room stays shut until then.
				{/if}
			</div>
			<dl class="req">
				<div><dt>Reference</dt><dd class="mono">{request.reference}</dd></div>
				<div><dt>Organisation</dt><dd>{request.organisation}</dd></div>
				<div><dt>Role</dt><dd>{request.role_title}</dd></div>
			</dl>
			{#if request.status === 'approved'}
				<a class="btn" href="/investors/room">Open the document room</a>
			{:else}
				<a class="btn btn-secondary" href="/contact">Ask about your request</a>
			{/if}
		{:else}
			{#if banner}
				<div class="banner banner-{banner.kind}" role="status"><strong>{banner.title}</strong> {banner.text}</div>
			{/if}
			<p class="lede">
				Serious investors request access here. An account holds one request; it reads pending until it is
				approved, and the room answers nobody else.
			</p>
			<form class="card" on:submit|preventDefault={submit}>
				<div class="field">
					<label for="ar-org">Organisation</label>
					<input id="ar-org" type="text" bind:value={organisation} />
				</div>
				<div class="field">
					<label for="ar-role">Your role</label>
					<input id="ar-role" type="text" bind:value={role_title} />
				</div>
				<button class="btn" type="submit" disabled={busy}>{busy ? 'Sending' : 'Request access'}</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.lead {
		background: linear-gradient(180deg, #eaf1fb 0%, #fbf6ee 100%);
	}
	.lead h1 {
		max-width: 20ch;
	}
	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
	}
	.band {
		background: var(--ground-soft);
	}
	.compare {
		background: #fff;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.timeline {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		border-left: 2px solid var(--rule-strong);
	}
	.timeline li {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 18px;
		padding: 16px 0 16px 22px;
		position: relative;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -7px;
		top: 24px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--accent);
	}
	.year {
		font-weight: 700;
		color: var(--ink-muted);
	}
	.timeline h3 {
		margin-bottom: 2px;
		font-size: 1.05rem;
	}
	.timeline p {
		margin: 0;
		color: var(--ink-muted);
	}
	.access {
		max-width: 720px;
	}
	.req {
		display: grid;
		gap: 6px;
		margin: 0 0 18px;
	}
	.req div {
		display: flex;
		gap: 10px;
	}
	.req dt {
		color: var(--ink-muted);
		min-width: 120px;
	}
	.req dd {
		margin: 0;
		font-weight: 600;
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--accent);
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
	}
	[data-revealed='false'] {
		opacity: 0;
		transform: translateY(18px);
	}
	@media (max-width: 620px) {
		.timeline li {
			grid-template-columns: 1fr;
			gap: 4px;
		}
	}
</style>
