import { l as loadJsonOr } from '../../../chunks/ssr.js-tA8gd0pz.js';

async function load({ fetch }) {
  return { jobs: await loadJsonOr(fetch, "/jobs", []) };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-C5mbQHI5.js.map
