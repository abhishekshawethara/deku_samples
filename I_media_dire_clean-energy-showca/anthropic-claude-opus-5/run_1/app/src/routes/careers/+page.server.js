import { copyFor, getData } from '$lib/server/data.js';

export async function load() {
	const [copy, jobs] = await Promise.all([copyFor('careers'), getData('/api/jobs')]);
	return { copy, jobs };
}
