import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { api, ApiError } from './api.js';

const TOKEN_KEY = 'zj_token';
const SAVE_TOKEN_KEY = 'zj_save_token';

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
export const account = writable(null);
export const authReady = writable(false);
export const saveToken = writable(readLocal(SAVE_TOKEN_KEY));

token.subscribe((v) => writeLocal(TOKEN_KEY, v));
saveToken.subscribe((v) => writeLocal(SAVE_TOKEN_KEY, v));

export function currentToken() {
	return get(token);
}

export function currentSaveToken() {
	return get(saveToken);
}

export function setSaveToken(v) {
	if (v) saveToken.set(v);
}

export function clearSaveToken() {
	saveToken.set(null);
}

export function setSession(accessToken, acct) {
	token.set(accessToken);
	account.set(acct || null);
}

export async function loadAccount() {
	const t = get(token);
	if (!t) {
		account.set(null);
		authReady.set(true);
		return null;
	}
	try {
		const { data } = await api('/api/accounts/me', { token: t });
		account.set(data);
		authReady.set(true);
		return data;
	} catch (err) {
		if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
			token.set(null);
			account.set(null);
		}
		authReady.set(true);
		return null;
	}
}

export async function signOut() {
	const t = get(token);
	token.set(null);
	account.set(null);
	if (t) {
		try {
			await api('/api/auth/logout', { method: 'POST', token: t });
		} catch {
			/* best effort */
		}
	}
	await goto('/');
}

/** Called when an authenticated call comes back 401: clear and bounce to sign in. */
export async function expireSession(currentPath) {
	token.set(null);
	account.set(null);
	await goto(`/signin?next=${encodeURIComponent(currentPath)}`);
}
