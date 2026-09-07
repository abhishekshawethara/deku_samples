<script>
	// Every "photograph" is a generated gradient plate in the site's own tones.
	// Nothing is downloaded: the seed decides the angle and the stops.
	export let seed = 'zettajoule';
	export let ratio = '16 / 9';
	export let label = '';
	export let kind = 'industry'; // industry | portrait | story | ground

	function hash(s) {
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return Math.abs(h);
	}

	$: h = hash(String(seed));
	$: angle = h % 360;
	$: a = 195 + (h % 40);
	$: b = 205 + ((h >> 3) % 35);
	$: light = 88 - ((h >> 5) % 16);
	$: tint =
		kind === 'portrait'
			? `linear-gradient(${160 + (h % 40)}deg, var(--sky) 0%, #ffffff 58%, var(--sky-deep) 100%)`
			: kind === 'story'
				? `linear-gradient(${angle}deg, hsl(${a} 60% ${light}%) 0%, hsl(${b} 45% ${Math.min(96, light + 8)}%) 55%, var(--sky) 100%)`
				: kind === 'ground'
					? `linear-gradient(180deg, #eaf1fb 0%, #fbf6ee 100%)`
					: `linear-gradient(${angle}deg, hsl(${a} 55% ${light}%) 0%, hsl(${b} 38% ${Math.min(95, light + 10)}%) 62%, #ffffff 100%)`;
</script>

<div class="plate-wrap" style="aspect-ratio:{ratio}; background:{tint}" role={label ? 'img' : 'presentation'} aria-label={label || undefined}>
	<svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
		<g stroke="rgba(13,33,69,0.16)" fill="none" stroke-width="0.7">
			<circle cx={30 + (h % 60)} cy={40 + ((h >> 4) % 40)} r={18 + (h % 22)} />
			<circle cx={120 + ((h >> 2) % 50)} cy={30 + ((h >> 6) % 60)} r={12 + ((h >> 1) % 26)} />
			<line x1="0" y1={90 - (h % 30)} x2="200" y2={40 + (h % 40)} />
			<line x1={20 + (h % 90)} y1="0" x2={60 + (h % 100)} y2="120" />
		</g>
	</svg>
	{#if $$slots.default}<div class="plate-content"><slot /></div>{/if}
</div>

<style>
	.plate-wrap {
		position: relative;
		width: 100%;
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--rule);
		-webkit-mask-image: radial-gradient(120% 120% at 50% 40%, #000 60%, rgba(0, 0, 0, 0.86) 100%);
		mask-image: radial-gradient(120% 120% at 50% 40%, #000 60%, rgba(0, 0, 0, 0.86) 100%);
	}
	.plate-wrap svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.plate-content {
		position: relative;
		height: 100%;
		display: flex;
		align-items: flex-end;
		padding: 14px;
	}
</style>
