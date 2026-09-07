<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.js';
	import { token, account, clearSession, compareList } from '$lib/session.js';
	import Modal from '$lib/components/Modal.svelte';

	let loading = true;
	let error = '';
	let saves = [];
	let searches = [];
	let enquiries = [];
	let accessRequest = null;
	let applications = [];
	let banner = null;
	let confirm = null; // a destructive action confirms first

	async function loadAll() {
		if (!$token) {
			await goto('/signin?next=%2Faccount');
			return;
		}
		loading = true;
		error = '';
		try {
			const results = await Promise.allSettled([
				api('/api/saves', { token: $token }),
				api('/api/searches', { token: $token }),
				api('/api/enquiries', { token: $token }),
				api('/api/access-request', { token: $token }),
				api('/api/applications', { token: $token }),
				api('/api/accounts/me', { token: $token })
			]);
			const [s, se, e, ar, ap, me] = results;
			if (me.status === 'rejected' && me.reason?.status === 401) {
				clearSession();
				await goto('/signin?next=%2Faccount');
				return;
			}
			if (me.status === 'fulfilled') account.set(me.value);
			saves = s.status === 'fulfilled' ? s.value : [];
			searches = se.status === 'fulfilled' ? se.value : [];
			enquiries = e.status === 'fulfilled' ? e.value : [];
			accessRequest = ar.status === 'fulfilled' ? ar.value : null;
			applications = ap.status === 'fulfilled' ? ap.value : [];
		} catch (err) {
			error = err.message || 'Your lists could not be read. Reload the page to try again.';
		} finally {
			loading = false;
		}
	}

	onMount(loadAll);

	function ask(action) {
		confirm = action;
	}

	async function run() {
		const action = confirm;
		confirm = null;
		if (!action) return;
		banner = null;
		try {
			await action.run();
			banner = { kind: 'success', title: 'Done.', text: action.done };
			await loadAll();
		} catch (err) {
			banner = { kind: 'error', title: 'Not done.', text: err.message || 'That could not be carried out.' };
		}
	}

	function removeSave(row) {
		ask({
			title: 'Remove this saved solution?',
			body: `"${row.title || row.slug}" leaves your saved list. You can save it again from the explorer.`,
			confirmLabel: 'Remove it',
			done: 'The saved solution was removed.',
			run: () => api(`/api/saves/${row.id}`, { method: 'DELETE', token: $token })
		});
	}

	function removeSearch(row) {
		ask({
			title: 'Delete this saved search?',
			body: `"${row.name}" will be gone. The filters are easy to set again in the explorer.`,
			confirmLabel: 'Delete it',
			done: 'The saved search was deleted.',
			run: () => api(`/api/searches/${row.id}`, { method: 'DELETE', token: $token })
		});
	}

	function closeEnquiry(row) {
		ask({
			title: 'Close this enquiry?',
			body: `${row.reference} will read closed. Closing an already closed enquiry records one close, not two.`,
			confirmLabel: 'Close it',
			done: 'The enquiry now reads closed.',
			run: () => api(`/api/enquiries/${row.id}/close`, { method: 'POST', token: $token })
		});
	}

	function compareSaves() {
		const slugs = saves.slice(0, 4).map((s) => s.slug);
		compareList.set(slugs);
		goto(`/compare?slugs=${slugs.join(',')}`);
	}

	function fmt(d) {
		return String(d).slice(0, 10);
	}
</script>

<svelte:head><title>Your account, Zettajoule</title></svelte:head>

<section class="section-tight head-band">
	<div class="wrap">
		<p class="eyebrow">Account</p>
		<h1>{$account ? $account.display_name : 'Your account'}</h1>
		{#if $account}<p class="lede">{$account.email}</p>{/if}
	</div>
</section>

<section class="section-tight lists">
	<div class="wrap">
		{#if banner}
			<div class="banner banner-{banner.kind}" role="status"><strong>{banner.title}</strong> {banner.text}</div>
		{/if}
		{#if error}
			<div class="banner banner-error" role="alert"><strong>Something went wrong.</strong> {error}</div>
		{/if}

		{#if loading}
			<p class="loading-note"><span class="spinner" aria-hidden="true"></span> Reading your five lists</p>
		{:else}
			<div class="list-block">
				<div class="list-head">
					<h2>Saved solutions</h2>
					{#if saves.length}
						<button type="button" class="btn btn-secondary btn-sm" on:click={compareSaves}>Compare up to four</button>
					{/if}
				</div>
				{#if saves.length === 0}
					<div class="empty-state">
						<h3>No saved solutions</h3>
						<p>You have not kept any of the eight yet. <a href="/solutions">Open the explorer</a> and save the ones that fit.</p>
					</div>
				{:else}
					<div class="table-scroll"><table class="data" data-testid="saved-solutions">
						<thead><tr><th scope="col">Industry</th><th scope="col">Output</th><th scope="col">Temperature</th><th scope="col">Modules</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
						<tbody>
							{#each saves as row (row.id)}
								<tr>
									<td><a href={`/solutions/${row.slug}`}>{row.title || row.slug}</a></td>
									<td>{row.output_kind}</td>
									<td>{row.temperature_band}</td>
									<td>{row.module_count}</td>
									<td><button type="button" class="btn btn-danger btn-sm" on:click={() => removeSave(row)}>Remove<span class="visually-hidden"> {row.slug}</span></button></td>
								</tr>
							{/each}
						</tbody>
					</table></div>
				{/if}
			</div>

			<div class="list-block">
				<h2>Saved searches</h2>
				{#if searches.length === 0}
					<div class="empty-state">
						<h3>No saved searches</h3>
						<p>Nothing saved under a name yet. <a href="/solutions">Set some filters</a> and save them to come back to.</p>
					</div>
				{:else}
					<div class="table-scroll"><table class="data" data-testid="saved-searches">
						<thead><tr><th scope="col">Name</th><th scope="col">Filters</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
						<tbody>
							{#each searches as row (row.id)}
								<tr>
									<td>{row.name}</td>
									<td class="dense">
										{[row.industry && `industry ${row.industry}`, row.output_kind && `output ${row.output_kind}`, row.temperature_band && `temperature ${row.temperature_band}`, row.deployment && `deployment ${row.deployment}`, row.query && `search "${row.query}"`].filter(Boolean).join(', ') || 'no filters'}
									</td>
									<td class="actions">
										<a class="btn btn-quiet btn-sm" href={`/solutions?${new URLSearchParams(Object.fromEntries(Object.entries({ industry: row.industry, output_kind: row.output_kind, temperature_band: row.temperature_band, deployment: row.deployment, q: row.query }).filter(([, v]) => v))).toString()}`}>Run it</a>
										<button type="button" class="btn btn-danger btn-sm" on:click={() => removeSearch(row)}>Delete<span class="visually-hidden"> {row.name}</span></button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table></div>
				{/if}
			</div>

			<div class="list-block">
				<h2>Enquiries</h2>
				{#if enquiries.length === 0}
					<div class="empty-state">
						<h3>No enquiries sent</h3>
						<p>You have not asked us anything yet. <a href="/contact">Send an enquiry</a> and the reference appears here.</p>
					</div>
				{:else}
					<div class="table-scroll"><table class="data" data-testid="enquiries">
						<thead><tr><th scope="col">Reference</th><th scope="col">Topic</th><th scope="col">Sent</th><th scope="col">Status</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
						<tbody>
							{#each enquiries as row (row.id)}
								<tr>
									<td class="mono">{row.reference}</td>
									<td>{row.topic}</td>
									<td>{fmt(row.created_at)}</td>
									<td><span class="status-pill status-{row.status}">{row.status}</span></td>
									<td>
										{#if row.status !== 'closed'}
											<button type="button" class="btn btn-quiet btn-sm" on:click={() => closeEnquiry(row)}>Close<span class="visually-hidden"> {row.reference}</span></button>
										{:else}
											<span class="dense muted">Closed</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table></div>
				{/if}
			</div>

			<div class="list-block">
				<h2>Investor access</h2>
				{#if !accessRequest}
					<div class="empty-state">
						<h3>No access request</h3>
						<p>You have not asked for the private document room. <a href="/investors#access">Request access</a> from the investors route.</p>
					</div>
				{:else}
					<div class="table-scroll"><table class="data" data-testid="access-request">
						<thead><tr><th scope="col">Reference</th><th scope="col">Organisation</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
						<tbody>
							<tr>
								<td class="mono">{accessRequest.reference}</td>
								<td>{accessRequest.organisation}</td>
								<td>{accessRequest.role_title}</td>
								<td><span class="status-pill status-{accessRequest.status}">{accessRequest.status}</span></td>
								<td>
									{#if accessRequest.status === 'approved'}
										<a class="btn btn-secondary btn-sm" href="/investors/room">Open the room</a>
									{:else}
										<span class="dense muted">Waiting on approval</span>
									{/if}
								</td>
							</tr>
						</tbody>
					</table></div>
				{/if}
			</div>

			<div class="list-block">
				<h2>Job applications</h2>
				{#if applications.length === 0}
					<div class="empty-state">
						<h3>No applications sent</h3>
						<p>You have not applied for a role yet. <a href="/careers">See the open jobs</a>.</p>
					</div>
				{:else}
					<div class="table-scroll"><table class="data" data-testid="applications">
						<thead><tr><th scope="col">Role</th><th scope="col">Location</th><th scope="col">Sent</th><th scope="col">Status</th></tr></thead>
						<tbody>
							{#each applications as row (row.id)}
								<tr>
									<td>{row.job_title}</td>
									<td>{row.location}</td>
									<td>{fmt(row.created_at)}</td>
									<td><span class="status-pill status-{row.status}">{row.status}</span></td>
								</tr>
							{/each}
						</tbody>
					</table></div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<Modal open={Boolean(confirm)} title={confirm ? confirm.title : ''} on:close={() => (confirm = null)}>
	{#if confirm}
		<p>{confirm.body}</p>
		<div class="row">
			<button type="button" class="btn btn-danger" on:click={run} data-autofocus>{confirm.confirmLabel}</button>
			<button type="button" class="btn btn-quiet" on:click={() => (confirm = null)}>Keep it</button>
		</div>
	{/if}
</Modal>

<style>
	.head-band {
		border-bottom: 1px solid var(--rule);
	}
	.lists {
		padding-bottom: 72px;
	}
	.list-block {
		margin-bottom: 40px;
	}
	.list-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}
	.list-block h2 {
		font-size: 1.3rem;
		margin-bottom: 12px;
	}
	.actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.muted {
		color: var(--ink-muted);
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--accent);
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
	}
	.table-scroll {
		overflow-x: auto;
		max-width: 100%;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}
	.table-scroll table.data {
		min-width: 560px;
	}
</style>
