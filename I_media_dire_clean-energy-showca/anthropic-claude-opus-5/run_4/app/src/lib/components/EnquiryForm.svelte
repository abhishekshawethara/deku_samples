<script>
	/* Validates as it is filled in; on success the reference appears in place as
	   an inline banner, never a floating toast. */
	import { createEventDispatcher } from 'svelte';
	import { api, ApiError } from '$lib/api.js';
	import { account } from '$lib/session.js';

	export let topic = 'Technology';
	export let prefill = '';

	const dispatch = createEventDispatcher();

	const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
	const COUNTRIES = [
		{ code: '+31', label: 'Netherlands (+31)' },
		{ code: '+1', label: 'United States (+1)' },
		{ code: '+44', label: 'United Kingdom (+44)' },
		{ code: '+49', label: 'Germany (+49)' },
		{ code: '+81', label: 'Japan (+81)' },
		{ code: '+971', label: 'United Arab Emirates (+971)' }
	];

	let form = {
		name: '',
		email: '',
		phone_country: '+31',
		phone: '',
		topic,
		message: prefill
	};
	let touched = {};
	let busy = false;
	let banner = null;
	let sent = null;

	let prefilled = false;
	$: if ($account && !prefilled && !form.name.trim()) {
		prefilled = true;
		form.name = $account.display_name;
		form.email = $account.email;
	}

	/* These reference `form` directly so the compiler tracks it as a dependency
	   and the form revalidates on every keystroke. */
	$: nameError = !form.name.trim() ? 'Enter your name.' : '';
	$: emailError = !form.email.trim()
		? 'Enter your email address.'
		: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
			? 'That does not look like an email address.'
			: '';
	$: messageError = !form.message.trim()
		? 'Write a short message.'
		: form.message.trim().length < 10
			? 'Add a little more detail, at least 10 characters.'
			: '';

	$: errors = { name: nameError, email: emailError, message: messageError };
	$: valid = !nameError && !emailError && !messageError;

	async function submit() {
		touched = { name: true, email: true, message: true };
		banner = null;
		if (!valid) {
			banner = { kind: 'fail', title: 'Check the form', text: 'Some fields still need attention before this can be sent.' };
			return;
		}
		busy = true;
		try {
			const res = await api('/enquiries', { method: 'POST', body: form });
			sent = res;
			banner = {
				kind: 'ok',
				title: 'Enquiry sent',
				text: `Your reference is ${res.reference}. An acknowledgement carrying it is on its way to ${form.email}.`
			};
			dispatch('sent', res);
			form = { name: '', email: '', phone_country: '+31', phone: '', topic, message: '' };
			touched = {};
		} catch (err) {
			banner = {
				kind: 'fail',
				title: 'That did not send',
				text: err instanceof ApiError ? err.message : 'The server could not be reached. Try again in a moment.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<form on:submit|preventDefault={submit} novalidate>
	{#if banner}
		<div class="banner banner--{banner.kind === 'ok' ? 'ok' : 'fail'}" role={banner.kind === 'ok' ? 'status' : 'alert'} data-testid="enquiry-banner">
			<span class="banner__title">{banner.title}</span>
			{banner.text}
		</div>
	{/if}

	{#if sent}
		<p class="reference" data-testid="enquiry-reference">
			Reference <strong>{sent.reference}</strong> &middot; status {sent.status}
		</p>
	{/if}

	<div class="field">
		<label for="enq-name">Name</label>
		<input
			id="enq-name"
			type="text"
			bind:value={form.name}
			on:blur={() => (touched.name = true)}
			aria-invalid={touched.name && errors.name ? 'true' : 'false'}
			aria-describedby={touched.name && errors.name ? 'enq-name-err' : undefined}
			autocomplete="name"
			data-autofocus
		/>
		{#if touched.name && errors.name}<p class="field__error" id="enq-name-err">{errors.name}</p>{/if}
	</div>

	<div class="field">
		<label for="enq-email">Email</label>
		<input
			id="enq-email"
			type="email"
			bind:value={form.email}
			on:blur={() => (touched.email = true)}
			aria-invalid={touched.email && errors.email ? 'true' : 'false'}
			aria-describedby={touched.email && errors.email ? 'enq-email-err' : undefined}
			autocomplete="email"
		/>
		{#if touched.email && errors.email}<p class="field__error" id="enq-email-err">{errors.email}</p>{/if}
	</div>

	<div class="row">
		<div class="field field--country">
			<label for="enq-country">Country code</label>
			<select id="enq-country" bind:value={form.phone_country}>
				{#each COUNTRIES as c}
					<option value={c.code}>{c.label}</option>
				{/each}
			</select>
		</div>
		<div class="field field--phone">
			<label for="enq-phone">Phone <span class="opt">(optional)</span></label>
			<input id="enq-phone" type="text" bind:value={form.phone} autocomplete="tel-national" />
		</div>
	</div>

	<div class="field">
		<label for="enq-topic">Topic</label>
		<select id="enq-topic" bind:value={form.topic}>
			{#each TOPICS as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="enq-message">Message</label>
		<textarea
			id="enq-message"
			bind:value={form.message}
			on:blur={() => (touched.message = true)}
			aria-invalid={touched.message && errors.message ? 'true' : 'false'}
			aria-describedby={touched.message && errors.message ? 'enq-message-err' : undefined}
		></textarea>
		{#if touched.message && errors.message}<p class="field__error" id="enq-message-err">{errors.message}</p>{/if}
	</div>

	<button class="btn" type="submit" disabled={busy} data-testid="enquiry-submit">
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		{busy ? 'Sending' : 'Send enquiry'}
	</button>
</form>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(160px, 1fr) 2fr;
		gap: 0.75rem;
	}
	.opt {
		font-weight: 400;
		color: var(--ink-muted);
	}
	.reference {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		background: var(--accent-tint);
		border: 1px solid var(--accent);
		border-radius: var(--radius-sm);
		padding: 0.6rem 0.75rem;
	}
	@media (max-width: 520px) {
		.row {
			grid-template-columns: 1fr;
		}
	}
</style>
