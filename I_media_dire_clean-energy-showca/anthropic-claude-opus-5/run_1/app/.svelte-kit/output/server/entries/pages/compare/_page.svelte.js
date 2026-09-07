import { h as head, s as store_get, u as unsubscribe_stores } from "../../../chunks/index.js";
import "../../../chunks/api.js";
import { a as authReady, b as account } from "../../../chunks/session.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    head("1ez3k3s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Compare, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1ez3k3s"><div class="wrap"><p class="eyebrow">Compare</p> <h1>Four saves, side by side</h1> <p class="lede">Pick up to 4 of your saved solutions and read them against each other. A fifth is refused
			and the four already chosen stay compared.</p></div></section> <section class="section"><div class="wrap">`);
    {
      $$renderer2.push(`<!--[0--><p class="loading svelte-1ez3k3s"><span class="spinner" aria-hidden="true"></span> Loading your saves</p>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$authReady", authReady) && !store_get($$store_subs ??= {}, "$account", account)) {
      $$renderer2.push(`<!--[0--><p class="field-hint"><a href="/signin?next=/compare">Sign in</a> and any solution you saved without an account comes
				with you.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
