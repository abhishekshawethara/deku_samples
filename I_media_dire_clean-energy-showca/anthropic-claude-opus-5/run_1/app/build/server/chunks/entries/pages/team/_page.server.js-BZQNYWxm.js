import { c as copyFor, g as getData } from '../../../chunks/data.js-CWRcJhtg.js';

async function load() {
  const [copy, team] = await Promise.all([copyFor("team"), getData("/api/team")]);
  return { copy, team };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-BZQNYWxm.js.map
