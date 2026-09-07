import { c as copyFor, g as getData } from '../../../chunks/data.js-CWRcJhtg.js';

async function load() {
  const [copy, offices] = await Promise.all([copyFor("contact"), getData("/api/offices")]);
  return { copy, offices };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-CMF-bYO2.js.map
