import { readable } from 'svelte/store';
import { browser } from '$app/environment';

/** True when the visitor has asked their device for reduced motion. */
export const reducedMotion = readable(false, (set) => {
	if (!browser) return;
	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	set(mq.matches);
	const on = () => set(mq.matches);
	mq.addEventListener('change', on);
	return () => mq.removeEventListener('change', on);
});

/** Window scroll offset, updated from a rAF-throttled listener. */
export const scrollY = readable(0, (set) => {
	if (!browser) return;
	let ticking = false;
	const on = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			set(window.scrollY);
			ticking = false;
		});
	};
	on();
	window.addEventListener('scroll', on, { passive: true });
	window.addEventListener('resize', on);
	return () => {
		window.removeEventListener('scroll', on);
		window.removeEventListener('resize', on);
	};
});

/**
 * Bind an element's progress through the viewport to a callback: 0 as it enters
 * from below, 1 once it has passed. Runs backwards on the way up because it
 * reads position rather than playing a timeline.
 */
export function scrollProgress(node, { onprogress, start = 0.9, end = 0.15 } = {}) {
	if (!browser) return {};
	let raf = 0;
	const measure = () => {
		raf = 0;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const from = vh * start;
		const to = vh * end;
		const raw = (from - rect.top) / Math.max(1, from - to + rect.height * 0.4);
		onprogress?.(Math.min(1, Math.max(0, raw)));
	};
	const schedule = () => {
		if (!raf) raf = requestAnimationFrame(measure);
	};
	schedule();
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	return {
		destroy() {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		}
	};
}

/**
 * Reveal: marks the node once it has been reached. Position-bound, so scrolling
 * back unmarks it. Under reduced motion the node is marked immediately.
 */
export function reveal(node, options = {}) {
	if (!browser) return {};
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) {
		node.setAttribute('data-revealed', 'true');
		return {};
	}
	node.setAttribute('data-revealed', 'false');
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				node.setAttribute('data-revealed', e.isIntersecting ? 'true' : 'false');
			}
		},
		{ rootMargin: options.rootMargin || '0px 0px -12% 0px', threshold: options.threshold ?? 0.08 }
	);
	io.observe(node);
	return {
		destroy() {
			io.disconnect();
		}
	};
}
