import { c as copyFor, a as get } from '../../../chunks/data.js-CWRcJhtg.js';

const PAGE = 3;
async function load() {
  const [copy, featuredRes, wallRes] = await Promise.all([
    copyFor("news"),
    get("/api/stories?featured=true"),
    get(`/api/stories?featured=false&limit=${PAGE}&offset=0`)
  ]);
  return {
    copy,
    featured: featuredRes.data[0] || null,
    wall: wallRes.data,
    wallTotal: Number(wallRes.headers.get("x-total-count") ?? wallRes.data.length),
    pageSize: PAGE
  };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-DW-W3E5K.js.map
