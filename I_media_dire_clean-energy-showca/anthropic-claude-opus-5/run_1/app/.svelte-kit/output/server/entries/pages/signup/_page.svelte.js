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
    let display_name = "";
    let email = "";
    let password = "";
    let busy = false;
    const next = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("next") || "/account");
    const nameError = derived(() => "");
    const emailError = derived(() => "");
    const passwordError = derived(() => "");
    head("kmqcod", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Create an account, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section"><div class="auth svelte-kmqcod"><p class="eyebrow">Account</p> <h1>Create an account</h1> <p class="lede">Signing up keeps your saved solutions, searches, enquiries and access request in one place.
			Anything you saved before signing up moves onto the account.</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate=""><div class="field"><label for="display_name">Name</label> <input id="display_name" type="text" autocomplete="name"${attr("value", display_name)}${attr("aria-invalid", nameError() ? "true" : "false")}${attr("aria-describedby", nameError() ? "name-error" : void 0)} data-testid="display-name"/> `);
    if (nameError()) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="name-error">${escape_html(nameError())}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)}${attr("aria-invalid", emailError() ? "true" : "false")}${attr("aria-describedby", emailError() ? "email-error" : void 0)} data-testid="email"/> `);
    if (emailError()) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="email-error">${escape_html(emailError())}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="password">Password</label> <input id="password" type="password" autocomplete="new-password"${attr("value", password)}${attr("aria-invalid", passwordError() ? "true" : "false")} aria-describedby="password-hint" data-testid="password"/> `);
    if (passwordError()) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="password-hint">${escape_html(passwordError())}</p>`);
    } else {
      $$renderer2.push(`<!--[-1--><p class="field-hint" id="password-hint">At least 8 characters.</p>`);
    }
    $$renderer2.push(`<!--]--></div> <button class="btn btn-primary" type="submit"${attr("disabled", busy, true)} data-testid="signup-submit">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> ${escape_html("Create account")}</button></form> <p class="alt svelte-kmqcod">Already have one? <a${attr("href", `/signin?next=${encodeURIComponent(next())}`)}>Sign in</a>.</p></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
