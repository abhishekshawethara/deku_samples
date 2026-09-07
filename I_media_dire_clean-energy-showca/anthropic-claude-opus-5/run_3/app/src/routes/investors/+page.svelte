<script>
	import { browser } from '$app/environment';
	import Reveal from '$lib/Reveal.svelte';
	import Plate from '$lib/Plate.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { token } from '$lib/auth.js';

	let request = $state(null);
	let loading = $state(true);
	let organisation = $state('');
	let role_title = $state('');
	let busy = $state(false);
	let banner = $state(null);

	$effect(() => {
		if (!browser) return;
		if (!$token) {
			loading = false;
			return;
		}
		loading = true;
		api('/access-request')
			.then(({ data }) => (request = data))
			.catch(() => (request = null))
			.finally(() => (loading = false));
	});

	async function submit(event) {
		event.preventDefault();
		banner = null;
		if (!organisation.trim() || !role_title.trim()) {
			banner = { kind: 'fail', text: 'Give your organisation and your role.' };
			return;
		}
		busy = true;
		try {
			const { data } = await api('/access-request', {
				method: 'POST',
				body: { organisation: organisation.trim(), role_title: role_title.trim() }
			});
			request = data;
			banner = {
				kind: 'ok',
				text: `Request recorded as ${data.reference}. It reads pending until it is approved, and an acknowledgement is on its way to your inbox.`
			};
		} catch (e) {
			banner = {
				kind: 'fail',
				text:
					e instanceof ApiError && e.status === 401
						? 'Sign in first: an access request belongs to an account.'
						: e.message
			};
		} finally {
			busy = false;
		}
	}

	const TIMELINE = [
		['1998', 'The reference test reactor goes critical and begins the operating record this design rests on.'],
		['2024', 'Modernized module design frozen; the digital twin programme starts against the test reactor data.'],
		['2026', 'Pre-application review closed out; first firm module order signed.'],
		['2027', 'Formal design submission and long lead procurement for vessel and circulators.'],
		['2029', 'Construction permit and factory build of the first modules.'],
		['2031', 'First deployment delivering heat and power under an energy supply agreement.']
	];

	const COMPARISON = [
		['Zettajoule module', '750 C', 'Heat, hydrogen, power', 'Modular, factory built', 'Owned and run by us'],
		['Water-cooled SMR', '300 C', 'Electricity only', 'Modular', 'Customer or utility operated'],
		['Gas-fired heat', '700 C plus', 'Heat and power', 'Bespoke build', 'Customer operated, emitting'],
		['Renewables plus storage', 'Low grade', 'Electricity', 'Land hungry', 'Weather dependent']
	];
</script>

<svelte:head><title>Investors · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Investors</p>
		<Reveal as="h1" text="The case" />
		<p class="lede">
			The world will need a zettajoule of clean energy, most of it as heat, and most of that hotter
			than a water-cooled reactor can reach. This is a proven machine, modernized, sold as a service.
		</p>
	</div>
</section>

<section class="section wrap grid grid--2">
	<div>
		<h2>The size of the need</h2>
		<p>
			Industrial process heat is roughly a quarter of global final energy use and it is the part that
			has no easy substitute. Electrification reaches some of it; the rest wants temperature, and
			temperature is what burns fuel today. That is the demand this business is pointed at, and it
			does not shrink on any credible path.
		</p>
		<h2>Why a service, not a sale</h2>
		<p>
			Selling reactors means selling an operating obligation to a customer who does not want one.
			Selling energy means Zettajoule owns the module, runs it and staffs it through its own
			Operations Academy, and the customer signs the kind of supply agreement they already sign. It
			puts the risk with the party that understands it and gives the business recurring revenue over
			the life of each installation.
		</p>
	</div>
	<div>
		<Plate seed="investor-case" ratio="4 / 3" label="Generated plate: the investment case" />
		<h2 class="mt">How it stacks up</h2>
		<div class="scroller">
			<table class="data">
				<thead>
					<tr>
						<th scope="col">Option</th>
						<th scope="col">Temperature</th>
						<th scope="col">Outputs</th>
						<th scope="col">Build</th>
						<th scope="col">Operation</th>
					</tr>
				</thead>
				<tbody>
					{#each COMPARISON as row}
						<tr>
							<th scope="row">{row[0]}</th>
							<td>{row[1]}</td>
							<td>{row[2]}</td>
							<td>{row[3]}</td>
							<td>{row[4]}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<section class="section wrap">
	<h2>Roadmap</h2>
	<p class="lede">From the proven test reactor to first deployment.</p>
	<ol class="timeline">
		{#each TIMELINE as [year, text]}
			<li>
				<span class="timeline__year">{year}</span>
				<span class="timeline__text">{text}</span>
			</li>
		{/each}
	</ol>
</section>

<section class="section wrap room-ask" id="access">
	<div class="card card--pad">
		<h2>The document room</h2>
		{#if loading}
			<p class="loading-row"><span class="spinner" aria-hidden="true"></span> Checking your request…</p>
		{:else if !$token}
			<p>
				The private document room holds the investor deck, the technology dossier and the licensing
				roadmap. Access is by request, on an account.
			</p>
			<a class="btn" href="/signin?next=/investors">Sign in to request access</a>
		{:else if request}
			{#if banner}
				<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
					<strong>{banner.kind === 'ok' ? 'Recorded' : 'Refused'}</strong>
					<span>{banner.text}</span>
				</div>
			{/if}
			<p class="request-line">
				<span class="ref">{request.reference}</span>
				<span class="status-tag status-tag--{request.status}">{request.status}</span>
			</p>
			<p class="muted">{request.organisation} · {request.role_title}</p>
			{#if request.status === 'approved'}
				<p>Your request is approved. The room is open to you.</p>
				<a class="btn" href="/investors/room">Open the document room</a>
			{:else if request.status === 'pending'}
				<p>
					Plainly: your request is <b>pending</b>. The room stays shut until it is approved, and
					approval happens outside this product. You hold one request per account, so asking again
					updates this one rather than adding a second.
				</p>
			{:else}
				<p>This request was declined, so the room stays shut.</p>
			{/if}
		{:else}
			{#if banner}
				<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
					<strong>{banner.kind === 'ok' ? 'Recorded' : 'Refused'}</strong>
					<span>{banner.text}</span>
				</div>
			{/if}
			<p>
				Serious investors request access here. A new request reads <b>pending</b> until it is
				approved, and one account holds one request.
			</p>
			<form onsubmit={submit} novalidate>
				<div class="field">
					<label for="org">Organisation</label>
					<input id="org" type="text" bind:value={organisation} autocomplete="organization" />
				</div>
				<div class="field">
					<label for="role">Your role</label>
					<input id="role" type="text" bind:value={role_title} autocomplete="organization-title" />
				</div>
				<button class="btn" type="submit" disabled={busy}>
					{#if busy}<span class="spinner" aria-hidden="true"></span> Requesting{:else}Request access{/if}
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.mt {
		margin-top: 1.5rem;
	}
	.scroller {
		overflow-x: auto;
	}
	.timeline {
		list-style: none;
		margin: 1.5rem 0 0;
		padding: 0 0 0 1rem;
		border-left: 2px solid var(--rule-strong);
	}
	.timeline li {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 1rem;
		padding: 0.75rem 0 0.75rem 1rem;
		position: relative;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -1.42rem;
		top: 1.25rem;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--paper);
	}
	.timeline__year {
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.timeline__text {
		color: var(--ink-muted);
	}
	.room-ask {
		max-width: 760px;
	}
	.request-line {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-weight: 700;
	}
	.ref {
		font-family: var(--font-mono);
	}
	@media (max-width: 560px) {
		.timeline li {
			grid-template-columns: 1fr;
			gap: 0.2rem;
		}
	}
</style>
