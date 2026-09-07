import { l as loadJson } from '../../../chunks/load.js-BqG70t3y.js';

const PAGE_SIZE = 3;
async function load({ fetch }) {
  const [featuredRes, wallRes] = await Promise.all([
    loadJson(fetch, "/stories?featured=true"),
    loadJson(fetch, `/stories?featured=false&limit=${PAGE_SIZE}&offset=0`)
  ]);
  return {
    featured: featuredRes.data[0] || null,
    wall: wallRes.data,
    wallTotal: wallRes.total ?? wallRes.data.length,
    pageSize: PAGE_SIZE
  };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-DlHnhKHU.js.map
