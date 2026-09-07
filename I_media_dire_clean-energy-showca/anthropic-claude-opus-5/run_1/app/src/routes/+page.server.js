import { copyFor, getData } from '$lib/server/data.js';

export async function load() {
	const [copy, solutions] = await Promise.all([
		copyFor('home'),
		getData('/api/solutions')
	]);
	return { copy, solutions };
}
