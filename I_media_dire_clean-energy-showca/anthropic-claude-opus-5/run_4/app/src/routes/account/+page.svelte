<script>
	/* The five private lists. Every row shown here is the caller's own: the
	   endpoints take no account identifier at all. */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api, getToken, ApiError } from '$lib/api.js';
	import { account, sessionReady, refreshSaves } from '$lib/session.js';
	import Modal from '$lib/components/Modal.svelte';

	let loading = true;
	let saves = [];
	let searches = [];
	let enquiries = [];
	let accessRequest = null;
	let applications = [];
	let banner = null;
	let confirming = null;

	function fmtDate(d) {
		return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
	}

	function statusChip(status) {
		if (status === 'approved') return 'chip--ok';
		if (status === 'pending' || status === 'received' || status === 'reviewing') return 'chip--pending';
		if (status === 'declined') return 'chip--fail';
		return '';
	}

	async function loadAll() {
		loading = true;
		try {
			const [s, se, en, ap] = await Promise.all([
				api('/saves').catch(() => []),
				api('/searches').catch(() => []),
				api('/enquiries').catch(() => []),
				api('/applications').catch(() => [])
			]);
			saves = s;
			searches = se;
			enquiries = en;
			applications = ap;
			try {
				accessRequest = await api('/access-request');
			} catch (err) {
				accessRequest = null;
			}
		} finally {
			loading = false;
		}
	}

	async function removeSave(row) {
		banner = null;
		try {
			await api(`/saves/${row.id}`, { method: 'DELETE' });
			saves = saves.filter((s) => s.id !== row.id);
			await refreshSaves();
			banner = { kind: 'ok', text: `Removed ${row.slug} from your saved solutions.` };
		} catch (err) {
			banner = { kind: 'fail', text: err instanceof ApiError ? err.message : 'That could not be removed.' };
		}
	}

	async function removeSearch(row) {
		banner = null;
		try {
			await api(`/searches/${row.id}`, { method: 'DELETE' });
			searches = searches.filter((s) => s.id !== row.id);
			banner = { kind: 'ok', text: `Removed the saved search "${row.name}".` };
		} catch (err) {
			banner = { kind: 'fail', text: err instanceof ApiError ? err.message : 'That could not be removed.' };
		}
	}

	async function closeEnquiry(row) {
		banner = null;
		try {
			const updated = await api(`/enquiries/${row.id}/close`, { method: 'POST' });
			enquiries = enquiries.map((e) => (e.id === row.id ? { ...e, status: updated.status } : e));
			banner = { kind: 'ok', text: `Enquiry ${row.reference} is now closed.` };
		} catch (err) {
			banner = { kind: 'fail', text: err instanceof ApiError ? err.message : 'That enquiry could not be closed.' };
		}
	}

	function askConfirm(kind, row) {
		confirming = { kind, row };
	}

	async function doConfirm() {
		const { kind, row } = confirming;
		confirming = null;
		if (kind === 'save') await removeSave(row);
		else if (kind === 'search') await removeSearch(row);
		else if (kind === 'enquiry') await closeEnquiry(row);
	}

	onMount(async () => {
		if (!getToken()) {
			await goto('/signin?next=%2Faccount', { replaceState: true });
			return;
		}
		await loadAll();
	});

	$: searchFilters = (s) =>
		[
			s.query && `search "${s.query}"`,
			s.industry,
			s.output_kind,
			s.temperature_band,
			s.deployment
		]
			.filter(Boolean)
			.join(', ') || 'no filters';

	function searchHref(s) {
		const qs = new URLSearchParams();
		for (const k of ['q', 'industry', 'output_kind', 'temperature_band', 'deployment']) {
			const v = k === 'q' ? s.query : s[k];
			if (v) qs.set(k, v);
		}
		return `/solutions${qs.toString() ? `?${qs}` : ''}`;
	}
</script>

<svelte:head><title>Your account, Zettajoule</title></svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Account</p>
	<h1>{$account ? $account.display_name : 'Your account'}</h1>
	<p class="lede">
		{#if $account}{$account.email} &middot; {/if}Five lists, all of them yours alone. No one else can reach a row
		here, by this page or by the API.
	</p>
</section>

<section class="wrap section--tight">
	{#if banner}
		<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status" data-testid="account-banner">
			{banner.text}
		</div>
	{/if}

	{#if loading}
		<div class="card"><span class="spinner" aria-hidden="true"></span> Loading your lists</div>
	{:else}
		<div class="lists">
			<!-- 1: saved solutions -->
			<section class="list" aria-labelledby="l-saves">
				<div class="list__head">
					<h2 id="l-saves">Saved solutions</h2>
					<span class="count">{saves.length}</span>
				</div>
				{#if saves.length === 0}
					<div class="empty">
						<p><strong>No saved solutions.</strong></p>
						<p>Nothing has been kept from the explorer yet.</p>
						<a class="btn btn--small" href="/solutions">Open the explorer</a>
					</div>
				{:else}
					<ul data-testid="account-saves">
						{#each saves as row (row.id)}
							<li>
								<div>
									<a href="/solutions/{row.slug}"><strong>{row.industry || row.slug}</strong></a>
									<span class="sub">{row.slug} &middot; {row.output_kind} &middot; {row.temperature_band}</span>
								</div>
								<button class="btn btn--danger btn--small" type="button" on:click={() => askConfirm('save', row)}>
									Remove
								</button>
							</li>
						{/each}
					</ul>
					<a class="btn btn--ghost btn--small" href="/compare">Compare up to four</a>
				{/if}
			</section>

			<!-- 2: saved searches -->
			<section class="list" aria-labelledby="l-searches">
				<div class="list__head">
					<h2 id="l-searches">Saved searches</h2>
					<span class="count">{searches.length}</span>
				</div>
				{#if searches.length === 0}
					<div class="empty">
						<p><strong>No saved searches.</strong></p>
						<p>Name a filter combination in the explorer to keep it.</p>
						<a class="btn btn--small" href="/solutions">Open the explorer</a>
					</div>
				{:else}
					<ul data-testid="account-searches">
						{#each searches as row (row.id)}
							<li>
								<div>
									<a href={searchHref(row)}><strong>{row.name}</strong></a>
									<span class="sub">{searchFilters(row)}</span>
								</div>
								<button class="btn btn--danger btn--small" type="button" on:click={() => askConfirm('search', row)}>
									Remove
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- 3: enquiries -->
			<section class="list list--wide" aria-labelledby="l-enquiries">
				<div class="list__head">
					<h2 id="l-enquiries">Enquiries</h2>
					<span class="count">{enquiries.length}</span>
				</div>
				{#if enquiries.length === 0}
					<div class="empty">
						<p><strong>No enquiries sent.</strong></p>
						<p>Nothing has been asked from this account yet.</p>
						<a class="btn btn--small" href="/contact">Send an enquiry</a>
					</div>
				{:else}
					<ul data-testid="account-enquiries">
						{#each enquiries as row (row.id)}
							<li>
								<div>
									<strong class="mono">{row.reference}</strong>
									<span class="sub">{row.topic} &middot; {fmtDate(row.created_at)}</span>
									<span class="sub sub--msg">{row.message}</span>
								</div>
								<div class="list__actions">
									<span class="chip {statusChip(row.status)}">{row.status}</span>
									{#if row.status !== 'closed'}
										<button
											class="btn btn--ghost btn--small"
											type="button"
											on:click={() => askConfirm('enquiry', row)}
											data-testid="close-{row.reference}"
										>
											Close
										</button>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- 4: investor access request -->
			<section class="list" aria-labelledby="l-access">
				<div class="list__head">
					<h2 id="l-access">Investor access</h2>
				</div>
				{#if !accessRequest}
					<div class="empty">
						<p><strong>No access request.</strong></p>
						<p>The document room stays shut until a request of yours is approved.</p>
						<a class="btn btn--small" href="/investors">Request access</a>
					</div>
				{:else}
					<div class="access" data-testid="account-access">
						<p class="mono"><strong>{accessRequest.reference}</strong></p>
						<p class="sub">{accessRequest.organisation} &middot; {accessRequest.role_title}</p>
						<p><span class="chip {statusChip(accessRequest.status)}">{accessRequest.status}</span></p>
						{#if accessRequest.status === 'approved'}
							<a class="btn btn--small" href="/investors/room">Open the document room</a>
						{:else if accessRequest.status === 'pending'}
							<div class="banner banner--pending">
								<span class="banner__title">Pending</span>
								Your request is with the team. The room opens once it is approved.
							</div>
						{:else}
							<div class="banner banner--fail">
								<span class="banner__title">Declined</span>
								This request was declined, so the room stays shut. Contact us if that looks wrong.
							</div>
						{/if}
					</div>
				{/if}
			</section>

			<!-- 5: applications -->
			<section class="list" aria-labelledby="l-apps">
				<div class="list__head">
					<h2 id="l-apps">Job applications</h2>
					<span class="count">{applications.length}</span>
				</div>
				{#if applications.length === 0}
					<div class="empty">
						<p><strong>No applications.</strong></p>
						<p>Nothing has been applied for from this account.</p>
						<a class="btn btn--small" href="/careers">See open roles</a>
					</div>
				{:else}
					<ul data-testid="account-applications">
						{#each applications as row (row.id)}
							<li>
								<div>
									<strong>{row.job_title}</strong>
									<span class="sub">{row.location} &middot; {fmtDate(row.created_at)}</span>
								</div>
								<span class="chip {statusChip(row.status)}">{row.status}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>
	{/if}
</section>

<Modal
	open={!!confirming}
	title={confirming?.kind === 'enquiry' ? 'Close this enquiry?' : 'Remove this?'}
	on:close={() => (confirming = null)}
>
	{#if confirming}
		<p>
			{#if confirming.kind === 'enquiry'}
				Closing enquiry <strong class="mono">{confirming.row.reference}</strong> marks it closed. It cannot be
				reopened from here.
			{:else if confirming.kind === 'save'}
				<strong>{confirming.row.slug}</strong> will be removed from your saved solutions.
			{:else}
				The saved search <strong>{confirming.row.name}</strong> will be removed.
			{/if}
		</p>
		<div class="confirm">
			<button class="btn btn--danger" type="button" on:click={doConfirm} data-autofocus>
				{confirming.kind === 'enquiry' ? 'Close it' : 'Remove it'}
			</button>
			<button class="btn btn--ghost" type="button" on:click={() => (confirming = null)}>Keep it</button>
		</div>
	{/if}
</Modal>

<style>
	.lists {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1rem;
	}
	.list {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
	}
	.list--wide {
		grid-column: 1 / -1;
	}
	.list__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--rule);
	}
	.list__head h2 {
		margin: 0;
		font-size: 1.05rem;
	}
	.count {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
	.list ul {
		list-style: none;
		margin: 0 0 0.75rem;
		padding: 0;
	}
	.list li {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--rule);
	}
	.list li > div:first-child {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.sub {
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
	.sub--msg {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.list__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: none;
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	.access p {
		margin: 0 0 0.5rem;
	}
	.confirm {
		display: flex;
		gap: 0.6rem;
		margin-top: 1.25rem;
	}
</style>
