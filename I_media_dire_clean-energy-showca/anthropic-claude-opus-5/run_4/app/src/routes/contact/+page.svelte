<script>
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';
	export let data;
</script>

<svelte:head>
	<title>Contact, Zettajoule</title>
	<meta name="description" content="Send Zettajoule an enquiry about technology, solutions, investor relations, careers or supply." />
</svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Contact</p>
	<h1>Get in Touch</h1>
	<p class="lede">
		This form reaches the team directly. It is the right place for careers questions, investor relations,
		supplier approaches and anything technical about the modules. You get a reference back straight away and an
		acknowledgement in your inbox carrying it.
	</p>
</section>

<section class="wrap section--tight">
	<div class="contact">
		<div class="contact__form card">
			<h2>Send an enquiry</h2>
			<EnquiryForm />
		</div>

		<aside class="contact__aside">
			<h2>Where we are</h2>
			<ul class="offices">
				{#each data.offices as office}
					<li>
						<strong>{office.city}</strong>
						<span>{office.country}</span>
						<span class="chip">{office.role_label}</span>
					</li>
				{/each}
			</ul>
			<div class="banner banner--info">
				<span class="banner__title">What happens next</span>
				Your enquiry is stored with a reference of the form ENQ- plus eight characters, and starts at status
				received. Signed in, you can follow and close it from your <a href="/account">account</a>.
			</div>
		</aside>
	</div>
</section>

<style>
	.contact {
		display: grid;
		grid-template-columns: minmax(300px, 1.4fr) 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	.contact__form h2 {
		margin-bottom: 1rem;
	}
	.offices {
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
	}
	.offices li {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--rule);
	}
	.offices strong {
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.offices span {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}
	.offices .chip {
		align-self: flex-start;
	}
	@media (max-width: 860px) {
		.contact {
			grid-template-columns: 1fr;
		}
	}
</style>
