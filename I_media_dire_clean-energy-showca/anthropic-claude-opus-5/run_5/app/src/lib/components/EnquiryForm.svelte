
<script>
	import { apiData } from '$lib/api';

	let { compact = false, presetTopic = '', presetMessage = '' } = $props();

	const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
	const DIALS = [
		['+31', 'Netherlands +31'],
		['+1', 'United States +1'],
		['+44', 'United Kingdom +44'],
		['+81', 'Japan +81'],
		['+49', 'Germany +49'],
		['+33', 'France +33'],
		['+91', 'India +91'],
		['+61', 'Australia +61']
	];

	let form = $state({
		name: '',
		email: '',
		phone_country: '+31',
		phone: '',
		topic: presetTopic,
		message: presetMessage
	});
	let touched = $state({});
	let busy = $state(false);
	let result = $state(null);
	let failure = $state('');

	// checks itself as the visitor fills it in
	let errors = $derived({
		name: form.name.trim() ? '' : 'Enter the name we should reply to.',
		email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())
			? ''
			: 'Enter an email address we can reach you at.',
		topic: TOPICS.includes(form.topic) ? '' : 'Choose the topic your enquiry is about.',
		message: form.message.trim().length >= 10 ? '' : 'Write at least a sentence so we can answer well.'
	});
	let valid = $derived(Object.values(errors).every((e) => !e));

	function show(field) {
		return touched[field] && errors[field];
	}

	async function submit(e) {
		e.preventDefault();
		touched = { name: true, email: true, topic: true, message: true };
		failure = '';
		if (!valid) return;
		busy = true;
		try {
			const row = await apiData('/enquiries', {
				method: 'POST',
				body: {
					name: form.name.trim(),
					email: form.email.trim(),
					phone_country: form.phone_country,
					phone: form.phone.trim(),
					topic: form.topic,
					message: form.message.trim()
				}
			});
			result = row;
		} catch (err) {
			failure = err.message || 'That enquiry could not be sent.';
		} finally {
			busy = false;
		}
	}

	function again() {
		result = null;
		failure = '';
		touched = {};
		form = {
			name: '',
			email: '',
			phone_country: '+31',
			phone: '',
			topic: presetTopic,
			message: presetMessage
		};
	}
</script>

{#if result}
	<!-- the reference appears in place -->
	<div class="banner banner-ok" role="status" data-testid="enquiry-result">
		<p>
			<strong>Enquiry received.</strong> Your reference is
			<span class="mono" data-testid="enquiry-reference">{result.reference}</span>.
		</p>
		<p>
			An acknowledgement carrying that reference is on its way to
			<strong>{form.email || 'your inbox'}</strong>. Its status is
			<span class="pill pill-pending">{result.status}</span>. Quote the reference if you write again.
		</p>
		<button class="btn btn-sm btn-secondary" type="button" onclick={again}>Send another enquiry</button>
	</div>
{:else}
	<form onsubmit={submit} novalidate class:compact>
		{#if failure}
			<div class="banner banner-fail" role="alert">
				<strong>That enquiry was not sent.</strong>
				{failure} Correct the field it names and send it again.
			</div>
		{/if}

		<div class="row">
			<div class="field">
				<label for="e-name">Your name</label>
				<input
					id="e-name"
					type="text"
					bind:value={form.name}
					onblur={() => (touched.name = true)}
					aria-invalid={show('name') ? 'true' : undefined}
					aria-describedby={show('name') ? 'e-name-err' : undefined}
					autocomplete="name"
				/>
				{#if show('name')}<p class="field-error" id="e-name-err">{errors.name}</p>{/if}
			</div>
			<div class="field">
				<label for="e-email">Email</label>
				<input
					id="e-email"
					type="email"
					bind:value={form.email}
					onblur={() => (touched.email = true)}
					aria-invalid={show('email') ? 'true' : undefined}
					aria-describedby={show('email') ? 'e-email-err' : undefined}
					autocomplete="email"
				/>
				{#if show('email')}<p class="field-error" id="e-email-err">{errors.email}</p>{/if}
			</div>
		</div>

		<div class="row">
			<div class="field">
				<label for="e-dial">Country code</label>
				<select id="e-dial" bind:value={form.phone_country}>
					{#each DIALS as [v, l]}<option value={v}>{l}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="e-phone">Phone, optional</label>
				<input id="e-phone" type="tel" bind:value={form.phone} autocomplete="tel-national" />
			</div>
		</div>

		<div class="field">
			<label for="e-topic">Topic</label>
			<select
				id="e-topic"
				bind:value={form.topic}
				onblur={() => (touched.topic = true)}
				aria-invalid={show('topic') ? 'true' : undefined}
				aria-describedby={show('topic') ? 'e-topic-err' : undefined}
			>
				<option value="">Choose a topic</option>
				{#each TOPICS as t}<option value={t}>{t}</option>{/each}
			</select>
			{#if show('topic')}<p class="field-error" id="e-topic-err">{errors.topic}</p>{/if}
		</div>

		<div class="field">
			<label for="e-message">Message</label>
			<textarea
				id="e-message"
				bind:value={form.message}
				onblur={() => (touched.message = true)}
				aria-invalid={show('message') ? 'true' : undefined}
				aria-describedby={show('message') ? 'e-message-err' : undefined}
			></textarea>
			{#if show('message')}<p class="field-error" id="e-message-err">{errors.message}</p>{/if}
		</div>

		<button class="btn" type="submit" disabled={busy} data-testid="enquiry-submit">
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
			{busy ? 'Sending' : 'Send enquiry'}
		</button>
		<p class="muted note">
			We reply by email and send an acknowledgement carrying your reference straight away.
		</p>
	</form>
{/if}

<style>
	.row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}
	.note {
		font-size: 0.84rem;
		margin: 12px 0 0;
	}
	.banner p {
		margin: 0 0 8px;
	}
	@media (max-width: 620px) {
		.row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
