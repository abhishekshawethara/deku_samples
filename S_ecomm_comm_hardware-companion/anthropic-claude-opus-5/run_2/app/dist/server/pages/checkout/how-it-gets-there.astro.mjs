import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$CheckoutSteps, a as $$CheckoutSummary } from '../../chunks/CheckoutSummary_Awe98YC2.mjs';
import { s as shippingMethods, c as cartByToken, r as readCart } from '../../chunks/cart_C--Khl-8.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
import { f as formatMoney } from '../../chunks/money_BIIhPbI9.mjs';
/* empty css                                                */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$HowItGetsThere = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$HowItGetsThere;
  const cart = Astro2.locals.cart;
  if (!cart || cart.lines.length === 0) return Astro2.redirect("/cart", 302);
  if (!cart.draft?.email || !cart.draft?.shipping_address?.line1) {
    return Astro2.redirect("/checkout/where-it-goes", 302);
  }
  const methods = await shippingMethods();
  let error = "";
  let chosen = cart.draft?.shipping_method ?? "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    chosen = String(form.get("shipping_method") ?? "");
    if (!chosen || !methods.some((m) => m.code === chosen)) {
      error = "Choose a delivery method.";
    } else {
      const raw = await cartByToken(Astro2.locals.cartToken);
      if (raw) {
        await query("UPDATE cart SET draft=$2, updated_at=now() WHERE id=$1", [
          raw.id,
          JSON.stringify({ ...raw.draft || {}, shipping_method: chosen })
        ]);
        return Astro2.redirect("/checkout/payment", 303);
      }
    }
  }
  const fresh = await cartByToken(Astro2.locals.cartToken);
  const view = fresh ? await readCart(fresh) : cart;
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "How it gets there \u2014 Vela", "current": "shop", "data-astro-cid-pa2nskyo": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="page-title" data-astro-cid-pa2nskyo>Checkout</h1> ${renderComponent($$result2, "CheckoutSteps", $$CheckoutSteps, { "step": 2, "data-astro-cid-pa2nskyo": true })} <div class="layout" data-astro-cid-pa2nskyo> <section class="panel" data-astro-cid-pa2nskyo> <h2 data-astro-cid-pa2nskyo>How it gets there</h2> ${error && renderTemplate`<p class="notice notice-wrong" role="alert" data-astro-cid-pa2nskyo>${error}</p>`} <form method="post" data-astro-cid-pa2nskyo> <!-- No method is preselected. --> <fieldset class="methods" data-astro-cid-pa2nskyo> <legend class="visually-hidden" data-astro-cid-pa2nskyo>Delivery method</legend> ${methods.map((m) => renderTemplate`<label class="method" data-astro-cid-pa2nskyo> <input type="radio" name="shipping_method"${addAttribute(m.code, "value")}${addAttribute(chosen === m.code, "checked")} required data-astro-cid-pa2nskyo> <span class="method-face" data-astro-cid-pa2nskyo> <span class="method-main" data-astro-cid-pa2nskyo> <span class="method-label" data-astro-cid-pa2nskyo>${m.label}</span> <span class="method-window xsmall muted" data-astro-cid-pa2nskyo>${m.window_text}</span> </span> <span class="method-price money" data-astro-cid-pa2nskyo>${formatMoney(m.price_minor)}</span> </span> </label>`)} </fieldset> <div class="actions" data-astro-cid-pa2nskyo> <button type="submit" class="button button-primary" data-astro-cid-pa2nskyo>Continue to payment</button> <a class="button button-quiet" href="/checkout/where-it-goes" data-astro-cid-pa2nskyo>Back</a> </div> </form> </section> ${renderComponent($$result2, "CheckoutSummary", $$CheckoutSummary, { "cart": view, "data-astro-cid-pa2nskyo": true })} </div> ` })} `;
}, "/app/src/pages/checkout/how-it-gets-there.astro", void 0);

const $$file = "/app/src/pages/checkout/how-it-gets-there.astro";
const $$url = "/checkout/how-it-gets-there";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HowItGetsThere,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
