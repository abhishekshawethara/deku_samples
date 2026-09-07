import { loadJson } from '$lib/server-load.js';

export async function load({ fetch }) {
return { faqs: await loadJson(fetch, '/faqs', []) };
}
