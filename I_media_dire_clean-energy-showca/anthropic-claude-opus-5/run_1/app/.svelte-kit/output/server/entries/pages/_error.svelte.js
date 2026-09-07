import { h as head, e as escape_html, s as store_get, u as unsubscribe_stores, d as derived } from "../../chunks/index.js";
import { p as page } from "../../chunks/stores.js";
function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const status = derived(() => store_get($$store_subs ??= {}, "$page", page).status);
    const isNotFound = derived(() => status() === 404);
    head("1j96wlh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(isNotFound() ? "We cannot find that page" : "Something went wrong")}, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section"><div class="wrap-narrow"><div class="card nf svelte-1j96wlh" data-testid="not-found"><p class="eyebrow">${escape_html(status())}</p> <h1>${escape_html(isNotFound() ? "We cannot find that page" : "Something went wrong")}</h1> <p class="lede">`);
    if (isNotFound()) {
      $$renderer2.push(`<!--[0-->The address you asked for is not one of ours. Nothing is broken; there is simply nothing
					here.`);
    } else {
      $$renderer2.push(`<!--[-1-->${escape_html(store_get($$store_subs ??= {}, "$page", page).error?.message || "The request could not be completed.")} Try again, and if it keeps
					happening use the contact form.`);
    }
    $$renderer2.push(`<!--]--></p> <div class="row svelte-1j96wlh"><a class="btn btn-primary" href="/">Back to the home page</a> <a class="btn btn-quiet" href="/solutions">Browse the solutions</a></div></div></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _error as default
};
