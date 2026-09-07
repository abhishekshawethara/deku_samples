<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api.js';
	import Modal from '$lib/components/Modal.svelte';
	import { account, token, currentToken, loadAccount, signOut } from '$lib/session.js';

	let ready = $state(false);
	let loading = $state(true);
	let saves = $state([]);
	let searches = $state([]);
	let enquiries = $state([]);
	let accessRequest = $state(null);
	let applications = $state([]);
	let banner = $state(null);
	let confirming = $state(null); // { kind, id, label }
	let busyId = $state(null);

	onMount(async () => {
		const acct = await loadAccount();
		if (!acct) {
			await goto('/signin?next=/account');
			return;
		}
		ready = true;
		await refresh();
	});

	async function pull(path) {
		try {
			const { data } = await api(path, { token: currentToken() });
			return data;
		} catch (err) {
			if (err instanceof ApiError && err.status === 404) return null;
			if (err instanceof ApiError && err.status === 401) {
				token.set(null);
				account.set(null);
				await goto('/signin?next=/account');
				return null;
			}
			throw err;
		}
	}

	async function refresh() {
		loading = true;
		try {
			const [a, b, c, d, e] = await Promise.all([
				pull('/api/saves'),
				pull('/api/searches'),
				pull('/api/enquiries'),
				pull('/api/access-request'),
				pull('/api/applications')
			]);
			saves = a || [];
			searches = b || [];
			enquiries = c || [];
			accessRequest = d;
			applications = e || [];
		} catch {
			banner = { kind: 'error', text: 'We could not load your lists. Reload the page to try again.' };
		} finally {
			loading = false;
		}
	}

	function ask(kind, id, label) {
		confirming = { kind, id, label };
	}

	async function confirmDestructive() {
		if (!confirming) return;
		const { kind, id } = confirming;
		busyId = `${kind}-${id}`;
		try {
			const path = kind === 'save' ? `/api/saves/${id}` : `/api/searches/${id}`;
			await api(path, { method: 'DELETE', token: currentToken() });
			banner = { kind: 'success', text: `Removed "${confirming.label}" from your account.` };
			confirming = null;
			await refresh();
		} catch (err) {
			banner = {
				kind: 'error',
				text:
					err instanceof ApiError && err.status === 404
						? 'That row is not on your account, so nothing was removed.'
						: 'We could not remove that. Try again in a moment.'
			};
			confirming = null;
		} finally {
			busyId = null;
		}
	}

	async function closeEnquiry(id, reference) {
		busyId = `enq-${id}`;
		banner = null;
		try {
			const { data } = await api(`/api/enquiries/${id}/close`, {
				method: 'POST',
				token: currentToken()
			});
			banner = { kind: 'success', text: `Enquiry ${data.reference} is closed.` };
			await refresh();
		} catch (err) {
			banner = {
				kind: 'error',
				text:
					err instanceof ApiError && err.status === 404
						? `Enquiry ${reference} is not on your account, so nothing changed.`
						: 'We could not close that enquiry. Try again in a moment.'
			};
		} finally {
			busyId = null;
		}
	}

	function fmt(d) {
		if (!d) return '';
		return new Date(d).toISOString().slice(0, 10);
	}
</script>

<svelte:head><title>Your account, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Account</p>
		<h1>{$account ? $account.display_name : 'Your account'}</h1>
		<p class="lede">
			{#if $account}Signed in as {$account.email}. Everything below belongs to this account alone.{:else}Loading
				your account.{/if}
		</p>
		<div class="head-actions">
			<a class="btn btn-quiet btn-sm" href="/solutions">Explore solutions</a>
			<a class="btn btn-quiet btn-sm" href="/compare">Compare saves</a>
			<button class="btn btn-quiet btn-sm" type="button" onclick={signOut}>Sign out</button>
		</div>
	</div>
</section>

<section class="section-tight">
	<div class="wrap">
		{#if banner}
			<p
				class={`banner banner-${banner.kind}`}
				role={banner.kind === 'error' ? 'alert' : 'status'}
				data-testid="account-banner"
			>
				{banner.text}
			</p>
		{/if}

		{#if !ready || loading}
			<p class="loading"><span class="spinner" aria-hidden="true"></span> Loading your lists</p>
		{:else}
			<div class="lists">
				<!-- 1. saved solutions -->
				<section class="list" aria-labelledby="h-saves">
					<h2 id="h-saves">Saved solutions <span class="n">{saves.length}</span></h2>
					{#if saves.length === 0}
						<div class="empty">
							<h3>No saved solutions</h3>
							<p>You have not kept any of the eight yet.</p>
							<a class="btn btn-primary btn-sm" href="/solutions">Open the explorer</a>
						</div>
					{:else}
						<ul data-testid="saves-list">
							{#each saves as s (s.id)}
								<li>
									<div>
										<a href={`/solutions/${s.slug}`}><strong>{s.title || s.slug}</strong></a>
										<p class="meta mono">
											{s.output_kind} &middot; {s.temperature_band} &middot; {s.module_count} module{s.module_count ===
											1
												? ''
												: 's'}
										</p>
									</div>
									<button
										class="btn btn-danger btn-sm"
										type="button"
										onclick={() => ask('save', s.id, s.title || s.slug)}
										disabled={busyId === `save-${s.id}`}
									>
										Remove
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- 2. saved searches -->
				<section class="list" aria-labelledby="h-searches">
					<h2 id="h-searches">Saved searches <span class="n">{searches.length}</span></h2>
					{#if searches.length === 0}
						<div class="empty">
							<h3>No saved searches</h3>
							<p>Name a filter combination on the explorer and it will wait here for you.</p>
							<a class="btn btn-primary btn-sm" href="/solutions">Build a search</a>
						</div>
					{:else}
						<ul data-testid="searches-list">
							{#each searches as s (s.id)}
								<li>
									<div>
										<strong>{s.name}</strong>
										<p class="meta mono">
											{[s.industry, s.output_kind, s.temperature_band, s.deployment, s.query]
												.filter(Boolean)
												.join(' · ') || 'no filters'}
										</p>
									</div>
									<div class="row-actions">
										<a
											class="btn btn-quiet btn-sm"
											href={`/solutions?${new URLSearchParams(
												Object.fromEntries(
													['industry', 'output_kind', 'temperature_band', 'deployment', 'q']
														.map((k) => [k, k === 'q' ? s.query : s[k]])
														.filter(([, v]) => v)
												)
											).toString()}`}>Run</a
										>
										<button
											class="btn btn-danger btn-sm"
											type="button"
											onclick={() => ask('search', s.id, s.name)}
											disabled={busyId === `search-${s.id}`}>Remove</button
										>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- 3. enquiries -->
				<section class="list" aria-labelledby="h-enquiries">
					<h2 id="h-enquiries">Enquiries <span class="n">{enquiries.length}</span></h2>
					{#if enquiries.length === 0}
						<div class="empty">
							<h3>No enquiries sent</h3>
							<p>Nothing has been asked from this account yet.</p>
							<a class="btn btn-primary btn-sm" href="/contact">Send an enquiry</a>
						</div>
					{:else}
						<ul data-testid="enquiries-list">
							{#each enquiries as e (e.id)}
								<li>
									<div>
										<strong class="mono">{e.reference}</strong>
										<span class={`badge badge-${e.status}`}>{e.status}</span>
										<p class="meta">{e.topic} &middot; {fmt(e.created_at)}</p>
										<p class="body-line">{e.message}</p>
									</div>
									{#if e.status !== 'closed'}
										<button
											class="btn btn-quiet btn-sm"
											type="button"
											onclick={() => closeEnquiry(e.id, e.reference)}
											disabled={busyId === `enq-${e.id}`}
											data-testid={`close-${e.reference}`}
										>
											{#if busyId === `enq-${e.id}`}<span class="spinner" aria-hidden="true"
												></span>{/if}
											Close
										</button>
									{:else}
										<button class="btn btn-sm" type="button" disabled aria-disabled="true"
											>Closed</button
										>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- 4. access request -->
				<section class="list" aria-labelledby="h-access">
					<h2 id="h-access">Investor access <span class="n">{accessRequest ? 1 : 0}</span></h2>
					{#if !accessRequest}
						<div class="empty">
							<h3>No access request</h3>
							<p>
								The document room is private. Request access from the investors route and this will
								show where it stands.
							</p>
							<a class="btn btn-primary btn-sm" href="/investors">Request access</a>
						</div>
					{:else}
						<ul data-testid="access-list">
							<li>
								<div>
									<strong class="mono">{accessRequest.reference}</strong>
									<span class={`badge badge-${accessRequest.status}`}>{accessRequest.status}</span>
									<p class="meta">
										{accessRequest.organisation} &middot; {accessRequest.role_title}
									</p>
									<p class="body-line">
										{#if accessRequest.status === 'approved'}
											Approved. The document room is open to you.
										{:else if accessRequest.status === 'pending'}
											Pending. The room stays closed until it is approved.
										{:else}
											Declined. The room is closed and you can write to us to ask why.
										{/if}
									</p>
								</div>
								{#if accessRequest.status === 'approved'}
									<a class="btn btn-primary btn-sm" href="/investors/room">Open the room</a>
								{:else}
									<a class="btn btn-quiet btn-sm" href="/investors">Investors</a>
								{/if}
							</li>
						</ul>
					{/if}
				</section>

				<!-- 5. applications -->
				<section class="list" aria-labelledby="h-apps">
					<h2 id="h-apps">Job applications <span class="n">{applications.length}</span></h2>
					{#if applications.length === 0}
						<div class="empty">
							<h3>No applications</h3>
							<p>You have not applied for a role from this account.</p>
							<a class="btn btn-primary btn-sm" href="/careers">See the three open jobs</a>
						</div>
					{:else}
						<ul data-testid="applications-list">
							{#each applications as a (a.id)}
								<li>
									<div>
										<strong>{a.job_title}</strong>
										<span class={`badge badge-${a.status}`}>{a.status}</span>
										<p class="meta">{a.location} &middot; {a.team} &middot; {fmt(a.created_at)}</p>
										<p class="body-line">{a.note}</p>
									</div>
									<a class="btn btn-quiet btn-sm" href="/careers">Careers</a>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
		{/if}
	</div>
</section>

<Modal
	open={!!confirming}
	title="Remove this from your account?"
	onclose={() => (confirming = null)}
>
	<p>
		This removes <strong>{confirming?.label}</strong> from your account. It cannot be undone, though you
		can save it again from the explorer.
	</p>
	{#snippet footer()}
		<button class="btn btn-quiet" type="button" onclick={() => (confirming = null)}>Keep it</button>
		<button class="btn btn-danger" type="button" onclick={confirmDestructive}>Remove it</button>
	{/snippet}
</Modal>

<style>
	.head {
		padding: 40px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.head-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 8px;
	}
	.loading {
		display: inline-flex;
		gap: 10px;
		align-items: center;
		color: var(--ink-muted);
	}
	.lists {
		display: grid;
		gap: 30px;
		padding-bottom: 40px;
	}
	.list h2 {
		font-size: 1.15rem;
		display: flex;
		align-items: center;
		gap: 10px;
		padding-bottom: 8px;
		border-bottom: 2px solid var(--rule-strong);
		margin-bottom: 12px;
	}
	.n {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--ink-muted);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 1px 9px;
	}
	.list ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.list li {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
		padding: 11px 14px;
	}
	.list li > div:first-child {
		min-width: 0;
	}
	.meta {
		margin: 4px 0 0;
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
	.body-line {
		margin: 5px 0 0;
		font-size: 0.88rem;
		color: var(--ink-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.row-actions {
		display: flex;
		gap: 6px;
		flex: none;
	}
	@media (min-width: 1000px) {
		.lists {
			grid-template-columns: 1fr 1fr;
		}
		.list:first-child {
			grid-column: 1 / -1;
		}
	}
</style>
