import { c as copyFor, a as get } from '../../../chunks/data.js-CWRcJhtg.js';

const KEYS = ["industry", "output_kind", "temperature_band", "deployment", "q"];
async function load({ url }) {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const v = url.searchParams.get(key);
    if (v) params.set(key, v);
  }
  const qs = params.toString();
  const [copy, res, all] = await Promise.all([
    copyFor("solutions"),
    get(`/api/solutions${qs ? `?${qs}` : ""}`),
    get("/api/solutions")
  ]);
  return {
    copy,
    solutions: res.data,
    total: Number(res.headers.get("x-total-count") ?? res.data.length),
    allCount: all.data.length,
    industries: [...new Set(all.data.map((s) => s.industry))],
    filters: Object.fromEntries(KEYS.map((k) => [k, url.searchParams.get(k) || ""]))
  };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-DoyS4rIz.js.map
