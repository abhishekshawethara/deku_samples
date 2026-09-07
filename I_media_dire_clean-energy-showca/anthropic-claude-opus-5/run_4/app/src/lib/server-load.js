/**
 * Load helpers for SSR.
 *
 * These run only in +page.server.js, in the same Node process that serves the
 * Fastify API. SvelteKit resolves a relative fetch against its own router, so
 * `/api/...` would never reach Fastify; we address the listener directly on the
 * loopback interface instead. It is the same origin the browser uses, one hop
 * over real HTTP, so first paint carries complete HTML from the database.
 */
const PORT = process.env.PORT || 4173;
const INTERNAL_ORIGIN = process.env.INTERNAL_API_ORIGIN || `http://127.0.0.1:${PORT}`;

async function request(path) {
	return fetch(`${INTERNAL_ORIGIN}/api${path}`, {
		headers: { accept: 'application/json' }
	});
}

export async function loadJson(_fetchFn, path, fallback = null) {
	try {
		const res = await request(path);
		if (!res.ok) return fallback;
		return await res.json();
	} catch (err) {
		console.error(JSON.stringify({ level: 'error', msg: 'ssr load failed', path, err: err.message }));
		return fallback;
	}
}

export async function loadJsonWithCount(_fetchFn, path, fallback = []) {
	try {
		const res = await request(path);
		if (!res.ok) return { items: fallback, total: 0 };
		const items = await res.json();
		const total = Number(res.headers.get('X-Total-Count'));
		return { items, total: Number.isFinite(total) ? total : items.length };
	} catch (err) {
		console.error(JSON.stringify({ level: 'error', msg: 'ssr load failed', path, err: err.message }));
		return { items: fallback, total: 0 };
	}
}
