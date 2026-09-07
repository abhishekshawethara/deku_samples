import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const team = await api('/api/team', { fetch }).catch(() => []);
	return { team };
}
