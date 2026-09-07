<script>
	import { onMount } from 'svelte';
	import { api, ApiError } from '$lib/api.js';
	import Plate from '$lib/art/Plate.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let members = [];
	let loading = true;
	let error = '';
	let active = null;

	async function load() {
		loading = true;
		error = '';
		try {
			members = await api('/team', { anonymous: true });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not load the team.';
		} finally {
			loading = false;
		}
	}

	onMount(load);
</script>

<svelte:head><title>Our Team | Zettajoule</title></svelte:head>

<section class="opener">
	<div class="wrap">
		<p class="eyebrow">Our Team</p>
		<h1>shaping the future of nuclear together</h1>
		<p class="lede">
			An international group of recognised experts in reactor engineering, licensing, operations and
			industrial energy contracting.
		</p>
	</div>
</section>

<section class="section-tight">
	<div class="wrap">
		{#if loading}
			<ul class="team" aria-busy="true">
				{#each Array(4) as _}
					<li class="card"><div class="skeleton" style="height:200px"></div></li>
				{/each}
			</ul>
		{:else if error}
			<div class="banner banner-error" role="alert">
				<strong>Could not load</strong>{error}
				<p style="margin:8px 0 0"><button class="btn btn-sm" type="button" on:click={load}>Try again</button></p>
			</div>
		{:else if !members.length}
			<div class="empty">
				<h2>No team members are published</h2>
				<p>Nobody is listed here yet. Get in touch and we will introduce you directly.</p>
				<a class="btn btn-primary" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="team">
				{#each members as m}
					<li class="member">
						<Plate seed={m.slug} variant="portrait" ratio="4 / 5" label="Generated portrait plate for {m.name}" />
						<h2>{m.name}</h2>
						<p class="role">{m.role_title}</p>
						<div class="m-actions">
							<button class="btn btn-sm" type="button" on:click={() => (active = m)}>
								View bio<span class="sr-only"> for {m.name}</span>
							</button>
							<a class="prof" href={m.profile_url} target="_blank" rel="noopener noreferrer">
								Profile<span class="sr-only"> of {m.name}, opens in a new tab</span>
								<svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
									<path d="M4 12 L12 4 M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</a>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<Modal open={Boolean(active)} title={active?.name || ''} on:close={() => (active = null)}>
	{#if active}
		<p class="modal-role">{active.role_title}</p>
		<p>{active.bio}</p>
		<p>
			<a href={active.profile_url} target="_blank" rel="noopener noreferrer">
				Professional profile<span class="sr-only">, opens in a new tab</span>
			</a>
		</p>
	{/if}
	<svelte:fragment slot="footer">
		<button class="btn" type="button" on:click={() => (active = null)}>Close</button>
	</svelte:fragment>
</Modal>

<style>
	.opener {
		background: linear-gradient(180deg, var(--sky), var(--paper));
		padding-block: clamp(44px, 8vw, 100px);
	}
	.opener h1 {
		max-width: 16ch;
	}
	.team {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 24px;
	}
	.member h2 {
		margin: 14px 0 2px;
		font-size: 1.12rem;
	}
	.role {
		margin: 0 0 12px;
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.m-actions {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}
	.prof {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.modal-role {
		font-family: var(--font-head);
		font-size: 0.76rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-muted);
		margin-bottom: 12px;
	}
</style>
