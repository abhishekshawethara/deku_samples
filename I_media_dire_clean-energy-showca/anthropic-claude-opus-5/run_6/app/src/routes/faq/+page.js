import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const faqs = await api('/faqs', { fetch, anonymous: true, token: null });
	return { faqs };
}
