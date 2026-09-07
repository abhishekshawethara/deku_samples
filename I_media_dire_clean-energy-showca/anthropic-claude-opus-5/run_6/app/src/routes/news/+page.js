import { api } from '$lib/api.js';

export async function load({ fetch }) {
	const opts = { fetch, anonymous: true, token: null };
	const [featured, firstPage] = await Promise.all([
		api('/stories?featured=true', opts),
		api('/stories?featured=false&limit=3&offset=0', { ...opts, raw: true })
	]);
	return {
		featured: featured[0] || null,
		stories: firstPage.data,
		total: Number(firstPage.headers.get('X-Total-Count') ?? firstPage.data.length)
	};
}
