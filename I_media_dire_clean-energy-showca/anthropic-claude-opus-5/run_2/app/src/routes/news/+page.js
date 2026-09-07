import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const [featuredList, all] = await Promise.all([
		api('/api/stories?featured=true', { fetch }).catch(() => []),
		api('/api/stories', { fetch }).catch(() => [])
	]);
	const featured = featuredList[0] || null;
	const wall = all.filter((s) => !s.featured);
	return { featured, wall };
}
