import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$OrderDetail } from '../../chunks/OrderDetail_DU4gHrZR.mjs';
import { b as orderByNumber, m as mayReadOrder, c as orderSerials, a as orderChip } from '../../chunks/orders_C_gxanvP.mjs';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$number = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$number;
  const { number } = Astro2.params;
  const accessToken = Astro2.url.searchParams.get("access_token");
  const customer = Astro2.locals.customer;
  const found = await orderByNumber(number);
  if (!found || !mayReadOrder(found.order, { accessToken, customer })) {
    return new Response(null, { status: 404 });
  }
  const { order, lines } = found;
  const serials = await orderSerials(order.id);
  const chip = orderChip(order);
  const justPlaced = order.status === "confirmed";
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": `Order ${order.number} \u2014 Vela`, "current": "shop", "data-astro-cid-cxx6wafo": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="head" data-astro-cid-cxx6wafo> ${justPlaced && renderTemplate`<!-- Success is stated in words before it is coloured. -->
      <p class="confirmed notice notice-done" role="status" data-astro-cid-cxx6wafo>
Order ${order.number} is confirmed. We have emailed ${order.email}.
</p>`} <div class="head-row" data-astro-cid-cxx6wafo> <h1 data-astro-cid-cxx6wafo>Order ${order.number}</h1> <span${addAttribute(["chip", `chip-${chip.tone}`], "class:list")} data-astro-cid-cxx6wafo>${chip.text}</span> </div> ${customer ? renderTemplate`<a class="button button-primary keep" href="/account/orders" data-astro-cid-cxx6wafo>Keep track of this order</a>` : renderTemplate`<a class="button button-primary keep"${addAttribute(`/sign-up?next=${encodeURIComponent("/account/orders")}`, "href")} data-astro-cid-cxx6wafo>
Keep track of this order
</a>`} </div> ${renderComponent($$result2, "OrderDetail", $$OrderDetail, { "order": order, "lines": lines, "serials": serials, "chip": chip, "canRegister": !!customer && order.customer_id === customer.id, "data-astro-cid-cxx6wafo": true })} <p class="small muted foot" data-astro-cid-cxx6wafo>
Keep this address to come back to your order.
${!customer && " It is the only link that opens it without an account."} </p> ` })} `;
}, "/app/src/pages/orders/[number].astro", void 0);

const $$file = "/app/src/pages/orders/[number].astro";
const $$url = "/orders/[number]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$number,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
