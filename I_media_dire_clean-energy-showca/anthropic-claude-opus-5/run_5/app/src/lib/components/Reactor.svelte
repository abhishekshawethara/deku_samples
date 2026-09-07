
<script>
	/**
	 * The reactor. Every part is a named shape drawn from code, so the
	 * scroll-bound sequence can address it: rods, dome, core, vessel, base.
	 * `p` runs 0 (whole and metallic) to 1 (apart and resolved to a technical
	 * line drawing). Under reduced motion the caller holds p at one still frame.
	 */
	let { p = 0, still = false, size = 460, label = 'Zettajoule reactor module' } = $props();

	const clamp = (v) => Math.max(0, Math.min(1, v));
	const seg = (v, a, b) => clamp((v - a) / (b - a));

	let t = $derived(still ? 0 : clamp(p));
	// stage 1 rods lift, stage 2 dome rises, stage 3 core bare, stage 4 line drawing
	let rods = $derived(seg(t, 0.05, 0.4));
	let dome = $derived(seg(t, 0.3, 0.62));
	let bare = $derived(seg(t, 0.5, 0.78));
	let line = $derived(still ? 1 : seg(t, 0.72, 1));

	let metal = $derived(1 - line);
</script>

<svg
	class="reactor"
	viewBox="0 0 300 420"
	width={size}
	height={size * 1.4}
	role="img"
	aria-label={label}
	data-stage={t < 0.3 ? 'whole' : t < 0.6 ? 'rods-out' : t < 0.8 ? 'core-bare' : 'diagram'}
	focusable="false"
>
	<defs>
		<!-- hand-made metallic shine, the part most worth getting right -->
		<linearGradient id="rx-steel" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="#7e8794" />
			<stop offset="14%" stop-color="#c9d2dd" />
			<stop offset="30%" stop-color="#f4f7fb" />
			<stop offset="44%" stop-color="#aab4c2" />
			<stop offset="58%" stop-color="#e4eaf2" />
			<stop offset="74%" stop-color="#8f98a6" />
			<stop offset="88%" stop-color="#c2cbd7" />
			<stop offset="100%" stop-color="#6d7683" />
		</linearGradient>
		<linearGradient id="rx-steel-soft" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="#8a929e" />
			<stop offset="26%" stop-color="#e8edf3" />
			<stop offset="52%" stop-color="#a7b1bf" />
			<stop offset="78%" stop-color="#dde3ea" />
			<stop offset="100%" stop-color="#79828f" />
		</linearGradient>
		<linearGradient id="rx-core" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#2a2622" />
			<stop offset="50%" stop-color="#4a423a" />
			<stop offset="100%" stop-color="#211d19" />
		</linearGradient>
		<linearGradient id="rx-hot" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#ffb46b" />
			<stop offset="100%" stop-color="#e8632a" />
		</linearGradient>
		<radialGradient id="rx-glow" cx="0.5" cy="0.5" r="0.5">
			<stop offset="0%" stop-color="#ffb46b" stop-opacity="0.75" />
			<stop offset="100%" stop-color="#ffb46b" stop-opacity="0" />
		</radialGradient>
	</defs>

	<!-- base -->
	<g data-part="base">
		<ellipse cx="150" cy="392" rx="104" ry="15" fill="var(--sky-deep)" opacity={0.5 * metal + 0.12} />
		<rect
			x="66"
			y="342"
			width="168"
			height="42"
			rx="7"
			fill="url(#rx-steel-soft)"
			opacity={metal}
		/>
		<rect
			x="66"
			y="342"
			width="168"
			height="42"
			rx="7"
			fill="none"
			stroke="var(--ink)"
			stroke-width="1.4"
			opacity={line}
		/>
		<line x1="90" y1="384" x2="78" y2="404" stroke="var(--ink)" stroke-width="1.4" opacity={0.35 + 0.65 * line} />
		<line x1="210" y1="384" x2="222" y2="404" stroke="var(--ink)" stroke-width="1.4" opacity={0.35 + 0.65 * line} />
	</g>

	<!-- pressure vessel -->
	<g data-part="vessel">
		<rect
			x="88"
			y="150"
			width="124"
			height="196"
			rx="15"
			fill="url(#rx-steel)"
			opacity={metal}
		/>
		<rect
			x="88"
			y="150"
			width="124"
			height="196"
			rx="15"
			fill="none"
			stroke="var(--ink)"
			stroke-width="1.6"
			opacity={line}
		/>
		<!-- the vessel wall opens to expose the inside -->
		<rect
			x="104"
			y="166"
			width="92"
			height="164"
			rx="9"
			fill="#1b1815"
			opacity={0.16 + 0.7 * bare}
		/>
		{#each [186, 216, 246, 276, 306] as y}
			<line
				x1="104"
				y1={y}
				x2="196"
				y2={y}
				stroke="var(--ink)"
				stroke-width="1"
				opacity={0.28 * line}
			/>
		{/each}
	</g>

	<!-- core: a dark column of fuel, laid bare -->
	<g data-part="core">
		<rect x="124" y="176" width="52" height="146" rx="6" fill="url(#rx-core)" opacity={0.35 + 0.65 * bare} />
		<rect
			x="124"
			y="176"
			width="52"
			height="146"
			rx="6"
			fill="none"
			stroke="var(--ink)"
			stroke-width="1.3"
			opacity={line}
		/>
		<circle cx="150" cy="250" r="62" fill="url(#rx-glow)" opacity={bare * (1 - line * 0.75)} />
		{#each [0, 1, 2, 3, 4, 5] as i}
			{#each [0, 1, 2] as j}
				<circle
					cx={134 + j * 16}
					cy={192 + i * 24}
					r="4.4"
					fill={line > 0.5 ? 'none' : 'url(#rx-hot)'}
					stroke="var(--ink)"
					stroke-width={line}
					opacity={0.25 + 0.75 * bare}
				/>
			{/each}
		{/each}
	</g>

	<!-- control rods: they lift up and pull free -->
	<g data-part="rods" transform="translate(0 {-96 * rods})">
		{#each [0, 1, 2, 3] as i}
			<g>
				<rect
					x={112 + i * 26}
					y="72"
					width="11"
					height="120"
					rx="4"
					fill="url(#rx-steel-soft)"
					opacity={metal}
				/>
				<rect
					x={112 + i * 26}
					y="72"
					width="11"
					height="120"
					rx="4"
					fill="none"
					stroke="var(--ink)"
					stroke-width="1.2"
					opacity={line}
				/>
				<rect
					x={108 + i * 26}
					y="62"
					width="19"
					height="12"
					rx="3"
					fill={line > 0.5 ? 'none' : '#6f7784'}
					stroke="var(--ink)"
					stroke-width={line * 1.2}
					opacity={0.9}
				/>
			</g>
		{/each}
	</g>

	<!-- the rounded lid rises off -->
	<g data-part="dome" transform="translate(0 {-116 * dome})">
		<path
			d="M88 152 A62 54 0 0 1 212 152 Z"
			fill="url(#rx-steel)"
			opacity={metal}
		/>
		<path
			d="M88 152 A62 54 0 0 1 212 152 Z"
			fill="none"
			stroke="var(--ink)"
			stroke-width="1.6"
			opacity={line}
		/>
		<path
			d="M112 140 A42 34 0 0 1 188 140"
			fill="none"
			stroke="#ffffff"
			stroke-width="2.4"
			opacity={0.55 * metal}
		/>
	</g>

	<!-- helium outlet leg, drawn on as the diagram resolves -->
	<g data-part="loop" opacity={line}>
		<path
			d="M212 210 H264 V330 H236"
			fill="none"
			stroke="var(--accent)"
			stroke-width="1.8"
			stroke-dasharray="4 4"
		/>
		<path d="M88 300 H36 V196 H62" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="4 4" />
		<text x="268" y="206" font-size="10" fill="var(--ink-muted)" font-family="var(--font-body)">750 C</text>
	</g>
</svg>

<style>
	.reactor {
		display: block;
		max-width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
