import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const prefersReducedMotion = writable(false);

if (browser) {
	const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
	prefersReducedMotion.set(mql.matches);
	mql.addEventListener('change', (e) => prefersReducedMotion.set(e.matches));
}

/**
 * Bind an element's revealed state to scroll position rather than to a duration,
 * so it runs backwards on the way up and holds one still frame under reduced motion.
 */
export function reveal(node, options = {}) {
	if (!browser) return {};
	const start = options.start ?? 0.9;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		node.dataset.revealed = 'true';
		return {};
	}
	let raf = 0;
	const update = () => {
		raf = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const shown = rect.top < vh * start && rect.bottom > 0;
		node.dataset.revealed = shown ? 'true' : 'false';
	};
	const schedule = () => {
		if (!raf) raf = requestAnimationFrame(update);
	};
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	update();
	return {
		destroy() {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		}
	};
}

/**
 * Reports 0..1 of how far the visitor has scrolled through the node, through a callback.
 * Purely scroll-bound: no timers, so scrolling back runs it backwards.
 */
export function scrollProgress(node, callback) {
	if (!browser) return {};
	let raf = 0;
	const update = () => {
		raf = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const span = rect.height + vh;
		const travelled = vh - rect.top;
		const p = Math.max(0, Math.min(1, travelled / span));
		callback?.(p);
	};
	const schedule = () => {
		if (!raf) raf = requestAnimationFrame(update);
	};
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	update();
	return {
		update(cb) {
			callback = cb;
		},
		destroy() {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		}
	};
}
