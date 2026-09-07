async function loadJson(fetcher, path, { headers } = {}) {
  if (typeof globalThis.__zjApiInject === "function") {
    const res2 = await globalThis.__zjApiInject(path, headers);
    if (res2.status >= 400) {
      const err = new Error(res2.body?.message || `Request failed (${res2.status})`);
      err.status = res2.status;
      throw err;
    }
    const total2 = res2.headers["x-total-count"];
    return { data: res2.body, total: total2 === void 0 ? null : Number(total2) };
  }
  const res = await fetcher(`/api${path}`, { headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      message = (await res.clone().json())?.message || message;
    } catch {
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  const total = res.headers.get("x-total-count");
  const data = await res.json();
  return { data, total: total === null ? null : Number(total) };
}

export { loadJson as l };
//# sourceMappingURL=load.js-BqG70t3y.js.map
