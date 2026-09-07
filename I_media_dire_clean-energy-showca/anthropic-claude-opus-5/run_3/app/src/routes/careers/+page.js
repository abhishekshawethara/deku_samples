import { loadJson } from '$lib/load.js';

export async function load({ fetch }) {
	const { data } = await loadJson(fetch, '/jobs');
	return { jobs: data };
}
