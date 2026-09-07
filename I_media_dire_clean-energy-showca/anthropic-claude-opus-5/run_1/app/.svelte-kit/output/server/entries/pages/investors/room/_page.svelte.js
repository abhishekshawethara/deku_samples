import { h as head, e as escape_html } from "../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/api.js";
import "../../../../chunks/session.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("dm15ji", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("We cannot find that page")}, Zettajoule</title>`);
      });
    });
    {
      $$renderer2.push(`<!--[0--><section class="section"><div class="wrap"><p class="loading svelte-dm15ji"><span class="spinner" aria-hidden="true"></span> Checking your access</p></div></section>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
