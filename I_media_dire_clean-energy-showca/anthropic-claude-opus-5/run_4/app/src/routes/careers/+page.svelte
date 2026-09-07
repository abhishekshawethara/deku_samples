<script>
	/* The apply form offers no file input and no attachment control: the note is
	   the whole application. */
	import Modal from '$lib/components/Modal.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import { api, getToken, ApiError } from '$lib/api.js';
	import { account } from '$lib/session.js';

	export let data;

	let applyingTo = null;
	let form = { name: '', email: '', note: '' };
	let touched = {};
	let busy = false;
	let banner = null;

	function openApply(job) {
		applyingTo = job;
		banner = null;
		touched = {};
		form = {
			name: $account?.display_name || '',
			email: $account?.email || '',
			note: ''
		};
	}

	$: errors = {
		name: !form.name.trim() ? 'Enter your name.' : '',
		email: !form.email.trim()
			? 'Enter your email address.'
			: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
				? 'That does not look like an email address.'
				: '',
		note: !form.note.trim()
			? 'Write a short note; it is the whole application.'
			: form.note.trim().length < 20
				? 'Tell us a little more, at least 20 characters.'
				: ''
	};
	$: valid = !errors.name && !errors.email && !errors.note;

	async function submit() {
		touched = { name: true, email: true, note: true };
		banner = null;
		if (!getToken()) {
			banner = {
				kind: 'fail',
				title: 'Sign in to apply',
				text: 'An application belongs to an account. Sign in or create one, then apply.'
			};
			return;
		}
		if (!valid) {
			banner = { kind: 'fail', title: 'Check the form', text: 'Some fields still need attention.' };
			return;
		}
		busy = true;
		try {
			const res = await api('/applications', {
				method: 'POST',
				body: {
					job_slug: applyingTo.slug,
					name: form.name.trim(),
					email: form.email.trim(),
					note: form.note.trim()
				}
			});
			banner = {
				kind: 'ok',
				title: 'Application received',
				text: `Your application for ${applyingTo.title} is at status ${res.status}. An account holds at most one application per job, so applying again updates this one. It is listed in your account.`
			};
		} catch (err) {
			banner = {
				kind: 'fail',
				title: 'That did not send',
				text: err instanceof ApiError ? err.message : 'The server could not be reached.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Careers, Zettajoule</title>
	<meta name="description" content="Help us build what's next in nuclear energy. Open roles in engineering, licensing and the Operations Academy." />
</svelte:head>

<section class="section wrap">
	<p class="eyebrow">Careers</p>
	<h1 class="opening">help us build what's next in nuclear energy</h1>
	<p class="lede">
		We try to do right by our partners, the planet and the people who work here, in that order on the hard days
		and all at once on the good ones.
	</p>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div>
			<h2>How we work</h2>
			<p>
				This is an engineering company that writes things down. Assumptions sit next to numbers, the safety
				case is written before the marketing, and a component sees its duty on a rig before it sees a site.
			</p>
			<p>
				It is also a company that operates what it builds, which keeps everyone honest: the person who
				specifies a seal knows the crew who will replace it works for the same company.
			</p>
		</div>
		<Plate seed="careers-culture" label="Generated plate: the culture" ratio="4 / 3" />
	</div>
</section>

<section class="section wrap" aria-labelledby="jobs-heading">
	<h2 id="jobs-heading">Open roles</h2>
	{#if data.jobs.length === 0}
		<div class="empty">
			<p><strong>No roles are open right now.</strong></p>
			<p>Nothing is posted at the moment; check back or send us a note.</p>
			<a class="btn" href="/contact">Get in Touch</a>
		</div>
	{:else}
		<ul class="jobs">
			{#each data.jobs as job (job.slug)}
				<li class="job">
					<div class="job__head">
						<h3>{job.title}</h3>
						<p class="job__meta mono">{job.location} &middot; {job.team}</p>
					</div>
					<p class="job__desc">{job.description}</p>
					<button class="btn btn--small" type="button" on:click={() => openApply(job)} data-testid="apply-{job.slug}">
						Apply
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="section wrap">
	<div class="card academy">
		<p class="eyebrow">Operations Academy</p>
		<h2>How we staff the reactors we run</h2>
		<p>
			Because Zettajoule owns and operates every module it deploys, it hires and trains every crew that runs
			one. The Operations Academy in Rotterdam takes cohorts through simulator work against the digital twin
			alongside classroom time on reactor physics, helium systems and the operating envelope.
		</p>
		<p>
			Graduates hold a Zettajoule control room qualification and go on to a deployment. It is a training arm
			and a core part of the product at the same time.
		</p>
	</div>
</section>

<Modal open={!!applyingTo} title={applyingTo ? `Apply: ${applyingTo.title}` : ''} on:close={() => (applyingTo = null)}>
	{#if applyingTo}
		<p class="mono sub">{applyingTo.location} &middot; {applyingTo.team}</p>

		{#if banner}
			<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role={banner.kind === 'ok' ? 'status' : 'alert'} data-testid="apply-banner">
				<span class="banner__title">{banner.title}</span>{banner.text}
			</div>
		{/if}

		<form on:submit|preventDefault={submit} novalidate>
			<div class="field">
				<label for="ap-name">Name</label>
				<input
					id="ap-name"
					type="text"
					bind:value={form.name}
					on:blur={() => (touched.name = true)}
					aria-invalid={touched.name && errors.name ? 'true' : 'false'}
					data-autofocus
				/>
				{#if touched.name && errors.name}<p class="field__error">{errors.name}</p>{/if}
			</div>
			<div class="field">
				<label for="ap-email">Email</label>
				<input
					id="ap-email"
					type="email"
					bind:value={form.email}
					on:blur={() => (touched.email = true)}
					aria-invalid={touched.email && errors.email ? 'true' : 'false'}
				/>
				{#if touched.email && errors.email}<p class="field__error">{errors.email}</p>{/if}
			</div>
			<div class="field">
				<label for="ap-note">Your note</label>
				<textarea
					id="ap-note"
					bind:value={form.note}
					on:blur={() => (touched.note = true)}
					aria-invalid={touched.note && errors.note ? 'true' : 'false'}
					aria-describedby="ap-note-hint"
				></textarea>
				<p class="field__hint" id="ap-note-hint">
					There is no attachment: the note is the whole application. Tell us why this role and what you have
					done.
				</p>
				{#if touched.note && errors.note}<p class="field__error">{errors.note}</p>{/if}
			</div>
			<button class="btn" type="submit" disabled={busy} data-testid="apply-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Sending' : 'Submit application'}
			</button>
		</form>
	{/if}
</Modal>

<style>
	.opening {
		font-size: clamp(1.9rem, 5.5vw, 3.8rem);
		max-width: 20ch;
		line-height: 1.02;
	}
	.jobs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 1rem;
	}
	.job {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1.25rem;
	}
	.job__head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.job h3 {
		margin: 0;
	}
	.job__meta {
		margin: 0;
		font-size: 0.82rem;
		color: var(--ink-muted);
	}
	.job__desc {
		color: var(--ink-muted);
		font-size: 0.92rem;
		margin: 0.75rem 0 1rem;
	}
	.academy {
		max-width: 760px;
		padding: 1.75rem;
	}
	.sub {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
</style>
