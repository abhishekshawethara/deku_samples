import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$ProductMedia } from '../../chunks/ProductMedia_Cfn42Ikw.mjs';
import { f as formatDate } from '../../chunks/view_5k7OaDvH.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
/* empty css                                       */
import { f as formatMoney } from '../../chunks/money_BIIhPbI9.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$handle = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$handle;
  const { handle } = Astro2.params;
  const { rows } = await query(
    `SELECT p.id, p.handle, p.title, p.subtitle, p.kind, p.status, p.support_until,
          v.id AS variant_id, v.sku, v.option_value, v.price_minor,
          COALESCE(i.available,0) AS available
     FROM product p
     JOIN variant v ON v.product_id = p.id
     LEFT JOIN inventory_level i ON i.variant_id = v.id
    WHERE p.handle = $1 AND p.kind != 'protection'
    ORDER BY v.position, v.id`,
    [handle]
  );
  if (!rows.length) {
    return new Response(null, { status: 404 });
  }
  const product = {
    id: rows[0].id,
    handle: rows[0].handle,
    title: rows[0].title,
    subtitle: rows[0].subtitle,
    kind: rows[0].kind,
    status: rows[0].status,
    support_until: rows[0].support_until
  };
  const discontinued = product.status === "discontinued";
  const variants = rows.map((r) => ({
    sku: r.sku,
    option_value: r.option_value,
    price_minor: r.price_minor,
    available: r.available,
    discontinued,
    // Precomputed so the markup carries no comparison operators, which the
    // template compiler reads as tags.
    stock_label: discontinued ? "Discontinued" : r.available === 0 ? "Sold out" : `${r.available} in stock`
  }));
  const asked = Astro2.url.searchParams.get("variant");
  const selected = variants.find((v) => v.sku === asked) ?? variants[0];
  const { rows: blocks } = await query(
    "SELECT kind, payload FROM product_block WHERE product_id = $1 ORDER BY position",
    [product.id]
  );
  const lede = blocks.find((b) => b.kind === "lede");
  const specGroups = blocks.filter((b) => b.kind === "spec_group");
  const inTheBox = blocks.find((b) => b.kind === "in_the_box");
  const compatibility = blocks.find((b) => b.kind === "compatibility");
  const supportNote = blocks.find((b) => b.kind === "support_note");
  function stateFor(v) {
    if (discontinued) return { key: "discontinued", label: "Discontinued" };
    if (v.available <= 0) return { key: "sold_out", label: "Sold out" };
    if (v.available <= 10) return { key: "low", label: `Only ${v.available} left` };
    return { key: "available", label: "Available" };
  }
  const state = stateFor(selected);
  const maxQty = Math.max(1, Math.min(10, selected.available));
  const supportLine = discontinued && product.support_until ? `We no longer sell this. We will support it until ${formatDate(product.support_until)}.` : null;
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": `${product.title} \u2014 Vela`, "current": "shop", "description": product.subtitle, "data-astro-cid-aqxoqqhg": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<nav class="crumbs" aria-label="Breadcrumb" data-astro-cid-aqxoqqhg> <a href="/shop" data-astro-cid-aqxoqqhg>Shop</a> <span aria-hidden="true" data-astro-cid-aqxoqqhg>/</span> <span data-astro-cid-aqxoqqhg>${product.title}</span> </nav> <div class="product" data-product${addAttribute(JSON.stringify(variants), "data-variants")} data-astro-cid-aqxoqqhg> <!-- A keyboard navigable gallery on one side. --> <section class="gallery"${addAttribute(`${product.title} images`, "aria-label")} data-astro-cid-aqxoqqhg> ${renderComponent($$result2, "ProductMedia", $$ProductMedia, { "handle": product.handle, "option": selected.option_value, "ratio": "4 / 3", "alt": `${product.title} in ${selected.option_value}`, "data-astro-cid-aqxoqqhg": true })} <ul class="thumbs" data-astro-cid-aqxoqqhg> ${variants.map((v) => renderTemplate`<li data-astro-cid-aqxoqqhg> <a${addAttribute(["thumb", { "thumb-current": v.sku === selected.sku }], "class:list")}${addAttribute(`/shop/${product.handle}?variant=${v.sku}`, "href")}${addAttribute(v.sku === selected.sku ? "true" : void 0, "aria-current")}${addAttribute(`${product.title} in ${v.option_value}`, "aria-label")} data-astro-cid-aqxoqqhg> ${renderComponent($$result2, "ProductMedia", $$ProductMedia, { "handle": product.handle, "option": v.option_value, "ratio": "1 / 1", "data-astro-cid-aqxoqqhg": true })} </a> </li>`)} </ul> </section> <section class="buy" aria-label="Buy" data-astro-cid-aqxoqqhg> <h1 data-astro-cid-aqxoqqhg>${product.title}</h1> <p class="subtitle muted" data-astro-cid-aqxoqqhg>${product.subtitle}</p> <p class="price money" data-price data-astro-cid-aqxoqqhg>${formatMoney(selected.price_minor)}</p> <p class="availability" data-astro-cid-aqxoqqhg> <span${addAttribute(["chip", state.key === "low" && "chip-progress"], "class:list")} data-availability data-astro-cid-aqxoqqhg> ${state.label} </span> </p> ${supportLine && renderTemplate`<p class="support-note notice" data-astro-cid-aqxoqqhg>${supportLine}</p>`} <form method="post" action="/cart/add" data-buy-form data-astro-cid-aqxoqqhg>  ${variants.length > 1 && renderTemplate`<fieldset class="options" data-astro-cid-aqxoqqhg> <legend data-astro-cid-aqxoqqhg>Finish</legend> ${variants.map((v) => renderTemplate`<label class="option" data-astro-cid-aqxoqqhg> <input type="radio" name="sku"${addAttribute(v.sku, "value")}${addAttribute(v.sku === selected.sku, "checked")} data-astro-cid-aqxoqqhg> <span class="option-face" data-astro-cid-aqxoqqhg> <span class="option-name" data-astro-cid-aqxoqqhg>${v.option_value}</span> <span class="option-state xsmall muted" data-astro-cid-aqxoqqhg>${v.stock_label}</span> </span> </label>`)} </fieldset>`} ${variants.length === 1 && renderTemplate`<input type="hidden" name="sku"${addAttribute(selected.sku, "value")} data-astro-cid-aqxoqqhg>`} <div class="qty-row" data-astro-cid-aqxoqqhg> <label for="quantity" data-astro-cid-aqxoqqhg>Quantity</label> <input type="number" id="quantity" name="quantity" value="1" min="1"${addAttribute(maxQty, "max")} inputmode="numeric"${addAttribute(state.key !== "available" && state.key !== "low", "disabled")} data-astro-cid-aqxoqqhg> </div> <div class="buy-row" data-astro-cid-aqxoqqhg> <button type="submit" class="button button-primary buy-submit" data-buy-submit${addAttribute(state.key === "sold_out" || state.key === "discontinued", "disabled")} data-astro-cid-aqxoqqhg> ${state.key === "sold_out" ? "Sold out" : state.key === "discontinued" ? "Discontinued" : "Add to cart"} </button> ${state.key === "sold_out" && renderTemplate`<button type="button" class="button button-quiet" data-astro-cid-aqxoqqhg>Tell me when it is back</button>`} </div> <!-- An unavailable control always says why. --> ${state.key === "discontinued" && renderTemplate`<p class="xsmall muted why" data-astro-cid-aqxoqqhg>We stopped making this. It cannot be added to a cart.</p>`} ${state.key === "sold_out" && renderTemplate`<p class="xsmall muted why" data-astro-cid-aqxoqqhg>This finish is out of stock, so it cannot be added to a cart.</p>`} <p class="buy-status" data-buy-status role="status" aria-live="polite" data-astro-cid-aqxoqqhg></p> </form> </section> </div> <div class="detail" data-astro-cid-aqxoqqhg> ${lede && renderTemplate`<p class="lede" data-astro-cid-aqxoqqhg>${lede.payload.text}</p>`} ${specGroups.length > 0 && renderTemplate`<section class="specs" aria-label="Specifications" data-astro-cid-aqxoqqhg> <h2 data-astro-cid-aqxoqqhg>Specifications</h2> <!-- A real table with figures aligned, never a wall of prose. --> ${specGroups.map((g) => renderTemplate`<table class="data" data-astro-cid-aqxoqqhg> <caption data-astro-cid-aqxoqqhg>${g.payload.title}</caption> <tbody data-astro-cid-aqxoqqhg> ${g.payload.rows.map(([k, v]) => renderTemplate`<tr data-astro-cid-aqxoqqhg> <th scope="row" data-astro-cid-aqxoqqhg>${k}</th> <td class="num" data-astro-cid-aqxoqqhg>${v}</td> </tr>`)} </tbody> </table>`)} </section>`} <div class="detail-side" data-astro-cid-aqxoqqhg> ${inTheBox && renderTemplate`<section aria-label="In the box" data-astro-cid-aqxoqqhg> <h2 data-astro-cid-aqxoqqhg>In the box</h2> <ul class="box-list" data-astro-cid-aqxoqqhg> ${inTheBox.payload.items.map((i) => renderTemplate`<li data-astro-cid-aqxoqqhg>${i}</li>`)} </ul> </section>`} ${compatibility && renderTemplate`<section aria-label="Compatibility" data-astro-cid-aqxoqqhg> <h2 data-astro-cid-aqxoqqhg>Compatibility</h2> <table class="data" data-astro-cid-aqxoqqhg> <tbody data-astro-cid-aqxoqqhg> <tr data-astro-cid-aqxoqqhg><th scope="row" data-astro-cid-aqxoqqhg>Operating system</th><td class="num" data-astro-cid-aqxoqqhg>${compatibility.payload.min_os} or later</td></tr> <tr data-astro-cid-aqxoqqhg><th scope="row" data-astro-cid-aqxoqqhg>Arranger</th><td class="num version" data-astro-cid-aqxoqqhg>${compatibility.payload.min_app} or later</td></tr> </tbody> </table> </section>`} ${supportNote && renderTemplate`<section aria-label="Support" data-astro-cid-aqxoqqhg> <h2 data-astro-cid-aqxoqqhg>Support</h2> <p class="small" data-astro-cid-aqxoqqhg>${supportNote.payload.text}</p> </section>`} </div> </div>  ` })} `;
}, "/app/src/pages/shop/[handle].astro", void 0);

const $$file = "/app/src/pages/shop/[handle].astro";
const $$url = "/shop/[handle]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$handle,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
