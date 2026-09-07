<script>
	import Modal from '$lib/components/Modal.svelte';
	import Plate from '$lib/components/Plate.svelte';

	export let data;
	let openMember = null;
</script>

<svelte:head><title>Our Team, Zettajoule</title></svelte:head>

<section class="section lead">
	<div class="wrap">
		<p class="eyebrow">Our Team</p>
		<h1>shaping the future of nuclear together</h1>
		<p class="lede">
			An international group of recognised experts in reactor engineering, licensing and industrial operations,
			working from Rotterdam, Chicago and Tokyo.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap">
		{#if data.team.length === 0}
			<div class="empty-state">
				<h3>No team members to show</h3>
				<p>The team list is empty right now. <a href="/contact">Get in touch</a> and a person will answer you directly.</p>
			</div>
		{:else}
			<ul class="team">
				{#each data.team as m (m.slug)}
					<li class="member">
						<Plate seed={m.slug} ratio="1 / 1" kind="portrait" label={`Generated portrait plate for ${m.name}`} />
						<h2>{m.name}</h2>
						<p class="role">{m.role_title}</p>
						<div class="row member-actions">
							<button type="button" class="btn btn-secondary btn-sm" on:click={() => (openMember = m)}>
								View bio<span class="visually-hidden">, {m.name}</span>
							</button>
							<a class="profile" href={m.profile_url} rel="noreferrer noopener">
								Professional profile<span class="visually-hidden">, {m.name}</span>
							</a>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<Modal open={Boolean(openMember)} title={openMember ? `${openMember.name}, ${openMember.role_title}` : ''} on:close={() => (openMember = null)}>
	{#if openMember}
		<p>{openMember.bio}</p>
		<a class="btn btn-secondary btn-sm" href={openMember.profile_url} rel="noreferrer noopener">Professional profile</a>
	{/if}
</Modal>

<style>
	.lead {
		background: linear-gradient(180deg, #eaf1fb 0%, #ffffff 100%);
	}
	.lead h1 {
		font-size: clamp(2rem, 6vw, 4rem);
		max-width: 16ch;
	}
	.team {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: 24px;
	}
	.member h2 {
		font-size: 1.25rem;
		margin: 14px 0 2px;
	}
	.role {
		color: var(--ink-muted);
		margin-bottom: 10px;
	}
	.profile {
		font-size: 0.9rem;
	}
	.member-actions {
		gap: 12px;
	}
</style>
