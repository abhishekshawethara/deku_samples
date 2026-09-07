import { c as copyFor, g as getData } from '../../../chunks/data.js-CWRcJhtg.js';

async function load() {
  const [copy, jobs] = await Promise.all([copyFor("careers"), getData("/api/jobs")]);
  return { copy, jobs };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-65rO5mqC.js.map
