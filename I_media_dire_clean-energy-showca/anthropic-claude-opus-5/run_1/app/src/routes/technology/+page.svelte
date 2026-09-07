<script>
	import { onMount } from 'svelte';
	import Reactor from '$lib/components/Reactor.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { prefersReducedMotion } from '$lib/scroll.js';

	let { data } = $props();
	const c = $derived(data.copy);

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	const PARTS = [
		{
			id: 'rods',
			name: 'Control rods',
			text: 'Absorbers that drop into channels in the graphite to shut the chain reaction down. They lift clear when the module runs at power.'
		},
		{
			id: 'dome',
			name: 'The dome',
			text: 'The rounded upper closure of the pressure boundary. It lifts off for refuelling and inspection and is drawn separately in the sequence.'
		},
		{
			id: 'core',
			name: 'The core',
			text: 'A dark column of coated particle fuel inside a graphite block. Thousands of grain-sized particles, each its own pressure vessel.'
		},
		{
			id: 'vessel',
			name: 'The vessel',
			text: 'The steel pressure boundary holding the helium inventory. Factory built, road transportable, assembled on site.'
		},
		{
			id: 'helium-circuit',
			name: 'The helium circuit',
			text: 'Helium leaves the core at 750 degrees Celsius, gives its heat to the customer process through an exchanger, and is returned by the circulator.'
		},
		{
			id: 'base',
			name: 'The base',
			text: 'The supporting structure and the interface to the site: the anchor, the shielding and the connections into the process.'
		}
	];

	let turn = $state(0); // the diagram can be turned
	let zoom = $state(1); // and pinched
	let selected = $state(PARTS[2]);
	let reduced = $state(false);
	let progress = $state(0.55);

	onMount(() => {
		reduced = prefersReducedMotion();
	});

	let dragging = false;
	let lastX = 0;

	function down(event) {
		dragging = true;
		lastX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
	}
	function move(event) {
		if (!dragging) return;
		const x = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
		turn = Math.max(-40, Math.min(40, turn + (x - lastX) * 0.35));
		lastX = x;
	}
	function up() {
		dragging = false;
	}
</script>

<svelte:window onpointermove={move} onpointerup={up} />

<svelte:head><title>Technology, Zettajoule</title></svelte:head>

<section class="head">
	<div class="wrap">
		<p class="eyebrow">Technology</p>
		<h1>{c.lede?.heading}</h1>
		<p class="lede">{c.lede?.body}</p>
		<ul class="facts">
			{#each FACTS as f}
				<li class="mono">{f}</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section diagram-section">
	<div class="wrap diagram-grid">
		<div class="stage">
			<div
				class="drag"
				style:transform={`rotate(${turn * 0.12}deg) scale(${zoom})`}
				onpointerdown={down}
				role="application"
				aria-label="Reactor diagram. Drag to turn it, or use the part buttons beside it."
			>
				<Reactor progress={reduced ? 0.55 : progress} mode={reduced ? 'still' : 'auto'} size={360} />
			</div>
			<div class="stage-controls">
				<label class="ctl" for="turn">Turn</label>
				<input id="turn" type="range" min="-40" max="40" step="1" bind:value={turn} />
				<label class="ctl" for="zoom">Zoom</label>
				<input id="zoom" type="range" min="0.7" max="1.5" step="0.05" bind:value={zoom} />
				<label class="ctl" for="apart">Take apart</label>
				<input id="apart" type="range" min="0" max="1" step="0.01" bind:value={progress} />
			</div>
		</div>

		<div>
			<h2>Pick it apart</h2>
			<p class="muted">
				Each part is separately named. Choose one to read what it does; the same text is here whether
				you use the diagram or the list.
			</p>
			<ul class="parts">
				{#each PARTS as p}
					<li>
						<button
							type="button"
							class:selected={selected.id === p.id}
							onclick={() => (selected = p)}
							aria-pressed={selected.id === p.id}
						>
							{p.name}
						</button>
					</li>
				{/each}
			</ul>
			<div class="part-detail card" aria-live="polite">
				<h3>{selected.name}</h3>
				<p>{selected.text}</p>
			</div>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap deep">
		{#each ['fuel', 'graphite', 'helium'] as key}
			<Reveal>
				<article class="card">
					<h2>{c[key]?.heading}</h2>
					<p>{c[key]?.body}</p>
				</article>
			</Reveal>
		{/each}
	</div>
</section>

<section class="section alt">
	<div class="wrap deep">
		{#each ['twin', 'safety', 'modular'] as key}
			<Reveal>
				<article class="card">
					<h2>{c[key]?.heading}</h2>
					<p>{c[key]?.body}</p>
				</article>
			</Reveal>
		{/each}
	</div>
</section>

<style>
	.head {
		padding: 44px 0 26px;
		border-bottom: 1px solid var(--rule);
	}
	.facts {
		list-style: none;
		margin: 18px 0 0;
		padding: 0;
		display: flex;
		gap: 10px 24px;
		flex-wrap: wrap;
		font-size: 0.84rem;
		color: var(--ink-muted);
	}
	.facts li {
		border-left: 3px solid var(--accent);
		padding-left: 10px;
	}
	.diagram-section {
		background: var(--surface-soft);
		border-bottom: 1px solid var(--rule);
	}
	.diagram-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 44px;
		align-items: start;
	}
	.stage {
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		padding: 18px;
	}
	.drag {
		touch-action: none;
		cursor: grab;
		transform-origin: center;
	}
	.drag:active {
		cursor: grabbing;
	}
	.stage-controls {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 8px 14px;
		align-items: center;
		margin-top: 14px;
		border-top: 1px solid var(--rule);
		padding-top: 14px;
	}
	.ctl {
		margin: 0;
	}
	input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
		min-height: 32px;
	}
	.parts {
		list-style: none;
		margin: 14px 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.parts button {
		min-height: 44px;
		padding: 8px 14px;
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink);
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 0.82rem;
		cursor: pointer;
	}
	.parts button:hover {
		background: var(--surface-grey);
	}
	.parts button.selected {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.part-detail h3 {
		font-size: 1.05rem;
	}
	.part-detail p {
		margin: 0;
		color: var(--ink-muted);
	}
	.deep {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
		gap: 20px;
	}
	.deep h2 {
		font-size: 1.15rem;
	}
	.deep p {
		color: var(--ink-muted);
		font-size: 0.95rem;
		margin: 0;
	}
	.alt {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
	}
	@media (max-width: 900px) {
		.diagram-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
