import { error } from '@sveltejs/kit';
import { getData } from '$lib/server/data.js';

export async function load({ params }) {
	try {
		const story = await getData(`/api/stories/${encodeURIComponent(params.slug)}`);
		const all = await getData('/api/stories');
		return { story, others: all.filter((s) => s.slug !== story.slug).slice(0, 3) };
	} catch (err) {
		if (err.status === 404) throw error(404, 'We cannot find that page');
		throw err;
	}
}
