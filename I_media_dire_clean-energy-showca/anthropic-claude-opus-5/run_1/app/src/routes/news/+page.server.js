import { copyFor, get } from '$lib/server/data.js';

const PAGE = 3;

export async function load() {
	const [copy, featuredRes, wallRes] = await Promise.all([
		copyFor('news'),
		get('/api/stories?featured=true'),
		get(`/api/stories?featured=false&limit=${PAGE}&offset=0`)
	]);
	return {
		copy,
		featured: featuredRes.data[0] || null,
		wall: wallRes.data,
		wallTotal: Number(wallRes.headers.get('x-total-count') ?? wallRes.data.length),
		pageSize: PAGE
	};
}
