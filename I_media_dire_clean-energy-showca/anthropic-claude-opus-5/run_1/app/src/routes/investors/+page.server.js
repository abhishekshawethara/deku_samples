import { copyFor, getData } from '$lib/server/data.js';

export async function load() {
	const [copy, roadmap] = await Promise.all([
		copyFor('investors'),
		getData('/api/roadmap')
	]);
	return { copy, roadmap };
}
