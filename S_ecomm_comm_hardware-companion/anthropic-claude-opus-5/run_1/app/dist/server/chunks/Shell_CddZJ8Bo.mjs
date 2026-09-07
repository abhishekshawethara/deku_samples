import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent, F as Fragment, e as renderSlot } from './astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Base } from './Base_IsKydZqX.mjs';
import 'clsx';
/* empty css                            */

const $$Astro$1 = createAstro();
const $$CartButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CartButton;
  const { count = 0 } = Astro2.props;
  const badge = count > 99 ? "99+" : String(count);
  const label = count === 1 ? "Cart, 1 item" : `Cart, ${count} items`;
  return renderTemplate`${maybeRenderHead()}<a class="cart-button" href="/cart"${addAttribute(label, "aria-label")} data-astro-cid-4b4iadpb> <span aria-hidden="true" class="cart-glyph" data-astro-cid-4b4iadpb></span> <span class="cart-word" data-astro-cid-4b4iadpb>Cart</span> ${count > 0 && renderTemplate`<span class="cart-badge tnum" aria-hidden="true" data-astro-cid-4b4iadpb>${badge}</span>`} </a> `;
}, "/app/src/components/CartButton.astro", void 0);

const $$Astro = createAstro();
const $$Shell = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Shell;
  const { title, current = "", description } = Astro2.props;
  const customer = Astro2.locals.customer ?? null;
  const cartCount = Astro2.locals.cartCount ?? 0;
  const shopEntries = [
    { key: "shop", href: "/shop", label: "Shop" },
    { key: "downloads", href: "/downloads", label: "Downloads" },
    { key: "doctor", href: "/doctor", label: "Firmware installer" }
  ];
  const accountEntries = customer ? [
    { key: "account", href: "/account", label: "Overview" },
    { key: "orders", href: "/account/orders", label: "Orders" },
    { key: "cameras", href: "/account/cameras", label: "Cameras" }
  ] : [];
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": title, "description": description, "data-astro-cid-eh5ed76d": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<a class="skip-link" href="#content" data-astro-cid-eh5ed76d>Skip to content</a> <div class="shell" data-astro-cid-eh5ed76d> <!-- On a narrow viewport the rail collapses to a single control at the top
         of the content column: the only place in the product where a control
         replaces navigation. --> <input type="checkbox" id="rail-toggle" class="rail-toggle-state" hidden data-astro-cid-eh5ed76d> <nav class="rail" aria-label="Sections" data-astro-cid-eh5ed76d> <div class="rail-inner" data-astro-cid-eh5ed76d> <a class="wordmark" href="/" data-astro-cid-eh5ed76d> <span aria-hidden="true" class="wordmark-mark" data-astro-cid-eh5ed76d></span>
Vela
</a> <ul class="rail-list" data-astro-cid-eh5ed76d> ${shopEntries.map((e) => renderTemplate`<li data-astro-cid-eh5ed76d> <a${addAttribute(e.href, "href")}${addAttribute(["rail-link", { "rail-link-current": current === e.key }], "class:list")}${addAttribute(current === e.key ? "page" : void 0, "aria-current")} data-astro-cid-eh5ed76d> <span class="rail-marker" aria-hidden="true" data-astro-cid-eh5ed76d></span> ${e.label} </a> </li>`)} </ul> ${accountEntries.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-eh5ed76d": true }, { "default": ($$result3) => renderTemplate` <p class="rail-heading" id="rail-account" data-astro-cid-eh5ed76d>Account</p> <ul class="rail-list" aria-labelledby="rail-account" data-astro-cid-eh5ed76d> ${accountEntries.map((e) => renderTemplate`<li data-astro-cid-eh5ed76d> <a${addAttribute(e.href, "href")}${addAttribute(["rail-link", { "rail-link-current": current === e.key }], "class:list")}${addAttribute(current === e.key ? "page" : void 0, "aria-current")} data-astro-cid-eh5ed76d> <span class="rail-marker" aria-hidden="true" data-astro-cid-eh5ed76d></span> ${e.label} </a> </li>`)} </ul> ` })}`} <div class="rail-foot" data-astro-cid-eh5ed76d> ${customer ? renderTemplate`<form method="post" action="/sign-out" data-astro-cid-eh5ed76d> <p class="xsmall muted rail-who" data-astro-cid-eh5ed76d>Signed in as ${customer.email}</p> <button type="submit" class="button button-quiet rail-signout" data-astro-cid-eh5ed76d>Sign out</button> </form>` : renderTemplate`<a class="button button-quiet rail-signout" href="/sign-in" data-astro-cid-eh5ed76d>Sign in</a>`} </div> </div> </nav> <div class="column" data-astro-cid-eh5ed76d> <div class="topbar" data-astro-cid-eh5ed76d> <label for="rail-toggle" class="rail-toggle-button" data-astro-cid-eh5ed76d> <span aria-hidden="true" class="rail-toggle-glyph" data-astro-cid-eh5ed76d></span>
Sections
</label> <a class="topbar-wordmark" href="/" data-astro-cid-eh5ed76d>Vela</a> ${renderComponent($$result2, "CartButton", $$CartButton, { "count": cartCount, "data-astro-cid-eh5ed76d": true })} </div> <main id="content" class="content" tabindex="-1" data-astro-cid-eh5ed76d> ${renderSlot($$result2, $$slots["default"])} </main> <footer class="column-footer" data-astro-cid-eh5ed76d> <p class="xsmall muted" data-astro-cid-eh5ed76d>
Vela · All rights reserved ·
<a href="/shop" data-astro-cid-eh5ed76d>Shop</a> · <a href="/downloads" data-astro-cid-eh5ed76d>Downloads</a> ·
<a href="/doctor" data-astro-cid-eh5ed76d>Firmware installer</a> </p> </footer> </div> </div> ` })} `;
}, "/app/src/layouts/Shell.astro", void 0);

export { $$Shell as $ };
