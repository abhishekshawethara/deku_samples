import { loadJson } from '$lib/server-load.js';

export async function load({ fetch }) {
return { solutions: await loadJson(fetch, '/solutions', []) };
}
