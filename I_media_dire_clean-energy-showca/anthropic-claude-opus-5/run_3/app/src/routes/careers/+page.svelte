<script>
	// The apply form offers no file input and no attachment control: the note is
	// the whole application.
	import Reveal from '$lib/Reveal.svelte';
	import Plate from '$lib/Plate.svelte';
	import Modal from '$lib/Modal.svelte';
	import { api, ApiError } from '$lib/api.js';
	import { token, account } from '$lib/auth.js';

	let { data } = $props();

	let openJob = $state(null);
	let form = $state({ name: '', email: '', note: '' });
	let touched = $state({});
	let busy = $state(false);
	let banner = $state(null);
	let modalError = $state('');

	function apply(job) {
		openJob = job;
		modalError = '';
		form = {
			name: $account?.display_name || '',
			email: $account?.email || '',
			note: ''
		};
		touched = {};
	}

	const errors = $derived({
		name: form.name.trim() ? '' : 'Tell us your name.',
		email: !form.email.trim()
			? 'We need an email to reply to.'
			: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
				? ''
				: 'That does not look like an email address.',
		note:
			form.note.trim().length >= 10
				? ''
				: 'Write at least 10 characters: the note is the whole application.'
	});
	const valid = $derived(!errors.name && !errors.email && !errors.note);

	async function submit(event) {
		event.preventDefault();
		touched = { name: true, email: true, note: true };
		modalError = '';
		if (!valid) return;
		busy = true;
		try {
			const { data: row } = await api('/applications', {
				method: 'POST',
				body: {
					job_slug: openJob.slug,
					name: form.name.trim(),
					email: form.email.trim(),
					note: form.note.trim()
				}
			});
			banner = {
				kind: 'ok',
				text: `Application for ${openJob.title} is in, and an acknowledgement is on its way to ${form.email}. Applying again updates it rather than adding a second.`
			};
			openJob = null;
		} catch (e) {
			modalError =
				e instanceof ApiError && e.status === 401
					? 'Sign in first: an application belongs to an account.'
					: e.message;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Careers · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Careers</p>
		<Reveal as="h1" text="help us build what's next in nuclear energy" />
		<p class="lede">
			We try to do right by our partners, the planet and the people who work here, in that order on
			the hard days and all at once on the good ones.
		</p>
	</div>
</section>

<section class="section wrap grid grid--2">
	<div>
		<h2>The culture</h2>
		<p>
			We are a small company doing something that has been done before, deliberately. That shapes
			how we work: evidence over enthusiasm, an operating record over a projection, and a written
			argument that a regulator could follow over a diagram that only makes sense out loud.
		</p>
		<p>
			The people here have built offshore wind, run nuclear and process plant, assessed submissions
			from inside a regulator and taught operators their trade. Nobody is precious about their
			discipline, because a licensing decision is an engineering decision and an engineering
			decision is a schedule decision.
		</p>
	</div>
	<Plate seed="careers-culture" ratio="4 / 3" label="Generated plate: working at Zettajoule" />
</section>

<section class="section wrap" id="jobs">
	<h2>Open roles</h2>
	{#if banner}
		<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role="status">
			<strong>{banner.kind === 'ok' ? 'Application received' : 'Not sent'}</strong>
			<span>{banner.text}</span>
		</div>
	{/if}

	{#if data.jobs.length === 0}
		<div class="empty-state">
			<p><strong>No open roles right now.</strong> Nothing is being advertised today.</p>
			<a class="btn" href="/contact">Write to us anyway</a>
		</div>
	{:else}
		<ul class="jobs">
			{#each data.jobs as job (job.slug)}
				<li class="job">
					<div class="job__head">
						<div>
							<h3>{job.title}</h3>
							<p class="job__meta">{job.location} · {job.team}</p>
						</div>
						<button class="btn btn--sm" type="button" onclick={() => apply(job)}>
							Apply<span class="visually-hidden"> for {job.title}</span>
						</button>
					</div>
					<p class="job__desc">{job.description}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="section academy">
	<div class="wrap grid grid--2">
		<div>
			<p class="eyebrow">Operations Academy</p>
			<h2>How we staff what we run</h2>
			<p>
				Because Zettajoule owns and operates every module it sells energy from, it has to supply the
				operators too. The Operations Academy is that answer: an eighteen month programme taking
				experienced process and power operators to licensed high-temperature reactor operators,
				through reactor physics, helium systems, the digital twin and simulator time.
			</p>
			<p>
				The first cohort of twenty four started at the Rotterdam campus, drawn from process
				industry, conventional power and naval propulsion. The intake schedule is a real constraint
				on the deployment schedule, which is why the academy sits at the centre of the company
				rather than at the edge of it.
			</p>
		</div>
		<Plate seed="operations-academy" ratio="4 / 3" label="Generated plate: the Operations Academy" />
	</div>
</section>

<Modal
	open={Boolean(openJob)}
	title={openJob ? `Apply: ${openJob.title}` : ''}
	onclose={() => (openJob = null)}
>
	{#if openJob}
		<p class="muted">
			{openJob.location} · {openJob.team}. No file is attached anywhere: the note is the whole
			application.
		</p>
		{#if !$token}
			<div class="banner banner--info">
				<strong>Sign in first</strong>
				<span>An application belongs to an account, so we can show you where it stands.</span>
			</div>
			<a class="btn" href="/signin?next=/careers">Sign in</a>
		{:else}
			{#if modalError}
				<div class="banner banner--fail" role="alert">
					<strong>Not sent</strong>
					<span>{modalError}</span>
				</div>
			{/if}
			<form onsubmit={submit} novalidate>
				<div class="field">
					<label for="a-name">Name</label>
					<input
						id="a-name"
						type="text"
						bind:value={form.name}
						onblur={() => (touched = { ...touched, name: true })}
						aria-invalid={touched.name && errors.name ? 'true' : undefined}
					/>
					{#if touched.name && errors.name}<p class="field__error">{errors.name}</p>{/if}
				</div>
				<div class="field">
					<label for="a-email">Email</label>
					<input
						id="a-email"
						type="email"
						bind:value={form.email}
						onblur={() => (touched = { ...touched, email: true })}
						aria-invalid={touched.email && errors.email ? 'true' : undefined}
					/>
					{#if touched.email && errors.email}<p class="field__error">{errors.email}</p>{/if}
				</div>
				<div class="field">
					<label for="a-note">Your note</label>
					<textarea
						id="a-note"
						bind:value={form.note}
						onblur={() => (touched = { ...touched, note: true })}
						aria-invalid={touched.note && errors.note ? 'true' : undefined}
					></textarea>
					{#if touched.note && errors.note}
						<p class="field__error">{errors.note}</p>
					{:else}
						<p class="field__hint">Tell us what you have run, built or licensed.</p>
					{/if}
				</div>
				<button class="btn" type="submit" disabled={busy}>
					{#if busy}<span class="spinner" aria-hidden="true"></span> Sending{:else}Submit application{/if}
				</button>
			</form>
		{/if}
	{/if}
</Modal>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.jobs {
		list-style: none;
		margin: 1.25rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}
	.job {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
	}
	.job__head {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		justify-content: space-between;
	}
	.job h3 {
		margin: 0 0 0.15rem;
		font-size: 1.15rem;
	}
	.job__meta {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
	.job__desc {
		margin: 0.75rem 0 0;
		font-size: 0.92rem;
		color: var(--ink-muted);
	}
	.academy {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
	}
</style>
