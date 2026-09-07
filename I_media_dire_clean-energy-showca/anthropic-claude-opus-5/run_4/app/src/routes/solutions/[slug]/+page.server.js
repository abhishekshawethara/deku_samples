import { error } from '@sveltejs/kit';
import { loadJson } from '$lib/server-load.js';

export async function load({ fetch, params }) {
	const solution = await loadJson(fetch, `/solutions/${encodeURIComponent(params.slug)}`);
	if (!solution) throw error(404, 'We cannot find that page');
	const all = await loadJson(fetch, '/solutions', []);
	return { solution, related: all.filter((s) => s.slug !== solution.slug).slice(0, 3) };
}
