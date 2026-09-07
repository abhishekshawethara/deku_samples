import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { auth, clearSession } from './stores.js';

export class ApiError extends Error {
	constructor(message, status, body) {
		super(message);
		this.status = status;
		this.body = body;
	}
}

function base(fetchFn) {
	return fetchFn || fetch;
}

export async function api(path, options = {}) {
	const { method = 'GET', body, token, fetch: fetchFn, raw = false, anonymous = false } = options;
	const headers = { accept: 'application/json' };
	if (body !== undefined) headers['content-type'] = 'application/json';

	let bearer = token;
	if (bearer === undefined && browser && !anonymous) bearer = get(auth).token;
	if (bearer) headers.authorization = `Bearer ${bearer}`;

	const res = await base(fetchFn)(`/api${path}`, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	let payload = null;
	const text = await res.text();
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = text;
		}
	}

	if (res.status === 401 && browser && !anonymous && get(auth).token) {
		clearSession();
		const next = location.pathname + location.search;
		goto(`/signin?next=${encodeURIComponent(next)}`, { replaceState: true });
	}

	if (!res.ok) {
		const message =
			(payload && (payload.message || payload.error)) ||
			(res.status === 404 ? 'Not found' : `Request failed (${res.status})`);
		throw new ApiError(message, res.status, payload);
	}

	if (raw) return { data: payload, headers: res.headers, status: res.status };
	return payload;
}

export const get_ = (path, opts) => api(path, { ...opts, method: 'GET' });
export const post = (path, body, opts) => api(path, { ...opts, method: 'POST', body });
export const del = (path, opts) => api(path, { ...opts, method: 'DELETE' });
