import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { a as formatDateTime } from '../../chunks/view_5k7OaDvH.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
import { o as orderLines, a as orderChip } from '../../chunks/orders_C_gxanvP.mjs';
/* empty css                                    */
import { f as formatMoney } from '../../chunks/money_BIIhPbI9.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const customer = Astro2.locals.customer;
  const { rows } = await query(
    'SELECT * FROM "order" WHERE customer_id = $1 ORDER BY id DESC LIMIT 100',
    [customer.id]
  );
  const orders = await Promise.all(
    rows.map(async (o) => {
      const lines = await orderLines(o.id);
      return {
        ...o,
        chip: orderChip(o),
        // The first line title with "and <count> more".
        summary: lines.length > 1 ? `${lines[0].title_snapshot} and ${lines.length - 1} more` : lines[0]?.title_snapshot ?? ""
      };
    })
  );
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Orders \u2014 Vela", "current": "orders", "data-astro-cid-fdv6b7ge": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-fdv6b7ge> <h1 data-astro-cid-fdv6b7ge>Orders</h1> <p class="muted small" data-astro-cid-fdv6b7ge>Everything bought with this account.</p> </header> ${orders.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-fdv6b7ge> <p data-astro-cid-fdv6b7ge>No orders yet.</p> <p data-astro-cid-fdv6b7ge><a href="/shop" data-astro-cid-fdv6b7ge>Shop</a></p> </div>` : renderTemplate`<table class="data orders" data-astro-cid-fdv6b7ge> <thead data-astro-cid-fdv6b7ge> <tr data-astro-cid-fdv6b7ge> <th scope="col" data-astro-cid-fdv6b7ge>Number</th> <th scope="col" data-astro-cid-fdv6b7ge>Placed</th> <th scope="col" data-astro-cid-fdv6b7ge>What</th> <th scope="col" class="num" data-astro-cid-fdv6b7ge>Total</th> <th scope="col" data-astro-cid-fdv6b7ge>State</th> </tr> </thead> <tbody data-astro-cid-fdv6b7ge> ${orders.map((o) => renderTemplate`<tr data-astro-cid-fdv6b7ge> <td data-astro-cid-fdv6b7ge><a class="number tnum"${addAttribute(`/account/orders/${o.number}`, "href")} data-astro-cid-fdv6b7ge>${o.number}</a></td> <td data-astro-cid-fdv6b7ge>${formatDateTime(o.placed_at)}</td> <td data-astro-cid-fdv6b7ge>${o.summary}</td> <!-- The total in the order's own currency. --> <td class="num money" data-astro-cid-fdv6b7ge>${formatMoney(o.total_minor)} ${String(o.currency).toUpperCase()}</td> <!-- One chip combining the order, payment and fulfilment states. --> <td data-astro-cid-fdv6b7ge><span${addAttribute(["chip", `chip-${o.chip.tone}`], "class:list")} data-astro-cid-fdv6b7ge>${o.chip.text}</span></td> </tr>`)} </tbody> </table>`}` })} `;
}, "/app/src/pages/account/orders/index.astro", void 0);

const $$file = "/app/src/pages/account/orders/index.astro";
const $$url = "/account/orders";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
