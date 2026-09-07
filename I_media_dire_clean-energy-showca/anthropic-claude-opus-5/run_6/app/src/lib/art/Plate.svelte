<script>
	/** A generated gradient plate. Stands in for every photograph: industry
	 * plates, team portraits and route grounds. No file is loaded. */
	export let seed = 'zettajoule';
	export let ratio = '16 / 9';
	export let variant = 'industry';
	export let label = '';
	export let caption = '';

	function hash(str) {
		let h = 2166136261;
		for (let i = 0; i < str.length; i++) {
			h ^= str.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return Math.abs(h);
	}

	$: h = hash(seed);
	$: hue = variant === 'portrait' ? 206 + (h % 16) : 198 + (h % 44);
	$: hue2 = variant === 'portrait' ? 214 + (h % 10) : hue + 26 + (h % 20);
	$: ang = 20 + (h % 130);
	$: x1 = 18 + (h % 60);
	$: y1 = 16 + ((h >> 3) % 58);
	$: x2 = 30 + ((h >> 5) % 55);
	$: y2 = 40 + ((h >> 7) % 50);
	$: light = variant === 'portrait' ? 92 : 88;

	$: style = `--pa:${ang}deg;--h1:${hue};--h2:${hue2};--x1:${x1}%;--y1:${y1}%;--x2:${x2}%;--y2:${y2}%;--pl:${light}%;aspect-ratio:${ratio};`;
</script>

<figure class="plate {variant}" {style} role={label ? 'img' : 'presentation'} aria-label={label || null}>
	<div class="wash" aria-hidden="true"></div>
	<svg class="lines" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
		<g fill="none" stroke="hsl(var(--h1) 40% 34% / 0.24)" stroke-width="0.6">
			<path d="M0 {40 + (h % 30)} H200" />
			<path d="M{30 + (h % 40)} 0 V120" />
			<circle cx={70 + (h % 60)} cy={54 + (h % 30)} r={16 + (h % 18)} />
		</g>
	</svg>
	{#if variant === 'portrait'}
		<svg class="figure" viewBox="0 0 120 140" aria-hidden="true">
			<circle cx="60" cy="50" r="24" fill="hsl(var(--h1) 34% 62% / 0.42)" />
			<path d="M18 140 a42 42 0 0 1 84 0 Z" fill="hsl(var(--h1) 34% 58% / 0.42)" />
		</svg>
	{/if}
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.plate {
		position: relative;
		margin: 0;
		width: 100%;
		border-radius: var(--r-lg);
		overflow: hidden;
		background: var(--paper-2);
		border: 1px solid var(--rule);
	}
	.wash {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				60% 70% at var(--x1) var(--y1),
				hsl(var(--h1) 62% 78% / 0.9),
				transparent 70%
			),
			radial-gradient(
				55% 65% at var(--x2) var(--y2),
				hsl(var(--h2) 58% 84% / 0.85),
				transparent 72%
			),
			linear-gradient(var(--pa), hsl(var(--h1) 48% var(--pl)), hsl(var(--h2) 40% 96%));
	}
	.lines {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.figure {
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		height: 84%;
		width: auto;
	}
	.portrait .wash {
		background:
			radial-gradient(70% 60% at 50% 22%, hsl(var(--h1) 60% 92%), transparent 70%),
			linear-gradient(180deg, var(--sky), #f7fafd);
	}
	figcaption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 8px 12px;
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--ink);
		background: rgba(255, 255, 255, 0.86);
		border-top: 1px solid var(--rule);
	}
</style>
