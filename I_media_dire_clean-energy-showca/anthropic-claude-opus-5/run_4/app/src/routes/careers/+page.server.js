import { loadJson } from '$lib/server-load.js';

export async function load({ fetch }) {
return { jobs: await loadJson(fetch, '/jobs', []) };
}
