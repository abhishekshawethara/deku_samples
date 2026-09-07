import { a5 as store_get, a6 as attr_class, a7 as ensure_array_like, a8 as attr, a9 as escape_html, aa as slot, ab as unsubscribe_stores, ac as fallback, ad as bind_props } from '../../chunks/index.js-D2EWZzu8.js';
import { p as page, n as navigating } from '../../chunks/stores.js-Df_k4Qpr.js';
import '../../chunks/exports.js-8HOoaa4e.js';
import '../../chunks/utils2.js-BQzn9ikS.js';
import '../../chunks/utils.js-Bzpr6vQU.js';
import '../../chunks/root.js-DYTbTUbw.js';
import '../../chunks/state.svelte.js-CqN4U7qs.js';

function Logo($$renderer, $$props) {
  let size = fallback($$props["size"], 30);
  let light = fallback($$props["light"], false);
  $$renderer.push(`<span class="logo svelte-1l8nvlt"><svg${attr("width", size)}${attr("height", size)} viewBox="0 0 40 40" role="img" aria-label="Zettajoule mark: a particle circling a core" focusable="false"><g fill="none"${attr("stroke", light ? "#ffffff" : "var(--accent)")} stroke-width="1.6"><ellipse cx="20" cy="20" rx="17" ry="6.5"></ellipse><ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(60 20 20)"></ellipse><ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(120 20 20)"></ellipse></g><circle cx="20" cy="20" r="4"${attr("fill", light ? "#ffffff" : "var(--accent)")}></circle></svg> <span${attr_class("word svelte-1l8nvlt", void 0, { "light": light })}>Zettajoule</span></span>`);
  bind_props($$props, { size, light });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
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
    store_get($$store_subs ??= {}, "$page", page).url.pathname, menuOpen = false;
    $$renderer2.push(`<a class="skip-link svelte-12qhfyh" href="#main">Skip to the main content</a> `);
    if (store_get($$store_subs ??= {}, "$navigating", navigating)) {
      $$renderer2.push(`<!--[0--><div class="route-cover svelte-12qhfyh" aria-hidden="true"></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <header${attr_class("bar svelte-12qhfyh", void 0, { "scrolled": scrolled })} data-testid="topbar"><div class="bar-inner svelte-12qhfyh"><a href="/" class="brand svelte-12qhfyh" aria-label="Zettajoule, home">`);
    Logo($$renderer2, {});
    $$renderer2.push(`<!----></a> <nav class="routes svelte-12qhfyh" aria-label="Main"><ul class="svelte-12qhfyh"><!--[-->`);
    const each_array = ensure_array_like(ROUTES);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let r = each_array[$$index];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)}${attr("aria-current", store_get($$store_subs ??= {}, "$page", page).url.pathname === r.href ? "page" : void 0)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></nav> <div class="actions svelte-12qhfyh">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <a class="btn btn-sm cta svelte-12qhfyh" href="/contact">Get in Touch</a> <button type="button" class="menu-btn svelte-12qhfyh"${attr("aria-expanded", menuOpen)} aria-controls="route-menu">`);
    if (menuOpen) {
      $$renderer2.push(`<!--[0--><svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2" class="svelte-12qhfyh"></path></svg>`);
    } else {
      $$renderer2.push(`<!--[-1--><svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><path d="M2 4 H14 M2 8 H14 M2 12 H14" stroke="currentColor" stroke-width="2" class="svelte-12qhfyh"></path></svg>`);
    }
    $$renderer2.push(`<!--]--> <span class="sr-only svelte-12qhfyh">${escape_html(menuOpen ? "Close the menu" : "Open the menu")}</span></button></div></div></header> `);
    if (menuOpen) {
      $$renderer2.push(`<!--[0--><div class="menu-panel svelte-12qhfyh" id="route-menu"><nav aria-label="Routes" class="svelte-12qhfyh"><ul class="svelte-12qhfyh"><!--[-->`);
      const each_array_1 = ensure_array_like(ROUTES);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let r = each_array_1[$$index_1];
        $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
      }
      $$renderer2.push(`<!--]--> <li class="svelte-12qhfyh"><a href="/calculator" class="svelte-12qhfyh">Calculator</a></li> <li class="svelte-12qhfyh"><a href="/compare" class="svelte-12qhfyh">Compare</a></li> <li class="svelte-12qhfyh"><a href="/faq" class="svelte-12qhfyh">FAQ</a></li> <li class="svelte-12qhfyh"><a${attr("href", "/signin")} class="svelte-12qhfyh">${escape_html("Sign in")}</a></li></ul></nav> <a class="btn svelte-12qhfyh" href="/contact">Get in Touch</a></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <main id="main" tabindex="-1" class="svelte-12qhfyh"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></main> <section class="invite svelte-12qhfyh"><div class="wrap invite-inner svelte-12qhfyh"><div class="svelte-12qhfyh"><p class="eyebrow svelte-12qhfyh">Next step</p> <h2 class="svelte-12qhfyh">Tell us what you need powered.</h2> <p class="lede svelte-12qhfyh">Careers, investor and supplier enquiries all start in the same place. We reply to the address
        you give us with a reference you can quote back.</p></div> <a class="btn svelte-12qhfyh" href="/contact">Get in Touch</a></div></section> <footer class="foot svelte-12qhfyh"><div class="wrap foot-inner svelte-12qhfyh"><div class="foot-brand svelte-12qhfyh">`);
    Logo($$renderer2, { light: true });
    $$renderer2.push(`<!----> <p class="svelte-12qhfyh">Small high-temperature gas-cooled modules. We own them, run them and sell the energy.</p></div> <nav aria-label="Footer routes" class="svelte-12qhfyh"><h3 class="svelte-12qhfyh">Routes</h3> <ul class="svelte-12qhfyh"><!--[-->`);
    const each_array_2 = ensure_array_like(ROUTES);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let r = each_array_2[$$index_2];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></nav> <nav aria-label="Working routes" class="svelte-12qhfyh"><h3 class="svelte-12qhfyh">Work with it</h3> <ul class="svelte-12qhfyh"><li class="svelte-12qhfyh"><a href="/solutions" class="svelte-12qhfyh">Solutions explorer</a></li> <li class="svelte-12qhfyh"><a href="/calculator" class="svelte-12qhfyh">Energy calculator</a></li> <li class="svelte-12qhfyh"><a href="/compare" class="svelte-12qhfyh">Compare saves</a></li> <li class="svelte-12qhfyh"><a href="/faq" class="svelte-12qhfyh">Questions</a></li> <li class="svelte-12qhfyh"><a href="/account" class="svelte-12qhfyh">Account</a></li></ul></nav> <div class="foot-social svelte-12qhfyh"><h3 class="svelte-12qhfyh">Elsewhere</h3> <ul class="social svelte-12qhfyh"><li class="svelte-12qhfyh"><a href="/contact" aria-label="Professional network profile" class="svelte-12qhfyh"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.4" class="svelte-12qhfyh"></rect><path d="M5 8v7M5 5.2v.1M9 15V8m0 3c0-2 4-2 4 0v4" stroke="currentColor" stroke-width="1.6" fill="none" class="svelte-12qhfyh"></path></svg> <span class="sr-only svelte-12qhfyh">Professional network</span></a></li> <li class="svelte-12qhfyh"><a href="/contact" aria-label="Short posts profile" class="svelte-12qhfyh"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.4" class="svelte-12qhfyh"></rect><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6" class="svelte-12qhfyh"></path></svg> <span class="sr-only svelte-12qhfyh">Short posts</span></a></li> <li class="svelte-12qhfyh"><a href="/news" aria-label="Newsroom feed" class="svelte-12qhfyh"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.4" class="svelte-12qhfyh"></rect><path d="M5 14a5 5 0 0 1 0-8M8 14a8 8 0 0 0 0-8" stroke="currentColor" stroke-width="1.6" fill="none" class="svelte-12qhfyh"></path></svg> <span class="sr-only svelte-12qhfyh">Newsroom feed</span></a></li></ul> <p class="legal svelte-12qhfyh">© 2026 Zettajoule BV. Rotterdam, Chicago, Tokyo.<br class="svelte-12qhfyh"/> Privacy notice, terms of use and cookie statement available on request.</p></div></div></footer>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte.js-lYGypoQj.js.map
