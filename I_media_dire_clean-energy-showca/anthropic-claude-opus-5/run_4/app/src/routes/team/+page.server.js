import { loadJson } from '$lib/server-load.js';

export async function load({ fetch }) {
return { team: await loadJson(fetch, '/team', []) };
}
