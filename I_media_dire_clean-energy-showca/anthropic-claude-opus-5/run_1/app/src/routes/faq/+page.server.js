import { copyFor, getData } from '$lib/server/data.js';

export async function load() {
	const [copy, faqs] = await Promise.all([copyFor('faq'), getData('/api/faqs')]);
	return { copy, faqs };
}
