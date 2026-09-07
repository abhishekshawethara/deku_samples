import { C as error } from '../../../../chunks/utils.js-Bzpr6vQU.js';
import { l as loadJson } from '../../../../chunks/load.js-BqG70t3y.js';

async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/solutions/${encodeURIComponent(params.slug)}`);
    return { solution: data };
  } catch (e) {
    throw error(e.status === 404 ? 404 : 500, e.message);
  }
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page as _ };
//# sourceMappingURL=_page.js-Cqr0VMkq.js.map
