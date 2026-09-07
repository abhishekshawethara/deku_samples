import { h as head, e as escape_html } from "../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/auth.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("dm15ji", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("We cannot find that page · Zettajoule")}</title>`);
      });
      $$renderer3.push(`<meta name="robots" content="noindex"/>`);
    });
    {
      $$renderer2.push(`<!--[0--><section class="wrap room svelte-dm15ji"><p class="loading-row"><span class="spinner" aria-hidden="true"></span> Opening the room…</p></section>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
