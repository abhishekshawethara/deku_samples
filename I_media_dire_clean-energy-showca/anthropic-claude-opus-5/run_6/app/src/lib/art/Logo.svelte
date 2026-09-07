<script>
	export let size = 30;
	export let showName = true;
	export let tone = 'ink';
	$: colour = tone === 'light' ? '#ffffff' : 'var(--ink)';
</script>

<span class="logo" style="--logo-colour:{colour}">
	<svg
		width={size}
		height={size}
		viewBox="0 0 40 40"
		role="img"
		aria-label="Zettajoule"
		focusable="false"
	>
		<g fill="none" stroke="var(--logo-colour)" stroke-width="1.6">
			<ellipse cx="20" cy="20" rx="17" ry="6.6" />
			<ellipse cx="20" cy="20" rx="17" ry="6.6" transform="rotate(60 20 20)" />
			<ellipse cx="20" cy="20" rx="17" ry="6.6" transform="rotate(120 20 20)" />
		</g>
		<circle cx="20" cy="20" r="4.2" fill="var(--accent)" />
		<circle cx="36.2" cy="16.6" r="2.3" fill="var(--logo-colour)" />
	</svg>
	{#if showName}<span class="name">Zettajoule</span>{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--logo-colour);
	}
	.name {
		font-family: var(--font-head);
		font-weight: 800;
		letter-spacing: -0.03em;
		font-size: 1.12rem;
		color: var(--logo-colour);
	}
</style>
