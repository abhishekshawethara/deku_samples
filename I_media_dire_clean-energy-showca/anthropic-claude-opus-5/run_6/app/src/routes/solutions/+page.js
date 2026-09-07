import { api } from '$lib/api.js';

export async function load({ fetch, url }) {
	const solutions = await api('/solutions', { fetch, anonymous: true, token: null });
	return {
		solutions,
		initial: {
			industry: url.searchParams.get('industry') || '',
			output_kind: url.searchParams.get('output_kind') || '',
			temperature_band: url.searchParams.get('temperature_band') || '',
			deployment: url.searchParams.get('deployment') || '',
			q: url.searchParams.get('q') || ''
		}
	};
}
