<script>
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';
</script>

<svelte:head><title>Contact, Zettajoule</title></svelte:head>

<section class="section">
	<div class="wrap contact-grid">
		<div>
			<p class="eyebrow">Contact</p>
			<h1>Get in Touch</h1>
			<p class="lede">
				This form reaches the people who can answer: careers questions go to the Operations Academy, investor
				questions to the investor relations desk, supplier questions to procurement, and everything about the
				technology or the eight solutions to the engineers who built it.
			</p>
			<p class="lede">
				You will get a reference straight away, and an acknowledgement carrying it by email. Quote the reference
				in any reply and we will pick the thread back up.
			</p>
			<ul class="offices dense">
				<li><strong>Rotterdam</strong> Netherlands, headquarters</li>
				<li><strong>Chicago</strong> United States, licensing</li>
				<li><strong>Tokyo</strong> Japan, engineering</li>
			</ul>
		</div>
		<div class="card">
			<EnquiryForm defaultTopic="Technology" />
		</div>
	</div>
</section>

<style>
	.contact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 40px;
		align-items: start;
	}
	.offices {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		border-top: 1px solid var(--rule);
	}
	.offices li {
		padding: 10px 0;
		border-bottom: 1px solid var(--rule);
		color: var(--ink-muted);
	}
	.offices strong {
		color: var(--ink);
		margin-right: 8px;
	}
</style>
