<script>
  import Modal from '$lib/components/Modal.svelte';
  import Plate from '$lib/components/Plate.svelte';

  export let data;
  $: team = data.team ?? [];
  let bio = null;
</script>

<svelte:head><title>Our Team, Zettajoule</title></svelte:head>

<section class="section-tight">
  <div class="wrap">
    <p class="eyebrow">Our Team</p>
    <h1 class="opening">shaping the future of nuclear together</h1>
    <p class="lede">
      An international group of recognised experts in reactor engineering, licensing and industrial
      operations, working across Rotterdam, Chicago and Tokyo.
    </p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    {#if team.length === 0}
      <div class="empty">
        <p><strong>The team list is unavailable.</strong></p>
        <p>We could not read it just now. Write to us and we will introduce you directly.</p>
        <a class="btn btn-secondary" href="/contact">Get in Touch</a>
      </div>
    {:else}
      <div class="grid grid-4" data-testid="team-grid">
        {#each team as m (m.slug)}
          <article class="member">
            <Plate seed={m.slug} kind="portrait" height="190px" label={`Generated portrait plate for ${m.name}`} />
            <h2>{m.name}</h2>
            <p class="small muted">{m.role_title}</p>
            <div class="member-actions">
              <button class="btn btn-secondary btn-sm" type="button" on:click={() => (bio = m)} data-testid={`bio-${m.slug}`}>
                View bio<span class="sr-only"> for {m.name}</span>
              </button>
              <a class="small" href={m.profile_url} rel="noreferrer noopener nofollow">
                Profile<span class="sr-only"> for {m.name}</span>
              </a>
            </div>
          </article>
        {/each}
      </div>
      <p class="small muted">
        The portraits are generated plates rather than photographs, and the names are stand-ins.
      </p>
    {/if}
  </div>
</section>

<Modal open={!!bio} title={bio ? `${bio.name}, ${bio.role_title}` : ''} labelledBy="bio-title" onClose={() => (bio = null)}>
  {#if bio}
    <Plate seed={bio.slug} kind="portrait" height="170px" label={`Generated portrait plate for ${bio.name}`} />
    <p>{bio.bio}</p>
    <p><a href={bio.profile_url} rel="noreferrer noopener nofollow" data-autofocus>Professional profile</a></p>
  {/if}
</Modal>

<style>
  .opening {
    font-size: clamp(1.9rem, 5.6vw, 3.6rem);
  }
  .member h2 {
    font-size: 1.05rem;
    margin: 10px 0 2px;
  }
  .member p {
    margin: 0 0 8px;
  }
  .member-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
</style>
