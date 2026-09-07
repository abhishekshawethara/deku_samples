import { copyFor, getData } from '$lib/server/data.js';

export async function load() {
	const [copy, offices] = await Promise.all([copyFor('contact'), getData('/api/offices')]);
	return { copy, offices };
}
