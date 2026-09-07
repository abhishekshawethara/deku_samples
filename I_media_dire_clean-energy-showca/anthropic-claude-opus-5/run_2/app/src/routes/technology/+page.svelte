<script>
	// The reactor diagram can be turned and tapped to learn each part.
	import Reactor from '$lib/components/Reactor.svelte';
	import { reveal } from '$lib/scroll.js';

	const PARTS = [
		{
			id: 'dome',
			name: 'Pressure vessel head',
			text: 'The rounded lid. It seals the primary circuit and lifts off for refuelling and inspection.'
		},
		{
			id: 'rods',
			name: 'Control rods',
			text: 'Tall absorber rods that drop into the core under gravity. Losing power drops them in rather than holding them out.'
		},
		{
			id: 'core',
			name: 'Fuel core',
			text: 'Tiny uranium grains, each wrapped in tough ceramic shells, packed into a graphite matrix. The shells hold the fission products in well above any temperature the reactor can reach.'
		},
		{
			id: 'reflector',
			name: 'Graphite reflector',
			text: 'Graphite surrounds the core, slows the neutrons and reflects them back in. It also stores an enormous amount of heat, which is what makes the plant slow and forgiving.'
		},
		{
			id: 'helium-loop',
			name: 'Helium circuit',
			text: 'Helium carries the heat out at 750 degrees Celsius. It is chemically inert, stays a gas at every temperature the plant reaches and does not attack anything it touches.'
		},
		{
			id: 'vessel',
			name: 'Reactor vessel',
			text: 'The steel pressure boundary, sized so the whole module can be built in a factory and delivered in sections.'
		},
		{
			id: 'base',
			name: 'Module base',
			text: 'The structural base and the seismic isolation the module lands on. Site work is preparation and connection rather than construction.'
		}
	];

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	let selected = PARTS[2];
	let turn = 0; // the diagram can be turned

	function turnBy(deg) {
		turn = (turn + deg + 360) % 360;
	}
</script>

<svelte:head><title>Technology, Zettajoule</title></svelte:head>

<section class="section-tight lead">
	<div class="wrap">
		<p class="eyebrow">Technology</p>
		<h1>A reactor that already exists, made manufacturable.</h1>
		<ul class="facts">
			{#each FACTS as f}<li>{f}</li>{/each}
		</ul>
	</div>
</section>

<section class="section">
	<div class="wrap diagram-grid">
		<div class="diagram-stage" style={`--turn:${turn}deg`}>
			<div class="turned"><Reactor progress={0.9} mode="diagram" height={420} /></div>
			<div class="turn-controls row">
				<button type="button" class="btn btn-quiet btn-sm" on:click={() => turnBy(-45)}>
					Turn left<span class="visually-hidden">, rotate the diagram 45 degrees anticlockwise</span>
				</button>
				<span class="mono dense">{turn} degrees</span>
				<button type="button" class="btn btn-quiet btn-sm" on:click={() => turnBy(45)}>
					Turn right<span class="visually-hidden">, rotate the diagram 45 degrees clockwise</span>
				</button>
			</div>
		</div>
		<div>
			<h2>Pick it apart</h2>
			<p class="lede">Choose a part and read what it does. Every stage is written out, nothing is only reachable by aiming at a moving picture.</p>
			<ul class="parts">
				{#each PARTS as p}
					<li>
						<button
							type="button"
							class="part-btn"
							aria-pressed={selected.id === p.id}
							on:click={() => (selected = p)}
						>
							{p.name}
						</button>
					</li>
				{/each}
			</ul>
			<div class="part-detail card" role="status">
				<h3>{selected.name}</h3>
				<p>{selected.text}</p>
			</div>
		</div>
	</div>
</section>

<section class="section band">
	<div class="wrap narrative">
		<div use:reveal>
			<h2>The fuel contains itself</h2>
			<p class="lede">
				The fuel is not a rod. It is hundreds of thousands of uranium grains, each one smaller than a poppy
				seed, wrapped in successive shells of carbon and silicon carbide. Those shells are the containment. They
				hold the fission products inside well past any temperature this reactor can reach, including with every
				pump stopped and every operator gone home. Safety here is a property of the fuel rather than of a system
				that has to work.
			</p>
		</div>
		<div use:reveal>
			<h2>Graphite and helium</h2>
			<p class="lede">
				Graphite surrounds the fuel, moderates the neutrons and stores heat, which makes the plant slow to
				change and hard to surprise. Helium carries that heat away. It stays a gas at every temperature the
				plant reaches, is chemically calm around everything it touches, and does not become strongly
				radioactive, so the working fluid never becomes a problem of its own.
			</p>
		</div>
		<div use:reveal>
			<h2>A living digital copy</h2>
			<p class="lede">
				Every module runs alongside a digital twin fed by its own instrumentation. The twin spots drift before
				it becomes a fault, schedules maintenance against the real condition of the plant rather than a
				calendar, and pushes what it learns back into the next modules off the line. Fleets get cheaper because
				the twin makes each one better informed than the last.
			</p>
		</div>
		<div use:reveal>
			<h2>The safety case rests on a real reactor</h2>
			<p class="lede">
				This is a modernized version of a high-temperature gas-cooled reactor that has been operating as a test
				reactor since the late 1990s. The physics, the fuel and the coolant chemistry have decades of operating
				record behind them. Our licensing file points at that record rather than at a simulation, which is a far
				shorter argument to make.
			</p>
		</div>
		<div use:reveal>
			<h2>Modules, not projects</h2>
			<p class="lede">
				Modules are built in series in a factory and delivered in transportable sections. One module suits a
				mine, a town or a compute campus; three to eight suit a chemical complex, a hydrogen corridor or a
				steelworks. Adding capacity is an order rather than a construction programme, and modules are staggered
				so heat never stops during maintenance.
			</p>
		</div>
	</div>
</section>

<style>
	.lead {
		border-bottom: 1px solid var(--rule);
		background: linear-gradient(180deg, #eef4fd 0%, #ffffff 100%);
	}
	.facts {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0 32px;
		margin: 18px 0 0;
		padding: 0;
	}
	.facts li {
		font-family: var(--font-heading);
		font-weight: 800;
		padding: 10px 0;
		border-top: 2px solid var(--ink);
		min-width: 220px;
		flex: 1;
	}
	.diagram-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
		align-items: start;
	}
	.diagram-stage {
		background: linear-gradient(160deg, #eef4fd 0%, #ffffff 70%);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 18px;
		touch-action: pan-y pinch-zoom;
	}
	.turned {
		transform: rotate(var(--turn));
	}
	.turn-controls {
		justify-content: center;
		border-top: 1px solid var(--rule);
		padding-top: 12px;
		margin-top: 8px;
	}
	.parts {
		list-style: none;
		margin: 16px 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.part-btn {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 0.86rem;
		min-height: 40px;
		padding: 8px 14px;
		border-radius: 999px;
		border: 1px solid var(--rule-strong);
		background: #fff;
		color: var(--ink);
		cursor: pointer;
	}
	.part-btn:hover {
		background: var(--sky);
		border-color: var(--accent-hover);
		color: var(--accent-hover);
	}
	.part-btn[aria-pressed='true'] {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.part-detail h3 {
		margin-bottom: 6px;
	}
	.part-detail p {
		margin: 0;
		color: var(--ink-muted);
	}
	.band {
		background: var(--ground-soft);
	}
	.narrative {
		display: grid;
		gap: 44px;
		max-width: 800px;
	}
	[data-revealed='false'] {
		opacity: 0;
		transform: translateY(18px);
	}
</style>
