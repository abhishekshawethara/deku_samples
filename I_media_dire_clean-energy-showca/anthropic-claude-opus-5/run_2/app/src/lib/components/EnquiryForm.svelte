<script>
	// The enquiry form. It checks itself as it is filled in and, once sent,
	// shows the reference in place as an inline banner rather than a toast.
	import { createEventDispatcher } from 'svelte';
	import { api } from '$lib/api.js';
	import { token, account } from '$lib/session.js';

	export let defaultTopic = 'Technology';
	export let prefillMessage = '';

	const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
	const COUNTRIES = [
		['+31', 'Netherlands +31'],
		['+1', 'United States +1'],
		['+81', 'Japan +81'],
		['+44', 'United Kingdom +44'],
		['+49', 'Germany +49'],
		['+61', 'Australia +61'],
		['+27', 'South Africa +27']
	];

	const dispatch = createEventDispatcher();

	let name = $account?.display_name || '';
	let email = $account?.email || '';
	let phone_country = '+31';
	let phone = '';
	let topic = defaultTopic;
	let message = prefillMessage;
	let touched = {};
	let busy = false;
	let banner = null;

	$: errors = {
		name: name.trim() ? '' : 'Tell us your name.',
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter an email we can reply to.',
		topic: TOPICS.includes(topic) ? '' : 'Choose a topic.',
		message: message.trim().length >= 10 ? '' : 'Write at least ten characters so we can help.'
	};
	$: valid = Object.values(errors).every((e) => !e);

	async function submit() {
		touched = { name: true, email: true, topic: true, message: true };
		banner = null;
		if (!valid) {
			banner = { kind: 'error', title: 'Not sent.', text: 'Some fields still need attention. They are marked below.' };
			return;
		}
		busy = true;
		try {
			const row = await api('/api/enquiries', {
				method: 'POST',
				token: $token || undefined,
				body: { name: name.trim(), email: email.trim(), phone_country, phone: phone.trim(), topic, message: message.trim() }
			});
			banner = {
				kind: 'success',
				title: 'Enquiry sent.',
				text: `Your reference is ${row.reference}. An acknowledgement carrying it is on its way to ${row.email}.`,
				reference: row.reference
			};
			message = '';
			phone = '';
			touched = {};
			dispatch('sent', row);
		} catch (err) {
			banner = { kind: 'error', title: 'Not sent.', text: err.message || 'That enquiry could not be recorded. Try again.' };
		} finally {
			busy = false;
		}
	}
</script>

<form class="enquiry" on:submit|preventDefault={submit} novalidate data-testid="enquiry-form">
	{#if banner}
		<div class="banner banner-{banner.kind}" role={banner.kind === 'error' ? 'alert' : 'status'} data-testid="enquiry-banner">
			<strong>{banner.title}</strong>
			{banner.text}
			{#if banner.reference}
				<p class="ref mono" data-testid="enquiry-reference">{banner.reference}</p>
			{/if}
		</div>
	{/if}

	<div class="field">
		<label for="eq-name">Your name</label>
		<input
			id="eq-name"
			type="text"
			bind:value={name}
			on:blur={() => (touched = { ...touched, name: true })}
			aria-invalid={touched.name && errors.name ? 'true' : undefined}
			aria-describedby={touched.name && errors.name ? 'eq-name-err' : undefined}
			autocomplete="name"
		/>
		{#if touched.name && errors.name}<p class="field-error" id="eq-name-err">{errors.name}</p>{/if}
	</div>

	<div class="field">
		<label for="eq-email">Email</label>
		<input
			id="eq-email"
			type="email"
			bind:value={email}
			on:blur={() => (touched = { ...touched, email: true })}
			aria-invalid={touched.email && errors.email ? 'true' : undefined}
			aria-describedby={touched.email && errors.email ? 'eq-email-err' : undefined}
			autocomplete="email"
		/>
		{#if touched.email && errors.email}<p class="field-error" id="eq-email-err">{errors.email}</p>{/if}
	</div>

	<div class="field phone">
		<div>
			<label for="eq-country">Country code</label>
			<select id="eq-country" bind:value={phone_country}>
				{#each COUNTRIES as [code, label]}<option value={code}>{label}</option>{/each}
			</select>
		</div>
		<div>
			<label for="eq-phone">Phone, optional</label>
			<input id="eq-phone" type="tel" bind:value={phone} autocomplete="tel" />
		</div>
	</div>

	<div class="field">
		<label for="eq-topic">Topic</label>
		<select id="eq-topic" bind:value={topic}>
			{#each TOPICS as t}<option value={t}>{t}</option>{/each}
		</select>
	</div>

	<div class="field">
		<label for="eq-message">Message</label>
		<textarea
			id="eq-message"
			bind:value={message}
			on:blur={() => (touched = { ...touched, message: true })}
			aria-invalid={touched.message && errors.message ? 'true' : undefined}
			aria-describedby={touched.message && errors.message ? 'eq-message-err' : undefined}
		></textarea>
		{#if touched.message && errors.message}<p class="field-error" id="eq-message-err">{errors.message}</p>{/if}
	</div>

	<button type="submit" class="btn" disabled={busy} data-testid="enquiry-submit">
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		{busy ? 'Sending' : 'Send the enquiry'}
	</button>
</form>

<style>
	.phone {
		display: grid;
		grid-template-columns: minmax(160px, 1fr) 2fr;
		gap: 12px;
	}
	.ref {
		margin: 8px 0 0;
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid #fff;
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
		margin-right: 8px;
	}
	@media (max-width: 520px) {
		.phone {
			grid-template-columns: 1fr;
		}
	}
</style>
