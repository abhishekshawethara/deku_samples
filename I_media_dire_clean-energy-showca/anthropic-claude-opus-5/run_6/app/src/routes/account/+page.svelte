<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { api, del, post, ApiError } from '$lib/api.js';
	import { auth, savedSlugs } from '$lib/stores.js';
	import Confirm from '$lib/components/Confirm.svelte';
	import { labelForOutput } from '$lib/nav.js';

	let ready = false;
	let loading = true;
	let loadError = '';
	let banner = null;

	let saves = [];
	let searches = [];
	let enquiries = [];
	let accessRequest = null;
	let applications = [];

	let confirm = { open: false, kind: '', id: null, label: '', busy: false };

	async function loadAll() {
		loading = true;
		loadError = '';
		try {
			const [s, se, e, a] = await Promise.all([
				api('/saves'),
				api('/searches'),
				api('/enquiries'),
				api('/applications')
			]);
			saves = s;
			searches = se;
			enquiries = e;
			applications = a;
			savedSlugs.set(new Set(s.map((r) => r.slug)));
			try {
				accessRequest = await api('/access-request');
			} catch (err) {
				accessRequest = err instanceof ApiError && err.status === 404 ? null : accessRequest;
			}
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) return;
			loadError = err instanceof ApiError ? err.message : 'Could not load your account.';
		} finally {
			loading = false;
		}
	}

	function askRemove(kind, id, label) {
		confirm = { open: true, kind, id, label, busy: false };
	}

	async function doRemove() {
		confirm.busy = true;
		banner = null;
		try {
			if (confirm.kind === 'save') {
				await del(`/saves/${confirm.id}`);
				saves = saves.filter((r) => r.id !== confirm.id);
				savedSlugs.set(new Set(saves.map((r) => r.slug)));
			} else if (confirm.kind === 'search') {
				await del(`/searches/${confirm.id}`);
				searches = searches.filter((r) => r.id !== confirm.id);
			}
			banner = { kind: 'success', text: `Removed ${confirm.label}.` };
			confirm = { open: false, kind: '', id: null, label: '', busy: false };
		} catch (err) {
			banner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not remove that. Try again.'
			};
			confirm = { ...confirm, open: false, busy: false };
		}
	}

	async function closeEnquiry(id) {
		banner = null;
		try {
			const row = await post(`/enquiries/${id}/close`);
			enquiries = enquiries.map((e) => (e.id === id ? { ...e, status: row.status } : e));
			banner = { kind: 'success', text: `Enquiry ${row.reference} is closed.` };
		} catch (err) {
			banner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not close that enquiry.'
			};
		}
	}

	function statusClass(s) {
		if (s === 'approved' || s === 'closed') return 'pill-success';
		if (s === 'pending' || s === 'received' || s === 'reviewing') return 'pill-pending';
		if (s === 'declined') return 'pill-danger';
		return '';
	}

	onMount(async () => {
		if (!$auth.token) {
			await goto('/signin?next=%2Faccount', { replaceState: true });
			return;
		}
		ready = true;
		await loadAll();
	});
</script>

<svelte:head><title>Your account | Zettajoule</title></svelte:head>

{#if ready}
	<section class="head-band">
		<div class="wrap">
			<p class="eyebrow">Account</p>
			<h1>{$auth.account?.display_name || 'Your account'}</h1>
			<p class="lede">{$auth.account?.email || ''}</p>
		</div>
	</section>

	<section class="section-tight">
		<div class="wrap">
			{#if banner}
				<div class="banner banner-{banner.kind}" role="status">
					<strong>{banner.kind === 'error' ? 'Problem' : 'Done'}</strong>{banner.text}
				</div>
			{/if}

			{#if loading}
				<p aria-busy="true"><span class="spinner" aria-hidden="true"></span> Loading your lists…</p>
			{:else if loadError}
				<div class="banner banner-error" role="alert">
					<strong>Could not load</strong>{loadError}
					<p style="margin:8px 0 0">
						<button class="btn btn-sm" type="button" on:click={loadAll}>Try again</button>
					</p>
				</div>
			{:else}
				<div class="lists">
					<!-- 1. saved solutions -->
					<section class="list-block" aria-labelledby="h-saves">
						<div class="list-head">
							<h2 id="h-saves">Saved solutions</h2>
							<span class="pill">{saves.length}</span>
						</div>
						{#if !saves.length}
							<div class="empty">
								<p>You have not saved a solution yet.</p>
								<a class="btn btn-primary btn-sm" href="/solutions">Open the explorer</a>
							</div>
						{:else}
							<ul class="rows">
								{#each saves as s}
									<li>
										<div class="r-main">
											<a href="/solutions/{s.slug}">{s.title || s.slug}</a>
											<p class="r-meta">
												{s.industry} · {labelForOutput(s.output_kind)} · {s.temperature_band}
											</p>
										</div>
										<button
											class="btn btn-sm btn-danger"
											type="button"
											on:click={() => askRemove('save', s.id, s.title || s.slug)}
										>
											Remove
										</button>
									</li>
								{/each}
							</ul>
							<a class="btn btn-sm" href="/compare">Compare up to four</a>
						{/if}
					</section>

					<!-- 2. saved searches -->
					<section class="list-block" aria-labelledby="h-searches">
						<div class="list-head">
							<h2 id="h-searches">Saved searches</h2>
							<span class="pill">{searches.length}</span>
						</div>
						{#if !searches.length}
							<div class="empty">
								<p>No saved searches. Filter the explorer and save the combination by name.</p>
								<a class="btn btn-primary btn-sm" href="/solutions">Build a search</a>
							</div>
						{:else}
							<ul class="rows">
								{#each searches as s}
									{@const qs = new URLSearchParams(
										Object.entries({
											q: s.query,
											industry: s.industry,
											output_kind: s.output_kind,
											temperature_band: s.temperature_band,
											deployment: s.deployment
										}).filter(([, v]) => v)
									).toString()}
									<li>
										<div class="r-main">
											<a href="/solutions{qs ? `?${qs}` : ''}">{s.name}</a>
											<p class="r-meta">
												{[
													s.query && `"${s.query}"`,
													s.industry,
													s.output_kind && labelForOutput(s.output_kind),
													s.temperature_band,
													s.deployment
												]
													.filter(Boolean)
													.join(' · ') || 'No filters'}
											</p>
										</div>
										<button
											class="btn btn-sm btn-danger"
											type="button"
											on:click={() => askRemove('search', s.id, s.name)}
										>
											Remove
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</section>

					<!-- 3. enquiries -->
					<section class="list-block" aria-labelledby="h-enq">
						<div class="list-head">
							<h2 id="h-enq">Enquiries</h2>
							<span class="pill">{enquiries.length}</span>
						</div>
						{#if !enquiries.length}
							<div class="empty">
								<p>You have not sent an enquiry from this account.</p>
								<a class="btn btn-primary btn-sm" href="/contact">Get in Touch</a>
							</div>
						{:else}
							<ul class="rows">
								{#each enquiries as e}
									<li>
										<div class="r-main">
											<span class="mono ref">{e.reference}</span>
											<p class="r-meta">{e.topic} · {new Date(e.created_at).toLocaleDateString('en-GB')}</p>
											<p class="r-msg">{e.message}</p>
										</div>
										<div class="r-side">
											<span class="pill {statusClass(e.status)}">{e.status}</span>
											{#if e.status !== 'closed'}
												<button class="btn btn-sm" type="button" on:click={() => closeEnquiry(e.id)}>
													Close
												</button>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</section>

					<!-- 4. access request -->
					<section class="list-block" aria-labelledby="h-access">
						<div class="list-head">
							<h2 id="h-access">Investor access</h2>
						</div>
						{#if !accessRequest}
							<div class="empty">
								<p>You have not requested access to the investor document room.</p>
								<a class="btn btn-primary btn-sm" href="/investors">Request access</a>
							</div>
						{:else}
							<div class="access card">
								<div class="r-main">
									<span class="mono ref">{accessRequest.reference}</span>
									<p class="r-meta">
										{accessRequest.organisation} · {accessRequest.role_title}
									</p>
								</div>
								<div class="r-side">
									<span class="pill {statusClass(accessRequest.status)}">{accessRequest.status}</span>
									{#if accessRequest.status === 'approved'}
										<a class="btn btn-sm btn-primary" href="/investors/room">Open the room</a>
									{/if}
								</div>
							</div>
							{#if accessRequest.status === 'pending'}
								<div class="banner banner-pending" style="margin-top:12px">
									<strong>Pending</strong>
									Your request is recorded and waiting on review. The document room opens once it is
									approved.
								</div>
							{:else if accessRequest.status === 'declined'}
								<div class="banner banner-error" style="margin-top:12px">
									<strong>Declined</strong>
									This request was declined. Contact us if you think that is wrong.
								</div>
							{/if}
						{/if}
					</section>

					<!-- 5. applications -->
					<section class="list-block" aria-labelledby="h-apps">
						<div class="list-head">
							<h2 id="h-apps">Job applications</h2>
							<span class="pill">{applications.length}</span>
						</div>
						{#if !applications.length}
							<div class="empty">
								<p>You have not applied for a role.</p>
								<a class="btn btn-primary btn-sm" href="/careers">See open jobs</a>
							</div>
						{:else}
							<ul class="rows">
								{#each applications as a}
									<li>
										<div class="r-main">
											<a href="/careers">{a.job_title}</a>
											<p class="r-meta">
												{a.job_location} · {new Date(a.created_at).toLocaleDateString('en-GB')}
											</p>
											<p class="r-msg">{a.note}</p>
										</div>
										<span class="pill {statusClass(a.status)}">{a.status}</span>
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				</div>
			{/if}
		</div>
	</section>

	<Confirm
		open={confirm.open}
		busy={confirm.busy}
		title="Remove {confirm.label}?"
		body="This takes it off your list. You can add it again later."
		confirmLabel="Remove"
		on:cancel={() => (confirm = { ...confirm, open: false })}
		on:confirm={doRemove}
	/>
{:else}
	<section class="section">
		<div class="wrap"><p aria-busy="true"><span class="spinner" aria-hidden="true"></span> Checking your session…</p></div>
	</section>
{/if}

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(30px, 5vw, 56px);
	}
	.lists {
		display: grid;
		gap: 30px;
	}
	.list-block {
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
		padding: 18px 18px 20px;
		background: var(--paper);
	}
	.list-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--rule);
	}
	.list-head h2 {
		margin: 0;
		font-size: 1.12rem;
	}
	.rows {
		list-style: none;
		margin: 0 0 14px;
		padding: 0;
	}
	.rows li,
	.access {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
		padding: 11px 0;
		border-bottom: 1px solid var(--rule);
	}
	.rows li:last-child {
		border-bottom: 0;
	}
	.access {
		border: 1px solid var(--rule);
		padding: 14px;
	}
	.r-main {
		min-width: 0;
		flex: 1;
	}
	.r-main a,
	.ref {
		font-weight: 700;
		font-size: 0.95rem;
	}
	.r-meta {
		margin: 3px 0 0;
		font-size: 0.82rem;
		color: var(--ink-muted);
	}
	.r-msg {
		margin: 6px 0 0;
		font-size: 0.85rem;
		color: var(--ink-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.r-side {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		flex: none;
	}
	.empty {
		padding: 20px 16px;
	}
	@media (max-width: 620px) {
		.rows li,
		.access {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
