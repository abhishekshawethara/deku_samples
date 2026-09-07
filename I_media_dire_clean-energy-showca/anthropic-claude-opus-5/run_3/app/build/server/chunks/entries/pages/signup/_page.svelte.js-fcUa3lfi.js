import { ae as head, ac as attr, a7 as escape_html, R as derived, a9 as store_get, ad as unsubscribe_stores } from '../../../chunks/index.js-CnICPAax.js';
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
    let display_name = "";
    let email = "";
    let password = "";
    let busy = false;
    let touched = {};
    const next = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("next") || "/account");
    const hadSaves = derived(() => Boolean(store_get($$store_subs ??= {}, "$saveTokenStore", saveTokenStore)));
    const errors = derived(() => ({
      display_name: display_name.trim() ? "" : "Tell us what to call you.",
      email: !email.trim() ? "An email is required." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "" : "That does not look like an email address.",
      password: password.length >= 8 ? "" : "Use at least 8 characters so the account is worth having."
    }));
    head("kmqcod", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Create an account · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="wrap auth svelte-kmqcod"><div class="card card--pad"><p class="eyebrow">Account</p> <h1>Create an account</h1> <p class="muted">An account keeps your saved solutions, your searches, your enquiries and your investor access
			request.</p> `);
    if (hadSaves()) {
      $$renderer2.push(`<!--[0--><div class="banner banner--info"><strong>Your saves come with you</strong> <span>The solutions you saved before signing up move onto the new account.</span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate=""><div class="field"><label for="name">Your name</label> <input id="name" type="text" autocomplete="name"${attr("value", display_name)}${attr("aria-invalid", touched.display_name && errors().display_name ? "true" : void 0)}/> `);
    if (touched.display_name && errors().display_name) {
      $$renderer2.push(`<!--[0--><p class="field__error">${escape_html(errors().display_name)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)}${attr("aria-invalid", touched.email && errors().email ? "true" : void 0)}/> `);
    if (touched.email && errors().email) {
      $$renderer2.push(`<!--[0--><p class="field__error">${escape_html(errors().email)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="password">Password</label> <input id="password" type="password" autocomplete="new-password"${attr("value", password)}${attr("aria-invalid", touched.password && errors().password ? "true" : void 0)} aria-describedby="pw-hint"/> `);
    if (touched.password && errors().password) {
      $$renderer2.push(`<!--[0--><p class="field__error">${escape_html(errors().password)}</p>`);
    } else {
      $$renderer2.push(`<!--[-1--><p class="field__hint" id="pw-hint">At least 8 characters.</p>`);
    }
    $$renderer2.push(`<!--]--></div> <button class="btn btn--block" type="submit"${attr("disabled", busy, true)}>`);
    {
      $$renderer2.push(`<!--[-1-->Create account`);
    }
    $$renderer2.push(`<!--]--></button></form> <p class="muted alt svelte-kmqcod">Already have one? <a${attr("href", `/signin${next() !== "/account" ? `?next=${encodeURIComponent(next())}` : ""}`)}>Sign in</a>.</p></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-fcUa3lfi.js.map
