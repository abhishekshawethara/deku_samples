import { c as copyFor, g as getData } from '../../../chunks/data.js-CWRcJhtg.js';

async function load() {
  const [copy, roadmap] = await Promise.all([
    copyFor("investors"),
    getData("/api/roadmap")
  ]);
  return { copy, roadmap };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-BR11OPms.js.map
