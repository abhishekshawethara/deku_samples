/**
 * Load JSON from the same-origin API during server rendering or client navigation.
 * `fetch` is SvelteKit's, so a server render calls the API in process without a network hop.
 */
export async function loadJson(fetch, path, { headers } = {}) {
  const res = await fetch(`/api${path}`, { headers });
  if (!res.ok) {
    const err = new Error(`api ${path} failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return { data: await res.json(), headers: res.headers };
}

export async function loadJsonOr(fetch, path, fallback) {
  try {
    const { data } = await loadJson(fetch, path);
    return data;
  } catch {
    return fallback;
  }
}
