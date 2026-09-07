import { loadJson, loadJsonWithCount } from '$lib/server-load.js';

export async function load({ fetch, url }) {
	const filters = {
		industry: url.searchParams.get('industry') || '',
		output_kind: url.searchParams.get('output_kind') || '',
		temperature_band: url.searchParams.get('temperature_band') || '',
		deployment: url.searchParams.get('deployment') || '',
		q: url.searchParams.get('q') || ''
	};
	const qs = new URLSearchParams();
	for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
	const query = qs.toString();

	const [{ items, total }, all] = await Promise.all([
		loadJsonWithCount(fetch, `/solutions${query ? `?${query}` : ''}`),
		loadJson(fetch, '/solutions', [])
	]);

	return { solutions: items, total, all, filters };
}
