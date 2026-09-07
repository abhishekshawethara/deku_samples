<script>
	/* Every "photograph" on the site: a generated gradient plate derived from a
	   seed string, in the site's own tones. No image file is shipped. */
	export let seed = 'zettajoule';
	export let ratio = '16 / 10';
	export let label = '';
	export let kind = 'plate'; // plate | portrait

	function hash(s) {
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return Math.abs(h);
	}

	$: h = hash(seed);
	$: hue = kind === 'portrait' ? 205 + (h % 18) : 200 + (h % 40);
	$: hue2 = kind === 'portrait' ? 196 + ((h >> 5) % 14) : 26 + ((h >> 5) % 24);
	$: angle = 100 + (h % 90);
	$: x1 = 15 + (h % 60);
	$: y1 = 12 + ((h >> 3) % 60);
	$: x2 = 30 + ((h >> 7) % 60);
	$: y2 = 40 + ((h >> 11) % 50);
	$: bandTop = 22 + ((h >> 9) % 40);
</script>

<div
	class="plate {kind === 'portrait' ? 'plate--portrait' : ''}"
	style="--ratio:{ratio}; --hue:{hue}; --hue2:{hue2}; --angle:{angle}deg; --x1:{x1}%; --y1:{y1}%; --x2:{x2}%; --y2:{y2}%; --band:{bandTop}%"
	role="img"
	aria-label={label || 'Generated gradient plate'}
>
	{#if kind === 'portrait'}
		<svg class="plate__figure" viewBox="0 0 100 120" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
			<circle cx="50" cy="42" r="20" fill="rgba(255,255,255,0.55)" />
			<path d="M14 120 a36 34 0 0 1 72 0 z" fill="rgba(255,255,255,0.45)" />
		</svg>
	{/if}
</div>

<style>
	.plate {
		aspect-ratio: var(--ratio);
		width: 100%;
		border-radius: var(--radius);
		border: 1px solid var(--rule);
		background:
			radial-gradient(60% 70% at var(--x1) var(--y1), hsl(var(--hue) 74% 88%) 0%, transparent 62%),
			radial-gradient(55% 60% at var(--x2) var(--y2), hsl(var(--hue2) 62% 86%) 0%, transparent 58%),
			linear-gradient(var(--angle), hsl(var(--hue) 46% 93%) 0%, hsl(var(--hue2) 40% 95%) 100%);
		position: relative;
		overflow: hidden;
		-webkit-mask-image: radial-gradient(120% 120% at 50% 50%, #000 62%, rgba(0, 0, 0, 0.72) 100%);
		mask-image: radial-gradient(120% 120% at 50% 50%, #000 62%, rgba(0, 0, 0, 0.72) 100%);
	}
	.plate::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: var(--band);
		height: 1px;
		background: rgba(15, 32, 68, 0.14);
	}
	.plate--portrait {
		background:
			radial-gradient(70% 70% at 50% 22%, hsl(var(--hue) 70% 94%) 0%, transparent 70%),
			linear-gradient(178deg, var(--paper-sky) 0%, hsl(var(--hue2) 50% 92%) 100%);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.plate__figure {
		width: 72%;
		height: 88%;
		display: block;
	}
</style>
