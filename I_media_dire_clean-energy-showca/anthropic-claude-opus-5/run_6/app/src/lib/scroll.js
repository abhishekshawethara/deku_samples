import { browser } from '$app/environment';

function prefersReduced() {
	return browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scroll-bound reveal. Progress is a function of scroll position rather than a
 * duration, so it runs backwards on the way up. Under reduced motion the node
 * is already finished and still.
 */
export function reveal(node, options = {}) {
	if (!browser) return {};
	const { start = 0.92, end = 0.55, stagger = 0 } = options;

	if (prefersReduced()) {
		node.style.setProperty('--rp', '1');
		node.dataset.revealed = 'true';
		return {};
	}

	let raf = null;
	let queued = false;

	const measure = () => {
		queued = false;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const from = vh * start;
		const to = vh * end;
		const p = (from - rect.top) / Math.max(1, from - to);
		const clamped = Math.min(1, Math.max(0, p));
		node.style.setProperty('--rp', String(clamped));
		node.dataset.revealed = clamped > 0.02 ? 'true' : 'false';
	};

	const onScroll = () => {
		if (queued) return;
		queued = true;
		raf = requestAnimationFrame(measure);
	};

	if (stagger) node.style.setProperty('--rs', String(stagger));
	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });

	return {
		destroy() {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (raf) cancelAnimationFrame(raf);
		}
	};
}

/**
 * Binds a 0..1 progress value to how far a section has been scrolled through.
 * Used by the reactor sequence, which runs forwards and backwards with the finger.
 */
export function scrollProgress(node, callback) {
	if (!browser) return {};
	if (prefersReduced()) {
		callback(-1); /* -1 asks the caller to hold one still frame */
		return {};
	}
	let queued = false;
	let raf;

	const measure = () => {
		queued = false;
		const rect = node.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const total = Math.max(1, rect.height - vh);
		const p = Math.min(1, Math.max(0, -rect.top / total));
		callback(p);
	};

	const onScroll = () => {
		if (queued) return;
		queued = true;
		raf = requestAnimationFrame(measure);
	};

	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });

	return {
		destroy() {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (raf) cancelAnimationFrame(raf);
		}
	};
}
