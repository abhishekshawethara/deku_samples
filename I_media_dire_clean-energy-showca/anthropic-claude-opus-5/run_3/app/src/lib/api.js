import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token, account, saveTokenStore, clearSession } from './auth.js';
import { get } from 'svelte/store';

export class ApiError extends Error {
	constructor(status, payload) {
		super(payload?.message || `Request failed (${status})`);
		this.status = status;
		this.code = payload?.error || 'error';
		this.payload = payload;
	}
}

/** Fetch the JSON API on the same origin under /api. */
export async function api(path, options = {}) {
	const { method = 'GET', body, auth = true, fetcher = fetch, headers = {} } = options;
	const h = { ...headers };
	if (body !== undefined) h['content-type'] = 'application/json';
	let sentToken = null;
	if (auth && browser) {
		const t = get(token);
		if (t) {
			h.authorization = `Bearer ${t}`;
			sentToken = t;
		}
	}
	const res = await fetcher(`/api${path}`, {
		method,
		headers: h,
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	let payload = null;
	const text = await res.text();
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = { message: text };
		}
	}
	if (!res.ok) {
		// A token we actually sent that the server will not accept is spent: an
		// expired or otherwise invalid one is cleared and the visitor is sent to
		// sign in again, carrying the route they were on.
		const rejectedToken =
			res.status === 401 &&
			browser &&
			sentToken &&
			['token_expired', 'invalid_token', 'unauthorized'].includes(payload?.error);
		if (rejectedToken) {
			clearSession();
			const next = location.pathname + location.search;
			goto(`/signin?next=${encodeURIComponent(next)}`, { replaceState: true });
		}
		throw new ApiError(res.status, payload);
	}
	return { data: payload, headers: res.headers, status: res.status };
}

export async function apiData(path, options) {
	const { data } = await api(path, options);
	return data;
}

export async function login(email, password) {
	const st = get(saveTokenStore);
	const data = await apiData('/auth/login', {
		method: 'POST',
		auth: false,
		body: { email, password, ...(st ? { save_token: st } : {}) }
	});
	token.set(data.access_token);
	account.set(data.account || null);
	saveTokenStore.set(null);
	return data;
}

export async function signup(email, password, display_name) {
	const st = get(saveTokenStore);
	const data = await apiData('/auth/signup', {
		method: 'POST',
		auth: false,
		body: { email, password, display_name, ...(st ? { save_token: st } : {}) }
	});
	token.set(data.access_token);
	account.set({ id: data.id, email: data.email, display_name: data.display_name });
	saveTokenStore.set(null);
	return data;
}
