
<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { apiData, getToken, getAccount } from '$lib/api';
	import Modal from '$lib/components/Modal.svelte';

	let ready = $state(false);
	let account = $state(null);
	let loading = $state(true);
	let saves = $state([]);
	let searches = $state([]);
	let enquiries = $state([]);
	let accessRequest = $state(null);
	let applications = $state([]);
	let banner = $state(null);
	let confirm = $state(null);

	const OUT = {
		heat: 'Heat',
		'heat-and-power': 'Heat and power',
		hydrogen: 'Hydrogen',
		electricity: 'Electricity'
	};

	async function loadAll() {
		loading = true;
		const [s, se, en, ar, ap] = await Promise.allSettled([
			apiData('/saves'),
			apiData('/searches'),
			apiData('/enquiries'),
			apiData('/access-request'),
			apiData('/applications')
		]);
		saves = s.status === 'fulfilled' ? s.value || [] : [];
		searches = se.status === 'fulfilled' ? se.value || [] : [];
		enquiries = en.status === 'fulfilled' ? en.value || [] : [];
		accessRequest = ar.status === 'fulfilled' ? ar.value : null;
		applications = ap.status === 'fulfilled' ? ap.value || [] : [];
		loading = false;
	}

	$effect(() => {
		if (!browser) return;
		if (!getToken()) {
			goto('/signin?next=%2Faccount');
			return;
		}
		ready = true;
		account = getAccount();
		apiData('/accounts/me')
			.then((me) => (account = me))
			.catch(() => {});
		loadAll();
	});

	function askRemoveSave(row) {
		confirm = {
			title: 'Remove this saved solution?',
			body: `"${row.title}" will be removed from your saved solutions. This cannot be undone.`,
			action: () => removeSave(row)
		};
	}

	async function removeSave(row) {
		confirm = null;
		try {
			await apiData(`/saves/${row.id}`, { method: 'DELETE' });
			banner = { kind: 'ok', text: `${row.title} was removed from your saved solutions.` };
			if (browser) window.dispatchEvent(new CustomEvent('zj:saves'));
			await loadAll();
		} catch (err) {
			banner = { kind: 'fail', text: err.message || 'That save could not be removed.' };
		}
	}

	function askRemoveSearch(row) {
		confirm = {
			title: 'Remove this saved search?',
			body: `The saved search "${row.name}" will be deleted. This cannot be undone.`,
			action: () => removeSearch(row)
		};
	}

	async function removeSearch(row) {
		confirm = null;
		try {
			await apiData(`/searches/${row.id}`, { method: 'DELETE' });
			banner = { kind: 'ok', text: `The saved search "${row.name}" was removed.` };
			await loadAll();
		} catch (err) {
			banner = { kind: 'fail', text: err.message || 'That search could not be removed.' };
		}
	}

	function askClose(row) {
		confirm = {
			title: 'Close this enquiry?',
			body: `Enquiry ${row.reference} will be marked closed. You will not be able to reopen it here.`,
			action: () => closeEnquiry(row)
		};
	}

	async function closeEnquiry(row) {
		confirm = null;
		try {
			const updated = await apiData(`/enquiries/${row.id}/close`, { method: 'POST' });
			banner = { kind: 'ok', text: `Enquiry ${updated.reference} is now ${updated.status}.` };
			await loadAll();
		} catch (err) {
			banner = { kind: 'fail', text: err.message || 'That enquiry could not be closed.' };
		}
	}

	function statusPill(status) {
		if (status === 'approved' || status === 'answered') return 'pill-ok';
		if (status === 'pending' || status === 'received' || status === 'reviewing') return 'pill-pending';
		if (status === 'declined') return 'pill-fail';
		return '';
	}

	function fmtDate(v) {
		if (!v) return '';
		return new Date(v).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head><title>Your account, Zettajoule</title></svelte:head>

{#if !ready}
	<div class="wrap section">
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Checking your session</div>
	</div>
{:else}
	<div class="head">
		<div class="wrap">
			<p class="eyebrow">Account</p>
			<h1>{account?.display_name || 'Your account'}</h1>
			<p class="lede">
				Five lists, all yours alone: what you saved, what you searched, what you asked, the
				document room request, and the jobs you applied for.
			</p>
		</div>
	</div>

	<div class="wrap section-tight">
		{#if banner}
			<div class="banner banner-{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
				{banner.text}
			</div>
		{/if}

		{#if loading}
			<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading your lists</div>
		{:else}
			<div class="lists">
				<!-- 1. saved solutions -->
				<section class="card list" aria-labelledby="l-saves">
					<h2 id="l-saves">Saved solutions <span class="n">{saves.length}</span></h2>
					{#if saves.length === 0}
						<div class="empty">
							<h3>Nothing saved yet</h3>
							<p>Save a card in the explorer and it lands here.</p>
							<a class="btn btn-sm btn-secondary" href="/solutions">Open the explorer</a>
						</div>
					{:else}
						<ul data-testid="account-saves">
							{#each saves as row (row.id)}
								<li>
									<div>
										<a href="/solutions/{row.slug}">{row.title}</a>
										<p class="meta">
											{OUT[row.output_kind] ?? row.output_kind} · {row.temperature_band}
										</p>
									</div>
									<button class="btn btn-sm btn-danger" type="button" onclick={() => askRemoveSave(row)}>
										Remove<span class="visually-hidden"> {row.title}</span>
									</button>
								</li>
							{/each}
						</ul>
						<a class="btn btn-sm btn-quiet" href="/compare">Compare up to four</a>
					{/if}
				</section>

				<!-- 2. saved searches -->
				<section class="card list" aria-labelledby="l-searches">
					<h2 id="l-searches">Saved searches <span class="n">{searches.length}</span></h2>
					{#if searches.length === 0}
						<div class="empty">
							<h3>No saved search</h3>
							<p>Filter the explorer and save that combination under a name.</p>
							<a class="btn btn-sm btn-secondary" href="/solutions">Go and filter</a>
						</div>
					{:else}
						<ul data-testid="account-searches">
							{#each searches as row (row.id)}
								<li>
									<div>
										<a
											href="/solutions?{new URLSearchParams(
												Object.fromEntries(
													Object.entries({
														industry: row.industry,
														output_kind: row.output_kind,
														temperature_band: row.temperature_band,
														deployment: row.deployment,
														q: row.query
													}).filter(([, v]) => v)
												)
											).toString()}">{row.name}</a
										>
										<p class="meta">
											{[row.industry, row.output_kind, row.temperature_band, row.deployment, row.query]
												.filter(Boolean)
												.join(' · ') || 'No filters set'}
										</p>
									</div>
									<button
										class="btn btn-sm btn-danger"
										type="button"
										onclick={() => askRemoveSearch(row)}
									>
										Remove<span class="visually-hidden"> the search {row.name}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- 3. enquiries -->
				<section class="card list" aria-labelledby="l-enquiries">
					<h2 id="l-enquiries">Enquiries <span class="n">{enquiries.length}</span></h2>
					{#if enquiries.length === 0}
						<div class="empty">
							<h3>You have not sent an enquiry</h3>
							<p>Send one and its reference and status appear here.</p>
							<a class="btn btn-sm btn-secondary" href="/contact">Get in Touch</a>
						</div>
					{:else}
						<ul data-testid="account-enquiries">
							{#each enquiries as row (row.id)}
								<li>
									<div>
										<span class="mono ref">{row.reference}</span>
										<p class="meta">{row.topic} · sent {fmtDate(row.created_at)}</p>
									</div>
									<div class="right">
										<span class="pill {statusPill(row.status)}">{row.status}</span>
										{#if row.status !== 'closed'}
											<button class="btn btn-sm btn-danger" type="button" onclick={() => askClose(row)}>
												Close<span class="visually-hidden"> enquiry {row.reference}</span>
											</button>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- 4. investor access request -->
				<section class="card list" aria-labelledby="l-access">
					<h2 id="l-access">Investor access</h2>
					{#if !accessRequest}
						<div class="empty">
							<h3>No access request made</h3>
							<p>Request the private document room from the investors route.</p>
							<a class="btn btn-sm btn-secondary" href="/investors">Request access</a>
						</div>
					{:else}
						<dl class="kv" data-testid="account-access">
							<dt>Reference</dt>
							<dd class="mono">{accessRequest.reference}</dd>
							<dt>Organisation</dt>
							<dd>{accessRequest.organisation}</dd>
							<dt>Role</dt>
							<dd>{accessRequest.role_title}</dd>
							<dt>Status</dt>
							<dd>
								<span class="pill {statusPill(accessRequest.status)}" data-testid="access-status">
									{accessRequest.status}
								</span>
							</dd>
						</dl>
						{#if accessRequest.status === 'approved'}
							<a class="btn btn-sm" href="/investors/room">Open the document room</a>
						{:else if accessRequest.status === 'pending'}
							<p class="muted small">
								The room opens once this request is approved. It reads pending until then.
							</p>
						{:else}
							<p class="muted small">
								This request was declined, so the document room stays closed. Contact us if that is
								wrong.
							</p>
						{/if}
					{/if}
				</section>

				<!-- 5. applications -->
				<section class="card list" aria-labelledby="l-apps">
					<h2 id="l-apps">Job applications <span class="n">{applications.length}</span></h2>
					{#if applications.length === 0}
						<div class="empty">
							<h3>No application sent</h3>
							<p>Apply to an open job and it appears here with its status.</p>
							<a class="btn btn-sm btn-secondary" href="/careers">See open jobs</a>
						</div>
					{:else}
						<ul data-testid="account-applications">
							{#each applications as row (row.id)}
								<li>
									<div>
										<strong>{row.job_title}</strong>
										<p class="meta">{row.location} · applied {fmtDate(row.created_at)}</p>
									</div>
									<span class="pill {statusPill(row.status)}">{row.status}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
		{/if}
	</div>

	<Modal open={!!confirm} title={confirm?.title || ''} onclose={() => (confirm = null)}>
		<p>{confirm?.body}</p>
		<div class="confirm-actions">
			<button class="btn btn-danger" type="button" onclick={() => confirm?.action?.()}>
				Yes, do it
			</button>
			<button class="btn btn-secondary" type="button" onclick={() => (confirm = null)}>Cancel</button>
		</div>
	</Modal>
{/if}

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 40px 0 32px;
	}
	.lists {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		padding-bottom: 60px;
	}
	.list h2 {
		font-size: 1.08rem;
		margin: 0 0 12px;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.n {
		font-family: var(--font-body);
		font-size: 0.76rem;
		font-weight: 700;
		background: var(--surface-sunk);
		border: var(--hair) solid var(--rule);
		border-radius: 999px;
		padding: 1px 9px;
		color: var(--ink-muted);
	}
	/* compact density on the account lists */
	.list ul {
		list-style: none;
		margin: 0 0 12px;
		padding: 0;
	}
	.list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 9px 0;
		border-top: var(--hair) solid var(--rule);
		font-size: 0.9rem;
	}
	.meta {
		margin: 2px 0 0;
		font-size: 0.78rem;
		color: var(--ink-muted);
	}
	.ref {
		font-weight: 650;
	}
	.right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}
	.kv {
		display: grid;
		grid-template-columns: 130px minmax(0, 1fr);
		gap: 7px 12px;
		margin: 0 0 14px;
		font-size: 0.9rem;
	}
	.kv dt {
		color: var(--ink-muted);
		font-weight: 650;
	}
	.kv dd {
		margin: 0;
	}
	.small {
		font-size: 0.85rem;
	}
	.confirm-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 16px;
	}
	@media (max-width: 900px) {
		.lists {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
