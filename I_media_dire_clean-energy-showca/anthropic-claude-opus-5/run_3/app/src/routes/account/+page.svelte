<script>
	// The five private lists. Every row here is the caller's own: the server
	// takes no account identifier on any of these reads.
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api.js';
	import { token, account, signOutTo } from '$lib/auth.js';
	import { saves, refreshSaves, savesLoading } from '$lib/saves.js';
	import Modal from '$lib/Modal.svelte';

	let searches = $state([]);
	let enquiries = $state([]);
	let accessRequest = $state(null);
	let applications = $state([]);
	let loading = $state(true);
	let banner = $state(null);

	let confirm = $state(null); // a destructive action confirms first

	// Unauthenticated at /account goes to /signin?next=/account
	$effect(() => {
		if (!browser) return;
		if (!$token) {
			goto(`/signin?next=${encodeURIComponent($page.url.pathname)}`, { replaceState: true });
		}
	});

	async function loadAll() {
		if (!browser || !$token) return;
		loading = true;
		try {
			const [s, e, a] = await Promise.all([
				api('/searches').then((r) => r.data).catch(() => []),
				api('/enquiries').then((r) => r.data).catch(() => []),
				api('/applications').then((r) => r.data).catch(() => [])
			]);
			searches = s;
			enquiries = e;
			applications = a;
			try {
				const { data } = await api('/access-request');
				accessRequest = data;
			} catch (err) {
				accessRequest = null; // no request on this account
			}
			await refreshSaves();
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (browser && $token) loadAll();
	});

	async function removeSave(row) {
		try {
			await api(`/saves/${row.id}`, { method: 'DELETE' });
			await refreshSaves();
			banner = { kind: 'ok', text: `Removed ${row.slug} from your saved solutions.` };
		} catch (e) {
			banner = { kind: 'fail', text: e.message };
		} finally {
			confirm = null;
		}
	}

	async function removeSearch(row) {
		try {
			await api(`/searches/${row.id}`, { method: 'DELETE' });
			searches = searches.filter((s) => s.id !== row.id);
			banner = { kind: 'ok', text: `Removed the saved search “${row.name}”.` };
		} catch (e) {
			banner = { kind: 'fail', text: e.message };
		} finally {
			confirm = null;
		}
	}

	async function closeEnquiry(row) {
		try {
			const { data } = await api(`/enquiries/${row.id}/close`, { method: 'POST' });
			enquiries = enquiries.map((e) => (e.id === row.id ? { ...e, status: data.status } : e));
			banner = { kind: 'ok', text: `Enquiry ${row.reference} is closed.` };
		} catch (e) {
			banner = {
				kind: 'fail',
				text: e instanceof ApiError && e.status === 404 ? 'That enquiry is not yours.' : e.message
			};
		} finally {
			confirm = null;
		}
	}

	function askConfirm(spec) {
		confirm = spec;
	}

	function signOut() {
		signOutTo(goto);
	}

	function filtersOf(s) {
		const parts = [
			s.query && `“${s.query}”`,
			s.industry,
			s.output_kind,
			s.temperature_band,
			s.deployment
		].filter(Boolean);
		return parts.length ? parts.join(' · ') : 'No filters, everything';
	}

	function searchHref(s) {
		const p = new URLSearchParams();
		for (const k of ['query', 'industry', 'output_kind', 'temperature_band', 'deployment']) {
			if (s[k]) p.set(k === 'query' ? 'q' : k, s[k]);
		}
		const qs = p.toString();
		return `/solutions${qs ? `?${qs}` : ''}`;
	}
</script>

<svelte:head><title>Account · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Account</p>
		<h1>{$account?.display_name || 'Your account'}</h1>
		<p class="lede">
			{$account?.email || ''} · Everything below belongs to this account alone.
		</p>
		<button class="btn btn--ghost btn--sm" type="button" onclick={signOut}>Sign out</button>
	</div>
</section>

<div class="wrap acct">
	{#if banner}
		<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
			<strong>{banner.kind === 'ok' ? 'Done' : 'Refused'}</strong>
			<span>{banner.text}</span>
		</div>
	{/if}

	{#if loading}
		<p class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading your lists…</p>
	{/if}

	<!-- 1. saved solutions -->
	<section class="list" aria-labelledby="l-saves">
		<div class="list__head">
			<h2 id="l-saves">Saved solutions</h2>
			<a class="btn btn--ghost btn--sm" href="/compare">Compare</a>
		</div>
		{#if $savesLoading}
			<p class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading…</p>
		{:else if $saves.length === 0}
			<div class="empty-state">
				<p><strong>No saved solutions yet.</strong> Nothing has been kept on this account.</p>
				<a class="btn" href="/solutions">Find one in the explorer</a>
			</div>
		{:else}
			<ul class="rows">
				{#each $saves as row (row.id)}
					<li class="row-item">
						<div>
							<a class="row-item__title" href={`/solutions/${row.slug}`}>{row.industry}</a>
							<p class="row-item__meta">
								{row.output_kind} · {row.temperature_band} · {row.module_count}
								{row.module_count === 1 ? 'module' : 'modules'}
							</p>
						</div>
						<button
							class="btn btn--danger btn--sm"
							type="button"
							onclick={() =>
								askConfirm({
									title: 'Remove this saved solution?',
									body: `${row.industry} will be removed from your saved solutions. You can save it again from the explorer.`,
									confirmLabel: 'Remove',
									run: () => removeSave(row)
								})}
						>
							Remove<span class="visually-hidden"> {row.industry} from saved solutions</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- 2. saved searches -->
	<section class="list" aria-labelledby="l-searches">
		<div class="list__head">
			<h2 id="l-searches">Saved searches</h2>
			<a class="btn btn--ghost btn--sm" href="/solutions">New search</a>
		</div>
		{#if searches.length === 0 && !loading}
			<div class="empty-state">
				<p><strong>No saved searches yet.</strong> A search kept under a name comes back here.</p>
				<a class="btn" href="/solutions">Open the explorer</a>
			</div>
		{:else}
			<ul class="rows">
				{#each searches as s (s.id)}
					<li class="row-item">
						<div>
							<a class="row-item__title" href={searchHref(s)}>{s.name}</a>
							<p class="row-item__meta">{filtersOf(s)}</p>
						</div>
						<button
							class="btn btn--danger btn--sm"
							type="button"
							onclick={() =>
								askConfirm({
									title: 'Remove this saved search?',
									body: `“${s.name}” will be removed. You can save it again under the same name.`,
									confirmLabel: 'Remove',
									run: () => removeSearch(s)
								})}
						>
							Remove<span class="visually-hidden"> the saved search {s.name}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- 3. enquiries -->
	<section class="list" aria-labelledby="l-enq">
		<div class="list__head">
			<h2 id="l-enq">Enquiries</h2>
			<a class="btn btn--ghost btn--sm" href="/contact">Send one</a>
		</div>
		{#if enquiries.length === 0 && !loading}
			<div class="empty-state">
				<p><strong>No enquiries yet.</strong> Nothing has been sent from this account.</p>
				<a class="btn" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="rows">
				{#each enquiries as e (e.id)}
					<li class="row-item">
						<div>
							<p class="row-item__title">
								<span class="ref">{e.reference}</span>
								<span class="status-tag status-tag--{e.status}">{e.status}</span>
							</p>
							<p class="row-item__meta">{e.topic} · {e.message.slice(0, 90)}{e.message.length > 90 ? '…' : ''}</p>
						</div>
						{#if e.status !== 'closed'}
							<button
								class="btn btn--ghost btn--sm"
								type="button"
								onclick={() =>
									askConfirm({
										title: 'Close this enquiry?',
										body: `${e.reference} will be marked closed. Closing one that is already closed records one close, not two.`,
										confirmLabel: 'Close enquiry',
										run: () => closeEnquiry(e)
									})}
							>
								Close<span class="visually-hidden"> enquiry {e.reference}</span>
							</button>
						{:else}
							<button class="btn btn--sm" type="button" disabled aria-disabled="true">
								Closed
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- 4. investor access request -->
	<section class="list" aria-labelledby="l-access">
		<div class="list__head">
			<h2 id="l-access">Investor access</h2>
			<a class="btn btn--ghost btn--sm" href="/investors">Investors</a>
		</div>
		{#if !accessRequest && !loading}
			<div class="empty-state">
				<p>
					<strong>No access request yet.</strong> The document room stays shut until a request of your
					own is approved.
				</p>
				<a class="btn" href="/investors">Request access</a>
			</div>
		{:else if accessRequest}
			<div class="card access">
				<p class="row-item__title">
					<span class="ref">{accessRequest.reference}</span>
					<span class="status-tag status-tag--{accessRequest.status}">{accessRequest.status}</span>
				</p>
				<p class="row-item__meta">
					{accessRequest.organisation} · {accessRequest.role_title}
				</p>
				{#if accessRequest.status === 'approved'}
					<p class="muted">Your request is approved. The document room is open to you.</p>
					<a class="btn btn--sm" href="/investors/room">Open the document room</a>
				{:else if accessRequest.status === 'pending'}
					<p class="muted">
						Your request is pending. The document room stays shut until it is approved, and approval
						happens outside this product.
					</p>
				{:else}
					<p class="muted">This request was declined, so the document room stays shut.</p>
				{/if}
			</div>
		{/if}
	</section>

	<!-- 5. applications -->
	<section class="list" aria-labelledby="l-apps">
		<div class="list__head">
			<h2 id="l-apps">Job applications</h2>
			<a class="btn btn--ghost btn--sm" href="/careers">Open jobs</a>
		</div>
		{#if applications.length === 0 && !loading}
			<div class="empty-state">
				<p><strong>No applications yet.</strong> Nothing has been sent from this account.</p>
				<a class="btn" href="/careers">See the three open jobs</a>
			</div>
		{:else}
			<ul class="rows">
				{#each applications as a (a.id)}
					<li class="row-item">
						<div>
							<p class="row-item__title">
								{a.job_title}
								<span class="status-tag status-tag--{a.status}">{a.status}</span>
							</p>
							<p class="row-item__meta">{a.location} · {a.note.slice(0, 90)}{a.note.length > 90 ? '…' : ''}</p>
						</div>
						<a class="btn btn--ghost btn--sm" href={`/careers`}>View job</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<Modal open={Boolean(confirm)} title={confirm?.title || ''} onclose={() => (confirm = null)}>
	<p>{confirm?.body}</p>
	<div class="row">
		<button class="btn btn--danger" type="button" onclick={() => confirm?.run?.()}>
			{confirm?.confirmLabel || 'Confirm'}
		</button>
		<button class="btn btn--ghost" type="button" onclick={() => (confirm = null)}>Cancel</button>
	</div>
</Modal>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.acct {
		padding-bottom: 4rem;
	}
	.list {
		margin-bottom: 2.5rem;
	}
	.list__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.5rem;
		margin-bottom: 0.75rem;
		border-bottom: 2px solid var(--ink);
	}
	.list__head h2 {
		margin: 0;
		font-size: 1.2rem;
	}
	/* the account lists are dense */
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.row-item {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		padding: 0.7rem 0.9rem;
		border-bottom: 1px solid var(--rule);
		background: var(--paper);
	}
	.row-item:last-child {
		border-bottom: 0;
	}
	.row-item__title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-weight: 700;
		color: var(--ink);
	}
	.row-item__meta {
		margin: 0.15rem 0 0;
		font-size: 0.84rem;
		color: var(--ink-muted);
	}
	.ref {
		font-family: var(--font-mono);
	}
	.access p {
		margin-bottom: 0.5rem;
	}
	@media (max-width: 560px) {
		.row-item {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
