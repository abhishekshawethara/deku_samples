<script>
	import { page } from '$app/stores';
	import { post, api, ApiError } from '$lib/api.js';
	import { TOPICS, PHONE_COUNTRIES } from '$lib/nav.js';
	import { onMount } from 'svelte';

	let name = '';
	let email = '';
	let phone_country = '+31';
	let phone = '';
	let topic = $page.url.searchParams.get('topic') || '';
	let message = '';

	let busy = false;
	let result = null;
	let banner = null;
	let offices = [];
	let touched = { name: false, email: false, topic: false, message: false };

	$: nameError = touched.name && !name.trim() ? 'Tell us who you are.' : '';
	$: emailError =
		touched.email && !email.trim()
			? 'We need an address to reply to.'
			: touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
				? 'That does not look like an email address.'
				: '';
	$: topicError = touched.topic && !TOPICS.includes(topic) ? 'Choose the topic that fits best.' : '';
	$: messageError = touched.message && message.trim().length < 5 ? 'Tell us a little more.' : '';
	$: valid =
		name.trim() &&
		/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
		TOPICS.includes(topic) &&
		message.trim().length >= 5;

	async function submit() {
		touched = { name: true, email: true, topic: true, message: true };
		banner = null;
		if (!valid) return;
		busy = true;
		try {
			result = await post('/enquiries', {
				name: name.trim(),
				email: email.trim(),
				phone_country,
				phone: phone.trim(),
				topic,
				message: message.trim()
			});
			name = '';
			email = '';
			phone = '';
			message = '';
			topic = '';
			touched = { name: false, email: false, topic: false, message: false };
		} catch (err) {
			banner = {
				kind: 'error',
				text: err instanceof ApiError ? err.message : 'Could not send that. Try again in a moment.'
			};
		} finally {
			busy = false;
		}
	}

	onMount(async () => {
		try {
			offices = await api('/offices', { anonymous: true });
		} catch {
			offices = [];
		}
	});
</script>

<svelte:head><title>Contact | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Contact</p>
		<h1>Get in Touch</h1>
		<p class="lede">
			This form reaches the team directly. It is the right place for careers questions, investor
			enquiries and supplier approaches, as well as anything about the technology or a site.
		</p>
	</div>
</section>

<section class="section-tight">
	<div class="wrap contact-grid">
		<div>
			{#if result}
				<div class="banner banner-success" role="status" data-testid="enquiry-success">
					<strong>Enquiry sent</strong>
					<p style="margin:0 0 6px">
						Thank you. We have your enquiry and an acknowledgement is on its way to your inbox.
					</p>
					<p style="margin:0">
						Your reference is
						<span class="mono ref" data-testid="enquiry-reference">{result.reference}</span>.
						Quote it in any reply. Status: {result.status}.
					</p>
				</div>
				<button class="btn" type="button" on:click={() => (result = null)}>Send another enquiry</button>
			{:else}
				{#if banner}
					<div class="banner banner-{banner.kind}" role="alert">
						<strong>Not sent</strong>{banner.text}
					</div>
				{/if}

				<form class="card form" on:submit|preventDefault={submit} novalidate>
					<div class="field">
						<label for="c-name">Your name</label>
						<input
							id="c-name"
							class="input"
							bind:value={name}
							on:blur={() => (touched.name = true)}
							autocomplete="name"
							aria-invalid={nameError ? 'true' : undefined}
							aria-describedby={nameError ? 'c-name-err' : undefined}
						/>
						{#if nameError}<p class="error-text" id="c-name-err">{nameError}</p>{/if}
					</div>

					<div class="field">
						<label for="c-email">Email</label>
						<input
							id="c-email"
							class="input"
							type="email"
							bind:value={email}
							on:blur={() => (touched.email = true)}
							autocomplete="email"
							aria-invalid={emailError ? 'true' : undefined}
							aria-describedby={emailError ? 'c-email-err' : undefined}
						/>
						{#if emailError}<p class="error-text" id="c-email-err">{emailError}</p>{/if}
					</div>

					<div class="phone-row">
						<div class="field">
							<label for="c-country">Country code</label>
							<select id="c-country" class="select" bind:value={phone_country}>
								{#each PHONE_COUNTRIES as c}<option value={c.code}>{c.label}</option>{/each}
							</select>
						</div>
						<div class="field">
							<label for="c-phone">Phone (optional)</label>
							<input id="c-phone" class="input" type="tel" bind:value={phone} autocomplete="tel" />
						</div>
					</div>

					<div class="field">
						<label for="c-topic">Topic</label>
						<select
							id="c-topic"
							class="select"
							bind:value={topic}
							on:blur={() => (touched.topic = true)}
							aria-invalid={topicError ? 'true' : undefined}
							aria-describedby={topicError ? 'c-topic-err' : undefined}
						>
							<option value="">Choose a topic</option>
							{#each TOPICS as t}<option value={t}>{t}</option>{/each}
						</select>
						{#if topicError}<p class="error-text" id="c-topic-err">{topicError}</p>{/if}
					</div>

					<div class="field">
						<label for="c-message">Message</label>
						<textarea
							id="c-message"
							class="textarea"
							bind:value={message}
							on:blur={() => (touched.message = true)}
							aria-invalid={messageError ? 'true' : undefined}
							aria-describedby={messageError ? 'c-msg-err' : undefined}
						></textarea>
						{#if messageError}<p class="error-text" id="c-msg-err">{messageError}</p>{/if}
					</div>

					<button class="btn btn-primary" type="submit" disabled={busy}>
						{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}Send enquiry
					</button>
				</form>
			{/if}
		</div>

		<aside class="side">
			<h2 class="side-h">Our offices</h2>
			{#if offices.length}
				<ul class="offices">
					{#each offices as o}
						<li>
							<span class="o-city">{o.city}</span>
							<span class="muted">{o.country} · {o.role_label}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">Office list unavailable right now.</p>
			{/if}
			<div class="card side-card">
				<h3>Looking for something specific?</h3>
				<ul class="links">
					<li><a href="/solutions">What we can power</a></li>
					<li><a href="/calculator">Size a site</a></li>
					<li><a href="/careers">Open roles</a></li>
					<li><a href="/investors">Investor material</a></li>
					<li><a href="/faq">Common questions</a></li>
				</ul>
			</div>
		</aside>
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.contact-grid {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: start;
	}
	.form {
		padding: clamp(18px, 3vw, 28px);
	}
	.phone-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.ref {
		font-weight: 700;
	}
	.side-h {
		font-size: 1.1rem;
	}
	.offices {
		list-style: none;
		padding: 0;
		margin: 0 0 22px;
	}
	.offices li {
		display: flex;
		flex-direction: column;
		padding: 10px 0;
		border-bottom: 1px solid var(--rule);
		font-size: 0.88rem;
	}
	.o-city {
		font-family: var(--font-head);
		font-size: 0.98rem;
	}
	.side-card h3 {
		font-size: 1rem;
	}
	.links {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 8px;
		font-size: 0.9rem;
	}
	@media (max-width: 860px) {
		.contact-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 460px) {
		.phone-row {
			grid-template-columns: 1fr;
		}
	}
</style>
