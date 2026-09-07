import { a as store_get, h as head, e as escape_html, u as unsubscribe_stores } from "../../chunks/index.js";
import { p as page } from "../../chunks/stores.js";
function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let status, notFound;
    status = store_get($$store_subs ??= {}, "$page", page).status;
    notFound = status === 404;
    head("1j96wlh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(notFound ? "We cannot find that page" : "Something went wrong")}, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section"><div class="wrap wrap-narrow"><div class="card notfound svelte-1j96wlh"><p class="eyebrow">${escape_html(status)}</p> `);
    if (notFound) {
      $$renderer2.push(`<!--[0--><h1>We cannot find that page</h1> <p class="lede">Nothing lives at that address. It may have moved, or the link may be mistyped.</p>`);
    } else {
      $$renderer2.push(`<!--[-1--><h1>Something went wrong</h1> <p class="lede">${escape_html(store_get($$store_subs ??= {}, "$page", page).error?.message || "The page could not be shown.")} Nothing you were working on has
          been lost. Try again, or take one of the routes below.</p>`);
    }
    $$renderer2.push(`<!--]--> <div class="ways svelte-1j96wlh"><a class="btn" href="/">Back to the home route</a> <a class="btn btn-secondary" href="/solutions">Solutions explorer</a> <a class="btn btn-secondary" href="/contact">Get in Touch</a></div></div></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _error as default
};
