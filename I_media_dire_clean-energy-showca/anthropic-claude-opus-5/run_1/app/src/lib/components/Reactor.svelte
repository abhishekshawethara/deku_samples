<script>
	// The centrepiece. Every part is a named shape drawn from code, so the
	// sequence can address it. `progress` is 0..1 and is bound to scroll
	// position by the caller, so the sequence runs forwards and backwards with
	// the finger rather than to a timer. Under reduced motion the caller pins
	// progress to one still frame.
	let { progress = 0, mode = 'auto', size = 460 } = $props();

	const p = $derived(Math.max(0, Math.min(1, progress)));

	// stage 1: rods lift, stage 2: dome lifts, stage 3: core exposed,
	// stage 4: metal resolves into a technical line drawing.
	const clamp01 = (v) => Math.max(0, Math.min(1, v));
	const rodLift = $derived(clamp01((p - 0.05) / 0.3) * 96);
	const domeLift = $derived(clamp01((p - 0.25) / 0.3) * 132);
	const coreGlow = $derived(clamp01((p - 0.42) / 0.28));
	const lineDraw = $derived(clamp01((p - 0.62) / 0.3));
	const metal = $derived(1 - lineDraw);
	const spread = $derived(clamp01((p - 0.2) / 0.5) * 26);
</script>

<div class="reactor" style:--size={`${size}px`}>
	<svg
		viewBox="0 0 320 460"
		width="100%"
		height="100%"
		role="img"
		aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, dome, core and base"
		focusable="false"
	>
		<defs>
			<linearGradient id="zj-steel" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#8f9aa6" />
				<stop offset="14%" stop-color="#e8edf3" />
				<stop offset="30%" stop-color="#aab6c3" />
				<stop offset="48%" stop-color="#f7fafc" />
				<stop offset="62%" stop-color="#9aa6b3" />
				<stop offset="80%" stop-color="#dde5ed" />
				<stop offset="100%" stop-color="#7d8894" />
			</linearGradient>
			<linearGradient id="zj-steel-dark" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#5f6a76" />
				<stop offset="20%" stop-color="#b6c1cd" />
				<stop offset="46%" stop-color="#dde5ed" />
				<stop offset="70%" stop-color="#8d98a4" />
				<stop offset="100%" stop-color="#59636e" />
			</linearGradient>
			<linearGradient id="zj-core" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#3b3129" />
				<stop offset="50%" stop-color="#221c17" />
				<stop offset="100%" stop-color="#100d0a" />
			</linearGradient>
			<linearGradient id="zj-hot" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#ffb257" />
				<stop offset="100%" stop-color="#d8551a" />
			</linearGradient>
			<radialGradient id="zj-sheen" cx="0.32" cy="0.22" r="0.75">
				<stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
				<stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
			</radialGradient>
		</defs>

		<!-- ground shadow -->
		<ellipse cx="160" cy="424" rx="112" ry="14" fill="#0b1a38" opacity="0.13" />

		<!-- part: base -->
		<g id="reactor-base" data-part="base">
			<rect
				x="52"
				y="368"
				width="216"
				height="46"
				rx="8"
				fill="url(#zj-steel-dark)"
				opacity={metal}
			/>
			<rect
				x="52"
				y="368"
				width="216"
				height="46"
				rx="8"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.4"
				opacity={lineDraw}
			/>
			<line x1="76" y1="380" x2="244" y2="380" stroke="var(--ink)" stroke-width="1" opacity={lineDraw * 0.7} />
			<line x1="76" y1="402" x2="244" y2="402" stroke="var(--ink)" stroke-width="1" opacity={lineDraw * 0.7} />
		</g>

		<!-- part: vessel -->
		<g id="reactor-vessel" data-part="vessel">
			<rect
				x="84"
				y="150"
				width="152"
				height="222"
				rx="14"
				fill="url(#zj-steel)"
				opacity={metal}
			/>
			<rect x="84" y="150" width="152" height="222" rx="14" fill="url(#zj-sheen)" opacity={metal} />
			<rect
				x="84"
				y="150"
				width="152"
				height="222"
				rx="14"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.6"
				opacity={lineDraw}
			/>
			<!-- vessel ribs -->
			{#each [186, 224, 262, 300, 338] as y}
				<line
					x1="90"
					y1={y}
					x2="230"
					y2={y}
					stroke={lineDraw > 0.5 ? 'var(--ink)' : '#6d7883'}
					stroke-width="0.9"
					opacity="0.45"
				/>
			{/each}
		</g>

		<!-- part: core, a dark column of fuel, revealed when the dome lifts -->
		<g id="reactor-core" data-part="core" opacity={coreGlow}>
			<rect x="124" y="176" width="72" height="180" rx="8" fill="url(#zj-core)" />
			<rect x="124" y="176" width="72" height="180" rx="8" fill="url(#zj-hot)" opacity={coreGlow * 0.45} />
			{#each [0, 1, 2, 3, 4] as i}
				<line
					x1={134 + i * 13}
					y1="184"
					x2={134 + i * 13}
					y2="348"
					stroke="#f0a555"
					stroke-width="1.5"
					opacity={0.35 + coreGlow * 0.4}
				/>
			{/each}
			<text x="160" y="368" text-anchor="middle" font-size="9" fill="var(--ink-muted)" opacity={lineDraw}
				>core</text
			>
		</g>

		<!-- part: control rods, lifting out -->
		<g id="reactor-rods" data-part="rods" transform={`translate(0 ${-rodLift})`}>
			{#each [-2, -1, 0, 1, 2] as i}
				<g transform={`translate(${i * (14 + spread * 0.28)} 0)`}>
					<rect
						x="155"
						y="86"
						width="10"
						height="118"
						rx="5"
						fill="url(#zj-steel-dark)"
						opacity={metal}
					/>
					<rect
						x="155"
						y="86"
						width="10"
						height="118"
						rx="5"
						fill="none"
						stroke="var(--ink)"
						stroke-width="1.2"
						opacity={lineDraw}
					/>
					<circle cx="160" cy="82" r="6" fill="url(#zj-steel)" opacity={metal} />
					<circle
						cx="160"
						cy="82"
						r="6"
						fill="none"
						stroke="var(--ink)"
						stroke-width="1.2"
						opacity={lineDraw}
					/>
				</g>
			{/each}
		</g>

		<!-- part: dome, the rounded lid rising off -->
		<g id="reactor-dome" data-part="dome" transform={`translate(0 ${-domeLift})`}>
			<path d="M84 164 A76 60 0 0 1 236 164 Z" fill="url(#zj-steel)" opacity={metal} />
			<path d="M84 164 A76 60 0 0 1 236 164 Z" fill="url(#zj-sheen)" opacity={metal} />
			<path
				d="M84 164 A76 60 0 0 1 236 164 Z"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.6"
				opacity={lineDraw}
			/>
			<rect x="80" y="160" width="160" height="12" rx="6" fill="url(#zj-steel-dark)" opacity={metal} />
			<rect
				x="80"
				y="160"
				width="160"
				height="12"
				rx="6"
				fill="none"
				stroke="var(--ink)"
				stroke-width="1.4"
				opacity={lineDraw}
			/>
		</g>

		<!-- part: helium circuit, drawn on as the metal resolves -->
		<g id="reactor-circuit" data-part="helium-circuit" opacity={lineDraw} fill="none">
			<path
				d="M236 210 H286 V330 H236"
				stroke="var(--accent)"
				stroke-width="1.6"
				stroke-dasharray="4 3"
			/>
			<circle cx="286" cy="270" r="13" stroke="var(--accent)" stroke-width="1.6" />
			<text x="286" y="296" text-anchor="middle" font-size="8" fill="var(--accent)">He</text>
			<path d="M84 232 H34 V320 H84" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3" />
			<text x="34" y="338" text-anchor="middle" font-size="8" fill="var(--accent)">750 C</text>
		</g>
	</svg>

	{#if mode === 'still'}
		<p class="visually-hidden">
			The reactor is shown as one still technical drawing because reduced motion is set. No
			information is lost: every stage is written out beside it.
		</p>
	{/if}
</div>

<style>
	.reactor {
		width: 100%;
		max-width: var(--size);
		margin: 0 auto;
		/* none-except-focus: the parts move with scroll position, never on a timer */
	}
	.reactor svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
