<script>
	import Reveal from '$lib/Reveal.svelte';
	import Plate from '$lib/Plate.svelte';
	import Modal from '$lib/Modal.svelte';

	let { data } = $props();

	let openMember = $state(null);

	function initials(name) {
		return name
			.split(/\s+/)
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	}
</script>

<svelte:head><title>Our Team · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Our Team</p>
		<Reveal as="h1" text="shaping the future of nuclear together" />
		<p class="lede">
			An international group of recognised experts in reactor physics, licensing, large energy
			construction and plant operations, most of whom have done the thing before rather than read
			about it.
		</p>
	</div>
</section>

<section class="wrap team-sec">
	<ul class="team">
		{#each data.team as m (m.slug)}
			<li class="member">
				<Plate
					seed={m.slug}
					kind="portrait"
					ratio="1 / 1"
					initials={initials(m.name)}
					label={`Generated portrait plate for ${m.name}`}
				/>
				<h2>{m.name}</h2>
				<p class="member__role">{m.role_title}</p>
				<div class="row">
					<button class="btn btn--ghost btn--sm" type="button" onclick={() => (openMember = m)}>
						View bio<span class="visually-hidden"> for {m.name}</span>
					</button>
					<a
						class="member__profile"
						href={m.profile_url}
						rel="noopener noreferrer nofollow"
						target="_blank"
					>
						Profile
						<svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
							<path
								d="M3 13 L13 3 M6 3 h7 v7"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span class="visually-hidden">, professional profile for {m.name}</span>
					</a>
				</div>
			</li>
		{/each}
	</ul>
	<p class="muted small">
		The portraits are generated plates drawn from code, not photographs, and the names are
		stand-ins.
	</p>
</section>

<Modal
	open={Boolean(openMember)}
	title={openMember ? `${openMember.name}, ${openMember.role_title}` : ''}
	onclose={() => (openMember = null)}
>
	{#if openMember}
		<div class="bio">
			<Plate
				seed={openMember.slug}
				kind="portrait"
				ratio="3 / 2"
				initials={initials(openMember.name)}
			/>
			<p class="bio__text">{openMember.bio}</p>
			<a href={openMember.profile_url} rel="noopener noreferrer nofollow" target="_blank">
				Professional profile for {openMember.name}
			</a>
		</div>
	{/if}
</Modal>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.head :global(h1) {
		text-transform: lowercase;
		max-width: 16ch;
	}
	.team-sec {
		padding-block: 2rem 4rem;
	}
	.team {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}
	.member h2 {
		margin: 0.75rem 0 0.1rem;
		font-size: 1.15rem;
	}
	.member__role {
		margin: 0 0 0.6rem;
		font-size: 0.88rem;
		color: var(--ink-muted);
	}
	.member__profile {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.85rem;
		min-height: 36px;
	}
	.bio__text {
		margin-top: 1rem;
	}
	.small {
		font-size: 0.84rem;
	}
</style>
