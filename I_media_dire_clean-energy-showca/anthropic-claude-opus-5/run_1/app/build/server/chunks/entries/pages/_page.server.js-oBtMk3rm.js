import { c as copyFor, g as getData } from '../../chunks/data.js-CWRcJhtg.js';

async function load() {
  const [copy, solutions] = await Promise.all([
    copyFor("home"),
    getData("/api/solutions")
  ]);
  return { copy, solutions };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-oBtMk3rm.js.map
