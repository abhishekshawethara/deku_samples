import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$OrderDetail } from '../../../chunks/OrderDetail_DU4gHrZR.mjs';
import { b as orderByNumber, c as orderSerials, a as orderChip } from '../../../chunks/orders_C_gxanvP.mjs';
/* empty css                                          */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$number = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$number;
  const customer = Astro2.locals.customer;
  const { number } = Astro2.params;
  const found = await orderByNumber(number);
  if (!found || found.order.customer_id !== customer.id) {
    return new Response(null, { status: 404 });
  }
  const { order, lines } = found;
  const serials = await orderSerials(order.id);
  const chip = orderChip(order);
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": `Order ${order.number} \u2014 Vela`, "current": "orders", "data-astro-cid-th46ys4i": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<nav class="crumbs" aria-label="Breadcrumb" data-astro-cid-th46ys4i> <a href="/account/orders" data-astro-cid-th46ys4i>Orders</a> <span aria-hidden="true" data-astro-cid-th46ys4i>/</span> <span class="tnum" data-astro-cid-th46ys4i>${order.number}</span> </nav> <header class="head" data-astro-cid-th46ys4i> <h1 data-astro-cid-th46ys4i>Order ${order.number}</h1> <span${addAttribute(["chip", `chip-${chip.tone}`], "class:list")} data-astro-cid-th46ys4i>${chip.text}</span> </header> ${renderComponent($$result2, "OrderDetail", $$OrderDetail, { "order": order, "lines": lines, "serials": serials, "chip": chip, "canRegister": true, "data-astro-cid-th46ys4i": true })} ` })} `;
}, "/app/src/pages/account/orders/[number].astro", void 0);

const $$file = "/app/src/pages/account/orders/[number].astro";
const $$url = "/account/orders/[number]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$number,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
