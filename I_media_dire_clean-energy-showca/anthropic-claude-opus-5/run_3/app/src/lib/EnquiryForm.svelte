<script>
	// The enquiry form: it checks itself as the visitor fills it in and, once
	// sent, shows the reference in place as an inline banner.
	import { api, ApiError } from '$lib/api.js';
	import { account } from '$lib/auth.js';

	let { topic = 'Technology', presetMessage = '', onsent, compact = false } = $props();

	const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
	const COUNTRIES = [
		['+31', 'Netherlands +31'],
		['+1', 'United States +1'],
		['+44', 'United Kingdom +44'],
		['+81', 'Japan +81'],
		['+49', 'Germany +49'],
		['+33', 'France +33'],
		['+971', 'United Arab Emirates +971'],
		['+61', 'Australia +61']
	];

	let form = $state({
		name: $account?.display_name || '',
		email: $account?.email || '',
		phone_country: '+31',
		phone: '',
		topic,
		message: presetMessage
	});
	let touched = $state({});
	let submitting = $state(false);
	let result = $state(null);
	let failure = $state('');

	function errorFor(field) {
		const v = String(form[field] || '').trim();
		if (field === 'name' && !v) return 'Tell us your name.';
		if (field === 'email') {
			if (!v) return 'We need an email to reply to.';
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That does not look like an email address.';
		}
		if (field === 'message') {
			if (!v) return 'Write us a message.';
			if (v.length < 10) return 'A little more detail, please: at least 10 characters.';
		}
		return '';
	}

	const errors = $derived({
		name: errorFor('name'),
		email: errorFor('email'),
		message: errorFor('message')
	});
	const valid = $derived(!errors.name && !errors.email && !errors.message);

	async function submit(event) {
		event.preventDefault();
		touched = { name: true, email: true, message: true };
		failure = '';
		if (!valid) return;
		submitting = true;
		try {
			const { data } = await api('/enquiries', { method: 'POST', body: { ...form } });
			result = data;
			onsent?.(data);
		} catch (e) {
			failure = e instanceof ApiError ? e.message : 'We could not send that just now.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if result}
	<div class="banner banner--ok" role="status" data-enquiry-reference={result.reference}>
		<strong>Enquiry sent</strong>
		<span>
			Your reference is <b class="ref">{result.reference}</b>. We have emailed an acknowledgement
			carrying it to {form.email}. Quote the reference in any follow up.
		</span>
	</div>
	<button
		class="btn btn--ghost"
		type="button"
		onclick={() => {
			result = null;
			form = { ...form, message: '' };
			touched = {};
		}}
	>
		Send another
	</button>
{:else}
	<form onsubmit={submit} novalidate class:compact>
		{#if failure}
			<div class="banner banner--fail" role="alert">
				<strong>Not sent</strong>
				<span>{failure}</span>
			</div>
		{/if}

		<div class="two">
			<div class="field">
				<label for="e-name">Name</label>
				<input
					id="e-name"
					type="text"
					autocomplete="name"
					bind:value={form.name}
					onblur={() => (touched = { ...touched, name: true })}
					aria-invalid={touched.name && errors.name ? 'true' : undefined}
					aria-describedby={touched.name && errors.name ? 'e-name-err' : undefined}
				/>
				{#if touched.name && errors.name}
					<p class="field__error" id="e-name-err">{errors.name}</p>
				{/if}
			</div>

			<div class="field">
				<label for="e-email">Email</label>
				<input
					id="e-email"
					type="email"
					autocomplete="email"
					bind:value={form.email}
					onblur={() => (touched = { ...touched, email: true })}
					aria-invalid={touched.email && errors.email ? 'true' : undefined}
					aria-describedby={touched.email && errors.email ? 'e-email-err' : undefined}
				/>
				{#if touched.email && errors.email}
					<p class="field__error" id="e-email-err">{errors.email}</p>
				{/if}
			</div>
		</div>

		<div class="two">
			<div class="field">
				<label for="e-country">Country code</label>
				<select id="e-country" bind:value={form.phone_country}>
					{#each COUNTRIES as [code, label]}
						<option value={code}>{label}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="e-phone">Phone <span class="muted">(optional)</span></label>
				<input id="e-phone" type="tel" autocomplete="tel" bind:value={form.phone} />
			</div>
		</div>

		<div class="field">
			<label for="e-topic">Topic</label>
			<select id="e-topic" bind:value={form.topic}>
				{#each TOPICS as t}
					<option value={t}>{t}</option>
				{/each}
			</select>
		</div>

		<div class="field">
			<label for="e-message">Message</label>
			<textarea
				id="e-message"
				bind:value={form.message}
				onblur={() => (touched = { ...touched, message: true })}
				aria-invalid={touched.message && errors.message ? 'true' : undefined}
				aria-describedby={touched.message && errors.message ? 'e-msg-err' : 'e-msg-hint'}
			></textarea>
			{#if touched.message && errors.message}
				<p class="field__error" id="e-msg-err">{errors.message}</p>
			{:else}
				<p class="field__hint" id="e-msg-hint">
					Tell us about the site, the load and the timing if you know them.
				</p>
			{/if}
		</div>

		<button class="btn" type="submit" disabled={submitting}>
			{#if submitting}
				<span class="spinner" aria-hidden="true"></span>
				<span>Sending</span>
			{:else}
				<span>Send enquiry</span>
			{/if}
		</button>
	</form>
{/if}

<style>
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.ref {
		font-family: var(--font-mono);
		font-weight: 700;
	}
	@media (max-width: 560px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
