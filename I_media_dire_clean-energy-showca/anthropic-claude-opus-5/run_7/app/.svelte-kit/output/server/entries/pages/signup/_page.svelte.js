import { a as store_get, h as head, c as attr, e as escape_html, u as unsubscribe_stores } from "../../../chunks/index.js";
import { p as page } from "../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let next, nameError, emailError, passwordError;
    let display_name = "";
    let email = "";
    let password = "";
    let busy = false;
    next = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("next") || "/account";
    nameError = "";
    emailError = "";
    passwordError = "";
    head("kmqcod", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Create an account, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section"><div class="wrap wrap-narrow"><p class="eyebrow">Account</p> <h1>Create an account</h1> <p class="lede">Anything you have already saved comes with you. Signup is open and creates a visitor account.</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate="" class="svelte-kmqcod"><div class="field"><label for="name">Your name</label> <input id="name" type="text" autocomplete="name"${attr("value", display_name)}${attr("aria-invalid", !!nameError)} data-testid="display_name"/> `);
    if (nameError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(nameError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)}${attr("aria-invalid", !!emailError)} data-testid="email"/> `);
    if (emailError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(emailError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="password">Password</label> <input id="password" type="password" autocomplete="new-password"${attr("value", password)}${attr("aria-invalid", !!passwordError)} aria-describedby="pw-hint" data-testid="password"/> <p class="small muted" id="pw-hint">At least 8 characters.</p> `);
    if (passwordError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(passwordError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="btn" type="submit"${attr("disabled", busy, true)} data-testid="submit">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Create account</button></form> <p class="small muted">Already have one? <a${attr("href", `/signin?next=${encodeURIComponent(next)}`)}>Sign in</a>.</p></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
