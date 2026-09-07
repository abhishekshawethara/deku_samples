
<script>
	import Reactor from '$lib/components/Reactor.svelte';
	import { scrollBound, prefersReducedMotion } from '$lib/scroll';
	import { browser } from '$app/environment';

	const facts = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	const parts = [
		{
			id: 'rods',
			name: 'Control rods',
			text: 'Absorbing rods drop into the graphite to shut the chain reaction down. They lift clear when the reactor is at power, which is the first move in the sequence on the home route.'
		},
		{
			id: 'dome',
			name: 'Dome and vessel',
			text: 'A steel pressure vessel closed by a rounded lid holds the helium at pressure. Everything inside is designed to be lifted out in one piece at refuelling.'
		},
		{
			id: 'core',
			name: 'Core',
			text: 'A column of graphite blocks carrying the fuel. Graphite gives the core an enormous heat capacity, so it warms slowly and sheds heat by conduction alone if the coolant flow stops.'
		},
		{
			id: 'fuel',
			name: 'Fuel',
			text: 'Tiny uranium grains, each wrapped in tough ceramic shells that hold the fission products inside at temperatures well beyond anything the reactor reaches, in normal operation or in an accident.'
		},
		{
			id: 'helium',
			name: 'Helium coolant',
			text: 'Helium is chemically inert. It does not react with the graphite, the fuel or the steel it touches, and it stays a gas at every temperature the plant sees. That inertness is what allows the 750 degree outlet.'
		},
		{
			id: 'loop',
			name: 'The loop',
			text: 'Hot helium leaves the core, gives its heat to a process exchanger or a steam generator, and returns cooled to the bottom of the core. The loop is closed and the working fluid never leaves it.'
		}
	];

	let p = $state(0);
	let still = $state(false);
	let selected = $state('core');
	let turn = $state(0);

	$effect(() => {
		if (browser) still = prefersReducedMotion();
	});

	let part = $derived(parts.find((x) => x.id === selected) ?? parts[0]);
</script>

<svelte:head><title>Technology, Zettajoule</title></svelte:head>

<div class="head">
	<div class="wrap">
		<p class="eyebrow">Technology</p>
		<h1>The machine, picked apart</h1>
		<ul class="facts">
			{#each facts as f}<li class="pill">{f}</li>{/each}
		</ul>
	</div>
</div>

<section class="section wrap">
	<div class="diagram-row">
		<div class="diagram-holder">
			<!-- the same reactor as the home route, here as a diagram to pick apart -->
			<div
				class="turner"
				style="transform: rotate({turn}deg)"
				use:scrollBound={{ onprogress: (v) => (p = 0.35 + v * 0.6) }}
			>
				<Reactor p={still ? 0 : p} {still} size={300} label="Zettajoule reactor diagram" />
			</div>
			<div class="turn-controls">
				<label for="turn-range">Turn the diagram</label>
				<input
					id="turn-range"
					type="range"
					min="-30"
					max="30"
					step="1"
					bind:value={turn}
					aria-describedby="turn-hint"
				/>
				<p class="muted hint" id="turn-hint">
					Drag to turn it, or tap a part below to read what it does.
				</p>
			</div>
		</div>

		<div class="parts">
			<h2>Tap a part</h2>
			<ul class="part-list">
				{#each parts as pt (pt.id)}
					<li>
						<button
							class="part-btn"
							type="button"
							aria-pressed={selected === pt.id}
							onclick={() => (selected = pt.id)}
						>
							{pt.name}
						</button>
					</li>
				{/each}
			</ul>
			<div class="part-read" aria-live="polite">
				<h3>{part.name}</h3>
				<p>{part.text}</p>
			</div>
		</div>
	</div>
</section>

<section class="section section-sunk">
	<div class="wrap">
		<div class="grid g3">
			<div class="card">
				<h2>The fuel</h2>
				<p class="muted">
					Uranium in grains a fraction of a millimetre across, each wrapped in layers of dense
					carbon and silicon carbide. The shells are the containment: they hold the fission
					products at temperatures far above anything the plant reaches, which is why a loss of
					cooling here does not become a release.
				</p>
			</div>
			<div class="card">
				<h2>The graphite</h2>
				<p class="muted">
					The fuel sits in graphite blocks that moderate the neutrons and store an enormous amount
					of heat. In an upset the core warms over hours rather than seconds and sheds its heat by
					conduction and radiation to the ground, with no pump running and no operator acting.
				</p>
			</div>
			<div class="card">
				<h2>The helium</h2>
				<p class="muted">
					Chemically calm around everything it touches: it does not corrode the steel, does not
					react with the graphite, does not burn, does not change phase. Without an inert coolant
					the 750 degree outlet is not available at all.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="section wrap">
	<div class="grid g2 pair">
		<div>
			<p class="eyebrow">The digital twin</p>
			<h2>A living copy of the reactor</h2>
			<p>
				Every module has a simulated counterpart fed by the real instrument stream. It predicts
				what the plant should be doing, and the difference between the prediction and the
				measurement is where problems show up first, usually weeks before they would otherwise.
			</p>
			<p class="muted">
				It also cuts cost: maintenance follows the condition of the machine rather than a calendar,
				and operators train on the twin at the Operations Academy before they ever take a shift.
			</p>
		</div>
		<div>
			<p class="eyebrow">The safety case</p>
			<h2>Built on a reactor that already runs</h2>
			<p>
				This is a modernized version of a test reactor that has operated since the late 1990s. The
				loss of forced circulation case, the one that matters most, has been demonstrated on real
				hardware rather than argued on paper.
			</p>
			<p class="muted">
				That is the difference between a regulator reviewing a concept and a regulator reviewing an
				update to something with an operating record.
			</p>
		</div>
	</div>
	<hr class="rule" />
	<div class="grid g2 pair">
		<div>
			<p class="eyebrow">Modules</p>
			<h2>Built in a factory, not on a site</h2>
			<p>
				A module is manufactured, shipped and connected. Site work is civil preparation rather than
				reactor construction, which is where conventional nuclear projects lose their years. Need
				more energy later and you add a module rather than redesign the plant.
			</p>
			<a class="btn btn-secondary" href="/calculator">Work out a module count</a>
		</div>
		<div>
			<p class="eyebrow">In plain text</p>
			<h2>The diagram, written out</h2>
			<ol class="written">
				{#each parts as pt}
					<li><strong>{pt.name}.</strong> {pt.text}</li>
				{/each}
			</ol>
		</div>
	</div>
</section>

<style>
	.head {
		background: var(--surface-sunk);
		border-bottom: var(--hair) solid var(--rule);
		padding: 44px 0 34px;
	}
	.facts {
		list-style: none;
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin: 16px 0 0;
		padding: 0;
	}
	.diagram-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 40px;
		align-items: start;
	}
	.diagram-holder {
		display: grid;
		justify-items: center;
		gap: 14px;
	}
	.turner {
		transform-origin: center;
	}
	.turn-controls {
		width: 100%;
		max-width: 320px;
	}
	.turn-controls input[type='range'] {
		width: 100%;
		min-height: 34px;
	}
	.hint {
		font-size: 0.82rem;
		margin: 4px 0 0;
	}
	.part-list {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin: 0 0 18px;
		padding: 0;
	}
	.part-btn {
		border: var(--hair) solid var(--rule);
		background: var(--surface);
		border-radius: 999px;
		padding: 8px 15px;
		font: inherit;
		font-size: 0.87rem;
		font-weight: 650;
		cursor: pointer;
		min-height: 40px;
	}
	.part-btn:hover {
		border-color: var(--accent);
		color: var(--accent-hover);
	}
	.part-btn[aria-pressed='true'] {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.part-read {
		border: var(--hair) solid var(--rule);
		border-radius: var(--radius-lg);
		padding: 18px;
		background: var(--surface-sunk);
		min-height: 150px;
	}
	.part-read h3 {
		margin-top: 0;
	}
	.part-read p {
		margin: 0;
		color: var(--ink-muted);
	}
	.pair {
		gap: 40px;
	}
	.written {
		padding-left: 20px;
		color: var(--ink-muted);
		font-size: 0.92rem;
	}
	.written li {
		margin-bottom: 9px;
	}
	.card h2 {
		font-size: 1.1rem;
	}
	@media (max-width: 900px) {
		.diagram-row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
