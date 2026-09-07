<script>
	// Headings split into lines that rise into place from behind an edge. The
	// reveal is bound to scroll position, so it runs backwards on the way up,
	// and under reduced motion the text is already in place and still.
	import { reveal } from './scroll.js';

	let { text = '', as = 'h2', class: klass = '', id = undefined } = $props();
	const lines = $derived(String(text).split('\n'));
</script>

<svelte:element this={as} {id} class="reveal {klass}" use:reveal>
	{#each lines as line, i}
		<span class="reveal__mask"><span class="reveal__line" style:--i={i}>{line}</span></span>
	{/each}
</svelte:element>

<style>
	.reveal {
		display: block;
	}
	.reveal__mask {
		display: block;
		overflow: hidden;
	}
	.reveal__line {
		display: block;
		transform: translateY(105%);
		transition: transform 620ms cubic-bezier(0.16, 0.84, 0.28, 1);
		transition-delay: calc(var(--i) * 80ms);
	}
	:global([data-revealed='true']) .reveal__line {
		transform: translateY(0);
	}
	@media (prefers-reduced-motion: reduce) {
		.reveal__line {
			transform: none !important;
			transition: none !important;
		}
	}
</style>
