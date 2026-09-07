<script>
	import { onMount } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Plate from '$lib/art/Plate.svelte';
	import { post, api, ApiError } from '$lib/api.js';
	import { auth } from '$lib/stores.js';

	export let data;

	let applyingTo = null;
	let name = '';
	let email = '';
	let note = '';
	let busy = false;
	let modalBanner = null;
	let pageBanner = null;
	let applied = new Set();
	let touched = { name: false, email: false, note: false };

	$: nameError = touched.name && !name.trim() ? 'Tell us your name.' : '';
	$: emailError =
		touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
			? 'A valid email address is required.'
			: '';
	$: noteError = touched.note && note.trim().length < 5 ? 'Write a short note about you.' : '';

	function openApply(job) {
		applyingTo = job;
		modalBanner = null;
		touched = { name: false, email: false, note: false };
		name = $auth.account?.display_name || '';
		email = $auth.account?.email || '';
		note = '';
	}

	async function submit() {
		touched = { name: true, email: true, note: true };
		modalBanner = null;
		if (!name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) || note.trim().length < 5)
			return;
		busy = true;
		try {
			await post('/applications', {
				job_slug: applyingTo.slug,
				name: name.trim(),
				email: email.trim(),
				note: note.trim()
			});
			applied = new Set(applied).add(applyingTo.slug);
			pageBanner = {
				kind: 'success',
				text: `Application for ${applyingTo.title} received. An acknowledgement is on its way to ${email.trim()}.`
			};
			applyingTo = null;
		} catch (err) {
			modalBanner = {
				kind: 'error',
				text:
					err instanceof ApiError
						? err.status === 401
							? 'Sign in first: an application belongs to an account.'
							: err.message
						: 'Could not send that application.'
			};
		} finally {
			busy = false;
		}
	}

	onMount(async () => {
		if (!$auth.token) return;
		try {
			const rows = await api('/applications');
			applied = new Set(rows.map((r) => r.job_slug));
		} catch {
			/* nothing to mark */
		}
	});
</script>

<svelte:head><title>Careers | Zettajoule</title></svelte:head>

<section class="opener">
	<div class="wrap">
		<p class="eyebrow">Careers</p>
		<h1>help us build what's next in nuclear energy</h1>
		<p class="lede">
			We try to do right by our partners, the planet and the people who work here, in that order
			only when we have to choose.
		</p>
	</div>
</section>

<section class="section culture">
	<div class="wrap two">
		<div>
			<h2>What it is like here</h2>
			<p>
				Small teams, short arguments, decisions written down. Because we own and operate what we
				build, nobody gets to hand a problem over the fence: the person who designs the circuit is
				in the room when the operator says it is awkward to maintain.
			</p>
			<p>
				We hire people who can defend a number and change their mind when the number changes. Prior
				nuclear experience is welcome and is not a requirement for most roles.
			</p>
		</div>
		<div>
			<Plate seed="careers-culture" ratio="4 / 3" label="Generated plate: the workplace" />
		</div>
	</div>
</section>

<section class="section jobs-band">
	<div class="wrap">
		<h2>Open roles</h2>

		{#if pageBanner}
			<div class="banner banner-{pageBanner.kind}" role="status" data-testid="apply-banner">
				<strong>{pageBanner.kind === 'error' ? 'Not sent' : 'Application received'}</strong>
				{pageBanner.text}
			</div>
		{/if}

		{#if !data.jobs.length}
			<div class="empty">
				<h3>No roles are open right now</h3>
				<p>Nothing is advertised at the moment. Send us a note and we will keep you in mind.</p>
				<a class="btn btn-primary" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="jobs">
				{#each data.jobs as job}
					<li class="job">
						<div class="j-main">
							<h3>{job.title}</h3>
							<p class="j-meta">{job.location} · {job.team}</p>
							<p class="j-desc">{job.description}</p>
						</div>
						<div class="j-side">
							{#if applied.has(job.slug)}
								<span class="pill pill-success">applied</span>
							{/if}
							{#if $auth.token}
								<button class="btn btn-primary btn-sm" type="button" on:click={() => openApply(job)}>
									{applied.has(job.slug) ? 'Update application' : 'Apply'}
									<span class="sr-only"> for {job.title}</span>
								</button>
							{:else}
								<a class="btn btn-primary btn-sm" href="/signin?next=%2Fcareers">
									Sign in to apply<span class="sr-only"> for {job.title}</span>
								</a>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<section class="section academy">
	<div class="wrap-narrow">
		<h2>The Operations Academy</h2>
		<p>
			Because we staff the reactors whose energy we sell, training is not a support function here,
			it is the supply line. The Academy takes qualified engineers through classroom, simulator and
			plant placement to a licensed operator qualification, on a simulator built from the same models
			that back our safety case.
		</p>
		<p>
			It is also the most reliable way into this company for somebody without a nuclear background.
		</p>
	</div>
</section>

<Modal
	open={Boolean(applyingTo)}
	title={applyingTo ? `Apply: ${applyingTo.title}` : ''}
	on:close={() => (applyingTo = null)}
>
	{#if applyingTo}
		<p class="modal-meta">{applyingTo.location} · {applyingTo.team}</p>
		{#if modalBanner}
			<div class="banner banner-{modalBanner.kind}" role="alert">
				<strong>Not sent</strong>{modalBanner.text}
			</div>
		{/if}
		<form id="apply-form" on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="a-name">Your name</label>
				<input
					id="a-name"
					class="input"
					bind:value={name}
					on:blur={() => (touched.name = true)}
					data-autofocus
					aria-invalid={nameError ? 'true' : undefined}
					aria-describedby={nameError ? 'a-name-err' : undefined}
				/>
				{#if nameError}<p class="error-text" id="a-name-err">{nameError}</p>{/if}
			</div>
			<div class="field">
				<label for="a-email">Email</label>
				<input
					id="a-email"
					class="input"
					type="email"
					bind:value={email}
					on:blur={() => (touched.email = true)}
					aria-invalid={emailError ? 'true' : undefined}
					aria-describedby={emailError ? 'a-email-err' : undefined}
				/>
				{#if emailError}<p class="error-text" id="a-email-err">{emailError}</p>{/if}
			</div>
			<div class="field">
				<label for="a-note">Your note</label>
				<textarea
					id="a-note"
					class="textarea"
					bind:value={note}
					on:blur={() => (touched.note = true)}
					aria-invalid={noteError ? 'true' : undefined}
					aria-describedby="a-note-hint {noteError ? 'a-note-err' : ''}"
				></textarea>
				<p class="hint" id="a-note-hint">
					The note is the whole application; there is nothing to attach.
				</p>
				{#if noteError}<p class="error-text" id="a-note-err">{noteError}</p>{/if}
			</div>
		</form>
	{/if}
	<svelte:fragment slot="footer">
		<button class="btn" type="button" on:click={() => (applyingTo = null)}>Cancel</button>
		<button class="btn btn-primary" type="submit" form="apply-form" disabled={busy}>
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Send application
		</button>
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
	.two {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: center;
	}
	.jobs-band {
		background: var(--paper-2);
	}
	.jobs {
		list-style: none;
		padding: 0;
		margin: 20px 0 0;
		display: grid;
		gap: 14px;
	}
	.job {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20px;
		border: 1px solid var(--rule);
		border-radius: var(--r-lg);
		background: var(--paper);
		padding: 18px 20px;
	}
	.j-main {
		flex: 1;
		min-width: 0;
	}
	.j-main h3 {
		margin: 0 0 3px;
		font-size: 1.12rem;
	}
	.j-meta {
		margin: 0 0 8px;
		font-size: 0.82rem;
		color: var(--ink-muted);
		font-weight: 600;
	}
	.j-desc {
		margin: 0;
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.j-side {
		flex: none;
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.academy {
		background: var(--paper);
	}
	.modal-meta {
		font-size: 0.82rem;
		color: var(--ink-muted);
		font-weight: 600;
		margin-bottom: 14px;
	}
	@media (max-width: 860px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 620px) {
		.job {
			flex-direction: column;
		}
	}
</style>
