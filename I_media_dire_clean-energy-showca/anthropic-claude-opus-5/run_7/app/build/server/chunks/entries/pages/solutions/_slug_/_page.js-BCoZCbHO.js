import { C as error } from '../../../../chunks/utils.js-Bzpr6vQU.js';
import { a as loadJson } from '../../../../chunks/ssr.js-tA8gd0pz.js';

async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/solutions/${encodeURIComponent(params.slug)}`);
    return { solution: data };
  } catch (e) {
    throw error(404, "We cannot find that page");
  }
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-BCoZCbHO.js.map
