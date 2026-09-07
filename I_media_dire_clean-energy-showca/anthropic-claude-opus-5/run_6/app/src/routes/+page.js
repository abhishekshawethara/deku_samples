import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const solutions = await api('/solutions', { fetch, anonymous: true, token: null });
	return { solutions };
}
