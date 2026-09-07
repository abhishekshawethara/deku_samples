import { a5 as head, a6 as escape_html, a7 as store_get, a8 as attr_class, a9 as ensure_array_like, aa as attr, ab as unsubscribe_stores, ac as attr_style, P as derived } from '../../chunks/index.js-DtYBOeIk.js';
import { p as page, n as navigating } from '../../chunks/stores.js-E354-PGU.js';
import { a as authReady, b as account } from '../../chunks/session.js-EMz6Q6iE.js';
import '../../chunks/utils.js-Bzpr6vQU.js';
import '../../chunks/utils2.js-BQzn9ikS.js';
import '../../chunks/exports.js-8HOoaa4e.js';
import '../../chunks/root.js-DzEA886G.js';
import '../../chunks/state.svelte.js-DiBp0ONL.js';
import '../../chunks/index2.js-DXE0eiF0.js';
import '../../chunks/api.js-LBSLTNEi.js';

function Logo($$renderer, $$props) {
  let { size = 26, inverse = false } = $$props;
  const ink = derived(() => inverse ? "#ffffff" : "var(--ink)");
  $$renderer.push(`<span class="logo svelte-1l8nvlt"><svg${attr("width", size)}${attr("height", size)} viewBox="0 0 32 32" role="img" aria-label="Zettajoule mark" focusable="false"><g fill="none"${attr("stroke", ink())} stroke-width="1.6"><ellipse cx="16" cy="16" rx="13.5" ry="5.5"></ellipse><ellipse cx="16" cy="16" rx="13.5" ry="5.5" transform="rotate(60 16 16)"></ellipse><ellipse cx="16" cy="16" rx="13.5" ry="5.5" transform="rotate(120 16 16)"></ellipse></g><circle cx="16" cy="16" r="3.4" fill="var(--accent)"></circle><circle cx="27.5" cy="12.4" r="2"${attr("fill", ink())}></circle></svg> <span class="word svelte-1l8nvlt"${attr_style("", { color: inverse ? "#fff" : "var(--ink)" })}>Zettajoule</span></span>`);
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    const ROUTES = [
      { href: "/company", label: "Company" },
      { href: "/technology", label: "Technology" },
      { href: "/solutions", label: "Solutions" },
      { href: "/edge", label: "Our Edge" },
      { href: "/team", label: "Our Team" },
      { href: "/investors", label: "Investors" },
      { href: "/news", label: "News" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" }
    ];
    let menuOpen = false;
    let scrolled = false;
    let loadPct = 0;
    const currentPath = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.push(`<meta name="theme-color" content="#ffffff"/>`);
    });
    $$renderer2.push(`<a class="skip-link svelte-12qhfyh" href="#main">Skip to content</a> `);
    {
      $$renderer2.push(`<!--[0--><div class="boot svelte-12qhfyh" aria-live="polite"><div class="boot-inner svelte-12qhfyh">`);
      Logo($$renderer2, { size: 30 });
      $$renderer2.push(`<!----> <p class="boot-count mono svelte-12qhfyh">${escape_html(loadPct)}%</p> <p class="boot-note muted svelte-12qhfyh">Preparing the reactor</p></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$navigating", navigating)) {
      $$renderer2.push(`<!--[0--><div class="sweep svelte-12qhfyh" aria-hidden="true"></div> <p class="visually-hidden svelte-12qhfyh" aria-live="polite">Loading the next page</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <header${attr_class("bar svelte-12qhfyh", void 0, { "grounded": scrolled })}><div class="bar-inner svelte-12qhfyh"><a class="brand svelte-12qhfyh" href="/" aria-label="Zettajoule, home">`);
    Logo($$renderer2, {});
    $$renderer2.push(`<!----></a> <nav class="routes svelte-12qhfyh" aria-label="Main"><ul class="svelte-12qhfyh"><!--[-->`);
    const each_array = ensure_array_like(ROUTES);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let r = each_array[$$index];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)}${attr("aria-current", currentPath() === r.href ? "page" : void 0)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></nav> <div class="bar-actions svelte-12qhfyh">`);
    if (store_get($$store_subs ??= {}, "$authReady", authReady) && store_get($$store_subs ??= {}, "$account", account)) {
      $$renderer2.push(`<!--[0--><a class="acct svelte-12qhfyh" href="/account">${escape_html(store_get($$store_subs ??= {}, "$account", account).display_name)}</a> <button class="btn btn-quiet btn-sm svelte-12qhfyh" type="button">Sign out</button>`);
    } else if (store_get($$store_subs ??= {}, "$authReady", authReady)) {
      $$renderer2.push(`<!--[1--><a class="acct svelte-12qhfyh" href="/signin">Sign in</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <a class="btn btn-primary btn-sm touch svelte-12qhfyh" href="/contact">Get in Touch</a> <button class="menu-btn svelte-12qhfyh" type="button"${attr("aria-expanded", menuOpen)} aria-controls="route-panel"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" fill="none" class="svelte-12qhfyh"></path></svg> <span class="visually-hidden svelte-12qhfyh">Open the route menu</span></button></div></div></header> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <main id="main" tabindex="-1" class="svelte-12qhfyh">`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></main> <section class="cta svelte-12qhfyh"><div class="wrap cta-inner svelte-12qhfyh"><div class="svelte-12qhfyh"><h2 class="svelte-12qhfyh">Tell us what you need to power</h2> <p class="lede svelte-12qhfyh">Heat, hydrogen or firm electricity, at your temperature and on your fence line. We own and
				run the module; you buy the energy.</p></div> <a class="btn btn-primary svelte-12qhfyh" href="/contact">Get in Touch</a></div></section> <footer class="foot svelte-12qhfyh"><div class="wrap svelte-12qhfyh"><div class="foot-top svelte-12qhfyh"><div class="foot-brand svelte-12qhfyh">`);
    Logo($$renderer2, { inverse: true });
    $$renderer2.push(`<!----> <p class="svelte-12qhfyh">Small high-temperature reactor modules, owned, operated and staffed by us.</p></div> <nav aria-label="Footer" class="svelte-12qhfyh"><ul class="foot-routes svelte-12qhfyh"><!--[-->`);
    const each_array_2 = ensure_array_like(ROUTES);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let r = each_array_2[$$index_2];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--> <li class="svelte-12qhfyh"><a href="/calculator" class="svelte-12qhfyh">Calculator</a></li> <li class="svelte-12qhfyh"><a href="/faq" class="svelte-12qhfyh">FAQ</a></li> <li class="svelte-12qhfyh"><a href="/account" class="svelte-12qhfyh">Account</a></li></ul></nav> <div class="foot-social svelte-12qhfyh"><p class="foot-label svelte-12qhfyh">Elsewhere</p> <ul class="svelte-12qhfyh"><li class="svelte-12qhfyh"><a href="/contact" aria-label="Professional network" class="svelte-12qhfyh"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" class="svelte-12qhfyh"></rect><path d="M5.5 8v7M5.5 5.2v.1M9.5 15V8m0 3c0-2 4.5-2.4 4.5.6V15" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" class="svelte-12qhfyh"></path></svg> <span class="svelte-12qhfyh">Professional network</span></a></li> <li class="svelte-12qhfyh"><a href="/news" aria-label="Newsroom feed" class="svelte-12qhfyh"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" class="svelte-12qhfyh"></rect><path d="M5 14a1 1 0 100-2 1 1 0 000 2M5 10.5c2 0 3.5 1.5 3.5 3.5M5 7c4 0 7 3 7 7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" class="svelte-12qhfyh"></path></svg> <span class="svelte-12qhfyh">Newsroom feed</span></a></li></ul></div></div> <div class="foot-legal svelte-12qhfyh"><p class="svelte-12qhfyh">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Zettajoule. All rights reserved.</p> <p class="svelte-12qhfyh">Names, portraits and stories on this site are stand-ins; every mark and plate is drawn from
				code and no asset file is shipped.</p></div></div></footer>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte.js-BMPiPnuy.js.map
