import { l as loadJson } from "../../../chunks/load.js";
const KEYS = ["industry", "output_kind", "temperature_band", "deployment", "q"];
async function load({ fetch, url }) {
  const params = new URLSearchParams();
  const filters = {};
  for (const k of KEYS) {
    const v = url.searchParams.get(k);
    filters[k] = v || "";
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  const [matching, everything] = await Promise.all([
    loadJson(fetch, `/solutions${qs ? `?${qs}` : ""}`),
    qs ? loadJson(fetch, "/solutions") : null
  ]);
  const all = everything ? everything.data : matching.data;
  return {
    solutions: matching.data,
    total: matching.total ?? matching.data.length,
    universe: all.length,
    filters,
    all
  };
}
export {
  load
};
