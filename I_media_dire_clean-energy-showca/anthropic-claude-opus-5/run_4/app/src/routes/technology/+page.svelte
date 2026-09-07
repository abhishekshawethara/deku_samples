<script>
	/* Reuses the reactor from the home route, here as a diagram the visitor can
	   pick apart: each part is selectable by pointer, tap or keyboard. */
	import { onMount } from 'svelte';
	import Reactor from '$lib/components/Reactor.svelte';
	import Plate from '$lib/components/Plate.svelte';

	const PARTS = [
		{
			id: 'rods',
			name: 'Control rods',
			body: 'The tall rods drop into channels in the graphite to hold the chain reaction where the operators want it, and fall in under gravity if power is lost.'
		},
		{
			id: 'dome',
			name: 'Pressure dome',
			body: 'The rounded lid seals the primary circuit and carries the penetrations for the rods and the instrumentation.'
		},
		{
			id: 'core',
			name: 'Fuel core',
			body: 'A column of graphite blocks holding the fuel: tiny uranium grains wrapped in tough ceramic shells that keep their fission products inside the particle.'
		},
		{
			id: 'vessel',
			name: 'Pressure vessel',
			body: 'The steel body that holds the helium at pressure and provides the surface the decay heat can leave through without any pump running.'
		},
		{
			id: 'circuit',
			name: 'Helium circuit',
			body: 'Helium enters cool, leaves the core at 750 degrees Celsius and crosses a heat exchanger into the customer process. It is chemically inert and does not attack what it touches.'
		},
		{
			id: 'base',
			name: 'Base and plinth',
			body: 'The module sits on a factory-made base, which is what lets the site work be preparation and connection rather than the construction of a reactor.'
		}
	];

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	let selected = PARTS[2];
	let spread = 0.55;
	let reduced = false;

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});
</script>

<svelte:head>
	<title>Technology, Zettajoule</title>
	<meta name="description" content="A high-temperature gas-cooled reactor: TRISO fuel, graphite moderator, helium coolant, 750 degrees Celsius at the outlet." />
</svelte:head>

<section class="section section--tight wrap">
	<p class="eyebrow">Technology</p>
	<h1>How the module works</h1>
	<p class="lede">
		A modernized high-temperature gas-cooled reactor. Helium cooled, graphite moderated, fuelled with ceramic
		particles that hold together far past anything the machine will ever see.
	</p>
	<ul class="facts">
		{#each FACTS as fact}
			<li>{fact}</li>
		{/each}
	</ul>
</section>

<section class="wrap section--tight" aria-labelledby="diagram-heading">
	<h2 id="diagram-heading">Pick it apart</h2>
	<div class="diagram">
		<div class="diagram__art">
			<Reactor progress={reduced ? 0 : spread} {reduced} width={320} />
			<div class="diagram__control">
				<label for="spread">Open the module</label>
				<input id="spread" type="range" min="0" max="1" step="0.01" bind:value={spread} disabled={reduced} />
				<p class="field__hint">
					{#if reduced}
						Reduced motion is on, so the diagram holds one still frame. Every part is described below.
					{:else}
						Drag to take the module apart and put it back together.
					{/if}
				</p>
			</div>
		</div>

		<div class="diagram__parts">
			<ul class="partlist" role="list">
				{#each PARTS as part}
					<li>
						<button
							type="button"
							class="partbtn"
							class:partbtn--on={selected.id === part.id}
							aria-pressed={selected.id === part.id}
							on:click={() => (selected = part)}
						>
							{part.name}
						</button>
					</li>
				{/each}
			</ul>
			<div class="partdetail" role="status" aria-live="polite">
				<h3>{selected.name}</h3>
				<p>{selected.body}</p>
			</div>
		</div>
	</div>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div>
			<h2>The fuel</h2>
			<p>
				The fuel is not a rod. It is uranium in grains a fraction of a millimetre across, each one wrapped in
				layers of carbon and silicon carbide. Every grain is its own pressure vessel and its own containment,
				and the shells hold together at temperatures well beyond anything the reactor reaches in normal
				operation or in an accident.
			</p>
			<p>
				That is the safety case in one sentence: the fission products stay inside the particle rather than
				relying on an outer barrier to catch them.
			</p>
		</div>
		<div>
			<h2>Graphite and helium</h2>
			<p>
				Graphite blocks around the fuel slow the neutrons and give the core an enormous thermal mass, so its
				temperature moves slowly and predictably rather than sharply.
			</p>
			<p>
				Helium carries the heat out. It is chemically inert, so it does not corrode the circuit, does not
				react with the graphite, and does not become a chemistry problem at 750 degrees Celsius the way water
				or sodium would.
			</p>
		</div>
	</div>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<Plate seed="digital-twin" label="Generated plate: the digital twin" ratio="4 / 3" />
		<div>
			<h2>A living digital copy</h2>
			<p>
				Every module has a digital twin that runs alongside it, fed with the real instrumentation. Because the
				model and the metal are compared continuously, a drift in a bearing or a heat exchanger shows up as a
				disagreement long before it shows up as a fault.
			</p>
			<p>
				That is how a small operator runs a fleet economically: maintenance goes where the data points rather
				than where the calendar says, and the crew that trains on the twin is the crew that runs the machine.
			</p>
		</div>
	</div>
</section>

<section class="section wrap">
	<div class="grid grid--2">
		<div>
			<h2>The safety case rests on a real machine</h2>
			<p>
				This design modernizes a test reactor that has been operating since the late 1990s. That is decades of
				real behaviour at temperature: real graphite, real helium, real fuel, real transients.
			</p>
			<p>
				A regulator reviewing a modernization is answering a smaller question than one reviewing a concept,
				and an investor backing one is buying a different risk. It is the single most important fact about
				this company.
			</p>
		</div>
		<div>
			<h2>Built in modules</h2>
			<p>
				Modules are made in a factory and shipped, so the work on your site is preparation and connection
				rather than the construction of a reactor. The schedule is set by the factory and the licence, not by
				pouring concrete on a bespoke design.
			</p>
			<p>
				Need more energy later? Add a module. Capacity grows in steps of 250 MW thermal without a second
				project, which is what makes the deployment story scale.
			</p>
			<a class="btn btn--ghost" href="/edge">Why this beats the alternatives</a>
		</div>
	</div>
</section>

<style>
	.facts {
		list-style: none;
		margin: 1.5rem 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.facts li {
		border: 1px solid var(--accent);
		background: var(--accent-tint);
		color: var(--accent-hover);
		border-radius: 999px;
		padding: 0.35rem 0.85rem;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.diagram {
		display: grid;
		grid-template-columns: minmax(280px, 420px) 1fr;
		gap: 1.5rem;
		align-items: start;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1.25rem;
	}
	.diagram__art {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.diagram__control {
		width: 100%;
	}
	.diagram__control input[type='range'] {
		width: 100%;
		min-height: 44px;
	}
	.partlist {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.partbtn {
		min-height: 40px;
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		background: var(--paper);
		color: var(--ink);
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
	}
	.partbtn:hover {
		background: var(--paper-grey);
		border-color: var(--ink-muted);
	}
	.partbtn--on {
		background: var(--accent-tint);
		border-color: var(--accent);
		color: var(--accent-hover);
	}
	.partdetail {
		border-top: 1px solid var(--rule);
		padding-top: 1rem;
	}
	.partdetail h3 {
		margin-bottom: 0.35rem;
	}
	.partdetail p {
		margin: 0;
		color: var(--ink-muted);
	}
	@media (max-width: 860px) {
		.diagram {
			grid-template-columns: 1fr;
		}
	}
</style>
