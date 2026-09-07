import { ae as head, ac as attr, R as derived, a9 as store_get, ad as unsubscribe_stores } from '../../../chunks/index.js-CnICPAax.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-GlEKx5p3.js';
import '../../../chunks/state.svelte.js-CoYBmM9v.js';
import { p as page } from '../../../chunks/stores.js-CGRUs2r6.js';
import { s as saveTokenStore } from '../../../chunks/auth.js-CRCsruHm.js';
import '../../../chunks/saves.js-CaRXZihz.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let email = "";
    let password = "";
    let busy = false;
    const next = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("next") || "/account");
    const hadSaves = derived(() => Boolean(store_get($$store_subs ??= {}, "$saveTokenStore", saveTokenStore)));
    head("iq265b", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign in · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="wrap auth svelte-iq265b"><div class="card card--pad"><p class="eyebrow">Account</p> <h1>Sign in</h1> `);
    if (hadSaves()) {
      $$renderer2.push(`<!--[0--><div class="banner banner--info"><strong>Your saves are waiting</strong> <span>Sign in and the solutions you saved before signing in move onto your account.</span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate=""><div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)} required=""/></div> <div class="field"><label for="password">Password</label> <input id="password" type="password" autocomplete="current-password"${attr("value", password)} required=""/></div> <button class="btn btn--block" type="submit"${attr("disabled", busy, true)}>`);
    {
      $$renderer2.push(`<!--[-1-->Sign in`);
    }
    $$renderer2.push(`<!--]--></button></form> <p class="muted alt svelte-iq265b">No account yet? <a${attr("href", `/signup${next() !== "/account" ? `?next=${encodeURIComponent(next())}` : ""}`)}>Create one</a>. It takes an email and a password.</p></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CvFfb3P1.js.map
