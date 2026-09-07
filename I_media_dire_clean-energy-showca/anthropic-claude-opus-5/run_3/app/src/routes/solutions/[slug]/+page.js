import { error } from '@sveltejs/kit';
import { loadJson } from '$lib/load.js';

export async function load({ fetch, params }) {
	try {
		const { data } = await loadJson(fetch, `/solutions/${encodeURIComponent(params.slug)}`);
		return { solution: data };
	} catch (e) {
		throw error(e.status === 404 ? 404 : 500, e.message);
	}
}
