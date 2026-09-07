import { a7 as escape_html, a8 as attr_style, a9 as store_get, aa as attr_class, ab as ensure_array_like, ac as attr, ad as unsubscribe_stores, R as derived } from '../../chunks/index.js-CnICPAax.js';
import { p as page, n as navigating } from '../../chunks/stores.js-CGRUs2r6.js';
import '../../chunks/exports.js-8HOoaa4e.js';
import '../../chunks/utils2.js-BQzn9ikS.js';
import '../../chunks/utils.js-Bzpr6vQU.js';
import '../../chunks/root.js-GlEKx5p3.js';
import '../../chunks/state.svelte.js-CoYBmM9v.js';
import { i as isSignedIn, a as account } from '../../chunks/auth.js-CRCsruHm.js';
import { s as scrollY } from '../../chunks/scroll.js-XFfYl84w.js';
import '../../chunks/index2.js-Bm-nwO79.js';

function Logo($$renderer, $$props) {
  let { size = 26, showName = true, tone = "ink" } = $$props;
  const stroke = tone === "light" ? "#ffffff" : "var(--accent)";
  const core = tone === "light" ? "#ffffff" : "var(--ink)";
  const word = tone === "light" ? "#ffffff" : "var(--ink)";
  $$renderer.push(`<span class="logo svelte-byj55g"><svg${attr("width", size)}${attr("height", size)} viewBox="0 0 32 32" aria-hidden="true" focusable="false" class="logo__mark"><ellipse cx="16" cy="16" rx="13.5" ry="5.2" fill="none"${attr("stroke", stroke)} stroke-width="1.8"></ellipse><ellipse cx="16" cy="16" rx="13.5" ry="5.2" fill="none"${attr("stroke", stroke)} stroke-width="1.8" transform="rotate(60 16 16)"></ellipse><ellipse cx="16" cy="16" rx="13.5" ry="5.2" fill="none"${attr("stroke", stroke)} stroke-width="1.8" transform="rotate(120 16 16)"></ellipse><circle cx="16" cy="16" r="3.1"${attr("fill", core)}></circle></svg> `);
  if (showName) {
    $$renderer.push(`<!--[0--><span class="logo__word svelte-byj55g"${attr_style("", { color: word })}>Zettajoule</span>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></span>`);
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
    let bootPercent = 0;
    const scrolled = derived(() => store_get($$store_subs ??= {}, "$scrollY", scrollY) > 8);
    const path = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
    $$renderer2.push(`<a class="skip-link svelte-12qhfyh" href="#main">Skip to content</a> `);
    {
      $$renderer2.push(`<!--[0--><div class="boot svelte-12qhfyh" aria-live="polite" aria-label="Loading Zettajoule">`);
      Logo($$renderer2, { size: 34 });
      $$renderer2.push(`<!----> <p class="boot__count svelte-12qhfyh">${escape_html(bootPercent)}%</p> <div class="boot__bar svelte-12qhfyh"><span class="svelte-12qhfyh"${attr_style("", { width: `${bootPercent}%` })}></span></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$navigating", navigating)) {
      $$renderer2.push(`<!--[0--><div class="sweep svelte-12qhfyh" aria-hidden="true"></div> <p class="visually-hidden svelte-12qhfyh" role="status">Loading page</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <header${attr_class("bar svelte-12qhfyh", void 0, { "bar--scrolled": scrolled() })}><div class="bar__inner svelte-12qhfyh"><a class="bar__logo svelte-12qhfyh" href="/" aria-label="Zettajoule, home">`);
    Logo($$renderer2, { size: 24 });
    $$renderer2.push(`<!----></a> <nav class="bar__nav svelte-12qhfyh" aria-label="Main"><ul class="svelte-12qhfyh"><!--[-->`);
    const each_array = ensure_array_like(ROUTES);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let r = each_array[$$index];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)}${attr("aria-current", path() === r.href ? "page" : void 0)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></nav> <div class="bar__end svelte-12qhfyh"><a class="bar__account svelte-12qhfyh" href="/account">${escape_html(store_get($$store_subs ??= {}, "$isSignedIn", isSignedIn) ? "Account" : "Sign in")}</a> <a class="btn btn--sm bar__cta svelte-12qhfyh" href="/contact">Get in Touch</a> <button class="bar__menu svelte-12qhfyh" type="button"${attr("aria-expanded", menuOpen)} aria-controls="route-panel"><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" stroke-width="2" class="svelte-12qhfyh"></path></svg> <span class="visually-hidden svelte-12qhfyh">Menu</span></button></div></div></header> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <main id="main" tabindex="-1" class="svelte-12qhfyh">`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></main> <section class="invite svelte-12qhfyh"><div class="wrap invite__inner svelte-12qhfyh"><div class="svelte-12qhfyh"><p class="eyebrow svelte-12qhfyh">Get in touch</p> <h2 class="invite__head svelte-12qhfyh">Tell us what your site needs.</h2> <p class="muted svelte-12qhfyh">Careers, investor and supplier enquiries all reach the same place, and every one gets a
				reference back.</p></div> <div class="row svelte-12qhfyh"><a class="btn svelte-12qhfyh" href="/contact">Get in Touch</a> <a class="btn btn--ghost svelte-12qhfyh" href="/calculator">Size a site</a></div></div></section> <footer class="foot svelte-12qhfyh"><div class="wrap foot__inner svelte-12qhfyh"><div class="foot__brand svelte-12qhfyh">`);
    Logo($$renderer2, { size: 26, tone: "light" });
    $$renderer2.push(`<!----> <p class="svelte-12qhfyh">Small modular high-temperature reactors. We sell the energy, not the reactor.</p> `);
    if (store_get($$store_subs ??= {}, "$isSignedIn", isSignedIn) && store_get($$store_subs ??= {}, "$account", account)) {
      $$renderer2.push(`<!--[0--><p class="foot__who svelte-12qhfyh">Signed in as ${escape_html(store_get($$store_subs ??= {}, "$account", account).display_name)} <button class="foot__signout svelte-12qhfyh" type="button">Sign out</button></p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <nav class="foot__nav svelte-12qhfyh" aria-label="Footer"><ul class="svelte-12qhfyh"><!--[-->`);
    const each_array_2 = ensure_array_like(ROUTES);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let r = each_array_2[$$index_2];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a${attr("href", r.href)} class="svelte-12qhfyh">${escape_html(r.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--> <li class="svelte-12qhfyh"><a href="/calculator" class="svelte-12qhfyh">Calculator</a></li> <li class="svelte-12qhfyh"><a href="/compare" class="svelte-12qhfyh">Compare</a></li> <li class="svelte-12qhfyh"><a href="/faq" class="svelte-12qhfyh">FAQ</a></li> <li class="svelte-12qhfyh"><a href="/account" class="svelte-12qhfyh">Account</a></li></ul></nav> <div class="foot__social svelte-12qhfyh"><p class="eyebrow svelte-12qhfyh" style="color:#9fb6d4">Elsewhere</p> <ul class="svelte-12qhfyh"><!--[-->`);
    const each_array_3 = ensure_array_like([["in", "LinkedIn"], ["x", "X"], ["yt", "YouTube"]]);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let [mark, name] = each_array_3[$$index_3];
      $$renderer2.push(`<li class="svelte-12qhfyh"><a href="/contact"${attr("aria-label", name)} class="svelte-12qhfyh"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="svelte-12qhfyh"><rect x="1" y="1" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" class="svelte-12qhfyh"></rect><text x="10" y="14" text-anchor="middle" font-size="8" font-family="var(--font-head)" fill="currentColor" class="svelte-12qhfyh">${escape_html(mark)}</text></svg> <span class="visually-hidden svelte-12qhfyh">${escape_html(name)}</span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div> <div class="wrap foot__legal svelte-12qhfyh"><p class="svelte-12qhfyh">© 2026 Zettajoule. All rights reserved.</p> <p class="svelte-12qhfyh">Privacy notice · Terms of use · Cookie notice</p></div></footer>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte.js-DdHecZvz.js.map
