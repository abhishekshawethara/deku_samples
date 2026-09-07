
<script>
	/** Every photographic area, the industry plates, the team portraits and the
	 * route grounds, is a soft generated gradient in the site's own tones.
	 * Nothing is downloaded: the seed decides the angle and the stops. */
	let { seed = 'zettajoule', height = 160, kind = 'plate', label = '', figure = false } = $props();

	function hash(s) {
		let h = 2166136261;
		for (let i = 0; i < s.length; i += 1) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return Math.abs(h);
	}

	let h = $derived(hash(seed));
	let angle = $derived(110 + (h % 90));
	let hue = $derived(206 + ((h >> 3) % 26) - 13);
	let lift = $derived(6 + ((h >> 7) % 16));
	let x = $derived(16 + ((h >> 5) % 60));
	let y = $derived(10 + ((h >> 9) % 40));
</script>

<div
	class="plate-outer"
	class:portrait={kind === 'portrait'}
	style="--h:{height}px; --a:{angle}deg; --hue:{hue}; --lift:{lift}%; --x:{x}%; --y:{y}%"
	role={figure ? 'img' : undefined}
	aria-label={figure ? label : undefined}
	aria-hidden={figure ? undefined : 'true'}
>
	{#if kind === 'portrait'}
		<!-- a portrait plate: a figure suggested with shapes, on a soft blue-white tint -->
		<svg viewBox="0 0 120 140" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true">
			<circle cx="60" cy="52" r="25" fill="rgba(255,255,255,0.62)" />
			<path d="M18 140 C18 104 36 88 60 88 C84 88 102 104 102 140 Z" fill="rgba(255,255,255,0.5)" />
			<circle cx="60" cy="52" r="25" fill="none" stroke="rgba(34,31,27,0.22)" stroke-width="1.2" />
			<path
				d="M18 140 C18 104 36 88 60 88 C84 88 102 104 102 140"
				fill="none"
				stroke="rgba(34,31,27,0.22)"
				stroke-width="1.2"
			/>
		</svg>
	{:else if kind === 'diagram'}
		<svg viewBox="0 0 200 120" preserveAspectRatio="none" focusable="false" aria-hidden="true">
			<g fill="none" stroke="rgba(34,31,27,0.34)" stroke-width="1.2">
				<rect x="18" y="26" width="52" height="68" rx="6" />
				<rect x="96" y="42" width="42" height="40" rx="4" />
				<circle cx="168" cy="62" r="17" />
				<path d="M70 46 H96 M138 62 H151" />
				<path d="M44 26 V12 M44 94 V108" stroke-dasharray="3 3" />
			</g>
		</svg>
	{/if}
</div>

<style>
	.plate-outer {
		height: var(--h);
		border-radius: var(--radius);
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(90% 70% at var(--x) var(--y), rgba(255, 255, 255, 0.92), transparent 62%),
			linear-gradient(
				var(--a),
				hsl(var(--hue) 62% calc(84% + var(--lift) * 0.2)) 0%,
				hsl(var(--hue) 54% 74%) 52%,
				hsl(calc(var(--hue) + 8) 40% 60%) 100%
			);
		/* fades softly at its edges */
		-webkit-mask-image: radial-gradient(120% 120% at 50% 46%, #000 60%, rgba(0, 0, 0, 0.6) 100%);
		mask-image: radial-gradient(120% 120% at 50% 46%, #000 60%, rgba(0, 0, 0, 0.6) 100%);
	}
	.plate-outer.portrait {
		background:
			radial-gradient(80% 70% at 50% 18%, #ffffff, transparent 60%),
			linear-gradient(var(--a), var(--sky) 0%, var(--sky-deep) 100%);
	}
	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
</style>
