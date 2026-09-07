import { h as head, a as attr, g as derived, s as store_get, u as unsubscribe_stores } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { p as page } from "../../../chunks/stores.js";
import { s as saveTokenStore } from "../../../chunks/auth.js";
import "../../../chunks/saves.js";
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
export {
  _page as default
};
