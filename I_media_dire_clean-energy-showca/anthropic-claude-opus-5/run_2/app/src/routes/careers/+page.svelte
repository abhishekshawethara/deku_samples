<script>
	import Modal from '$lib/components/Modal.svelte';
	import { api } from '$lib/api.js';
	import { token, account } from '$lib/session.js';

	export let data;

	let openJob = null;
	let name = '';
	let email = '';
	let note = '';
	let busy = false;
	let banner = null;
	let touched = {};

	$: errors = {
		name: name.trim() ? 'Tell us your name.' : '',
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter an email we can reply to.',
		note: note.trim().length >= 10 ? '' : 'Write at least ten characters. The note is the whole application.'
	};

	function openApply(job) {
		openJob = job;
		banner = null;
		touched = {};
		name = $account?.display_name || '';
		email = $account?.email || '';
		note = '';
	}

	async function submit() {
		touched = { name: true, email: true, note: true };
		banner = null;
		if (!name.trim() || errors.email || errors.note) {
			banner = { kind: 'error', title: 'Not sent.', text: 'Some fields still need attention.' };
			return;
		}
		if (!$token) {
			banner = { kind: 'error', title: 'Sign in first.', text: 'An application belongs to an account, so we need you signed in.' };
			return;
		}
		busy = true;
		try {
			const row = await api('/api/applications', {
				method: 'POST',
				token: $token,
				body: { job_slug: openJob.slug, name: name.trim(), email: email.trim(), note: note.trim() }
			});
			banner = {
				kind: 'success',
				title: 'Application received.',
				text: `Your application for ${openJob.title} is recorded as ${row.status}. An acknowledgement is on its way to ${row.email}.`
			};
		} catch (err) {
			banner = { kind: 'error', title: 'Not sent.', text: err.message || 'That application could not be recorded.' };
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Careers, Zettajoule</title></svelte:head>

<section class="section lead">
	<div class="wrap">
		<p class="eyebrow">Careers</p>
		<h1>help us build what's next in nuclear energy</h1>
		<p class="lede">
			We try to do right by our partners, the planet and the people who work here, in that order on a good day and
			all at once on a better one.
		</p>
	</div>
</section>

<section class="section">
	<div class="wrap split">
		<div>
			<h2>The culture</h2>
			<p class="lede">
				Small teams, short arguments, written decisions. Engineers sit with licensing people because a design
				choice that cannot be licensed is not a design choice. Nothing enters the module unless it has been
				operated somewhere at temperature for a thousand hours, and nobody has to pretend otherwise in a
				meeting.
			</p>
		</div>
		<div>
			<h2>The Operations Academy</h2>
			<p class="lede">
				Because we own and run the reactors we build, we also have to staff them. The Academy is our training
				and operations arm: eighteen months of simulator work, radiological protection and plant chemistry,
				ending in certification against the module operating envelope. Fleets are staffed, not hired, and every
				graduate has a station waiting.
			</p>
		</div>
	</div>
</section>

<section class="section band">
	<div class="wrap">
		<h2>Open roles</h2>
		{#if data.jobs.length === 0}
			<div class="empty-state">
				<h3>No roles are open right now</h3>
				<p>Nothing is posted today. <a href="/contact">Send an enquiry</a> under Careers and we will keep you in mind.</p>
			</div>
		{:else}
			<ul class="jobs" data-testid="job-list">
				{#each data.jobs as job (job.slug)}
					<li>
						<div class="job-head">
							<h3>{job.title}</h3>
							<p class="meta dense">{job.location} &middot; {job.team}</p>
						</div>
						<p class="dense">{job.description}</p>
						<button type="button" class="btn btn-secondary btn-sm" on:click={() => openApply(job)}>
							Apply<span class="visually-hidden">, {job.title}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<Modal open={Boolean(openJob)} title={openJob ? `Apply: ${openJob.title}` : ''} on:close={() => (openJob = null)}>
	{#if openJob}
		{#if banner}
			<div class="banner banner-{banner.kind}" role={banner.kind === 'error' ? 'alert' : 'status'}>
				<strong>{banner.title}</strong> {banner.text}
			</div>
		{/if}
		<p class="dense meta">{openJob.location} &middot; {openJob.team}. No file is attached anywhere: the note is the whole application.</p>
		<form on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="ap-name">Your name</label>
				<input id="ap-name" type="text" bind:value={name} on:blur={() => (touched = { ...touched, name: true })} />
				{#if touched.name && !name.trim()}<p class="field-error">Tell us your name.</p>{/if}
			</div>
			<div class="field">
				<label for="ap-email">Email</label>
				<input id="ap-email" type="email" bind:value={email} on:blur={() => (touched = { ...touched, email: true })} />
				{#if touched.email && errors.email}<p class="field-error">{errors.email}</p>{/if}
			</div>
			<div class="field">
				<label for="ap-note">Your note</label>
				<textarea id="ap-note" bind:value={note} on:blur={() => (touched = { ...touched, note: true })}></textarea>
				{#if touched.note && errors.note}<p class="field-error">{errors.note}</p>{/if}
			</div>
			{#if !$token}
				<div class="banner banner-info">
					<strong>Sign in to apply.</strong> An application belongs to an account.
					<a href={`/signin?next=%2Fcareers`}>Sign in</a>.
				</div>
			{/if}
			<button class="btn" type="submit" disabled={busy}>{busy ? 'Sending' : 'Send the application'}</button>
		</form>
	{/if}
</Modal>

<style>
	.lead {
		background: linear-gradient(180deg, #eaf1fb 0%, #fbf6ee 100%);
	}
	.lead h1 {
		font-size: clamp(2rem, 6vw, 4rem);
		max-width: 18ch;
	}
	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
	}
	.band {
		background: var(--ground-soft);
	}
	.jobs {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		display: grid;
		gap: 14px;
	}
	.jobs li {
		background: #fff;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 18px;
	}
	.job-head h3 {
		margin-bottom: 2px;
	}
	.meta {
		color: var(--ink-muted);
	}
</style>
