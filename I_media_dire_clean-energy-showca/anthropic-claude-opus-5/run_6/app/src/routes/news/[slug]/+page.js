import { error } from '@sveltejs/kit';
import { api, ApiError } from '$lib/api.js';

export async function load({ fetch, params }) {
	try {
		const story = await api(`/stories/${encodeURIComponent(params.slug)}`, {
			fetch,
			anonymous: true,
			token: null
		});
		return { story };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) throw error(404, 'Not found');
		throw err;
	}
}
