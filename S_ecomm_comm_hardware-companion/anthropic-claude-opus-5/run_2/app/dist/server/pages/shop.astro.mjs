import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$ProductMedia } from '../chunks/ProductMedia_Cfn42Ikw.mjs';
import { f as formatMoney } from '../chunks/money_BIIhPbI9.mjs';
import { q as query } from '../chunks/db_gZE7iOnF.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { rows } = await query(
    `SELECT p.id, p.handle, p.title, p.subtitle, p.kind, p.status, p.position,
          v.sku, v.option_value, v.price_minor, COALESCE(i.available,0) AS available
     FROM product p
     JOIN variant v ON v.product_id = p.id
     LEFT JOIN inventory_level i ON i.variant_id = v.id
    WHERE p.kind != 'protection'
    ORDER BY p.position, p.id, v.position, v.id`
  );
  const byId = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (!byId.has(r.id)) {
      byId.set(r.id, {
        handle: r.handle,
        title: r.title,
        subtitle: r.subtitle,
        kind: r.kind,
        status: r.status,
        variants: []
      });
    }
    byId.get(r.id).variants.push(r);
  }
  const products = [...byId.values()].map((p) => {
    const prices = p.variants.map((v) => v.price_minor);
    const lowest = Math.min(...prices);
    const total = p.variants.reduce((s, v) => s + v.available, 0);
    let chip = null;
    if (p.status === "discontinued") chip = { text: "Discontinued", tone: "" };
    else if (total === 0) chip = { text: "Sold out", tone: "" };
    else if (total <= 10) chip = { text: `Only ${total} left`, tone: "progress" };
    return {
      ...p,
      // A product whose variants differ in price reads "From " and the lowest.
      price_display: `${new Set(prices).size > 1 ? "From " : ""}${formatMoney(lowest)}`,
      chip,
      firstOption: p.variants[0]?.option_value ?? ""
    };
  });
  const cameras = products.filter((p) => p.kind === "camera");
  const rest = products.filter((p) => p.kind !== "camera");
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Shop \u2014 Vela", "current": "shop", "data-astro-cid-2eaphvki": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-2eaphvki> <h1 data-astro-cid-2eaphvki>Shop</h1> <p class="muted" data-astro-cid-2eaphvki>Two cameras, and the few things that go with them.</p> </header> ${products.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-2eaphvki> <p data-astro-cid-2eaphvki>Nothing is on the table right now.</p> <p data-astro-cid-2eaphvki><a href="/downloads" data-astro-cid-2eaphvki>Downloads</a></p> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-2eaphvki": true }, { "default": async ($$result3) => renderTemplate` <ul class="grid grid-cameras" data-astro-cid-2eaphvki> ${cameras.map((p) => renderTemplate`<li class="card cell" data-astro-cid-2eaphvki> <a class="cell-link"${addAttribute(`/shop/${p.handle}`, "href")} data-astro-cid-2eaphvki> ${renderComponent($$result3, "ProductMedia", $$ProductMedia, { "handle": p.handle, "option": p.firstOption, "ratio": "16 / 9", "data-astro-cid-2eaphvki": true })} <div class="cell-body" data-astro-cid-2eaphvki> <div class="cell-head" data-astro-cid-2eaphvki> <h2 data-astro-cid-2eaphvki>${p.title}</h2> ${p.chip && renderTemplate`<span${addAttribute(["chip", p.chip.tone && `chip-${p.chip.tone}`], "class:list")} data-astro-cid-2eaphvki>${p.chip.text}</span>`} </div> <p class="subtitle muted" data-astro-cid-2eaphvki>${p.subtitle}</p> <p class="price money" data-astro-cid-2eaphvki>${p.price_display}</p> </div> </a> </li>`)} </ul> <ul class="grid grid-rest" data-astro-cid-2eaphvki> ${rest.map((p) => renderTemplate`<li class="card cell" data-astro-cid-2eaphvki> <a class="cell-link"${addAttribute(`/shop/${p.handle}`, "href")} data-astro-cid-2eaphvki> ${renderComponent($$result3, "ProductMedia", $$ProductMedia, { "handle": p.handle, "option": p.firstOption, "ratio": "4 / 3", "data-astro-cid-2eaphvki": true })} <div class="cell-body" data-astro-cid-2eaphvki> <div class="cell-head" data-astro-cid-2eaphvki> <h2 data-astro-cid-2eaphvki>${p.title}</h2> ${p.chip && renderTemplate`<span${addAttribute(["chip", p.chip.tone && `chip-${p.chip.tone}`], "class:list")} data-astro-cid-2eaphvki>${p.chip.text}</span>`} </div> <p class="subtitle muted" data-astro-cid-2eaphvki>${p.subtitle}</p> <p class="price money" data-astro-cid-2eaphvki>${p.price_display}</p> </div> </a> </li>`)} </ul> ` })}`}` })} `;
}, "/app/src/pages/shop/index.astro", void 0);

const $$file = "/app/src/pages/shop/index.astro";
const $$url = "/shop";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
