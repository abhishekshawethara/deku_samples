import { C as error } from '../../../../chunks/utils.js-Bzpr6vQU.js';
import { g as getData } from '../../../../chunks/data.js-CWRcJhtg.js';

async function load({ params }) {
  try {
    const solution = await getData(`/api/solutions/${encodeURIComponent(params.slug)}`);
    const all = await getData("/api/solutions");
    return {
      solution,
      related: all.filter((s) => s.slug !== solution.slug && s.output_kind === solution.output_kind)
    };
  } catch (err) {
    if (err.status === 404) throw error(404, "We cannot find that page");
    throw err;
  }
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-CgNfdVZ4.js.map
