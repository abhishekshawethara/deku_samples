import { loadJson } from '$lib/load.js';

const PAGE_SIZE = 3;

export async function load({ fetch }) {
	const [featuredRes, wallRes] = await Promise.all([
		loadJson(fetch, '/stories?featured=true'),
		loadJson(fetch, `/stories?featured=false&limit=${PAGE_SIZE}&offset=0`)
	]);
	return {
		featured: featuredRes.data[0] || null,
		wall: wallRes.data,
		wallTotal: wallRes.total ?? wallRes.data.length,
		pageSize: PAGE_SIZE
	};
}
