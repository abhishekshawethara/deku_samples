<script>
	// A generated gradient plate standing in for a photograph. Zero assets:
	// the hue set is derived from the seed so each subject gets a stable plate.
	let {
		seed = 'plate',
		ratio = '16 / 9',
		label = '',
		kind = 'scene',
		radius = 'var(--radius)'
	} = $props();

	function hash(s) {
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return Math.abs(h);
	}

	const h = $derived(hash(seed));
	const a = $derived(198 + (h % 34)); // stays inside the accent hue family
	const b = $derived(24 + (Math.floor(h / 7) % 18)); // a warm cream counterpart
	const isPortrait = $derived(kind === 'portrait');
</script>

<div
	class="plate"
	class:portrait={isPortrait}
	style:aspect-ratio={ratio}
	style:border-radius={radius}
	role="img"
	aria-label={label || 'Generated gradient plate'}
>
	<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
		<defs>
			<linearGradient id={`pg-${h}`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color={`hsl(${a} 62% 88%)`} />
				<stop offset="55%" stop-color={`hsl(${a} 40% 74%)`} />
				<stop offset="100%" stop-color={`hsl(${b} 55% 86%)`} />
			</linearGradient>
			<radialGradient id={`pr-${h}`} cx="0.35" cy="0.3" r="0.8">
				<stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
				<stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
			</radialGradient>
		</defs>
		<rect width="100" height="100" fill={`url(#pg-${h})`} />
		<rect width="100" height="100" fill={`url(#pr-${h})`} />
		{#if isPortrait}
			<circle cx="50" cy="38" r="17" fill={`hsl(${a} 30% 55%)`} opacity="0.55" />
			<path
				d="M18 100 C18 74 32 62 50 62 C68 62 82 74 82 100 Z"
				fill={`hsl(${a} 30% 55%)`}
				opacity="0.55"
			/>
		{:else}
			<g stroke={`hsl(${a} 45% 42%)`} stroke-width="0.6" opacity="0.35" fill="none">
				<path d="M0 72 L26 48 L46 62 L72 30 L100 52" />
				<path d="M0 88 L30 68 L58 80 L78 56 L100 74" />
			</g>
			<circle cx="76" cy="24" r="9" fill={`hsl(${b} 70% 80%)`} opacity="0.7" />
		{/if}
	</svg>
	{#if label}
		<span class="cap">{label}</span>
	{/if}
</div>

<style>
	.plate {
		position: relative;
		width: 100%;
		overflow: hidden;
		background: var(--surface-soft);
		border: 1px solid var(--rule);
	}
	.plate svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	.cap {
		position: absolute;
		left: 10px;
		bottom: 8px;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink);
		background: rgba(255, 255, 255, 0.86);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 2px 9px;
	}
	.portrait {
		background: var(--sky);
	}
</style>
