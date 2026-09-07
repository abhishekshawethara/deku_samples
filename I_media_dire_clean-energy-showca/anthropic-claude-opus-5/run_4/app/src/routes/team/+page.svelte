<script>
	import Plate from '$lib/components/Plate.svelte';
	import Modal from '$lib/components/Modal.svelte';

	export let data;

	let openMember = null;
</script>

<svelte:head>
	<title>Our Team, Zettajoule</title>
	<meta name="description" content="An international group of recognised experts shaping the future of nuclear together." />
</svelte:head>

<section class="section wrap">
	<p class="eyebrow">Our Team</p>
	<h1 class="opening">shaping the future of nuclear together</h1>
	<p class="lede">
		We are an international group of recognised experts in reactor engineering, licensing, operations and
		industrial energy contracting. The portraits below are generated plates and the names are stand-ins.
	</p>
</section>

<section class="section wrap" aria-labelledby="leaders-heading">
	<h2 id="leaders-heading" class="visually-hidden">The leadership</h2>
	{#if data.team.length === 0}
		<div class="empty">
			<p><strong>No team members are published.</strong></p>
			<a class="btn" href="/company">Read the company story</a>
		</div>
	{:else}
		<ul class="team">
			{#each data.team as member (member.slug)}
				<li class="member">
					<Plate seed={member.slug} kind="portrait" ratio="4 / 5" label="Generated portrait plate for {member.name}" />
					<h3>{member.name}</h3>
					<p class="role">{member.role_title}</p>
					<div class="member__actions">
						<button class="btn btn--ghost btn--small" type="button" on:click={() => (openMember = member)}>
							View bio
						</button>
						<a class="profile" href={member.profile_url} rel="noreferrer noopener nofollow" target="_blank">
							Profile
							<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
								<path d="M3 11 L11 3 M5 3h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
							<span class="visually-hidden">professional profile for {member.name}</span>
						</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="section wrap">
	<div class="card closing">
		<h2>And the crews</h2>
		<p>
			Because we operate every module we deploy, most of the people who will work for this company are not on
			this page yet: they are the control room crews trained in the Operations Academy.
		</p>
		<a class="btn" href="/careers">See open roles</a>
	</div>
</section>

<Modal open={!!openMember} title={openMember ? `${openMember.name}, ${openMember.role_title}` : ''} on:close={() => (openMember = null)}>
	{#if openMember}
		<p>{openMember.bio}</p>
		<p>
			<a href={openMember.profile_url} rel="noreferrer noopener nofollow" target="_blank">
				Professional profile for {openMember.name}
			</a>
		</p>
	{/if}
</Modal>

<style>
	.opening {
		font-size: clamp(1.9rem, 6vw, 4rem);
		max-width: 16ch;
		line-height: 1.02;
	}
	.team {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}
	.member h3 {
		margin: 0.75rem 0 0.15rem;
		font-size: 1.1rem;
	}
	.role {
		margin: 0 0 0.6rem;
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.member__actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.profile {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.closing {
		max-width: 640px;
	}
</style>
