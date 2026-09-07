import { loadJsonOr } from '$lib/ssr';

export async function load({ fetch }) {
  return { jobs: await loadJsonOr(fetch, '/jobs', []) };
}
