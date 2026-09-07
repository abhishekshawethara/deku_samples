<script>
	/** Clean line diagram, drawn line by line rather than shown as a picture. */
	export let outputKind = 'heat';
	export let moduleCount = 1;

	const OUT_LABEL = {
		heat: 'Process heat',
		'heat-and-power': 'Heat and power',
		hydrogen: 'Hydrogen',
		electricity: 'Electricity'
	};
	$: shown = Math.min(moduleCount, 4);
	$: label = OUT_LABEL[outputKind] || outputKind;
</script>

<svg
	class="diagram"
	viewBox="0 0 300 150"
	role="img"
	aria-label="Block diagram: {moduleCount} reactor module{moduleCount === 1 ? '' : 's'} feed a transfer loop, which delivers {label}"
>
	<g fill="none" stroke="var(--ink)" stroke-width="1.2">
		{#each Array(shown) as _, i}
			<rect x="8" y={12 + i * 31} width="60" height="24" rx="3" />
		{/each}
		<rect x="108" y="46" width="66" height="52" rx="3" />
		<rect x="214" y="52" width="76" height="40" rx="3" />
		<path d="M68 {12 + (shown - 1) * 15.5} H92 M92 {12 + (shown - 1) * 15.5} V72 H108" />
		<path d="M174 72 H214" />
		<path d="M240 92 V116 H130 V98" stroke-dasharray="3 3" opacity="0.6" />
	</g>
	<g fill="var(--accent)">
		<circle cx="100" cy="72" r="2.6" />
		<circle cx="206" cy="72" r="2.6" />
	</g>
	<g font-size="7" fill="var(--ink-muted)" font-family="var(--font-body)">
		{#each Array(shown) as _, i}
			<text x="38" y={27 + i * 31} text-anchor="middle">Module {i + 1}</text>
		{/each}
		{#if moduleCount > 4}
			<text x="38" y="141" text-anchor="middle">+ {moduleCount - 4} more</text>
		{/if}
		<text x="141" y="68" text-anchor="middle">Transfer</text>
		<text x="141" y="78" text-anchor="middle">loop</text>
		<text x="252" y="76" text-anchor="middle">{label}</text>
		<text x="185" y="112" text-anchor="middle">return</text>
	</g>
</svg>

<style>
	.diagram {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--rule);
		border-radius: var(--r-md);
		background: var(--paper-2);
		padding: 8px;
	}
</style>
