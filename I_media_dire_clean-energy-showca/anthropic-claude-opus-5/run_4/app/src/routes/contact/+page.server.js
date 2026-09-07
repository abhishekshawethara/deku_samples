import { loadJson } from '$lib/server-load.js';

export async function load({ fetch }) {
return { offices: await loadJson(fetch, '/offices', []) };
}
