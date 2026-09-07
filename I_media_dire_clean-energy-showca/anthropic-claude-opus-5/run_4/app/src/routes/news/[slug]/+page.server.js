import { error } from '@sveltejs/kit';
import { loadJson } from '$lib/server-load.js';

export async function load({ fetch, params }) {
	const story = await loadJson(fetch, `/stories/${encodeURIComponent(params.slug)}`);
	if (!story) throw error(404, 'We cannot find that page');
	const all = await loadJson(fetch, '/stories', []);
	return { story, more: all.filter((s) => s.slug !== story.slug).slice(0, 3) };
}
