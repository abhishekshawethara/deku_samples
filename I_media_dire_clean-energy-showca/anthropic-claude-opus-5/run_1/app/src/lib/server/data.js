/** Resolved per call so it always reflects the environment the container was started with. */
function base() {
	return `http://127.0.0.1:${process.env.PORT || '4173'}`;
}

/**
 * Reads the JSON API from a server-side load.
 *
 * This deliberately uses Node's own fetch rather than SvelteKit's `event.fetch`.
 * `event.fetch` resolves a same-origin path inside SvelteKit's own router, which
 * never sees the `/api` prefix because Fastify answers those routes before the
 * SvelteKit handler is reached. Going over the loopback listener reaches the
 * real API, so a page renders from exactly what a client would be served.
 */
export async function get(path) {
	const res = await globalThis.fetch(`${base()}${path}`);
	if (!res.ok) {
		const err = new Error(`API ${path} responded ${res.status}`);
		err.status = res.status;
		throw err;
	}
	return { data: await res.json(), headers: res.headers };
}

export async function getData(path) {
	const { data } = await get(path);
	return data;
}

export async function copyFor(routeKey) {
	const rows = await getData(`/api/copy?route_key=${encodeURIComponent(routeKey)}`);
	const map = {};
	for (const row of rows) map[row.block_key] = row;
	return map;
}
