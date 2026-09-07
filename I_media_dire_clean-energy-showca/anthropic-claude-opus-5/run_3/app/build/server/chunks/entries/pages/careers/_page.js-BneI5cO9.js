import { l as loadJson } from '../../../chunks/load.js-BqG70t3y.js';

async function load({ fetch }) {
  const { data } = await loadJson(fetch, "/jobs");
  return { jobs: data };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-BneI5cO9.js.map
