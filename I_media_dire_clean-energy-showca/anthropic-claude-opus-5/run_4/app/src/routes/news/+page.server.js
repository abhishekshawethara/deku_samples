import { loadJson, loadJsonWithCount } from '$lib/server-load.js';

const PAGE = 3;

export async function load({ fetch }) {
	const featuredList = await loadJson(fetch, '/stories?featured=true', []);
	const featured = featuredList[0] || null;
	// The wall excludes the featured story: seven seeded stories leave two pages of three.
	const { items, total } = await loadJsonWithCount(fetch, '/stories');
	const wall = items.filter((s) => !s.featured);
	return {
		featured,
		wall: wall.slice(0, PAGE),
		wallTotal: wall.length,
		pageSize: PAGE,
		total
	};
}
