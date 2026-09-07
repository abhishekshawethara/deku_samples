import { l as loadJsonOr } from '../../../chunks/ssr.js-tA8gd0pz.js';

async function load({ fetch }) {
  return { team: await loadJsonOr(fetch, "/team", []) };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-S1QXHr_D.js.map
