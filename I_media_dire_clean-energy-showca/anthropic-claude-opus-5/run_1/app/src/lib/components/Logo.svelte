<script>
	// Stacked lens-shaped bands suggesting a particle circling a core,
	// beside the company name spelled in letters. Drawn, never an image file.
	let { size = 26, inverse = false } = $props();
	const ink = $derived(inverse ? '#ffffff' : 'var(--ink)');
</script>

<span class="logo">
	<svg
		width={size}
		height={size}
		viewBox="0 0 32 32"
		role="img"
		aria-label="Zettajoule mark"
		focusable="false"
	>
		<g fill="none" stroke={ink} stroke-width="1.6">
			<ellipse cx="16" cy="16" rx="13.5" ry="5.5" />
			<ellipse cx="16" cy="16" rx="13.5" ry="5.5" transform="rotate(60 16 16)" />
			<ellipse cx="16" cy="16" rx="13.5" ry="5.5" transform="rotate(120 16 16)" />
		</g>
		<circle cx="16" cy="16" r="3.4" fill="var(--accent)" />
		<circle cx="27.5" cy="12.4" r="2" fill={ink} />
	</svg>
	<span class="word" style:color={inverse ? '#fff' : 'var(--ink)'}>Zettajoule</span>
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 9px;
	}
	.word {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.03rem;
		letter-spacing: -0.02em;
	}
	@media (max-width: 400px) {
		.word {
			font-size: 0.92rem;
		}
	}
</style>
