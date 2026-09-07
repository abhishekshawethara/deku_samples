<script>
	export let size = 28;
	export let mono = false;
</script>

<span class="logo" style="--s:{size}px">
	<svg
		width={size}
		height={size}
		viewBox="0 0 32 32"
		role="img"
		aria-label="Zettajoule mark: a particle circling a core"
		focusable="false"
	>
		<g fill="none" stroke={mono ? 'currentColor' : 'var(--navy)'} stroke-width="1.7" stroke-linecap="round">
			<ellipse cx="16" cy="16" rx="14" ry="5.6" />
			<ellipse cx="16" cy="16" rx="14" ry="5.6" transform="rotate(60 16 16)" />
			<ellipse cx="16" cy="16" rx="14" ry="5.6" transform="rotate(120 16 16)" />
		</g>
		<circle cx="16" cy="16" r="4" fill={mono ? 'currentColor' : 'var(--accent)'} />
	</svg>
	<span class="logo__word">Zettajoule</span>
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-head);
		font-size: calc(var(--s) * 0.62);
		letter-spacing: -0.02em;
		color: inherit;
		line-height: 1;
	}
	.logo__word {
		white-space: nowrap;
	}
</style>
