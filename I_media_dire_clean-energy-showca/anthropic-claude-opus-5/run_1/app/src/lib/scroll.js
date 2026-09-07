import { browser } from '$app/environment';

export function prefersReducedMotion() {
	if (!browser) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Binds an element's reveal to scroll position rather than a duration, so it
 * runs backwards on the way up. Under reduced motion it holds the finished
 * frame from the start. Returns a Svelte action.
 */
export function scrollBound(node, options = {}) {
	const { onProgress, start = 0.9, end = 0.35 } = options;
	if (!browser) return {};

	if (prefersReducedMotion()) {
		node.style.setProperty('--reveal', '1');
		onProgress?.(1);
		return {};
	}

	let frame = 0;

	function measure() {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const startY = vh * start;
		const endY = vh * end;
		const raw = (startY - rect.top) / Math.max(1, startY - endY);
		const value = Math.max(0, Math.min(1, raw));
		node.style.setProperty('--reveal', String(value));
		onProgress?.(value);
	}

	function onScroll() {
		if (frame) return;
		frame = requestAnimationFrame(measure);
	}

	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });

	return {
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		}
	};
}

/** Progress of a tall section through the viewport, 0..1. */
export function sceneProgress(node, onProgress) {
	if (!browser) return {};
	if (prefersReducedMotion()) {
		onProgress?.(0.55);
		return {};
	}
	let frame = 0;
	function measure() {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const total = Math.max(1, rect.height - vh);
		const value = Math.max(0, Math.min(1, -rect.top / total));
		onProgress?.(value);
	}
	function onScroll() {
		if (frame) return;
		frame = requestAnimationFrame(measure);
	}
	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	return {
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		}
	};
}
