import { writable, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { api, getToken, setToken, getSaveToken, setSaveToken, ApiError } from './api.js';

export const account = writable(null);
export const sessionReady = writable(false);
export const savedSlugs = writable(new Set());

export async function loadSession() {
	if (!browser) return null;
	const token = getToken();
	if (!token) {
		account.set(null);
		sessionReady.set(true);
		await refreshSaves();
		return null;
	}
	try {
		const me = await api('/accounts/me', { token });
		account.set(me);
		sessionReady.set(true);
		await refreshSaves();
		return me;
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) {
			setToken(null);
			account.set(null);
			sessionReady.set(true);
			await refreshSaves();
			if (err.code === 'token_expired') {
				const current = window.location.pathname + window.location.search;
				goto(`/signin?next=${encodeURIComponent(current)}`, { replaceState: true });
			}
			return null;
		}
		sessionReady.set(true);
		return null;
	}
}

export async function refreshSaves() {
	if (!browser) return [];
	const token = getToken();
	const saveToken = getSaveToken();
	if (!token && !saveToken) {
		savedSlugs.set(new Set());
		return [];
	}
	try {
		const rows = await api(`/saves${!token && saveToken ? `?save_token=${encodeURIComponent(saveToken)}` : ''}`);
		savedSlugs.set(new Set(rows.map((r) => r.slug)));
		return rows;
	} catch {
		savedSlugs.set(new Set());
		return [];
	}
}

export async function signIn(email, password) {
	const saveToken = getSaveToken();
	const res = await api('/auth/login', {
		method: 'POST',
		token: null,
		body: { email, password, ...(saveToken ? { save_token: saveToken } : {}) }
	});
	setToken(res.access_token);
	if (saveToken) setSaveToken(null);
	account.set(res.account);
	await refreshSaves();
	return res;
}

export async function signUp(email, password, displayName) {
	const saveToken = getSaveToken();
	const res = await api('/auth/signup', {
		method: 'POST',
		token: null,
		body: {
			email,
			password,
			display_name: displayName,
			...(saveToken ? { save_token: saveToken } : {})
		}
	});
	setToken(res.access_token);
	if (saveToken) setSaveToken(null);
	account.set({ id: res.id, email: res.email, display_name: res.display_name });
	await refreshSaves();
	return res;
}

export async function signOut() {
	setToken(null);
	account.set(null);
	savedSlugs.set(new Set());
	await goto('/');
}

export function isSignedIn() {
	return !!get(account);
}
