import { error } from '@sveltejs/kit';
import { api } from '$lib/api.js';

export async function load({ fetch, params }) {
	try {
		const story = await api(`/api/stories/${encodeURIComponent(params.slug)}`, { fetch });
		return { story };
	} catch (err) {
		throw error(err.status === 404 ? 404 : 500, err.message || 'That story could not be loaded');
	}
}
