<script>
	/* The reactor. Every part is a named shape drawn in code: no asset file.
	   `progress` (0..1) is bound to scroll position by the caller, so the
	   sequence runs forwards and backwards with the finger. Under reduced
	   motion the caller holds one still frame. */
	export let progress = 0;
	export let reduced = false;
	export let width = 420;

	const clamp = (v) => Math.min(1, Math.max(0, v));
	// stage 1: rods lift, stage 2: dome opens, stage 3: metal turns to line drawing
	$: p = reduced ? 0 : clamp(progress);
	$: rodLift = clamp(p / 0.35) * 86;
	$: domeLift = clamp((p - 0.28) / 0.32) * 104;
	$: coreReveal = clamp((p - 0.34) / 0.3);
	$: lineMix = clamp((p - 0.62) / 0.3);
	$: metal = 1 - lineMix;
</script>

<svg
	class="reactor"
	viewBox="0 0 300 420"
	width={width}
	height={width * 1.4}
	role="img"
	aria-label="Cutaway of a Zettajoule module: control rods, pressure dome, fuel core and base, drawn as shapes"
	focusable="false"
>
	<defs>
		<linearGradient id="zj-steel" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="#8c959e" />
			<stop offset="18%" stop-color="#eef1f4" />
			<stop offset="38%" stop-color="#b6bec6" />
			<stop offset="55%" stop-color="#f7f9fb" />
			<stop offset="76%" stop-color="#9aa3ac" />
			<stop offset="100%" stop-color="#6f7982" />
		</linearGradient>
		<linearGradient id="zj-steel-dark" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="#5d666f" />
			<stop offset="25%" stop-color="#aeb7c0" />
			<stop offset="50%" stop-color="#7c858e" />
			<stop offset="78%" stop-color="#b9c1c9" />
			<stop offset="100%" stop-color="#525b64" />
		</linearGradient>
		<linearGradient id="zj-core" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#3a2f28" />
			<stop offset="45%" stop-color="#1d1815" />
			<stop offset="100%" stop-color="#100d0b" />
		</linearGradient>
		<radialGradient id="zj-glow" cx="0.5" cy="0.5" r="0.5">
			<stop offset="0%" stop-color="#ffb066" stop-opacity="0.85" />
			<stop offset="100%" stop-color="#ffb066" stop-opacity="0" />
		</radialGradient>
		<linearGradient id="zj-ground" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#cfd8e4" />
			<stop offset="100%" stop-color="#e8ded0" />
		</linearGradient>
	</defs>

	<!-- base plinth -->
	<g class="part" data-part="base">
		<ellipse cx="150" cy="392" rx="118" ry="18" fill="url(#zj-ground)" opacity={0.7 * metal + 0.15} />
		<path
			d="M62 352 h176 l14 30 h-204 z"
			fill="url(#zj-steel-dark)"
			opacity={metal}
		/>
		<path d="M62 352 h176 l14 30 h-204 z" fill="none" stroke="var(--navy)" stroke-width="1.4" opacity={lineMix} />
		<rect x="78" y="330" width="144" height="24" rx="4" fill="url(#zj-steel)" opacity={metal} />
		<rect x="78" y="330" width="144" height="24" rx="4" fill="none" stroke="var(--navy)" stroke-width="1.4" opacity={lineMix} />
	</g>

	<!-- pressure vessel body -->
	<g class="part" data-part="vessel">
		<rect x="88" y="150" width="124" height="182" rx="14" fill="url(#zj-steel)" opacity={metal} />
		<rect x="88" y="150" width="124" height="182" rx="14" fill="none" stroke="var(--navy)" stroke-width="1.6" opacity={lineMix} />
		<!-- hand-made shine: specular bands -->
		<rect x="102" y="150" width="10" height="182" fill="#ffffff" opacity={0.5 * metal} />
		<rect x="176" y="150" width="6" height="182" fill="#ffffff" opacity={0.28 * metal} />
		<g opacity={0.35 * lineMix} stroke="var(--accent)" stroke-width="0.8">
			<line x1="88" y1="196" x2="212" y2="196" />
			<line x1="88" y1="242" x2="212" y2="242" />
			<line x1="88" y1="288" x2="212" y2="288" />
		</g>
	</g>

	<!-- fuel core, revealed as the dome lifts -->
	<g class="part" data-part="core" opacity={coreReveal}>
		<ellipse cx="150" cy="230" rx="74" ry="60" fill="url(#zj-glow)" opacity={0.55 * coreReveal} />
		<rect x="118" y="176" width="64" height="140" rx="8" fill="url(#zj-core)" />
		<g stroke="#ffab5e" stroke-width="1.4" opacity="0.85">
			{#each [0, 1, 2, 3, 4] as i}
				<line x1={128 + i * 11} y1="186" x2={128 + i * 11} y2="306" />
			{/each}
		</g>
		<rect x="118" y="176" width="64" height="140" rx="8" fill="none" stroke="var(--navy)" stroke-width="1.2" opacity={lineMix} />
	</g>

	<!-- pressure dome, lifts off -->
	<g class="part" data-part="dome" transform="translate(0 {-domeLift})">
		<path d="M88 156 a62 46 0 0 1 124 0 z" fill="url(#zj-steel)" opacity={metal} />
		<path d="M88 156 a62 46 0 0 1 124 0 z" fill="none" stroke="var(--navy)" stroke-width="1.6" opacity={lineMix} />
		<path d="M104 150 a46 34 0 0 1 26 -26" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity={0.6 * metal} />
		<rect x="82" y="150" width="136" height="12" rx="4" fill="url(#zj-steel-dark)" opacity={metal} />
		<rect x="82" y="150" width="136" height="12" rx="4" fill="none" stroke="var(--navy)" stroke-width="1.4" opacity={lineMix} />
	</g>

	<!-- control rods, lift out first -->
	<g class="part" data-part="rods" transform="translate(0 {-rodLift})">
		{#each [110, 132, 154, 176] as x, i}
			<g>
				<rect x={x} y={54 + (i % 2) * 6} width="10" height="104" rx="4" fill="url(#zj-steel-dark)" opacity={metal} />
				<rect
					x={x}
					y={54 + (i % 2) * 6}
					width="10"
					height="104"
					rx="4"
					fill="none"
					stroke="var(--navy)"
					stroke-width="1.2"
					opacity={lineMix}
				/>
				<rect x={x - 4} y={44 + (i % 2) * 6} width="18" height="12" rx="3" fill="url(#zj-steel)" opacity={metal} />
				<rect
					x={x - 4}
					y={44 + (i % 2) * 6}
					width="18"
					height="12"
					rx="3"
					fill="none"
					stroke="var(--navy)"
					stroke-width="1.2"
					opacity={lineMix}
				/>
			</g>
		{/each}
	</g>

	<!-- helium circuit, drawn on as the diagram resolves -->
	<g class="part" data-part="circuit" opacity={lineMix} stroke="var(--accent)" fill="none" stroke-width="1.6">
		<path d="M212 214 h44 v96 h-30" stroke-dasharray="4 3" />
		<circle cx="256" cy="196" r="14" />
		<path d="M88 268 h-46 v-70 h30" stroke-dasharray="4 3" />
		<text x="238" y="200" font-size="9" fill="var(--ink-muted)" stroke="none" font-family="var(--font-mono)">He</text>
	</g>
</svg>

<style>
	.reactor {
		display: block;
		max-width: 100%;
		height: auto;
	}
</style>
