import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const jobs = await api('/api/jobs', { fetch }).catch(() => []);
	return { jobs };
}
