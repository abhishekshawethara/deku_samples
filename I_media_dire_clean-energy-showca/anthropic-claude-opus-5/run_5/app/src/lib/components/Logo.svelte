
<script>
	/** Stacked lens-shaped bands suggesting a particle circling a core, next to
	 * the company name spelled in letters. Drawn from shapes: no image file. */
	let { size = 26, dark = false } = $props();
</script>

<span class="logo" style="--s:{size}px">
	<svg
		class="mark"
		viewBox="0 0 40 40"
		width={size}
		height={size}
		role="img"
		aria-label="Zettajoule"
		focusable="false"
	>
		<g fill="none" stroke={dark ? '#ffffff' : 'var(--accent)'} stroke-width="2.1">
			<ellipse cx="20" cy="20" rx="17" ry="7" />
			<ellipse cx="20" cy="20" rx="17" ry="7" transform="rotate(60 20 20)" />
			<ellipse cx="20" cy="20" rx="17" ry="7" transform="rotate(120 20 20)" />
		</g>
		<circle cx="20" cy="20" r="4.4" fill={dark ? '#ffffff' : 'var(--ink)'} />
		<circle cx="35.2" cy="15.6" r="2.5" fill={dark ? '#9dc2f6' : 'var(--accent)'} />
	</svg>
	<span class="word" class:dark>Zettajoule</span>
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 9px;
	}
	.mark {
		flex: none;
		display: block;
	}
	.word {
		font-family: var(--font-head);
		font-weight: 800;
		letter-spacing: -0.03em;
		font-size: calc(var(--s) * 0.72);
		color: var(--ink);
		white-space: nowrap;
	}
	.word.dark {
		color: #fff;
	}
</style>
