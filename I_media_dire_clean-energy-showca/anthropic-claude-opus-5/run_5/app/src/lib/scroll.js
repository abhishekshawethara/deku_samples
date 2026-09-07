import { browser } from '$app/environment';

export function prefersReducedMotion() {
	if (!browser) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Bind an element's --p custom property to scroll position rather than to a
 * duration, so the move runs forwards and backwards with the visitor's finger.
 * Under reduced motion the element holds one finished frame.
 */
export function scrollBound(node, options = {}) {
	if (!browser) return {};
	const { start = 0.92, end = 0.35, onprogress } = options;

	if (prefersReducedMotion()) {
		node.style.setProperty('--p', '1');
		onprogress?.(1);
		return {};
	}

	let frame = 0;

	function measure() {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const startY = start * vh;
		const endY = end * vh;
		const raw = (startY - rect.top) / Math.max(startY - endY, 1);
		const p = Math.max(0, Math.min(1, raw));
		node.style.setProperty('--p', String(p));
		onprogress?.(p);
	}

	function schedule() {
		if (frame) return;
		frame = requestAnimationFrame(measure);
	}

	measure();
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);

	return {
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		}
	};
}

/** Progress of a tall section through the viewport: 0 at its top, 1 at its end. */
export function scrollRange(node, options = {}) {
	if (!browser) return {};
	const { onprogress } = options;

	if (prefersReducedMotion()) {
		onprogress?.(0);
		return {};
	}

	let frame = 0;

	function measure() {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const travel = Math.max(rect.height - vh, 1);
		const p = Math.max(0, Math.min(1, -rect.top / travel));
		onprogress?.(p);
	}

	function schedule() {
		if (frame) return;
		frame = requestAnimationFrame(measure);
	}

	measure();
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);

	return {
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		}
	};
}
