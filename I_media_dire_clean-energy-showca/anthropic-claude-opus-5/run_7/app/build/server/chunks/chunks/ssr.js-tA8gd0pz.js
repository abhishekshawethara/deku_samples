async function loadJson(fetch, path, { headers } = {}) {
  const res = await fetch(`/api${path}`, { headers });
  if (!res.ok) {
    const err = new Error(`api ${path} failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return { data: await res.json(), headers: res.headers };
}
async function loadJsonOr(fetch, path, fallback) {
  try {
    const { data } = await loadJson(fetch, path);
    return data;
  } catch {
    return fallback;
  }
}

export { loadJson as a, loadJsonOr as l };
//# sourceMappingURL=ssr.js-tA8gd0pz.js.map
