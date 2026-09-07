<script>
	// A heading or block that rises into place from behind an edge, glued to
	// scroll position. Running the page back up runs it backwards.
	import { scrollBound } from '$lib/scroll.js';

	let { distance = 26, children, className = '' } = $props();
</script>

<div
	class={`reveal ${className}`}
	style:--distance={`${distance}px`}
	use:scrollBound={{ start: 0.95, end: 0.55 }}
>
	<span class="clip">{@render children?.()}</span>
</div>

<style>
	.reveal {
		--reveal: 1;
	}
	.clip {
		display: block;
		opacity: calc(0.15 + var(--reveal) * 0.85);
		transform: translateY(calc((1 - var(--reveal)) * var(--distance)));
	}
</style>
