const INTERNAL_PORT = process.env?.PORT || '4173';
const INTERNAL_BASE = `http://127.0.0.1:${INTERNAL_PORT}`;

export class ApiError extends Error {
	constructor(status, payload) {
		super(payload?.message || `Request failed with status ${status}`);
		this.status = status;
		this.payload = payload;
	}
}

function resolve(path) {
	if (typeof window !== 'undefined') return path;
	return `${INTERNAL_BASE}${path}`;
}

export async function api(path, options = {}) {
	const { token, method = 'GET', body, headers = {}, fetch: f } = options;
	const doFetch = f || fetch;
	const init = { method, headers: { ...headers } };
	if (body !== undefined) {
		init.headers['content-type'] = 'application/json';
		init.body = JSON.stringify(body);
	}
	if (token) init.headers['authorization'] = `Bearer ${token}`;
	const res = await doFetch(resolve(path), init);
	const text = await res.text();
	let payload = null;
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = { message: text };
		}
	}
	if (!res.ok) throw new ApiError(res.status, payload);
	return { data: payload, headers: res.headers, status: res.status };
}

export async function apiData(path, options) {
	const { data } = await api(path, options);
	return data;
}

/** Returns null instead of throwing when the call fails. */
export async function apiTry(path, options) {
	try {
		return await apiData(path, options);
	} catch {
		return null;
	}
}
