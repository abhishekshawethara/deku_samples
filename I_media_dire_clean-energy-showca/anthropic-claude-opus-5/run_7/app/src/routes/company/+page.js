import { loadJsonOr } from '$lib/ssr';

export async function load({ fetch }) {
  return { offices: await loadJsonOr(fetch, '/offices', []) };
}
