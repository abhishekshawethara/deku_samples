import { error } from '@sveltejs/kit';
import { api } from '$lib/api.js';

export async function load({ fetch, params }) {
	try {
		const solution = await api(`/api/solutions/${encodeURIComponent(params.slug)}`, { fetch });
		return { solution };
	} catch (err) {
		throw error(err.status === 404 ? 404 : 500, err.message || 'That solution could not be loaded');
	}
}
