import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, F as Fragment, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$CheckoutSteps, a as $$CheckoutSummary } from '../../chunks/CheckoutSummary_Awe98YC2.mjs';
import { c as cartByToken, r as readCart, a as shippingMethod } from '../../chunks/cart_C--Khl-8.mjs';
import { p as placeOrder } from '../../chunks/orders_C_gxanvP.mjs';
import { f as formatMoney } from '../../chunks/money_BIIhPbI9.mjs';
import '../../chunks/db_gZE7iOnF.mjs';
/* empty css                                      */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Payment = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Payment;
  const cart = Astro2.locals.cart;
  if (!cart || cart.lines.length === 0) return Astro2.redirect("/cart", 302);
  if (!cart.draft?.email || !cart.draft?.shipping_address?.line1) {
    return Astro2.redirect("/checkout/where-it-goes", 302);
  }
  if (!cart.draft?.shipping_method) {
    return Astro2.redirect("/checkout/how-it-gets-there", 302);
  }
  let error = "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const raw = await cartByToken(Astro2.locals.cartToken);
    if (raw) {
      try {
        const view2 = await readCart(raw);
        const result = await placeOrder({
          cart: raw,
          cartView: view2,
          customer: Astro2.locals.customer,
          idempotencyKey: String(form.get("idempotency_key") || "") || null,
          expectedTotalMinor: Number(form.get("expected_total_minor") || 0) || null
        });
        const token = result.accessToken ? `?access_token=${encodeURIComponent(result.accessToken)}` : "";
        return Astro2.redirect(`/orders/${result.order.number}${token}`, 303);
      } catch (err) {
        if (err?.code === "price_changed" || err?.code === "total_changed") {
          return Astro2.redirect("/cart?repriced=1", 303);
        }
        error = err?.message || "That did not work.";
      }
    }
  }
  const fresh = await cartByToken(Astro2.locals.cartToken);
  const view = fresh ? await readCart(fresh) : cart;
  const method = await shippingMethod(view.draft.shipping_method);
  const address = view.draft.shipping_address;
  const formKey = `${view.token}:${view.total_minor}`;
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Payment \u2014 Vela", "current": "shop", "data-astro-cid-j4t6opjn": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="page-title" data-astro-cid-j4t6opjn>Checkout</h1> ${renderComponent($$result2, "CheckoutSteps", $$CheckoutSteps, { "step": 3, "data-astro-cid-j4t6opjn": true })} <div class="layout" data-astro-cid-j4t6opjn> <section class="panel" data-astro-cid-j4t6opjn> <h2 data-astro-cid-j4t6opjn>Payment</h2> ${error && renderTemplate`<p class="notice notice-wrong" role="alert" data-astro-cid-j4t6opjn>${error}</p>`} <div class="review card" data-astro-cid-j4t6opjn> <div class="review-row" data-astro-cid-j4t6opjn> <h3 data-astro-cid-j4t6opjn>Where it goes</h3> <a class="review-edit" href="/checkout/where-it-goes" data-astro-cid-j4t6opjn>Change</a> </div> <p class="review-body small" data-astro-cid-j4t6opjn> ${address.name}<br data-astro-cid-j4t6opjn> ${address.line1}${address.line2 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-j4t6opjn": true }, { "default": async ($$result3) => renderTemplate`, ${address.line2}` })}` : null}<br data-astro-cid-j4t6opjn> ${address.city}, ${address.region} <span class="tnum" data-astro-cid-j4t6opjn>${address.postal_code}</span><br data-astro-cid-j4t6opjn> ${address.country}<br data-astro-cid-j4t6opjn> <span class="muted" data-astro-cid-j4t6opjn>${view.draft.email}</span> </p> </div> <div class="review card" data-astro-cid-j4t6opjn> <div class="review-row" data-astro-cid-j4t6opjn> <h3 data-astro-cid-j4t6opjn>How it gets there</h3> <a class="review-edit" href="/checkout/how-it-gets-there" data-astro-cid-j4t6opjn>Change</a> </div> <p class="review-body small" data-astro-cid-j4t6opjn> ${method?.label} · <span class="muted" data-astro-cid-j4t6opjn>${method?.window_text}</span> ·
<span class="money" data-astro-cid-j4t6opjn>${formatMoney(view.shipping_minor)}</span> </p> </div> <!-- The final total, and one control to place the order. --> <div class="final" data-astro-cid-j4t6opjn> <dl class="final-totals" data-astro-cid-j4t6opjn> <div data-astro-cid-j4t6opjn><dt data-astro-cid-j4t6opjn>Subtotal</dt><dd class="money" data-astro-cid-j4t6opjn>${formatMoney(view.subtotal_minor)}</dd></div> <div data-astro-cid-j4t6opjn><dt data-astro-cid-j4t6opjn>Delivery</dt><dd class="money" data-astro-cid-j4t6opjn>${formatMoney(view.shipping_minor)}</dd></div> <div data-astro-cid-j4t6opjn><dt data-astro-cid-j4t6opjn>Tax</dt><dd class="money" data-astro-cid-j4t6opjn>${formatMoney(view.tax_minor)}</dd></div> <div class="final-total" data-astro-cid-j4t6opjn><dt data-astro-cid-j4t6opjn>Total</dt><dd class="money" data-astro-cid-j4t6opjn>${formatMoney(view.total_minor)}</dd></div> </dl> <form method="post" data-place-order${addAttribute(view.total_minor, "data-expected-total")}${addAttribute(view.token, "data-cart-token")} data-astro-cid-j4t6opjn> <input type="hidden" name="idempotency_key"${addAttribute(formKey, "value")} data-astro-cid-j4t6opjn> <input type="hidden" name="expected_total_minor"${addAttribute(view.total_minor, "value")} data-astro-cid-j4t6opjn> <button type="submit" class="button button-primary place" data-place-submit data-astro-cid-j4t6opjn>Place order</button> <p class="place-status" data-place-status role="status" aria-live="polite" data-astro-cid-j4t6opjn></p> </form> <p class="xsmall muted pay-note" data-astro-cid-j4t6opjn>
We raise an invoice for this order and email it to ${view.draft.email}. There is no card to enter.
</p> </div> </section> ${renderComponent($$result2, "CheckoutSummary", $$CheckoutSummary, { "cart": view, "exact": true, "data-astro-cid-j4t6opjn": true })} </div>  ` })} `;
}, "/app/src/pages/checkout/payment.astro", void 0);

const $$file = "/app/src/pages/checkout/payment.astro";
const $$url = "/checkout/payment";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Payment,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
