import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { api } from './api.js';

const TOKEN_KEY = 'zj.token';
const ACCOUNT_KEY = 'zj.account';
const SAVE_TOKEN_KEY = 'zj.save_token';
const COMPARE_KEY = 'zj.compare';

function readLocal(key) {
	if (!browser) return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeLocal(key, value) {
	if (!browser) return;
	try {
		if (value === null || value === undefined) window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, value);
	} catch {
		/* storage unavailable */
	}
}

export const token = writable(readLocal(TOKEN_KEY));
export const account = writable(
	(() => {
		const raw = readLocal(ACCOUNT_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch {
			return null;
		}
	})()
);
export const saveToken = writable(readLocal(SAVE_TOKEN_KEY));
export const compareList = writable(
	(() => {
		const raw = readLocal(COMPARE_KEY);
		if (!raw) return [];
		try {
			const v = JSON.parse(raw);
			return Array.isArray(v) ? v.slice(0, 4) : [];
		} catch {
			return [];
		}
	})()
);

token.subscribe((v) => writeLocal(TOKEN_KEY, v));
account.subscribe((v) => writeLocal(ACCOUNT_KEY, v ? JSON.stringify(v) : null));
saveToken.subscribe((v) => writeLocal(SAVE_TOKEN_KEY, v));
compareList.subscribe((v) => writeLocal(COMPARE_KEY, JSON.stringify(v || [])));

export function currentToken() {
	return get(token);
}
export function currentSaveToken() {
	return get(saveToken);
}

export function setSession(tok, acc) {
	token.set(tok);
	account.set(acc || null);
	saveToken.set(null); // claimed on sign in
}

export function clearSession() {
	token.set(null);
	account.set(null);
}

/** An expired token is cleared and the visitor is sent to sign in carrying the current path. */
export async function handleAuthFailure(currentPath) {
	clearSession();
	if (browser) await goto(`/signin?next=${encodeURIComponent(currentPath || '/account')}`);
}

export async function authed(path, options = {}) {
	const tok = get(token);
	try {
		return await api(path, { ...options, token: tok });
	} catch (err) {
		if (err.status === 401 && browser) {
			await handleAuthFailure(window.location.pathname + window.location.search);
		}
		throw err;
	}
}

export async function logout() {
	const tok = get(token);
	if (tok) {
		try {
			await api('/api/auth/logout', { method: 'POST', token: tok });
		} catch {
			/* the local session is cleared regardless */
		}
	}
	clearSession();
	compareList.set([]);
	if (browser) await goto('/');
}
