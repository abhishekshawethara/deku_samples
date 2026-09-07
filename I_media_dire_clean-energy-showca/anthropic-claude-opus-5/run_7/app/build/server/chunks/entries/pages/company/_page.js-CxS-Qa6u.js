import { l as loadJsonOr } from '../../../chunks/ssr.js-tA8gd0pz.js';

async function load({ fetch }) {
  return { offices: await loadJsonOr(fetch, "/offices", []) };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-CxS-Qa6u.js.map
