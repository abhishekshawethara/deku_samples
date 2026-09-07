import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const jobs = await api('/jobs', { fetch, anonymous: true, token: null });
	return { jobs };
}
