import { error } from '@sveltejs/kit';
import { api, ApiError } from '$lib/api.js';

export async function load({ fetch, params }) {
	try {
		const solution = await api(`/solutions/${encodeURIComponent(params.slug)}`, {
			fetch,
			anonymous: true,
			token: null
		});
		return { solution };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) throw error(404, 'Not found');
		throw err;
	}
}
