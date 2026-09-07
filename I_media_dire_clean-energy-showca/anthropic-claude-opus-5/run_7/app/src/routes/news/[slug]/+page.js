import { error } from '@sveltejs/kit';
import { loadJson } from '$lib/ssr';

export async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/stories/${encodeURIComponent(params.slug)}`);
    return { story: data };
  } catch {
    throw error(404, 'We cannot find that page');
  }
}
