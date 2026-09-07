import { api } from '$lib/api.js';

export async function load({ fetch, url }) {
	const raw = url.searchParams.get('slugs') || '';
	const slugs = [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
	if (slugs.length === 0) return { solutions: [], slugs, rejected: null };
	if (slugs.length > 4) {
		return {
			solutions: await api(`/api/compare?slugs=${slugs.slice(0, 4).join(',')}`, { fetch }).catch(() => []),
			slugs: slugs.slice(0, 4),
			rejected: `The comparison holds at most four saves. "${slugs[4]}" was rejected as invalid and the first four are still compared.`
		};
	}
	const solutions = await api(`/api/compare?slugs=${slugs.join(',')}`, { fetch }).catch(() => []);
	return { solutions, slugs, rejected: null };
}
