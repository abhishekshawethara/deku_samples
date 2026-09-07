<script>
	export let size = 30;
	export let tone = 'var(--accent)';
	export let showName = true;
</script>

<span class="logo">
	<svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Zettajoule mark" focusable="false">
		<g fill="none" stroke={tone} stroke-width="1.6">
			<ellipse cx="20" cy="20" rx="17" ry="6.5" />
			<ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(60 20 20)" />
			<ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(120 20 20)" />
		</g>
		<circle cx="20" cy="20" r="4" fill={tone} />
		<circle cx="35.4" cy="16.6" r="2.2" fill="var(--navy)" />
	</svg>
	{#if showName}<span class="name">Zettajoule</span>{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 9px;
	}
	.name {
		font-family: var(--font-heading);
		font-weight: 800;
		letter-spacing: -0.02em;
		font-size: 1.12rem;
		color: var(--ink);
	}
</style>
