import { loadJson } from '$lib/server-load.js';

export async function load({ fetch }) {
const solutions = await loadJson(fetch, '/solutions', []);
return { solutions };
}
