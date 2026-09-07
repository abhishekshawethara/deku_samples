import { ae as head, a7 as escape_html, a9 as store_get, ad as unsubscribe_stores } from '../../chunks/index.js-CnICPAax.js';
import { p as page } from '../../chunks/stores.js-CGRUs2r6.js';
import '../../chunks/utils.js-Bzpr6vQU.js';
import '../../chunks/utils2.js-BQzn9ikS.js';
import '../../chunks/exports.js-8HOoaa4e.js';
import '../../chunks/root.js-GlEKx5p3.js';
import '../../chunks/state.svelte.js-CoYBmM9v.js';

function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    head("1j96wlh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>We cannot find that page · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section wrap notfound svelte-1j96wlh"><div class="card card--pad"><p class="eyebrow">${escape_html(store_get($$store_subs ??= {}, "$page", page).status)}</p> <h1>We cannot find that page</h1> <p class="lede">`);
    if (store_get($$store_subs ??= {}, "$page", page).status === 404) {
      $$renderer2.push(`<!--[0-->The address you asked for is not one of ours, or it is a room your account cannot open.`);
    } else {
      $$renderer2.push(`<!--[-1-->${escape_html(store_get($$store_subs ??= {}, "$page", page).error?.message || "Something went wrong on our side.")}`);
    }
    $$renderer2.push(`<!--]--></p> <div class="row"><a class="btn" href="/">Back to home</a> <a class="btn btn--ghost" href="/solutions">Browse solutions</a></div></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _error as default };
//# sourceMappingURL=_error.svelte.js-5u1IC-V-.js.map
