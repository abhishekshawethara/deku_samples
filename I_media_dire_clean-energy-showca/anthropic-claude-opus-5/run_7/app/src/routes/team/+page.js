import { loadJsonOr } from '$lib/ssr';

export async function load({ fetch }) {
  return { team: await loadJsonOr(fetch, '/team', []) };
}
