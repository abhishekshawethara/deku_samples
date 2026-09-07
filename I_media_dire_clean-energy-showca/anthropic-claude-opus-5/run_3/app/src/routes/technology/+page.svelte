<script>
	// The technology route reuses the reactor from the home route, this time as
	// a diagram the visitor can pick apart, turn and tap.
	import Reactor from '$lib/Reactor.svelte';
	import Reveal from '$lib/Reveal.svelte';
	import { reducedMotion } from '$lib/scroll.js';

	let activePart = $state(null);
	let spin = $state(0);
	let explode = $state(0.55);

	const PARTS = {
		rods: {
			name: 'Control rods',
			text: 'Six control rods sit in channels through the graphite and are the primary means of holding the reaction where the operator wants it. In the sequence they lift clear first.'
		},
		dome: {
			name: 'Pressure dome',
			text: 'The rounded lid seals the vessel and carries the rod drives through it. It comes off second, which is what exposes the core.'
		},
		core: {
			name: 'Fuel core',
			text: 'A stack of graphite blocks holding TRISO fuel. This is where the heat is made, and where the safety case says it stays.'
		},
		vessel: {
			name: 'Pressure vessel',
			text: 'The steel vessel holds the helium at pressure. It is sized to be built in a factory and shipped whole rather than welded on site.'
		},
		loop: {
			name: 'Helium loop',
			text: 'Helium enters cool, passes through the core and leaves at 750 degrees Celsius, carrying the heat to the customer through a heat exchanger.'
		},
		base: {
			name: 'Base and support',
			text: 'The module sits on a supported base below grade. Modularity is the deployment argument: capacity arrives in module-sized steps.'
		}
	};

	const KEY_FACTS = [
		['Reactor type', 'High-temperature gas-cooled reactor'],
		['Thermal output', '250 MW thermal a module'],
		['Outlet temperature', '750 degrees Celsius at the outlet']
	];
</script>

<svelte:head><title>Technology · Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Technology</p>
		<Reveal as="h1" text="The machine, part by part" />
		<p class="lede">
			A high-temperature gas-cooled reactor, modernized from one that has been running since the
			late 1990s. Turn it, tap a part, and read what it does.
		</p>
	</div>
</section>

<section class="wrap facts-strip">
	<dl class="facts">
		{#each KEY_FACTS as [label, value]}
			<div class="fact">
				<dt>{label}</dt>
				<dd>{value}</dd>
			</div>
		{/each}
	</dl>
</section>

<section class="wrap diagram-sec">
	<div class="diagram">
		<Reactor
			progress={explode}
			still={$reducedMotion}
			height="min(60vh, 480px)"
			interactive
			bind:activePart
			{spin}
		/>
	</div>

	<div class="controls">
		<h2>Pick it apart</h2>

		<div class="field">
			<label for="explode">Take it apart</label>
			<input id="explode" type="range" min="0" max="1" step="0.01" bind:value={explode} />
			<p class="field__hint">Drag to move through the sequence, from whole to drawn.</p>
		</div>

		<div class="field">
			<label for="spin">Turn it</label>
			<input id="spin" type="range" min="-24" max="24" step="1" bind:value={spin} />
			<p class="field__hint">Turn the diagram to see it from another angle.</p>
		</div>

		<!-- every part is also a plain named control, so nothing is only
		     reachable by aiming at the drawing -->
		<h3>The parts</h3>
		<ul class="parts">
			{#each Object.entries(PARTS) as [id, part]}
				<li>
					<button
						class="btn btn--ghost btn--sm"
						type="button"
						aria-pressed={activePart === id}
						onclick={() => (activePart = activePart === id ? null : id)}
					>
						{part.name}
					</button>
				</li>
			{/each}
		</ul>

		<div class="readout" role="status" aria-live="polite">
			{#if activePart && PARTS[activePart]}
				<h3>{PARTS[activePart].name}</h3>
				<p>{PARTS[activePart].text}</p>
			{:else}
				<p class="muted">Choose a part, on the drawing or in the list, to read what it does.</p>
			{/if}
		</div>
	</div>
</section>

<section class="section wrap grid grid--2">
	<div>
		<h2>The fuel</h2>
		<p>
			Uranium arrives as grains a fraction of a millimetre across, each wrapped in layers of carbon
			and silicon carbide. Every one of those shells is a pressure vessel in its own right, and it
			holds its fission products in at temperatures far beyond anything the reactor would reach in
			service. The fuel is its own containment: that is the sentence the whole safety case rests on.
		</p>
		<h2>The graphite</h2>
		<p>
			The particles are held in a graphite structure that moderates the neutrons and, just as
			importantly, holds an enormous amount of heat. A core with that much thermal mass changes
			temperature slowly, which is what gives the machine hours rather than seconds to respond to
			anything going wrong.
		</p>
	</div>
	<div>
		<h2>The helium</h2>
		<p>
			Helium is the coolant because it does nothing. It is chemically inert, so it does not corrode
			the metals or attack the graphite it circulates around; it stays a gas at any temperature the
			reactor reaches, so there is no phase change and no water chemistry to manage; and it carries
			heat out at 750 degrees Celsius, which water at practical pressures simply cannot do.
		</p>
		<h2>The digital twin</h2>
		<p>
			Each module runs alongside a living model of itself, fed by its own instrumentation. The model
			is accurate enough to notice a developing problem before a human would, which turns
			maintenance from a calendar into a response and takes real cost out of operating a fleet.
		</p>
	</div>
</section>

<section class="section safety">
	<div class="wrap grid grid--2">
		<div>
			<p class="eyebrow">The safety case</p>
			<Reveal as="h2" text={'Built on a reactor\nthat already runs.'} />
			<p>
				The reference machine has been operating since the late 1990s. That matters more than any
				argument we could make on paper: a regulator assessing measured behaviour from an operating
				reactor is doing a different job from a regulator assessing a projection. The fuel has been
				tested past its service conditions, and decay heat leaves the core by conduction and
				radiation without a pump, an operator or external power.
			</p>
		</div>
		<div>
			<p class="eyebrow">Modular</p>
			<Reveal as="h2" text={'Quick to deploy,\neasy to scale.'} />
			<p>
				Modules are built in a factory and assembled on site, which is what makes the schedule
				predictable instead of heroic. A site takes what it needs today and adds modules as demand
				grows, without redesigning the installation. One module for a district network or a remote
				mine; eight for a steel works on the hydrogen route.
			</p>
			<a class="btn btn--ghost" href="/solutions">See which industries</a>
		</div>
	</div>
</section>

<style>
	.head {
		padding-top: calc(var(--bar-h) + 3rem);
		padding-bottom: 1rem;
		background: linear-gradient(180deg, var(--sky) 0%, var(--paper) 100%);
	}
	.facts-strip {
		padding-bottom: 1.5rem;
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
		margin: 0;
	}
	.fact {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 0.9rem;
	}
	.fact dt {
		font-size: 0.74rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-muted);
	}
	.fact dd {
		margin: 0.25rem 0 0;
		font-family: var(--font-head);
		font-size: 1.05rem;
	}
	.diagram-sec {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		padding-bottom: 3rem;
		align-items: start;
	}
	.diagram {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		background: linear-gradient(180deg, #fff, var(--paper-2));
		padding: 1rem;
	}
	.controls input[type='range'] {
		width: 100%;
		min-height: 44px;
	}
	.parts {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0 0 1rem;
		padding: 0;
	}
	.parts .btn[aria-pressed='true'] {
		background: var(--sky);
		border-color: var(--accent);
		color: var(--accent-hover);
	}
	.readout {
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 1rem;
		background: var(--paper-2);
		min-height: 120px;
	}
	.readout h3 {
		margin-top: 0;
	}
	.readout p {
		margin: 0;
		font-size: 0.92rem;
	}
	.safety {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
	}
	@media (max-width: 900px) {
		.diagram-sec {
			grid-template-columns: 1fr;
		}
	}
</style>
