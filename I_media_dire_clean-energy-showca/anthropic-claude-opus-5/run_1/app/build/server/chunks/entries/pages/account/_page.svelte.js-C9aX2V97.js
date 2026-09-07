import { a5 as head, a6 as escape_html, a7 as store_get, ab as unsubscribe_stores } from '../../../chunks/index.js-DtYBOeIk.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-DzEA886G.js';
import '../../../chunks/state.svelte.js-DiBp0ONL.js';
import '../../../chunks/api.js-LBSLTNEi.js';
import { M as Modal } from '../../../chunks/Modal.js-CsCHkgpZ.js';
import { b as account } from '../../../chunks/session.js-EMz6Q6iE.js';
import '../../../chunks/index2.js-DXE0eiF0.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let confirming = null;
    head("8i5vi8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Your account, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-8i5vi8"><div class="wrap"><p class="eyebrow">Account</p> <h1>${escape_html(store_get($$store_subs ??= {}, "$account", account) ? store_get($$store_subs ??= {}, "$account", account).display_name : "Your account")}</h1> <p class="lede">`);
    if (store_get($$store_subs ??= {}, "$account", account)) {
      $$renderer2.push(`<!--[0-->Signed in as ${escape_html(store_get($$store_subs ??= {}, "$account", account).email)}. Everything below belongs to this account alone.`);
    } else {
      $$renderer2.push(`<!--[-1-->Loading
				your account.`);
    }
    $$renderer2.push(`<!--]--></p> <div class="head-actions svelte-8i5vi8"><a class="btn btn-quiet btn-sm" href="/solutions">Explore solutions</a> <a class="btn btn-quiet btn-sm" href="/compare">Compare saves</a> <button class="btn btn-quiet btn-sm" type="button">Sign out</button></div></div></section> <section class="section-tight"><div class="wrap">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><p class="loading svelte-8i5vi8"><span class="spinner" aria-hidden="true"></span> Loading your lists</p>`);
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<button class="btn btn-quiet" type="button">Keep it</button> <button class="btn btn-danger" type="button">Remove it</button>`);
      };
      Modal($$renderer2, {
        open: !!confirming,
        title: "Remove this from your account?",
        onclose: () => confirming = null,
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<p>This removes <strong>${escape_html(confirming?.label)}</strong> from your account. It cannot be undone, though you
		can save it again from the explorer.</p>`);
        }
      });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-C9aX2V97.js.map
