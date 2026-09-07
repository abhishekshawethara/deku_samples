import { browser } from '$app/environment';

/**
 * Fetch the JSON API from inside a load function.
 *
 * In the browser this is an ordinary same-origin call to /api. On the server the
 * API lives in the very same Fastify process that renders the page, so the call
 * is dispatched in process rather than looped back over the network: the page
 * still comes off the same listener and the same database, without a second TCP
 * hop on every server render.
 */
export async function loadJson(fetcher, path, { headers } = {}) {
	if (!browser && typeof globalThis.__zjApiInject === 'function') {
		const res = await globalThis.__zjApiInject(path, headers);
		if (res.status >= 400) {
			const err = new Error(res.body?.message || `Request failed (${res.status})`);
			err.status = res.status;
			throw err;
		}
		const total = res.headers['x-total-count'];
		return { data: res.body, total: total === undefined ? null : Number(total) };
	}

	const res = await fetcher(`/api${path}`, { headers });
	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			message = (await res.clone().json())?.message || message;
		} catch {}
		const err = new Error(message);
		err.status = res.status;
		throw err;
	}
	const total = res.headers.get('x-total-count');
	const data = await res.json();
	return { data, total: total === null ? null : Number(total) };
}
