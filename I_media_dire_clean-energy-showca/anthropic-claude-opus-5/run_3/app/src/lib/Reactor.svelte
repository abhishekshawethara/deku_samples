<script>
	// The reactor is drawn from shapes, never a file. Each part stays separately
	// nameable so the sequence can address it: rods, dome, core, vessel, base.
	// The sequence is bound to scroll position, so it runs backwards on the way
	// up, and holds one still frame under reduced motion.
	let {
		progress = 0, // 0 whole and metallic .. 1 exploded technical drawing
		still = false, // reduced motion / low power: one clean frame
		height = '100%',
		interactive = false, // /technology: parts can be picked apart
		activePart = $bindable(null),
		spin = 0
	} = $props();

	const p = $derived(still ? 0.62 : Math.min(1, Math.max(0, progress)));

	// stage curves, all derived from scroll position rather than a duration
	const rodLift = $derived(Math.min(1, p / 0.34));
	const domeLift = $derived(Math.min(1, Math.max(0, (p - 0.22) / 0.32)));
	const coreShow = $derived(Math.min(1, Math.max(0, (p - 0.4) / 0.28)));
	const lineArt = $derived(Math.min(1, Math.max(0, (p - 0.62) / 0.34)));

	const metal = $derived(1 - lineArt);

	const parts = [
		{
			id: 'rods',
			name: 'Control rods',
			text: 'Six control rods sit in channels through the graphite. They lift clear first in the sequence.'
		},
		{
			id: 'dome',
			name: 'Pressure dome',
			text: 'The rounded lid seals the vessel and carries the rod drives. It rises off next.'
		},
		{
			id: 'core',
			name: 'Fuel core',
			text: 'A dark column of TRISO fuel in a graphite stack, where the heat is made and held.'
		},
		{
			id: 'vessel',
			name: 'Pressure vessel',
			text: 'The steel vessel holds the helium at pressure and resolves into a line drawing at the end.'
		},
		{
			id: 'loop',
			name: 'Helium loop',
			text: 'Helium leaves the core at 750 degrees Celsius and carries the heat out to the customer.'
		},
		{
			id: 'base',
			name: 'Base and support',
			text: 'The module sits on a supported base, factory-built and shipped whole.'
		}
	];

	function pick(id) {
		if (!interactive) return;
		activePart = activePart === id ? null : id;
	}
</script>

<div class="reactor" style:height data-progress={p.toFixed(2)}>
	<svg
		viewBox="0 0 320 420"
		class="reactor__svg"
		role="img"
		aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, pressure dome, fuel core, pressure vessel, helium loop and base."
		style:transform={`rotate(${spin}deg)`}
	>
		<defs>
			<!-- the metallic shine, made by hand from gradient stops -->
			<linearGradient id="zj-steel" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#6d737b" />
				<stop offset="14%" stop-color="#c9ced6" />
				<stop offset="30%" stop-color="#f4f7fa" />
				<stop offset="44%" stop-color="#aeb5be" />
				<stop offset="58%" stop-color="#e6eaf0" />
				<stop offset="74%" stop-color="#8f959e" />
				<stop offset="88%" stop-color="#c2c8d0" />
				<stop offset="100%" stop-color="#5e646c" />
			</linearGradient>
			<linearGradient id="zj-steel-dome" x1="0" y1="0" x2="1" y2="0.4">
				<stop offset="0%" stop-color="#767c84" />
				<stop offset="26%" stop-color="#eef2f6" />
				<stop offset="52%" stop-color="#b4bac2" />
				<stop offset="78%" stop-color="#e9edf2" />
				<stop offset="100%" stop-color="#666c74" />
			</linearGradient>
			<linearGradient id="zj-core" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#3a2a1c" />
				<stop offset="45%" stop-color="#6b3d16" />
				<stop offset="100%" stop-color="#241a12" />
			</linearGradient>
			<linearGradient id="zj-rod" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#8a9099" />
				<stop offset="40%" stop-color="#f0f3f7" />
				<stop offset="100%" stop-color="#767c85" />
			</linearGradient>
			<radialGradient id="zj-glow" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color="#ffb347" stop-opacity="0.85" />
				<stop offset="100%" stop-color="#ffb347" stop-opacity="0" />
			</radialGradient>
		</defs>

		<!-- base -->
		<g
			class="part"
			class:part--live={interactive}
			data-part="base"
			onclick={() => pick('base')}
			role={interactive ? 'button' : undefined}
			tabindex={interactive ? 0 : undefined}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('base'))}
			aria-label={interactive ? 'Base and support' : undefined}
		>
			<rect
				x="86"
				y="352"
				width="148"
				height="20"
				rx="4"
				fill="url(#zj-steel)"
				opacity={metal}
			/>
			<rect
				x="86"
				y="352"
				width="148"
				height="20"
				rx="4"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineArt}
			/>
			<rect x="104" y="372" width="18" height="26" fill="url(#zj-steel)" opacity={metal} />
			<rect x="198" y="372" width="18" height="26" fill="url(#zj-steel)" opacity={metal} />
			<rect
				x="104"
				y="372"
				width="18"
				height="26"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineArt}
			/>
			<rect
				x="198"
				y="372"
				width="18"
				height="26"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineArt}
			/>
		</g>

		<!-- helium loop: outlet piping to the customer -->
		<g
			class="part"
			class:part--live={interactive}
			data-part="loop"
			onclick={() => pick('loop')}
			role={interactive ? 'button' : undefined}
			tabindex={interactive ? 0 : undefined}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('loop'))}
			aria-label={interactive ? 'Helium loop' : undefined}
		>
			<path
				d="M234 210 H272 V300 H244"
				fill="none"
				stroke="url(#zj-steel)"
				stroke-width="11"
				opacity={metal}
			/>
			<path
				d="M234 210 H272 V300 H244"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1.6"
				stroke-dasharray="4 3"
				opacity={lineArt}
			/>
			<path
				d="M86 246 H48 V318 H84"
				fill="none"
				stroke="url(#zj-steel)"
				stroke-width="11"
				opacity={metal}
			/>
			<path
				d="M86 246 H48 V318 H84"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1.6"
				stroke-dasharray="4 3"
				opacity={lineArt}
			/>
		</g>

		<!-- pressure vessel -->
		<g
			class="part"
			class:part--live={interactive}
			data-part="vessel"
			onclick={() => pick('vessel')}
			role={interactive ? 'button' : undefined}
			tabindex={interactive ? 0 : undefined}
			onkeydown={(e) =>
				(e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('vessel'))}
			aria-label={interactive ? 'Pressure vessel' : undefined}
		>
			<rect
				x="94"
				y="150"
				width="132"
				height="204"
				rx="12"
				fill="url(#zj-steel)"
				opacity={metal}
			/>
			<rect
				x="94"
				y="150"
				width="132"
				height="204"
				rx="12"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.4"
				opacity={lineArt}
			/>
			<!-- vessel ribs -->
			{#each [186, 226, 266, 306] as y}
				<line
					x1="94"
					y1={y}
					x2="226"
					y2={y}
					stroke="rgba(255,255,255,0.5)"
					stroke-width="1.2"
					opacity={metal * 0.8}
				/>
				<line
					x1="94"
					y1={y}
					x2="226"
					y2={y}
					stroke="var(--rule-strong)"
					stroke-width="0.8"
					stroke-dasharray="3 3"
					opacity={lineArt}
				/>
			{/each}
		</g>

		<!-- fuel core, revealed once the dome is off -->
		<g
			class="part"
			class:part--live={interactive}
			data-part="core"
			onclick={() => pick('core')}
			role={interactive ? 'button' : undefined}
			tabindex={interactive ? 0 : undefined}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('core'))}
			aria-label={interactive ? 'Fuel core' : undefined}
			opacity={coreShow}
		>
			<ellipse cx="160" cy="250" rx="82" ry="66" fill="url(#zj-glow)" opacity={0.5 * coreShow} />
			<rect x="124" y="176" width="72" height="160" rx="6" fill="url(#zj-core)" opacity={metal} />
			<rect
				x="124"
				y="176"
				width="72"
				height="160"
				rx="6"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineArt}
			/>
			{#each [0, 1, 2, 3, 4] as r}
				{#each [0, 1, 2] as c}
					<circle
						cx={140 + c * 20}
						cy={196 + r * 28}
						r="5.5"
						fill="none"
						stroke={lineArt > 0.5 ? 'var(--ink)' : '#e9a13b'}
						stroke-width="1.4"
					/>
				{/each}
			{/each}
		</g>

		<!-- control rods lift first -->
		<g
			class="part"
			class:part--live={interactive}
			data-part="rods"
			onclick={() => pick('rods')}
			role={interactive ? 'button' : undefined}
			tabindex={interactive ? 0 : undefined}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('rods'))}
			aria-label={interactive ? 'Control rods' : undefined}
			style:transform={`translateY(${-rodLift * 96}px)`}
		>
			{#each [0, 1, 2, 3, 4, 5] as i}
				<rect
					x={118 + i * 15}
					y="96"
					width="7"
					height="118"
					rx="3"
					fill="url(#zj-rod)"
					opacity={metal}
				/>
				<rect
					x={118 + i * 15}
					y="96"
					width="7"
					height="118"
					rx="3"
					fill="none"
					stroke="var(--ink)"
					stroke-width="1.1"
					opacity={lineArt}
				/>
				<rect x={115 + i * 15} y="88" width="13" height="9" rx="2" fill="#8a9099" opacity={metal} />
				<rect
					x={115 + i * 15}
					y="88"
					width="13"
					height="9"
					rx="2"
					fill="none"
					stroke="var(--ink)"
					stroke-width="1.1"
					opacity={lineArt}
				/>
			{/each}
		</g>

		<!-- the dome rises off -->
		<g
			class="part"
			class:part--live={interactive}
			data-part="dome"
			onclick={() => pick('dome')}
			role={interactive ? 'button' : undefined}
			tabindex={interactive ? 0 : undefined}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('dome'))}
			aria-label={interactive ? 'Pressure dome' : undefined}
			style:transform={`translateY(${-domeLift * 62}px)`}
		>
			<path
				d="M94 156 A66 54 0 0 1 226 156 Z"
				fill="url(#zj-steel-dome)"
				opacity={metal}
			/>
			<path
				d="M94 156 A66 54 0 0 1 226 156 Z"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.4"
				opacity={lineArt}
			/>
			<rect x="94" y="152" width="132" height="10" rx="3" fill="url(#zj-steel)" opacity={metal} />
			<rect
				x="94"
				y="152"
				width="132"
				height="10"
				rx="3"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineArt}
			/>
		</g>
	</svg>
</div>

<style>
	.reactor {
		width: 100%;
		display: grid;
		place-items: center;
	}
	.reactor__svg {
		width: 100%;
		height: 100%;
		max-height: 100%;
		overflow: visible;
	}
	/* The sequence is glued to scroll position: no transition, so it tracks the
	   finger forwards and backwards rather than easing on a timer. */
	.part {
		transform-box: fill-box;
		transform-origin: center;
	}
	.part--live {
		cursor: pointer;
	}
	.part--live:hover {
		filter: brightness(1.06);
	}
	.part--live:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 3px;
	}
</style>
