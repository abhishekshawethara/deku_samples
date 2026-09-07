import { c as copyFor, g as getData } from '../../../chunks/data.js-CWRcJhtg.js';

async function load() {
  const [copy, faqs] = await Promise.all([copyFor("faq"), getData("/api/faqs")]);
  return { copy, faqs };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

export { _page_server as _ };
//# sourceMappingURL=_page.server.js-Bw2EhBUI.js.map
