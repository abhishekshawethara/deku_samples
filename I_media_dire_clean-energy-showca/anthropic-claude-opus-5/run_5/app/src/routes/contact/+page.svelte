
<script>
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';
	import { apiData } from '$lib/api';

	let offices = $state([]);
	let loading = $state(true);

	$effect(() => {
		apiData('/offices', { auth: false })
			.then((d) => (offices = d || []))
			.catch(() => (offices = []))
			.finally(() => (loading = false));
	});
</script>

<svelte:head><title>Contact, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Contact</p>
		<h1>Get in Touch</h1>
		<p class="lede">
			This form is for careers, investor and supplier enquiries, and for any site that wants to talk
			about heat, power, hydrogen or water. Send it and you get a reference in place, with an
			acknowledgement carrying that reference by email.
		</p>
	</div>
</div>

<div class="wrap section-tight contact">
	<div class="card form-card">
		<h2>Send an enquiry</h2>
		<EnquiryForm />
	</div>

	<aside>
		<h2>Where we are</h2>
		{#if loading}
			<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading offices</div>
		{:else if offices.length === 0}
			<div class="empty">
				<h3>No office is listed right now</h3>
				<p>Use the form and we will route your enquiry to the right team.</p>
			</div>
		{:else}
			<ul class="offices">
				{#each offices as o (o.city)}
					<li>
						<strong>{o.city}</strong>
						<span class="muted">{o.country}</span>
						<span class="pill">{o.role_label}</span>
					</li>
				{/each}
			</ul>
		{/if}

		<hr class="rule" />
		<h3>Before you write</h3>
		<p class="muted">
			Common questions are answered at <a href="/faq">the FAQ</a>. If you want to know how many
			modules a site needs, <a href="/calculator">the calculator</a> answers that directly.
			Investors should request the document room from <a href="/investors">the investors route</a>.
		</p>
	</aside>
</div>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 40px 0 32px;
	}
	.contact {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.65fr);
		gap: 30px;
		align-items: start;
		padding-bottom: 60px;
	}
	.form-card h2 {
		margin-top: 0;
		font-size: 1.25rem;
	}
	aside h2 {
		font-size: 1.15rem;
	}
	aside h3 {
		font-size: 1rem;
	}
	.offices {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.offices li {
		display: flex;
		align-items: center;
		gap: 9px;
		flex-wrap: wrap;
		padding: 11px 0;
		border-top: var(--hair) solid var(--rule);
		font-size: 0.92rem;
	}
	@media (max-width: 900px) {
		.contact {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
