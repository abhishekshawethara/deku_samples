
<script>
	import { browser } from '$app/environment';
	import { apiData, getToken, getAccount } from '$lib/api';
	import Modal from '$lib/components/Modal.svelte';
	import Plate from '$lib/components/Plate.svelte';

	let jobs = $state([]);
	let loading = $state(true);
	let error = $state('');
	let applyFor = $state(null);
	let form = $state({ name: '', email: '', note: '' });
	let touched = $state({});
	let busy = $state(false);
	let failure = $state('');
	let done = $state(null);
	let signedIn = $state(false);

	$effect(() => {
		apiData('/jobs', { auth: false })
			.then((d) => (jobs = d || []))
			.catch((err) => (error = err.message || 'The open jobs could not load.'))
			.finally(() => (loading = false));
	});

	$effect(() => {
		if (!browser) return;
		signedIn = !!getToken();
		const on = () => (signedIn = !!getToken());
		window.addEventListener('zj:session', on);
		return () => window.removeEventListener('zj:session', on);
	});

	let errors = $derived({
		name: form.name.trim() ? '' : 'Enter your name.',
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())
			? ''
			: 'Enter an email we can reach you at.',
		note: form.note.trim().length >= 10 ? '' : 'Write at least a sentence: the note is the whole application.'
	});
	let valid = $derived(Object.values(errors).every((e) => !e));

	function open(job) {
		const acc = getAccount();
		applyFor = job;
		form = { name: acc?.display_name || '', email: acc?.email || '', note: '' };
		touched = {};
		failure = '';
		done = null;
	}

	async function submit(e) {
		e.preventDefault();
		touched = { name: true, email: true, note: true };
		failure = '';
		if (!valid) return;
		busy = true;
		try {
			const row = await apiData('/applications', {
				method: 'POST',
				body: {
					job_slug: applyFor.slug,
					name: form.name.trim(),
					email: form.email.trim(),
					note: form.note.trim()
				}
			});
			done = row;
		} catch (err) {
			failure = err.message || 'That application could not be sent.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Careers, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Careers</p>
		<h1>help us build what's next in nuclear energy</h1>
		<p class="lede">
			We try to do right by our partners, the planet and the people who work here, in that order on
			the hard days and all three on the good ones.
		</p>
	</div>
</div>

<section class="section wrap">
	<div class="grid g2 culture">
		<div>
			<h2>How it works here</h2>
			<p>
				We own the reactors we build, which changes what the company is. A vendor ships a machine
				and moves on; we stay for sixty years, so the people who design the plant and the people
				who run it sit in the same building and argue about the same drawings. Engineers take their
				own designs through licensing review. Operators are consulted before the layout is frozen,
				not after.
			</p>
			<p>
				The work is deliberate rather than fast. Every claim in the safety case has to be traceable
				to a measurement somebody actually took, and that discipline runs through everything else.
			</p>
		</div>
		<div>
			<h2>The Operations Academy</h2>
			<p>
				Because we staff the reactors we run, training is not a support function, it is how the
				business scales. The Academy in Rotterdam takes people from inside and outside the industry
				and puts them through classroom work alongside simulator time on the digital twin, then
				follows them to the plant they will crew.
			</p>
			<p class="muted">
				It is why <a href="/team">Daniel Okoye</a> runs a school as one of four executive roles in a
				reactor company.
			</p>
		</div>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap">
		<h2>Open jobs</h2>
		{#if loading}
			<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading open jobs</div>
		{:else if error}
			<div class="banner banner-fail" role="alert">
				<strong>The jobs could not load.</strong>
				{error} Reload the page to try again, or <a href="/contact">write to us</a>.
			</div>
		{:else if jobs.length === 0}
			<div class="empty">
				<h3>No job is open right now</h3>
				<p>Nothing is posted at the moment. Write to us and we will keep your note on file.</p>
				<a class="btn btn-sm btn-secondary" href="/contact">Get in Touch</a>
			</div>
		{:else}
			<ul class="jobs" data-testid="job-list">
				{#each jobs as job (job.slug)}
					<li class="card job">
						<Plate seed={job.slug} height={90} />
						<div class="job-body">
							<h3>{job.title}</h3>
							<p class="job-meta">
								<span class="pill">{job.team}</span>
								<span class="pill">{job.location}</span>
							</p>
							<p class="muted">{job.description}</p>
							<button
								class="btn btn-sm"
								type="button"
								onclick={() => open(job)}
								data-testid="apply-{job.slug}"
							>
								Apply for this job<span class="visually-hidden">, {job.title}</span>
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<Modal
	open={!!applyFor}
	title={applyFor ? `Apply: ${applyFor.title}` : ''}
	onclose={() => (applyFor = null)}
>
	{#if done}
		<div class="banner banner-ok" role="status" data-testid="apply-result">
			<p>
				<strong>Application received.</strong> Your application for
				<strong>{done.job_title}</strong> is <span class="pill pill-pending">{done.status}</span>.
			</p>
			<p>
				An acknowledgement naming the role and its location is on its way to
				<strong>{form.email}</strong>. Applying again updates this one rather than adding a second.
			</p>
			<a class="btn btn-sm btn-secondary" href="/account">See it in your account</a>
		</div>
	{:else if !signedIn}
		<div class="banner banner-info">
			<strong>Sign in to apply.</strong> An application belongs to an account, so we need to know whose
			it is.
		</div>
		<a class="btn" href="/signin?next=%2Fcareers">Sign in</a>
	{:else}
		<p class="muted">
			{applyFor?.location} · {applyFor?.team}. There is no attachment: your note is the whole
			application.
		</p>
		<form onsubmit={submit} novalidate>
			{#if failure}
				<div class="banner banner-fail" role="alert">
					<strong>That application was not sent.</strong>
					{failure} Correct the field it names and send it again.
				</div>
			{/if}
			<div class="field">
				<label for="ap-name">Your name</label>
				<input
					id="ap-name"
					type="text"
					bind:value={form.name}
					onblur={() => (touched.name = true)}
					aria-invalid={touched.name && errors.name ? 'true' : undefined}
				/>
				{#if touched.name && errors.name}<p class="field-error">{errors.name}</p>{/if}
			</div>
			<div class="field">
				<label for="ap-email">Email</label>
				<input
					id="ap-email"
					type="email"
					bind:value={form.email}
					onblur={() => (touched.email = true)}
					aria-invalid={touched.email && errors.email ? 'true' : undefined}
				/>
				{#if touched.email && errors.email}<p class="field-error">{errors.email}</p>{/if}
			</div>
			<div class="field">
				<label for="ap-note">Your note</label>
				<textarea
					id="ap-note"
					bind:value={form.note}
					onblur={() => (touched.note = true)}
					aria-invalid={touched.note && errors.note ? 'true' : undefined}
				></textarea>
				{#if touched.note && errors.note}<p class="field-error">{errors.note}</p>{/if}
			</div>
			<button class="btn" type="submit" disabled={busy} data-testid="apply-submit">
				{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
				{busy ? 'Sending' : 'Send application'}
			</button>
		</form>
	{/if}
</Modal>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 44px 0 34px;
	}
	.head h1 {
		text-transform: none;
	}
	.culture {
		gap: 40px;
	}
	.jobs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 14px;
	}
	.job {
		display: grid;
		grid-template-columns: 190px minmax(0, 1fr);
		gap: 20px;
		align-items: start;
		background: var(--surface);
	}
	.job h3 {
		margin: 0 0 8px;
	}
	.job-meta {
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
		margin: 0 0 10px;
	}
	.job-body p.muted {
		font-size: 0.92rem;
		margin-bottom: 14px;
	}
	.banner p {
		margin: 0 0 8px;
	}
	@media (max-width: 720px) {
		.job {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
