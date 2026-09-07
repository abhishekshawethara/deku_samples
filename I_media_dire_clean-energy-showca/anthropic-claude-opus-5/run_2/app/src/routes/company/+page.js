import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const offices = await api('/api/offices', { fetch }).catch(() => []);
	return { offices };
}
