import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const solutions = await api('/api/solutions', { fetch }).catch(() => []);
	return { solutions };
}
