import { a5 as store_get, ae as head, a8 as attr, a9 as escape_html, ab as unsubscribe_stores } from '../../../chunks/index.js-D2EWZzu8.js';
import { p as page } from '../../../chunks/stores.js-Df_k4Qpr.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-DYTbTUbw.js';
import '../../../chunks/state.svelte.js-CqN4U7qs.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let next, emailError, passwordError;
    let email = "";
    let password = "";
    let busy = false;
    next = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("next") || "/account";
    emailError = "";
    passwordError = "";
    head("iq265b", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign in, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section"><div class="wrap auth svelte-iq265b"><div><p class="eyebrow">Account</p> <h1>Sign in</h1> <p class="lede">Your saved solutions, searches, enquiries, access request and applications live in your
        account and nowhere else.</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate="" class="svelte-iq265b"><div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)}${attr("aria-invalid", !!emailError)}${attr("aria-describedby", emailError ? "email-err" : void 0)} data-testid="email"/> `);
    if (emailError) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="email-err">${escape_html(emailError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="password">Password</label> <input id="password" type="password" autocomplete="current-password"${attr("value", password)}${attr("aria-invalid", !!passwordError)}${attr("aria-describedby", passwordError ? "pw-err" : void 0)} data-testid="password"/> `);
    if (passwordError) {
      $$renderer2.push(`<!--[0--><p class="field-error" id="pw-err">${escape_html(passwordError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="btn" type="submit"${attr("disabled", busy, true)} data-testid="submit">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Sign in</button></form> <p class="small muted">No account yet? <a${attr("href", `/signup?next=${encodeURIComponent(next)}`)}>Create one</a>. Saves
        made before you sign in follow you in.</p></div> <aside class="card"><h2>Demo accounts</h2> <p class="small muted">Fixture data for this build, not a secret.</p> <ul class="creds svelte-iq265b"><li class="svelte-iq265b"><code>visitor@example.com</code> Ada Moreau</li> <li class="svelte-iq265b"><code>visitor2@example.com</code> Ken Adeyemi</li> <li class="svelte-iq265b">Password <code>deku-demo-pw-2026</code></li></ul></aside></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-BjGrA1Qa.js.map
