import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const TOKEN_KEY = 'zj_token';
const ACCOUNT_KEY = 'zj_account';
const SAVE_TOKEN_KEY = 'zj_save_token';

function read(key) {
	if (!browser) return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function readJson(key) {
	const raw = read(key);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function write(key, value) {
	if (!browser) return;
	try {
		if (value === null || value === undefined) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {
		/* storage unavailable */
	}
}

export const auth = writable({
	token: read(TOKEN_KEY),
	account: readJson(ACCOUNT_KEY),
	ready: !browser ? true : true
});

export const isSignedIn = derived(auth, ($a) => Boolean($a.token));

export function setSession(token, account) {
	write(TOKEN_KEY, token);
	write(ACCOUNT_KEY, account ? JSON.stringify(account) : null);
	auth.set({ token, account, ready: true });
}

export function clearSession() {
	write(TOKEN_KEY, null);
	write(ACCOUNT_KEY, null);
	auth.set({ token: null, account: null, ready: true });
}

export const saveToken = writable(read(SAVE_TOKEN_KEY));

export function setSaveToken(token) {
	write(SAVE_TOKEN_KEY, token || null);
	saveToken.set(token || null);
}

export function currentSaveToken() {
	return read(SAVE_TOKEN_KEY);
}

/* Saved slugs, kept in sync so the explorer can mark cards. */
export const savedSlugs = writable(new Set());

export const compareTray = writable([]);

export const reducedMotion = writable(false);
if (browser) {
	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	reducedMotion.set(mq.matches);
	mq.addEventListener?.('change', (e) => reducedMotion.set(e.matches));
}
