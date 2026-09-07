import { error } from '@sveltejs/kit';
import { loadJson } from '$lib/ssr';

export async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/solutions/${encodeURIComponent(params.slug)}`);
    return { solution: data };
  } catch (e) {
    throw error(404, 'We cannot find that page');
  }
}
