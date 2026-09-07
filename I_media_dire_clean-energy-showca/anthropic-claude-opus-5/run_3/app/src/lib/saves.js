import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from './api.js';
import { token, saveTokenStore } from './auth.js';

/** The caller's own saved rows, as returned by the server. */
export const saves = writable([]);
export const savesLoading = writable(false);

export const savedSlugs = derived(saves, ($s) => new Set($s.map((r) => r.slug)));
export const savedIds = derived(saves, ($s) => new Map($s.map((r) => [r.slug, r.id])));

/** Reload the caller's saves: the account's rows, or the anonymous token's. */
export async function refreshSaves() {
	if (!browser) return;
	const signedIn = Boolean(get(token));
	const st = get(saveTokenStore);
	if (!signedIn && !st) {
		saves.set([]);
		return;
	}
	savesLoading.set(true);
	try {
		const { data } = await api(
			`/saves${!signedIn && st ? `?save_token=${encodeURIComponent(st)}` : ''}`
		);
		saves.set(Array.isArray(data) ? data : []);
	} catch {
		saves.set([]);
	} finally {
		savesLoading.set(false);
	}
}
