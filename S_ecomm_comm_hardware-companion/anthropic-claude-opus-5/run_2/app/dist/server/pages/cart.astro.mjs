import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$ProductMedia } from '../chunks/ProductMedia_Cfn42Ikw.mjs';
import { f as formatMoney } from '../chunks/money_BIIhPbI9.mjs';
import '../chunks/db_gZE7iOnF.mjs';
/* empty css                                */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Cart = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Cart;
  const cart = Astro2.locals.cart;
  const lines = cart?.lines ?? [];
  const notices = cart?.notices ?? [];
  const rung = cart?.protection_rung ?? null;
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Cart \u2014 Vela", "current": "shop", "data-astro-cid-h3zw4u6d": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-h3zw4u6d> <h1 data-astro-cid-h3zw4u6d>Cart</h1> </header> ${lines.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-h3zw4u6d> <p data-astro-cid-h3zw4u6d>Your cart is empty.</p> <p data-astro-cid-h3zw4u6d><a href="/shop" data-astro-cid-h3zw4u6d>Shop</a></p> </div>` : renderTemplate`<div class="cart" data-cart data-astro-cid-h3zw4u6d> <div class="lines-side" data-astro-cid-h3zw4u6d> <!-- A price or availability change renders above the lines as a
             persistent notice that cannot be dismissed. --> ${notices.map((n) => renderTemplate`<p class="notice notice-progress" role="status" data-astro-cid-h3zw4u6d>${n.message}</p>`)} <p class="cart-status" data-cart-status role="status" aria-live="polite" data-astro-cid-h3zw4u6d></p> <ul class="lines" data-astro-cid-h3zw4u6d> ${lines.map((l) => renderTemplate`<li class="line"${addAttribute(l.id, "data-line")} data-astro-cid-h3zw4u6d> <a class="line-media"${addAttribute(`/shop/${l.handle}?variant=${l.sku}`, "href")} tabindex="-1" aria-hidden="true" data-astro-cid-h3zw4u6d> ${renderComponent($$result2, "ProductMedia", $$ProductMedia, { "handle": l.handle, "option": l.option_value, "ratio": "1 / 1", "data-astro-cid-h3zw4u6d": true })} </a> <div class="line-body" data-astro-cid-h3zw4u6d> <a class="line-title"${addAttribute(`/shop/${l.handle}?variant=${l.sku}`, "href")} data-astro-cid-h3zw4u6d>${l.title}</a> <p class="line-variant xsmall muted" data-astro-cid-h3zw4u6d>${l.option_value} · <span class="serial" data-astro-cid-h3zw4u6d>${l.sku}</span></p> <p class="line-unit xsmall muted money" data-astro-cid-h3zw4u6d>${formatMoney(l.unit_price_minor)} each</p> </div> <div class="line-qty" data-astro-cid-h3zw4u6d> <label class="visually-hidden"${addAttribute(`qty-${l.id}`, "for")} data-astro-cid-h3zw4u6d>Quantity of ${l.title}</label> <input type="number"${addAttribute(`qty-${l.id}`, "id")}${addAttribute(l.quantity, "value")} min="1"${addAttribute(Math.max(1, Math.min(10, l.available)), "max")} inputmode="numeric" data-quantity${addAttribute(l.quantity, "data-previous")} data-astro-cid-h3zw4u6d> </div> <p class="line-total money" data-line-total data-astro-cid-h3zw4u6d>${formatMoney(l.total_minor)}</p> <button type="button" class="button button-quiet line-remove" data-remove${addAttribute(`Remove ${l.title} from the cart`, "aria-label")} data-astro-cid-h3zw4u6d>Remove</button> </li>`)} </ul> </div> <aside class="summary card" data-summary aria-label="Cart summary" data-astro-cid-h3zw4u6d> <h2 data-astro-cid-h3zw4u6d>Summary</h2> <!-- Every figure is labelled estimated until the address is known. --> <dl class="totals" data-astro-cid-h3zw4u6d> <div data-astro-cid-h3zw4u6d><dt data-astro-cid-h3zw4u6d>Estimated subtotal</dt><dd class="money" data-total="subtotal" data-astro-cid-h3zw4u6d>${formatMoney(cart.subtotal_minor)}</dd></div> <div data-protection-row${addAttribute(!cart.protection_enabled, "hidden")} data-astro-cid-h3zw4u6d> <dt data-astro-cid-h3zw4u6d>Shipment protection</dt> <dd class="money" data-total="protection" data-astro-cid-h3zw4u6d>${formatMoney(cart.protection_minor)}</dd> </div> <div data-astro-cid-h3zw4u6d><dt data-astro-cid-h3zw4u6d>Estimated delivery</dt><dd class="money" data-total="shipping" data-astro-cid-h3zw4u6d>${formatMoney(cart.shipping_minor)}</dd></div> <div data-astro-cid-h3zw4u6d><dt data-astro-cid-h3zw4u6d>Estimated tax</dt><dd class="money" data-total="tax" data-astro-cid-h3zw4u6d>${formatMoney(cart.tax_minor)}</dd></div> <div class="totals-final" data-astro-cid-h3zw4u6d><dt data-astro-cid-h3zw4u6d>Estimated total</dt><dd class="money" data-total="total" data-astro-cid-h3zw4u6d>${formatMoney(cart.total_minor)}</dd></div> </dl> <p class="xsmall muted estimate-note" data-astro-cid-h3zw4u6d>
Estimated. We will show the exact amount once we know where it is going.
</p> ${rung && renderTemplate`<label class="protect" data-astro-cid-h3zw4u6d> <input type="checkbox" data-protection${addAttribute(cart.protection_enabled, "checked")} data-astro-cid-h3zw4u6d> <span data-astro-cid-h3zw4u6d>Protect this shipment against loss, theft and damage for ${formatMoney(rung.price_minor)}</span> </label>`} <a class="button button-primary continue" href="/checkout/where-it-goes" data-astro-cid-h3zw4u6d>Continue</a> <a class="button button-quiet keep" href="/shop" data-astro-cid-h3zw4u6d>Keep shopping</a> </aside> </div>`} ` })} `;
}, "/app/src/pages/cart.astro", void 0);

const $$file = "/app/src/pages/cart.astro";
const $$url = "/cart";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cart,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
