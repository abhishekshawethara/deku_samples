import { api } from '$lib/api.js';

export async function load({ fetch, url }) {
	const params = new URLSearchParams();
	for (const key of ['industry', 'output_kind', 'temperature_band', 'deployment', 'q']) {
		const v = url.searchParams.get(key);
		if (v) params.set(key, v);
	}
	const qs = params.toString();
	const solutions = await api(`/api/solutions${qs ? '?' + qs : ''}`, { fetch }).catch(() => []);
	const all = qs ? await api('/api/solutions', { fetch }).catch(() => []) : solutions;
	return {
		solutions,
		total: all.length,
		filters: {
			industry: url.searchParams.get('industry') || '',
			output_kind: url.searchParams.get('output_kind') || '',
			temperature_band: url.searchParams.get('temperature_band') || '',
			deployment: url.searchParams.get('deployment') || '',
			q: url.searchParams.get('q') || ''
		},
		industries: all.map((s) => s.industry)
	};
}
