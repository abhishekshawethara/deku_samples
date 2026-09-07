
<script>
	import { apiData } from '$lib/api';
	import Plate from '$lib/components/Plate.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let team = $state([]);
	let loading = $state(true);
	let error = $state('');
	let bio = $state(null);

	$effect(() => {
		apiData('/team', { auth: false })
			.then((d) => (team = d || []))
			.catch((err) => (error = err.message || 'The team could not load.'))
			.finally(() => (loading = false));
	});
</script>

<svelte:head><title>Our Team, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Our Team</p>
		<h1>shaping the future of nuclear together</h1>
		<p class="lede">
			An international group of recognised experts in reactor engineering, licensing and industrial
			operations, who have taken machines like this one from drawing to operation before.
		</p>
	</div>
</div>

<section class="section wrap">
	{#if loading}
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading the team</div>
	{:else if error}
		<div class="banner banner-fail" role="alert">
			<strong>The team could not load.</strong>
			{error} Reload the page to try again.
		</div>
	{:else if team.length === 0}
		<div class="empty">
			<h3>No team member is listed</h3>
			<p>The leadership list is empty right now.</p>
			<a class="btn btn-sm btn-secondary" href="/company">Read the company story</a>
		</div>
	{:else}
		<ul class="team" data-testid="team-grid">
			{#each team as m (m.slug)}
				<li class="card person">
					<!-- portrait plates on a soft blue-white tint, generated not photographed -->
					<Plate seed={m.slug} kind="portrait" height={190} figure label="Portrait plate of {m.name}" />
					<h2>{m.name}</h2>
					<p class="role muted">{m.role_title}</p>
					<div class="p-actions">
						<button class="btn btn-sm btn-quiet" type="button" onclick={() => (bio = m)}>
							View bio<span class="visually-hidden">, {m.name}</span>
						</button>
						<a class="profile" href={m.profile_url} rel="noopener noreferrer">
							Profile<span class="visually-hidden">, {m.name}, opens their professional profile</span>
						</a>
					</div>
				</li>
			{/each}
		</ul>
		<p class="muted note">
			The portraits are generated plates rather than photographs, and the names are stand-ins.
		</p>
	{/if}
</section>

<Modal open={!!bio} title={bio ? `${bio.name}, ${bio.role_title}` : ''} onclose={() => (bio = null)}>
	{#if bio}
		<p>{bio.bio}</p>
		<a class="btn btn-sm btn-secondary" href={bio.profile_url} rel="noopener noreferrer">
			Professional profile
		</a>
	{/if}
</Modal>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 44px 0 34px;
	}
	.team {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 18px;
	}
	.person h2 {
		font-size: 1.1rem;
		margin: 14px 0 3px;
	}
	.role {
		font-size: 0.88rem;
		margin: 0 0 12px;
	}
	.p-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.profile {
		font-size: 0.85rem;
		font-weight: 650;
	}
	.note {
		margin-top: 24px;
		font-size: 0.88rem;
	}
	@media (max-width: 1000px) {
		.team {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 620px) {
		.team {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
