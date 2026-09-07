import { browser } from '$app/environment';
import { goto } from '$app/navigation';

const TOKEN_KEY = 'zj_token';
const ACCOUNT_KEY = 'zj_account';
const SAVE_TOKEN_KEY = 'zj_save_token';

export function getToken() {
	if (!browser) return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function getAccount() {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(ACCOUNT_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function setSession(token, account) {
	if (!browser) return;
	localStorage.setItem(TOKEN_KEY, token);
	if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
	window.dispatchEvent(new CustomEvent('zj:session'));
}

export function clearSession() {
	if (!browser) return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(ACCOUNT_KEY);
	window.dispatchEvent(new CustomEvent('zj:session'));
}

export function getSaveToken() {
	if (!browser) return null;
	return localStorage.getItem(SAVE_TOKEN_KEY);
}

export function setSaveToken(token) {
	if (!browser || !token) return;
	localStorage.setItem(SAVE_TOKEN_KEY, token);
	window.dispatchEvent(new CustomEvent('zj:saves'));
}

export function clearSaveToken() {
	if (!browser) return;
	localStorage.removeItem(SAVE_TOKEN_KEY);
}

export class ApiError extends Error {
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

/**
 * Call the JSON API on the same origin. An expired token is cleared and the
 * visitor is sent to /signin?next=<current>.
 */
export async function api(path, options = {}) {
	const { method = 'GET', body, auth = true, fetcher, signal } = options;
	const headers = { Accept: 'application/json' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	const token = auth ? getToken() : null;
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const f = fetcher || (browser ? window.fetch.bind(window) : fetch);
	const res = await f(`/api${path}`, {
		method,
		headers,
		signal,
		...(body !== undefined ? { body: JSON.stringify(body) } : {})
	});

	let payload = null;
	const text = await res.text();
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = null;
		}
	}

	if (res.status === 401 && browser && token) {
		const code = payload?.error;
		if (code === 'token_expired' || code === 'unauthorized') {
			clearSession();
			const here = window.location.pathname + window.location.search;
			goto(`/signin?next=${encodeURIComponent(here)}`);
		}
	}

	if (!res.ok) {
		throw new ApiError(
			res.status,
			payload?.message || `Request failed with status ${res.status}`,
			payload?.error
		);
	}

	return { data: payload, headers: res.headers, status: res.status };
}

export async function apiData(path, options) {
	const { data } = await api(path, options);
	return data;
}

export function qs(params) {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params || {})) {
		if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
	}
	const s = sp.toString();
	return s ? `?${s}` : '';
}
