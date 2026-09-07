import { C as error } from '../../../../chunks/utils.js-Bzpr6vQU.js';
import { g as getData } from '../../../../chunks/data.js-CWRcJhtg.js';

async function load({ params }) {
  try {
    const story = await getData(`/api/stories/${encodeURIComponent(params.slug)}`);
    const all = await getData("/api/stories");
    return { story, others: all.filter((s) => s.slug !== story.slug).slice(0, 3) };
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
//# sourceMappingURL=_page.server.js-DcT1MAd9.js.map
