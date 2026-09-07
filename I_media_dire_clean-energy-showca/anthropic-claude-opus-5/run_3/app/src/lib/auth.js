import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

const TOKEN_KEY = 'zj_token';
const ACCOUNT_KEY = 'zj_account';
const SAVE_KEY = 'zj_save_token';

function persisted(key, initial, { json = false } = {}) {
	let start = initial;
	if (browser) {
		const raw = localStorage.getItem(key);
		if (raw !== null) {
			try {
				start = json ? JSON.parse(raw) : raw;
			} catch {
				start = initial;
			}
		}
	}
	const store = writable(start);
	if (browser) {
		store.subscribe((value) => {
			if (value === null || value === undefined || value === '') localStorage.removeItem(key);
			else localStorage.setItem(key, json ? JSON.stringify(value) : String(value));
		});
	}
	return store;
}

export const token = persisted(TOKEN_KEY, null);
export const account = persisted(ACCOUNT_KEY, null, { json: true });
export const saveTokenStore = persisted(SAVE_KEY, null);

export const isSignedIn = derived(token, ($t) => Boolean($t));

export function clearSession() {
	token.set(null);
	account.set(null);
}

/**
 * Sign out and return to `/`.
 *
 * The order matters: a guarded route watches the token and sends a signed-out
 * visitor to /signin, so the session is cleared only once we have already left
 * the guarded page. Clearing first would race that guard and land on /signin
 * instead of the home route.
 */
export async function signOutTo(goto, destination = '/') {
	await goto(destination);
	clearSession();
}

export function currentToken() {
	return get(token);
}
