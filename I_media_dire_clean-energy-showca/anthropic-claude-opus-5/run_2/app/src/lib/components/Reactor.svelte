<script>
	// The reactor: every part is a named shape, drawn from code, no asset file.
	// The sequence is bound to scroll position, so it runs backwards on the way up
	// and holds one still frame under reduced motion.
	import { onMount, onDestroy } from 'svelte';

	export let progress = 0; // 0 whole and metallic, 1 resolved to a line drawing
	export let mode = 'metal'; // 'metal' | 'diagram'
	export let height = 460;

	let reduced = false;
	let mql;

	onMount(() => {
		mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduced = mql.matches;
		const onChange = (e) => (reduced = e.matches);
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	});
	onDestroy(() => {});

	// Under reduced motion the sequence holds one clean still frame.
	$: p = reduced ? 0.55 : Math.max(0, Math.min(1, progress));
	$: rodLift = p * 92;
	$: domeLift = Math.max(0, (p - 0.15) / 0.55) * 120;
	$: lineness = mode === 'diagram' ? 1 : Math.max(0, (p - 0.62) / 0.38);
	$: coreReveal = Math.max(0, Math.min(1, (p - 0.28) / 0.4));
</script>

<div class="reactor" style="--h:{height}px" data-progress={p.toFixed(2)} data-mode={mode}>
	<svg viewBox="0 0 320 460" role="img" aria-label="Cutaway of a high-temperature gas-cooled reactor module" focusable="false">
		<defs>
			<linearGradient id="rx-metal" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#8f9aa6" />
				<stop offset="18%" stop-color="#e8edf3" />
				<stop offset="38%" stop-color="#aab6c3" />
				<stop offset="55%" stop-color="#f4f7fa" />
				<stop offset="76%" stop-color="#9aa6b3" />
				<stop offset="100%" stop-color="#6f7a86" />
			</linearGradient>
			<linearGradient id="rx-metal-dark" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#5c6672" />
				<stop offset="30%" stop-color="#c3ccd6" />
				<stop offset="60%" stop-color="#78838f" />
				<stop offset="100%" stop-color="#48515b" />
			</linearGradient>
			<linearGradient id="rx-core" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#3a2b20" />
				<stop offset="50%" stop-color="#6b3d16" />
				<stop offset="100%" stop-color="#241a13" />
			</linearGradient>
			<linearGradient id="rx-glow" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#ffb35c" stop-opacity="0.85" />
				<stop offset="100%" stop-color="#ff7a18" stop-opacity="0.25" />
			</linearGradient>
		</defs>

		<!-- base -->
		<g class="part" data-part="base">
			<rect x="52" y="392" width="216" height="26" rx="6" fill="url(#rx-metal-dark)" opacity={1 - lineness} />
			<rect
				x="52"
				y="392"
				width="216"
				height="26"
				rx="6"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1.4"
				opacity={lineness}
			/>
			<rect x="86" y="418" width="148" height="12" rx="4" fill="#5c6672" opacity={(1 - lineness) * 0.9} />
		</g>

		<!-- vessel -->
		<g class="part" data-part="vessel">
			<rect x="86" y="150" width="148" height="248" rx="16" fill="url(#rx-metal)" opacity={1 - lineness} />
			<rect
				x="86"
				y="150"
				width="148"
				height="248"
				rx="16"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1.4"
				opacity={lineness}
			/>
			<line x1="86" y1="205" x2="234" y2="205" stroke="#ffffff" stroke-opacity={(1 - lineness) * 0.5} />
			<line x1="86" y1="330" x2="234" y2="330" stroke="#38414c" stroke-opacity={(1 - lineness) * 0.35} />
		</g>

		<!-- core, laid bare as the sequence runs -->
		<g class="part" data-part="core" opacity={coreReveal}>
			<rect x="126" y="196" width="68" height="176" rx="8" fill="url(#rx-core)" opacity={1 - lineness} />
			<rect
				x="126"
				y="196"
				width="68"
				height="176"
				rx="8"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1.2"
				opacity={lineness}
			/>
			<rect x="134" y="204" width="52" height="160" rx="6" fill="url(#rx-glow)" opacity={(1 - lineness) * 0.8} />
			{#each [0, 1, 2, 3, 4, 5] as i}
				<line
					x1="134"
					y1={214 + i * 28}
					x2="186"
					y2={214 + i * 28}
					stroke={lineness > 0.5 ? 'var(--accent)' : '#e6c79a'}
					stroke-opacity="0.7"
					stroke-width="1"
				/>
			{/each}
		</g>

		<!-- graphite reflector -->
		<g class="part" data-part="reflector" opacity={coreReveal * 0.9}>
			<rect
				x="108"
				y="188"
				width="104"
				height="192"
				rx="10"
				fill="none"
				stroke={lineness > 0.5 ? 'var(--accent)' : '#8b949f'}
				stroke-dasharray="4 4"
				stroke-width="1.1"
			/>
		</g>

		<!-- control rods, they lift up and pull free -->
		<g class="part" data-part="rods" transform="translate(0 {-rodLift})">
			{#each [0, 1, 2, 3] as i}
				<rect
					x={128 + i * 18}
					y="96"
					width="8"
					height="108"
					rx="3"
					fill="url(#rx-metal-dark)"
					opacity={1 - lineness}
				/>
				<rect
					x={128 + i * 18}
					y="96"
					width="8"
					height="108"
					rx="3"
					fill="none"
					stroke="var(--accent)"
					stroke-width="1.1"
					opacity={lineness}
				/>
				<circle cx={132 + i * 18} cy="92" r="5" fill={lineness > 0.5 ? 'none' : '#6f7a86'} stroke="var(--accent)" stroke-width={lineness} />
			{/each}
		</g>

		<!-- dome, the rounded lid rises off -->
		<g class="part" data-part="dome" transform="translate(0 {-domeLift})">
			<path
				d="M86 158 A74 56 0 0 1 234 158 Z"
				fill="url(#rx-metal)"
				opacity={1 - lineness}
			/>
			<path
				d="M86 158 A74 56 0 0 1 234 158 Z"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1.4"
				opacity={lineness}
			/>
			<path d="M108 140 A54 40 0 0 1 212 140" fill="none" stroke="#ffffff" stroke-opacity={(1 - lineness) * 0.55} />
		</g>

		<!-- helium loop out to the heat user -->
		<g class="part" data-part="helium-loop" opacity={coreReveal}>
			<path
				d="M234 240 H286 V344 H234"
				fill="none"
				stroke={lineness > 0.5 ? 'var(--accent)' : '#7f8a96'}
				stroke-width="2"
			/>
			<path
				d="M86 268 H34 V316 H86"
				fill="none"
				stroke={lineness > 0.5 ? 'var(--accent)' : '#7f8a96'}
				stroke-width="2"
			/>
		</g>
	</svg>
</div>

<style>
	.reactor {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	.reactor svg {
		width: 100%;
		max-width: 340px;
		height: var(--h);
	}
</style>
