import { a as loadJson } from '../../../chunks/ssr.js-tA8gd0pz.js';

async function load({ fetch }) {
  const [featuredRes, allRes] = await Promise.all([
    loadJson(fetch, "/stories?featured=true"),
    loadJson(fetch, "/stories?limit=100")
  ]);
  const featured = featuredRes.data[0] ?? null;
  const wall = allRes.data.filter((s) => !s.featured);
  return { featured, wall };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-DbWVyeQA.js.map
