<script>
	import Modal from '$lib/components/Modal.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { account, currentToken } from '$lib/session.js';

	let { data } = $props();

	let applying = $state(null);
	let name = $state('');
	let email = $state('');
	let note = $state('');
	let busy = $state(false);
	let banner = $state(null);
	let touched = $state({ name: false, email: false, note: false });

	function open(job) {
		applying = job;
		banner = null;
		touched = { name: false, email: false, note: false };
		name = $account?.display_name || '';
		email = $account?.email || '';
		note = '';
	}

	const nameError = $derived(touched.name && name.trim().length < 2 ? 'Tell us your name.' : '');
	const emailError = $derived(
		touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
			? 'Enter an email in the form name@example.com.'
			: ''
	);
	const noteError = $derived(
		touched.note && note.trim().length < 4 ? 'The note is the whole application; write something.' : ''
	);

	async function submit(event) {
		event.preventDefault();
		touched = { name: true, email: true, note: true };
		if (
			name.trim().length < 2 ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
			note.trim().length < 4
		)
			return;
		busy = true;
		banner = null;
		try {
			const { data: app } = await api('/api/applications', {
				method: 'POST',
				token: currentToken(),
				body: {
					job_slug: applying.slug,
					name: name.trim(),
					email: email.trim(),
					note: note.trim()
				}
			});
			banner = {
				kind: 'success',
				text: `Application for ${applying.title} is ${app.status}. An acknowledgement is on its way to ${app.email}. One account holds one application per job, so applying again updates this one.`
			};
			applying = null;
		} catch (err) {
			banner = {
				kind: 'error',
				text:
					err instanceof ApiError && err.status === 401
						? 'Sign in first, then apply. An application belongs to an account.'
						: err.message || 'The application did not send. Try again in a moment.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Careers, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<h1 class="big">{data.copy.lede?.heading || "help us build what's next in nuclear energy"}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap culture">
		<div>
			<Reveal><h2>{data.copy.culture?.heading}</h2></Reveal>
			<p>{data.copy.culture?.body}</p>
		</div>
		<Plate seed="careers-culture" ratio="4 / 3" label="Rotterdam" />
	</div>
</section>

<section class="section jobs-section">
	<div class="wrap">
		<h2>Open roles</h2>
		{#if banner}
			<p
				class={`banner banner-${banner.kind}`}
				role={banner.kind === 'error' ? 'alert' : 'status'}
				data-testid="apply-banner"
			>
				{banner.text}
			</p>
		{/if}
		{#if data.jobs.length === 0}
			<div class="empty">
				<h3>No roles open right now</h3>
				<p>Nothing is being advertised today. Write to us and we will keep you in mind.</p>
				<a class="btn btn-primary btn-sm" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="jobs">
				{#each data.jobs as job (job.slug)}
					<li>
						<div>
							<h3>{job.title}</h3>
							<p class="meta mono">{job.location} &middot; {job.team}</p>
							<p class="muted">{job.description}</p>
						</div>
						<button
							class="btn btn-primary btn-sm"
							type="button"
							onclick={() => open(job)}
							data-testid={`apply-${job.slug}`}>Apply</button
						>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<section class="section academy">
	<div class="wrap-narrow">
		<h2>{data.copy.academy?.heading || 'The Operations Academy'}</h2>
		<p class="lede">{data.copy.academy?.body}</p>
	</div>
</section>

<Modal
	open={!!applying}
	title={applying ? `Apply: ${applying.title}` : 'Apply'}
	onclose={() => (applying = null)}
>
	<p class="muted">
		{applying?.location} &middot; {applying?.team}. There is no attachment: the note is the whole
		application.
	</p>
	{#if !$account}
		<p class="banner banner-info">
			An application belongs to an account. <a href="/signin?next=/careers">Sign in</a> or
			<a href="/signup?next=/careers">create an account</a> first.
		</p>
	{/if}
	<form onsubmit={submit} novalidate id="apply-form">
		<div class="field">
			<label for="a-name">Name</label>
			<input
				id="a-name"
				type="text"
				bind:value={name}
				onblur={() => (touched.name = true)}
				aria-invalid={nameError ? 'true' : 'false'}
				data-testid="apply-name"
			/>
			{#if nameError}<p class="field-error">{nameError}</p>{/if}
		</div>
		<div class="field">
			<label for="a-email">Email</label>
			<input
				id="a-email"
				type="email"
				bind:value={email}
				onblur={() => (touched.email = true)}
				aria-invalid={emailError ? 'true' : 'false'}
				data-testid="apply-email"
			/>
			{#if emailError}<p class="field-error">{emailError}</p>{/if}
		</div>
		<div class="field">
			<label for="a-note">Your note</label>
			<textarea
				id="a-note"
				bind:value={note}
				onblur={() => (touched.note = true)}
				aria-invalid={noteError ? 'true' : 'false'}
				data-testid="apply-note"
			></textarea>
			{#if noteError}
				<p class="field-error">{noteError}</p>
			{:else}
				<p class="field-hint">What you have built, and why this role.</p>
			{/if}
		</div>
	</form>
	{#snippet footer()}
		<button class="btn btn-quiet" type="button" onclick={() => (applying = null)}>Cancel</button>
		<button
			class="btn btn-primary"
			type="submit"
			form="apply-form"
			disabled={busy}
			data-testid="apply-submit"
		>
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
			{busy ? 'Sending' : 'Submit application'}
		</button>
	{/snippet}
</Modal>

<style>
	.head {
		padding: 44px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.big {
		font-size: clamp(2rem, 6.5vw, 4.4rem);
		letter-spacing: -0.04em;
	}
	.culture {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 40px;
		align-items: center;
	}
	.jobs-section {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.jobs {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.jobs li {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20px;
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 18px 20px;
	}
	.jobs h3 {
		font-size: 1.1rem;
		margin-bottom: 4px;
	}
	.meta {
		font-size: 0.8rem;
		color: var(--ink-muted);
		margin: 0 0 8px;
	}
	.jobs .muted {
		font-size: 0.93rem;
		margin: 0;
		max-width: 70ch;
	}
	@media (max-width: 860px) {
		.culture {
			grid-template-columns: 1fr;
		}
		.jobs li {
			flex-direction: column;
		}
	}
</style>
