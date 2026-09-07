<script>
	// Stacked lens-shaped bands suggesting a particle circling a core, drawn as
	// shapes, next to the company name spelled in letters. No asset file.
	let { size = 26, showName = true, tone = 'ink' } = $props();
	const stroke = tone === 'light' ? '#ffffff' : 'var(--accent)';
	const core = tone === 'light' ? '#ffffff' : 'var(--ink)';
	const word = tone === 'light' ? '#ffffff' : 'var(--ink)';
</script>

<span class="logo">
	<svg
		width={size}
		height={size}
		viewBox="0 0 32 32"
		aria-hidden="true"
		focusable="false"
		class="logo__mark"
	>
		<ellipse cx="16" cy="16" rx="13.5" ry="5.2" fill="none" {stroke} stroke-width="1.8" />
		<ellipse
			cx="16"
			cy="16"
			rx="13.5"
			ry="5.2"
			fill="none"
			{stroke}
			stroke-width="1.8"
			transform="rotate(60 16 16)"
		/>
		<ellipse
			cx="16"
			cy="16"
			rx="13.5"
			ry="5.2"
			fill="none"
			{stroke}
			stroke-width="1.8"
			transform="rotate(120 16 16)"
		/>
		<circle cx="16" cy="16" r="3.1" fill={core} />
	</svg>
	{#if showName}
		<span class="logo__word" style:color={word}>Zettajoule</span>
	{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.logo__word {
		font-family: var(--font-head);
		font-size: 1.02rem;
		letter-spacing: -0.02em;
		white-space: nowrap;
	}
</style>
