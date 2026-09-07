import { browser } from '$app/environment';

/**
 * During server rendering the JSON API lives on the same listener, so we call it
 * over the container-internal loopback with the platform fetch. SvelteKit's own
 * load fetch is deliberately not used for /api: it applies browser CORS rules to
 * an absolute URL and does not know about routes served by Fastify.
 */
function internalBase() {
	if (browser) return '';
	const port = process.env.PORT || 4173;
	return process.env.INTERNAL_API_BASE || `http://127.0.0.1:${port}`;
}

export function apiUrl(path) {
	return `${internalBase()}${path}`;
}

export async function api(path, options = {}) {
	const { token, method = 'GET', body, headers = {} } = options;
	const h = { ...headers };
	if (body !== undefined) h['Content-Type'] = 'application/json';
	if (token) h.Authorization = `Bearer ${token}`;

	const doFetch = browser ? (options.fetch ?? fetch) : globalThis.fetch;
	const res = await doFetch(apiUrl(path), {
		method,
		headers: h,
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	const total = res.headers.get('X-Total-Count');
	let payload = null;
	const text = await res.text();
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = null;
		}
	}
	if (!res.ok) {
		const err = new Error((payload && payload.message) || `Request failed (${res.status})`);
		err.status = res.status;
		err.code = payload && payload.error;
		throw err;
	}
	if (total !== null && payload && typeof payload === 'object') {
		try {
			Object.defineProperty(payload, 'totalCount', { value: Number(total), enumerable: false });
		} catch {
			/* frozen payload, ignore */
		}
	}
	return payload;
}

export function readableError(err) {
	if (!err) return 'Something went wrong. Try again.';
	if (err.status === 401) return err.message || 'Please sign in and try again.';
	if (err.status === 404) return err.message || 'We could not find that.';
	return err.message || 'Something went wrong. Try again.';
}
