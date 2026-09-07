import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const faqs = await api('/api/faqs', { fetch }).catch(() => []);
	return { faqs };
}
