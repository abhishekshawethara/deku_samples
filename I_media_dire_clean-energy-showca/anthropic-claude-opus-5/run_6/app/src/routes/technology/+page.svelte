<script>
	import Reactor from '$lib/art/Reactor.svelte';
	import { reveal } from '$lib/scroll.js';
	import { KEY_FACTS } from '$lib/nav.js';

	let activePart = null;
	let turn = 0;

	const PARTS = ['control-rods', 'dome', 'vessel', 'core', 'base', 'coolant-loop'];
	const PART_LABEL = {
		'control-rods': 'Control rods',
		dome: 'Pressure dome',
		vessel: 'Reactor vessel',
		core: 'Fuel core',
		base: 'Base and skirt',
		'coolant-loop': 'Helium loop'
	};
</script>

<svelte:head><title>Technology | Zettajoule</title></svelte:head>

<section class="head-band">
	<div class="wrap">
		<p class="eyebrow">Technology</p>
		<h1>A high-temperature gas-cooled reactor, modernized.</h1>
		<ul class="facts">
			{#each KEY_FACTS as f}<li>{f}</li>{/each}
		</ul>
	</div>
</section>

<section class="section-tight diagram-band">
	<div class="wrap two">
		<div class="stage" style="--turn:{turn}deg">
			<Reactor still={true} interactive={true} bind:activePart labelled={true} width="min(330px, 76vw)" />
		</div>
		<div class="controls">
			<h2>Pick it apart</h2>
			<p class="muted">
				Choose a part to read what it does. The diagram is drawn line by line, so it stays sharp at
				any size.
			</p>
			<ul class="part-list">
				{#each PARTS as p}
					<li>
						<button
							class="btn btn-sm"
							class:on={activePart === p}
							type="button"
							aria-pressed={activePart === p}
							on:click={() => (activePart = activePart === p ? null : p)}
						>
							{PART_LABEL[p]}
						</button>
					</li>
				{/each}
			</ul>
			<div class="field turn-field">
				<label for="turn">Turn the diagram</label>
				<input id="turn" type="range" min="-24" max="24" step="1" bind:value={turn} />
				<p class="hint">Drag to turn. Every fact here is also written out below.</p>
			</div>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap-narrow">
		<div use:reveal>
			<h2>The fuel</h2>
			<p>
				The fuel is not a rod of metal. It is uranium in tiny grains, each one wrapped in layers of
				tough ceramic shell. Every grain is its own containment vessel, and the shells hold their
				integrity far above any temperature the plant reaches in normal running. Hundreds of
				thousands of them are set into graphite.
			</p>
			<p>
				This is why the safety argument is different in kind. It does not rest on a pump starting,
				it rests on the physics of a material that does not let go of what is inside it.
			</p>
		</div>

		<div use:reveal>
			<h2>The graphite</h2>
			<p>
				Graphite surrounds the fuel and does two jobs. It moderates the neutrons so the reaction
				sustains itself, and it carries an enormous amount of heat for its mass. If cooling stopped
				entirely the core would warm up slowly over hours rather than spike in minutes, and the
				geometry is such that it sheds heat to the ground around it without anything being switched
				on.
			</p>
		</div>

		<div use:reveal>
			<h2>The helium</h2>
			<p>
				Helium is the coolant, and its virtue is that it does nothing. It does not react with the
				graphite, with the fuel shells, or with the metal of the circuit. It does not become
				corrosive, it does not decompose and it does not change phase, which is what lets the outlet
				sit at 750 degrees Celsius instead of the 300 or so a water circuit imposes.
			</p>
			<p>
				That temperature difference is the whole commercial argument. It is the gap between making
				electricity and being able to run a reformer, a cracker, a reduction shaft or a
				high-temperature electrolyser.
			</p>
		</div>

		<div use:reveal>
			<h2>The digital twin</h2>
			<p>
				A living digital copy of each module runs alongside the real one, fed from plant
				instrumentation. Because the model expects a value and the plant reports one, a divergence
				shows up as a question long before it shows up as a fault. It is used to schedule
				maintenance against condition rather than against the calendar, which is where a large part
				of the operating cost of a nuclear plant is usually lost.
			</p>
		</div>

		<div use:reveal>
			<h2>The safety case</h2>
			<p>
				The design is a modernized version of a test reactor that has been operating since the late
				1990s. That is the single most important sentence on this page. The regulator is not being
				asked to accept a projection about a machine nobody has built; it is being asked to accept
				operating data from a machine that has run, been inspected, been restarted and been run
				again, for decades.
			</p>
		</div>

		<div use:reveal>
			<h2>Built in modules</h2>
			<p>
				Modules are manufactured in a factory and shipped as sections, so the build is a production
				run rather than a bespoke construction project. Site works and manufacturing happen at the
				same time instead of one after the other. A customer starts with the modules they need and
				adds more as their load grows, which means the power plan follows the business plan.
			</p>
			<a class="btn btn-primary" href="/solutions">See what it powers</a>
			<a class="btn" href="/calculator">Size a site</a>
		</div>
	</div>
</section>

<style>
	.head-band {
		background: var(--paper-2);
		border-bottom: 1px solid var(--rule);
		padding-block: clamp(36px, 6vw, 68px);
	}
	.facts {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		padding: 0;
		margin: 18px 0 0;
	}
	.facts li {
		border: 1px solid var(--rule-strong);
		background: var(--paper);
		border-radius: var(--r-md);
		padding: 8px 13px;
		font-weight: 600;
		font-size: 0.88rem;
	}
	.diagram-band {
		background: var(--paper);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(22px, 4vw, 52px);
		align-items: center;
	}
	.stage {
		transform: perspective(900px) rotateY(var(--turn));
	}
	.part-list {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 0;
		margin: 0 0 20px;
	}
	.on {
		border-color: var(--accent);
		background: var(--accent-tint);
		color: var(--accent-hover);
	}
	.turn-field input {
		width: 100%;
	}
	:global([data-revealed]) {
		transform: translateY(calc((1 - var(--rp, 1)) * 18px));
		opacity: calc(0.35 + var(--rp, 1) * 0.65);
	}
	@media (max-width: 860px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global([data-revealed]) {
			transform: none !important;
			opacity: 1 !important;
		}
	}
</style>
