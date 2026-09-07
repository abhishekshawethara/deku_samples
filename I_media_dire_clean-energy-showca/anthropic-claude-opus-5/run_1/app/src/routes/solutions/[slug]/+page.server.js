import { error } from '@sveltejs/kit';
import { getData } from '$lib/server/data.js';

export async function load({ params }) {
	try {
		const solution = await getData(`/api/solutions/${encodeURIComponent(params.slug)}`);
		const all = await getData('/api/solutions');
		return {
			solution,
			related: all.filter((s) => s.slug !== solution.slug && s.output_kind === solution.output_kind)
		};
	} catch (err) {
		if (err.status === 404) throw error(404, 'We cannot find that page');
		throw err;
	}
}
