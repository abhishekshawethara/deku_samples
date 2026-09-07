<script>
	import EnquiryForm from '$lib/EnquiryForm.svelte';
	import Plate from '$lib/Plate.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Contact · Zettajoule</title>
	<meta name="description" content="Careers, investor and supplier enquiries. Every one gets a reference." />
</svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Contact</p>
		<h1>Get in Touch</h1>
		<p class="lede">
			This form is for careers, investor and supplier enquiries, and for anything about the
			technology or a site you are sizing. Every enquiry comes back with a reference, and an
			acknowledgement carrying it reaches your inbox.
		</p>
	</div>
</section>

<section class="wrap contact">
	<div class="contact__form card card--pad">
		<h2>Send an enquiry</h2>
		<EnquiryForm topic="Technology" />
	</div>

	<aside class="contact__aside">
		<h2>Where we are</h2>
		<ul class="offices">
			{#each data.offices as o}
				<li class="office">
					<Plate seed={o.city} ratio="16 / 7" />
					<h3>{o.city}</h3>
					<p class="muted">{o.country} · {o.role_label}</p>
				</li>
			{/each}
		</ul>
		<div class="card">
			<h3>Looking for something else?</h3>
			<p class="muted">
				The <a href="/faq">common questions</a> cover the technology and how a deployment works, and
				the <a href="/calculator">calculator</a> will size a site before you write to us.
			</p>
		</div>
	</aside>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.contact {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		padding-bottom: 4rem;
		align-items: start;
	}
	.offices {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		gap: 1rem;
	}
	.office h3 {
		margin: 0.6rem 0 0.15rem;
		font-size: 1.05rem;
	}
	.office p {
		margin: 0;
		font-size: 0.88rem;
	}
	@media (max-width: 860px) {
		.contact {
			grid-template-columns: 1fr;
		}
	}
</style>
