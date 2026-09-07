import { browser } from '$app/environment';

export const TOKEN_KEY = 'zj_token';
export const SAVE_TOKEN_KEY = 'zj_save_token';

export function getToken() {
	if (!browser) return null;
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setToken(token) {
	if (!browser) return;
	try {
		if (token) localStorage.setItem(TOKEN_KEY, token);
		else localStorage.removeItem(TOKEN_KEY);
	} catch {
		/* storage unavailable */
	}
}

export function getSaveToken() {
	if (!browser) return null;
	try {
		return localStorage.getItem(SAVE_TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setSaveToken(token) {
	if (!browser) return;
	try {
		if (token) localStorage.setItem(SAVE_TOKEN_KEY, token);
		else localStorage.removeItem(SAVE_TOKEN_KEY);
	} catch {
		/* storage unavailable */
	}
}

export class ApiError extends Error {
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

/**
 * Calls the JSON API on the same origin.
 * `fetchFn` lets load functions pass SvelteKit's fetch for SSR.
 */
export async function api(path, { method = 'GET', body, token, fetchFn, headers = {}, raw = false } = {}) {
	const f = fetchFn || fetch;
	const opts = { method, headers: { ...headers } };
	const auth = token !== undefined ? token : getToken();
	if (auth) opts.headers.Authorization = `Bearer ${auth}`;
	if (body !== undefined) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(body);
	}
	const res = await f(`/api${path}`, opts);
	if (raw) return res;
	if (res.status === 204) return null;

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
		throw new ApiError(
			res.status,
			payload?.message || `The request failed (${res.status}).`,
			payload?.error || 'error'
		);
	}
	return payload;
}

export async function apiWithCount(path, opts = {}) {
	const res = await api(path, { ...opts, raw: true });
	const total = Number(res.headers.get('X-Total-Count'));
	if (!res.ok) {
		let message = `The request failed (${res.status}).`;
		try {
			const payload = await res.json();
			message = payload?.message || message;
		} catch {
			/* no body */
		}
		throw new ApiError(res.status, message, 'error');
	}
	const items = await res.json();
	return { items, total: Number.isFinite(total) ? total : items.length };
}
