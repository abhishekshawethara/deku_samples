
<script>
	import { page } from '$app/state';
	import { apiData } from '$lib/api';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';

	let slug = $derived(page.params.slug);
	let solution = $state(null);
	let loading = $state(true);
	let error = $state('');
	let enquiryOpen = $state(false);

	const OUT = {
		heat: 'Heat',
		'heat-and-power': 'Heat and power',
		hydrogen: 'Hydrogen',
		electricity: 'Electricity'
	};

	$effect(() => {
		const s = slug;
		loading = true;
		error = '';
		solution = null;
		apiData(`/solutions/${encodeURIComponent(s)}`, { auth: false })
			.then((d) => {
				solution = d;
			})
			.catch((err) => {
				error = err.status === 404 ? 'notfound' : err.message || 'That solution could not load.';
			})
			.finally(() => {
				loading = false;
			});
	});

	const blocks = [
		{ n: 'Core', d: 'Helium leaves the fuel column at 750 degrees Celsius.' },
		{ n: 'Hot header', d: 'The hot leg carries the gas to the exchange.' },
		{ n: 'Exchange', d: 'Heat crosses into the process, the steam raiser or the turbine set.' },
		{ n: 'Delivery', d: 'The site takes its energy at the header it already owns.' },
		{ n: 'Return leg', d: 'Cooled helium returns to the core and the loop closes.' }
	];
</script>

<svelte:head>
	<title>{solution ? `${solution.title}, solutions` : 'Solution'}, Zettajoule</title>
</svelte:head>

{#if loading}
	<div class="wrap section">
		<div class="loading"><span class="spinner" aria-hidden="true"></span> Loading this solution</div>
	</div>
{:else if error === 'notfound'}
	<div class="wrap section">
		<div class="card">
			<h1>We cannot find that page</h1>
			<p class="lede">There is no solution with the slug <span class="mono">{slug}</span>.</p>
			<a class="btn" href="/solutions">Back to the explorer</a>
		</div>
	</div>
{:else if error}
	<div class="wrap section">
		<div class="banner banner-fail" role="alert">
			<strong>This solution could not load.</strong>
			{error} Reload the page, or go back to <a href="/solutions">the explorer</a>.
		</div>
	</div>
{:else if solution}
	<article>
		<header class="head">
			<div class="wrap">
				<p class="eyebrow"><a href="/solutions">Solutions</a> / {solution.industry}</p>
				<h1>{solution.title}</h1>
				<p class="lede">{solution.summary}</p>
				<ul class="tags" aria-label="Attributes">
					<li class="pill">{OUT[solution.output_kind] ?? solution.output_kind}</li>
					<li class="pill">{solution.temperature_band}</li>
					<li class="pill">
						{solution.deployment === 'single-module' ? 'Single module' : 'Multi module'}
					</li>
					<li class="pill">{solution.module_count} modules</li>
				</ul>
				<div class="actions">
					<SaveButton slug={solution.slug} title={solution.title} />
					<button class="btn btn-sm" type="button" onclick={() => (enquiryOpen = true)}>
						Enquire about {solution.industry}
					</button>
					<a class="btn btn-sm btn-secondary" href="/contact">Contact</a>
				</div>
			</div>
		</header>

		<div class="wrap section">
			<div class="grid g2 body">
				<div>
					<h2>What the reactor does here</h2>
					<p>{solution.detail}</p>
				</div>
				<div>
					<h2>Block by block</h2>
					<ol class="blocks">
						{#each blocks as b, i}
							<li>
								<svg viewBox="0 0 60 40" width="56" height="38" aria-hidden="true" focusable="false">
									<g fill="none" stroke="var(--ink)" stroke-width="1.3">
										<rect x="6" y="10" width="22" height="20" rx="3" />
										<path d="M28 20 H44" />
										<path d="M40 16 L44 20 L40 24" />
										<circle cx="51" cy="20" r="6" />
									</g>
								</svg>
								<div>
									<strong>{i + 1}. {b.n}</strong>
									<p class="muted">{b.d}</p>
								</div>
							</li>
						{/each}
					</ol>
				</div>
			</div>

			<hr class="rule" />
			<p class="muted">
				Work out how many modules your site needs at
				<a href="/calculator">the calculator</a>, or put this beside up to three others at
				<a href="/compare?slugs={solution.slug}">compare</a>.
			</p>
		</div>
	</article>

	<Modal open={enquiryOpen} title="Enquire about {solution.industry}" onclose={() => (enquiryOpen = false)}>
		<EnquiryForm
			compact
			presetTopic="Solutions"
			presetMessage={`We are looking at the ${solution.industry} solution and would like to discuss our site.`}
		/>
	</Modal>
{/if}

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 40px 0 32px;
	}
	.eyebrow a {
		color: inherit;
	}
	.tags {
		list-style: none;
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
		padding: 0;
		margin: 16px 0;
	}
	.actions {
		display: flex;
		gap: 9px;
		flex-wrap: wrap;
		align-items: center;
	}
	.body {
		gap: 44px;
		align-items: start;
	}
	.blocks {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.blocks li {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding: 13px 0;
		border-top: var(--hair) solid var(--rule);
	}
	.blocks p {
		margin: 2px 0 0;
		font-size: 0.9rem;
	}
	.blocks svg {
		flex: none;
		margin-top: 2px;
	}
</style>
