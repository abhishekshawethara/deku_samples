import { h as head, a as attr, e as escape_html, d as derived, s as store_get, u as unsubscribe_stores } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { p as page } from "../../../chunks/stores.js";
import "../../../chunks/api.js";
import "../../../chunks/session.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let email = "";
    let password = "";
    let busy = false;
    const next = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("next") || "/account");
    const emailError = derived(() => "");
    const passwordError = derived(() => "");
    head("iq265b", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign in, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section"><div class="auth svelte-iq265b"><p class="eyebrow">Account</p> <h1>Sign in</h1> <p class="lede">Your saved solutions, searches, enquiries, access request and applications live on your
			account. Anything you saved before signing in comes with you.</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate=""><div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)}${attr("aria-invalid", emailError() ? "true" : "false")}${attr("aria-describedby", emailError() ? "email-error" : void 0)} data-testid="email"/> `);
    if (emailError()) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="email-error">${escape_html(emailError())}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="password">Password</label> <input id="password" type="password" autocomplete="current-password"${attr("value", password)}${attr("aria-invalid", passwordError() ? "true" : "false")}${attr("aria-describedby", passwordError() ? "password-error" : void 0)} data-testid="password"/> `);
    if (passwordError()) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="password-error">${escape_html(passwordError())}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="btn btn-primary" type="submit"${attr("disabled", busy, true)} data-testid="signin-submit">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> ${escape_html("Sign in")}</button></form> <p class="alt svelte-iq265b">No account yet? <a${attr("href", `/signup?next=${encodeURIComponent(next())}`)}>Create one</a>. It takes
			an email, a password and a name.</p></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
