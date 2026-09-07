<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { api, ApiError } from '$lib/api.js';
	import { account, currentToken } from '$lib/session.js';

	let { data } = $props();

	const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
	const COUNTRIES = [
		{ code: '+31', label: 'Netherlands +31' },
		{ code: '+1', label: 'United States +1' },
		{ code: '+81', label: 'Japan +81' },
		{ code: '+44', label: 'United Kingdom +44' },
		{ code: '+49', label: 'Germany +49' },
		{ code: '+33', label: 'France +33' },
		{ code: '+61', label: 'Australia +61' },
		{ code: '+91', label: 'India +91' }
	];

	let name = $state('');
	let email = $state('');
	let phone_country = $state('+31');
	let phone = $state('');
	let topic = $state('Technology');
	let message = $state('');
	let busy = $state(false);
	let sent = $state(null);
	let error = $state('');
	let touched = $state({ name: false, email: false, message: false });

	onMount(() => {
		const t = $page.url.searchParams.get('topic');
		if (t && TOPICS.includes(t)) topic = t;
		const sol = $page.url.searchParams.get('solution');
		if (sol) message = `I am interested in the ${sol.replace(/-/g, ' ')} solution. `;
		if ($account) {
			name = $account.display_name;
			email = $account.email;
		}
	});

	$effect(() => {
		if ($account && !name && !email) {
			name = $account.display_name;
			email = $account.email;
		}
	});

	const nameError = $derived(
		touched.name && name.trim().length < 2 ? 'Tell us who is asking.' : ''
	);
	const emailError = $derived(
		touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
			? 'Enter an email in the form name@example.com so we can reply.'
			: ''
	);
	const messageError = $derived(
		touched.message && message.trim().length < 4 ? 'Write at least a sentence.' : ''
	);
	const valid = $derived(
		name.trim().length >= 2 &&
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
			message.trim().length >= 4
	);

	async function submit(event) {
		event.preventDefault();
		touched = { name: true, email: true, message: true };
		if (!valid) return;
		busy = true;
		error = '';
		try {
			const { data: enq } = await api('/api/enquiries', {
				method: 'POST',
				token: currentToken() || undefined,
				body: {
					name: name.trim(),
					email: email.trim(),
					phone_country,
					phone: phone.trim(),
					topic,
					message: message.trim()
				}
			});
			sent = enq;
			message = '';
			phone = '';
			touched = { name: false, email: false, message: false };
		} catch (err) {
			error =
				err instanceof ApiError
					? err.message
					: 'The enquiry did not send. Check your connection and try again.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Contact, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Contact</p>
		<h1>{data.copy.lede?.heading || 'Get in touch'}</h1>
		<p class="lede">{data.copy.lede?.body}</p>
	</div>
</section>

<section class="section">
	<div class="wrap contact-grid">
		<div>
			{#if sent}
				<div class="banner banner-success" role="status" data-testid="enquiry-success">
					<strong>Enquiry received.</strong> Your reference is
					<span class="mono ref" data-testid="enquiry-reference">{sent.reference}</span>. We have
					sent an acknowledgement to {sent.email} carrying it, and the enquiry is
					<span class="mono">{sent.status}</span>.
					{#if $account}
						It is on <a href="/account">your account</a> too.
					{/if}
				</div>
				<p>
					<button class="btn btn-quiet" type="button" onclick={() => (sent = null)}
						>Send another enquiry</button
					>
				</p>
			{/if}

			{#if error}
				<p class="banner banner-error" role="alert" data-testid="enquiry-error">
					<strong>That did not send.</strong>
					{error}
				</p>
			{/if}

			{#if !sent}
				<form onsubmit={submit} novalidate data-testid="enquiry-form">
					<div class="field">
						<label for="name">Name</label>
						<input
							id="name"
							type="text"
							autocomplete="name"
							bind:value={name}
							onblur={() => (touched.name = true)}
							aria-invalid={nameError ? 'true' : 'false'}
							aria-describedby={nameError ? 'name-error' : undefined}
							data-testid="enq-name"
						/>
						{#if nameError}<p class="field-error" id="name-error">{nameError}</p>{/if}
					</div>

					<div class="field">
						<label for="email">Email</label>
						<input
							id="email"
							type="email"
							autocomplete="email"
							bind:value={email}
							onblur={() => (touched.email = true)}
							aria-invalid={emailError ? 'true' : 'false'}
							aria-describedby={emailError ? 'email-error' : undefined}
							data-testid="enq-email"
						/>
						{#if emailError}<p class="field-error" id="email-error">{emailError}</p>{/if}
					</div>

					<div class="field phone">
						<div>
							<label for="country">Country code</label>
							<select id="country" bind:value={phone_country} data-testid="enq-country">
								{#each COUNTRIES as c}
									<option value={c.code}>{c.label}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="phone">Phone, optional</label>
							<input
								id="phone"
								type="tel"
								autocomplete="tel"
								bind:value={phone}
								data-testid="enq-phone"
							/>
						</div>
					</div>

					<div class="field">
						<label for="topic">Topic</label>
						<select id="topic" bind:value={topic} data-testid="enq-topic">
							{#each TOPICS as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</div>

					<div class="field">
						<label for="message">Message</label>
						<textarea
							id="message"
							bind:value={message}
							onblur={() => (touched.message = true)}
							aria-invalid={messageError ? 'true' : 'false'}
							aria-describedby={messageError ? 'message-error' : 'message-hint'}
							data-testid="enq-message"
						></textarea>
						{#if messageError}
							<p class="field-error" id="message-error">{messageError}</p>
						{:else}
							<p class="field-hint" id="message-hint">
								We reply by email, and you get a reference back on this page straight away.
							</p>
						{/if}
					</div>

					<button
						class="btn btn-primary"
						type="submit"
						disabled={busy}
						data-testid="enquiry-submit"
					>
						{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
						{busy ? 'Sending' : 'Send enquiry'}
					</button>
				</form>
			{/if}
		</div>

		<aside>
			<h2>Where we are</h2>
			<ul class="offices">
				{#each data.offices as o}
					<li>
						<strong>{o.city}</strong>
						<span>{o.country}</span>
						<span class="badge">{o.role_label}</span>
					</li>
				{/each}
			</ul>
			<h2 class="mt">What happens next</h2>
			<ol class="steps">
				<li>You get a reference in place, on this page, straight away.</li>
				<li>An acknowledgement carrying that reference arrives in your inbox.</li>
				<li>
					Signed in, the enquiry sits on <a href="/account">your account</a> where you can close it.
				</li>
			</ol>
		</aside>
	</div>
</section>

<style>
	.head {
		padding: 40px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.contact-grid {
		display: grid;
		grid-template-columns: 1.25fr 0.75fr;
		gap: 44px;
		align-items: start;
	}
	.phone {
		display: grid;
		grid-template-columns: 0.9fr 1.1fr;
		gap: 12px;
	}
	.ref {
		font-weight: 700;
		border-bottom: 2px solid currentColor;
	}
	aside h2 {
		font-size: 1.05rem;
		padding-bottom: 8px;
		border-bottom: 2px solid var(--rule-strong);
	}
	.mt {
		margin-top: 28px;
	}
	.offices {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.offices li {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		border-bottom: 1px solid var(--rule);
		padding-bottom: 8px;
	}
	.offices span {
		color: var(--ink-muted);
		font-size: 0.9rem;
	}
	.steps {
		padding-left: 18px;
		color: var(--ink-muted);
		font-size: 0.92rem;
	}
	.steps li {
		margin-bottom: 7px;
	}
	@media (max-width: 880px) {
		.contact-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
