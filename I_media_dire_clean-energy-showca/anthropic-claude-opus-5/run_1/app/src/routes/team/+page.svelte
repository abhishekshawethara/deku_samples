<script>
	import Plate from '$lib/components/Plate.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let { data } = $props();
	let showing = $state(null);
</script>

<svelte:head><title>Our Team, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Our Team</p>
		<h1 class="opening">{data.copy.lede?.heading || 'shaping the future of nuclear together'}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<ul class="team">
			{#each data.team as m (m.slug)}
				<li class="member">
					<Plate seed={m.slug} kind="portrait" ratio="4 / 5" label="" />
					<h2>{m.name}</h2>
					<p class="role">{m.role_title}</p>
					<div class="member-actions">
						<button
							class="btn btn-quiet btn-sm"
							type="button"
							onclick={() => (showing = m)}
							data-testid={`bio-${m.slug}`}>View bio</button
						>
						<a class="profile" href={m.profile_url} rel="nofollow noopener">
							Professional profile
							<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
								<path
									d="M4 12 L12 4 M6 4 h6 v6"
									stroke="currentColor"
									stroke-width="1.8"
									fill="none"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</a>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>

<Modal open={!!showing} title={showing ? showing.name : ''} onclose={() => (showing = null)}>
	<p class="modal-role">{showing?.role_title}</p>
	<p>{showing?.bio}</p>
	<p>
		<a href={showing?.profile_url} rel="nofollow noopener">Professional profile</a>
	</p>
	{#snippet footer()}
		<button class="btn btn-quiet" type="button" onclick={() => (showing = null)}>Close</button>
	{/snippet}
</Modal>

<style>
	.head {
		padding: 46px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.opening {
		font-size: clamp(2rem, 6vw, 4rem);
		max-width: 16ch;
	}
	.team {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 22px;
	}
	.member h2 {
		font-size: 1.15rem;
		margin: 14px 0 2px;
	}
	.role {
		color: var(--ink-muted);
		font-size: 0.92rem;
		margin: 0 0 10px;
	}
	.member-actions {
		display: grid;
		gap: 8px;
		justify-items: start;
	}
	.profile {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.86rem;
	}
	.modal-role {
		font-family: var(--font-heading);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	@media (max-width: 900px) {
		.team {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 520px) {
		.team {
			grid-template-columns: 1fr;
		}
	}
</style>
