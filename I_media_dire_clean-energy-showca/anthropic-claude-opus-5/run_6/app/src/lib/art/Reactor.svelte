<script>
	/**
	 * The reactor. Every part is separately nameable so the scroll sequence can
	 * address it. `progress` is 0..1 and is bound to scroll position by the
	 * caller, so the sequence runs forwards and backwards with the finger.
	 * Under reduced motion the caller holds one still frame.
	 */
	export let progress = 0;
	export let still = false;
	export let interactive = false;
	export let width = '100%';
	export let labelled = false;

	export let activePart = null;

	const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
	const seg = (p, from, to) => clamp((p - from) / (to - from));

	$: p = still ? 0.62 : clamp(progress);
	/* stage 1 rods lift, stage 2 dome opens, stage 3 core bare + facts,
	   stage 4 metal resolves to a technical line drawing */
	$: rodLift = seg(p, 0.05, 0.4) * 92;
	$: domeLift = seg(p, 0.22, 0.55) * 118;
	$: coreReveal = seg(p, 0.38, 0.68);
	$: lineDraw = seg(p, 0.6, 0.95);
	$: metal = 1 - lineDraw * 0.92;

	const parts = {
		'control-rods': 'Control rods, lifted clear of the core',
		dome: 'Pressure dome, the rounded lid over the vessel',
		vessel: 'Reactor vessel, the steel pressure boundary',
		core: 'Fuel core, a dark column of coated fuel grains in graphite',
		base: 'Base and support skirt',
		'coolant-loop': 'Helium coolant loop to the heat exchanger'
	};

	function pick(name) {
		if (!interactive) return;
		activePart = activePart === name ? null : name;
	}
</script>

<div class="reactor" style="width:{width}">
	<svg
		viewBox="0 0 320 460"
		role="img"
		aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, pressure dome, vessel, fuel core and base"
		preserveAspectRatio="xMidYMid meet"
	>
		<defs>
			<linearGradient id="zj-steel" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#7f8894" />
				<stop offset="12%" stop-color="#c9d1da" />
				<stop offset="27%" stop-color="#eef2f6" />
				<stop offset="42%" stop-color="#aab4c0" />
				<stop offset="58%" stop-color="#e3e9ef" />
				<stop offset="74%" stop-color="#98a2ae" />
				<stop offset="88%" stop-color="#ced6de" />
				<stop offset="100%" stop-color="#6c7581" />
			</linearGradient>
			<linearGradient id="zj-steel-dark" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#5b636e" />
				<stop offset="25%" stop-color="#98a2ae" />
				<stop offset="50%" stop-color="#c4ccd5" />
				<stop offset="75%" stop-color="#8b95a1" />
				<stop offset="100%" stop-color="#4e5661" />
			</linearGradient>
			<linearGradient id="zj-core" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#3d2b1c" />
				<stop offset="40%" stop-color="#7a4a1c" />
				<stop offset="70%" stop-color="#b8641d" />
				<stop offset="100%" stop-color="#4a3320" />
			</linearGradient>
			<linearGradient id="zj-sheen" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
				<stop offset="45%" stop-color="#ffffff" stop-opacity="0.05" />
				<stop offset="100%" stop-color="#ffffff" stop-opacity="0.4" />
			</linearGradient>
			<radialGradient id="zj-glow" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color="#ffb457" stop-opacity="0.55" />
				<stop offset="100%" stop-color="#ffb457" stop-opacity="0" />
			</radialGradient>
		</defs>

		<!-- ground shadow -->
		<ellipse cx="160" cy="432" rx="104" ry="13" fill="#0d1014" opacity="0.09" />

		<!-- part: base -->
		<g
			class="part"
			data-part="base"
			class:pickable={interactive}
			on:click={() => pick('base')}
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('base'))}
			role="button"
			tabindex={interactive ? 0 : -1}
			aria-label={interactive ? parts.base : null}
		>
			<path d="M96 392 L224 392 L238 424 L82 424 Z" fill="url(#zj-steel-dark)" opacity={metal} />
			<path
				d="M96 392 L224 392 L238 424 L82 424 Z"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineDraw}
			/>
			<rect x="104" y="368" width="112" height="26" rx="3" fill="url(#zj-steel)" opacity={metal} />
			<rect
				x="104"
				y="368"
				width="112"
				height="26"
				rx="3"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.3"
				opacity={lineDraw}
			/>
		</g>

		<!-- part: coolant-loop -->
		<g
			class="part"
			data-part="coolant-loop"
			class:pickable={interactive}
			on:click={() => pick('coolant-loop')}
			on:keydown={(e) =>
				(e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('coolant-loop'))}
			role="button"
			tabindex={interactive ? 0 : -1}
			aria-label={interactive ? parts['coolant-loop'] : null}
			opacity={0.25 + coreReveal * 0.75}
		>
			<path
				d="M226 196 H272 a10 10 0 0 1 10 10 V330 a10 10 0 0 1 -10 10 H236"
				fill="none"
				stroke="var(--accent)"
				stroke-width="3"
				stroke-linecap="round"
			/>
			<path
				d="M94 250 H54 a10 10 0 0 0 -10 10 V330 a10 10 0 0 0 10 10 H86"
				fill="none"
				stroke="var(--accent)"
				stroke-width="3"
				stroke-linecap="round"
				opacity="0.55"
			/>
			<circle cx="272" cy="268" r="4.5" fill="var(--accent)" />
		</g>

		<!-- part: vessel -->
		<g
			class="part"
			data-part="vessel"
			class:pickable={interactive}
			on:click={() => pick('vessel')}
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('vessel'))}
			role="button"
			tabindex={interactive ? 0 : -1}
			aria-label={interactive ? parts.vessel : null}
		>
			<rect x="94" y="150" width="132" height="222" rx="12" fill="url(#zj-steel)" opacity={metal} />
			<rect
				x="94"
				y="150"
				width="132"
				height="222"
				rx="12"
				fill="url(#zj-sheen)"
				opacity={metal * 0.5}
			/>
			<rect
				x="94"
				y="150"
				width="132"
				height="222"
				rx="12"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.4"
				opacity={lineDraw}
			/>
			{#each [186, 226, 266, 306, 346] as y}
				<line
					x1="94"
					y1={y}
					x2="226"
					y2={y}
					stroke="var(--ink)"
					stroke-width="0.7"
					opacity={lineDraw * 0.45}
				/>
			{/each}
		</g>

		<!-- part: core, exposed as the sequence runs -->
		<g
			class="part"
			data-part="core"
			class:pickable={interactive}
			on:click={() => pick('core')}
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('core'))}
			role="button"
			tabindex={interactive ? 0 : -1}
			aria-label={interactive ? parts.core : null}
			opacity={coreReveal}
		>
			<ellipse cx="160" cy="262" rx="86" ry="86" fill="url(#zj-glow)" opacity={coreReveal * 0.8} />
			<rect x="126" y="188" width="68" height="164" rx="6" fill="url(#zj-core)" />
			{#each [0, 1, 2, 3] as c}
				<rect
					x={132 + c * 16}
					y="196"
					width="10"
					height="148"
					rx="2"
					fill="#1c1310"
					opacity="0.6"
				/>
			{/each}
			<rect
				x="126"
				y="188"
				width="68"
				height="164"
				rx="6"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.2"
				opacity={lineDraw}
			/>
		</g>

		<!-- part: control-rods, lift first -->
		<g
			class="part"
			data-part="control-rods"
			class:pickable={interactive}
			on:click={() => pick('control-rods')}
			on:keydown={(e) =>
				(e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('control-rods'))}
			role="button"
			tabindex={interactive ? 0 : -1}
			aria-label={interactive ? parts['control-rods'] : null}
			transform="translate(0,{-rodLift})"
		>
			{#each [0, 1, 2, 3, 4] as i}
				<rect
					x={126 + i * 14}
					y="72"
					width="7"
					height="128"
					rx="3"
					fill="url(#zj-steel-dark)"
					opacity={metal}
				/>
				<rect
					x={126 + i * 14}
					y="72"
					width="7"
					height="128"
					rx="3"
					fill="none"
					stroke="var(--ink)"
					stroke-width="1"
					opacity={lineDraw}
				/>
			{/each}
			<rect x="118" y="58" width="84" height="16" rx="4" fill="url(#zj-steel)" opacity={metal} />
			<rect
				x="118"
				y="58"
				width="84"
				height="16"
				rx="4"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.2"
				opacity={lineDraw}
			/>
		</g>

		<!-- part: dome, rises off the vessel -->
		<g
			class="part"
			data-part="dome"
			class:pickable={interactive}
			on:click={() => pick('dome')}
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('dome'))}
			role="button"
			tabindex={interactive ? 0 : -1}
			aria-label={interactive ? parts.dome : null}
			transform="translate(0,{-domeLift})"
		>
			<path
				d="M94 162 A66 62 0 0 1 226 162 Z"
				fill="url(#zj-steel)"
				opacity={metal}
			/>
			<path d="M94 162 A66 62 0 0 1 226 162 Z" fill="url(#zj-sheen)" opacity={metal * 0.55} />
			<path
				d="M94 162 A66 62 0 0 1 226 162 Z"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.4"
				opacity={lineDraw}
			/>
			<rect x="88" y="158" width="144" height="12" rx="4" fill="url(#zj-steel-dark)" opacity={metal} />
			<rect
				x="88"
				y="158"
				width="144"
				height="12"
				rx="4"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.2"
				opacity={lineDraw}
			/>
		</g>

		{#if labelled}
			<g class="callouts" opacity={coreReveal} font-size="9" fill="var(--ink-muted)">
				<line x1="200" y1="130" x2="252" y2="112" stroke="var(--rule-strong)" stroke-width="1" />
				<text x="256" y="110">Dome</text>
				<line x1="196" y1="270" x2="250" y2="286" stroke="var(--rule-strong)" stroke-width="1" />
				<text x="254" y="289">Fuel core</text>
				<line x1="120" y1="120" x2="66" y2="102" stroke="var(--rule-strong)" stroke-width="1" />
				<text x="16" y="100">Control rods</text>
			</g>
		{/if}
	</svg>

	{#if interactive && activePart}
		<p class="part-note" role="status">{parts[activePart]}</p>
	{/if}
</div>

<style>
	.reactor {
		max-width: 100%;
		margin-inline: auto;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.pickable {
		cursor: pointer;
	}
	.pickable:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 3px;
	}
	.part-note {
		margin: 12px auto 0;
		max-width: 44ch;
		text-align: center;
		font-size: 0.9rem;
		color: var(--ink-muted);
		border-top: 1px solid var(--rule);
		padding-top: 10px;
	}
</style>
