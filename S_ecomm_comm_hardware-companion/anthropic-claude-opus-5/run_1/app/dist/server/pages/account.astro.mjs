import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$CameraCard } from '../chunks/CameraCard_PhsmbFk2.mjs';
import { a as formatDateTime } from '../chunks/view_5k7OaDvH.mjs';
import { q as query } from '../chunks/db_gZE7iOnF.mjs';
import { d as decorateDevice } from '../chunks/devices_CukBZqQZ.mjs';
import { o as orderLines, a as orderChip } from '../chunks/orders_C_gxanvP.mjs';
/* empty css                                 */
import { f as formatMoney } from '../chunks/money_BIIhPbI9.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const customer = Astro2.locals.customer;
  async function safely(work) {
    try {
      return { ok: true, value: await work() };
    } catch (err) {
      return { ok: false, value: null };
    }
  }
  const camerasBlock = await safely(async () => {
    const { rows } = await query(
      `SELECT d.*, p.title AS model, p.handle, v.option_value
       FROM device_ownership o
       JOIN device d ON d.id = o.device_id
       JOIN product p ON p.id = d.product_id
       JOIN variant v ON v.id = d.variant_id
      WHERE o.customer_id = $1 AND o.released_at IS NULL
      ORDER BY d.id`,
      [customer.id]
    );
    return Promise.all(rows.map(decorateDevice));
  });
  const ordersBlock = await safely(async () => {
    const { rows } = await query(
      'SELECT * FROM "order" WHERE customer_id = $1 ORDER BY id DESC LIMIT 2',
      [customer.id]
    );
    return Promise.all(
      rows.map(async (o) => {
        const lines = await orderLines(o.id);
        return {
          ...o,
          chip: orderChip(o),
          summary: lines.length > 1 ? `${lines[0].title_snapshot} and ${lines.length - 1} more` : lines[0]?.title_snapshot ?? ""
        };
      })
    );
  });
  const softwareBlock = await safely(async () => {
    const { rows } = await query("SELECT * FROM app_release ORDER BY build DESC LIMIT 1");
    return rows[0];
  });
  const seenBuild = Number(Astro2.cookies.get("vela_seen_build")?.value || 0);
  const newest = softwareBlock.value;
  const isNewer = !!(newest && newest.build > seenBuild);
  if (newest) {
    Astro2.cookies.set("vela_seen_build", String(newest.build), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365
    });
  }
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Account \u2014 Vela", "current": "account", "data-astro-cid-idhuhdga": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-idhuhdga> <h1 data-astro-cid-idhuhdga>Your account</h1> <p class="muted small" data-astro-cid-idhuhdga>Signed in as ${customer.email}</p> </header>  <section class="block" aria-labelledby="cameras-heading" data-astro-cid-idhuhdga> <div class="block-head" data-astro-cid-idhuhdga> <h2 id="cameras-heading" data-astro-cid-idhuhdga>Your cameras</h2> <a class="block-more" href="/account/cameras" data-astro-cid-idhuhdga>All cameras</a> </div> ${!camerasBlock.ok ? renderTemplate`<p class="notice notice-wrong" data-astro-cid-idhuhdga>We could not load your cameras. Try again in a moment.</p>` : camerasBlock.value.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-idhuhdga> <p data-astro-cid-idhuhdga>No cameras registered yet.</p> <p data-astro-cid-idhuhdga><a href="/account/cameras" data-astro-cid-idhuhdga>Register one</a></p> </div>` : renderTemplate`<ul class="grid" data-astro-cid-idhuhdga> ${camerasBlock.value.map((d) => renderTemplate`${renderComponent($$result2, "CameraCard", $$CameraCard, { "device": d, "data-astro-cid-idhuhdga": true })}`)} </ul>`} </section> <section class="block" aria-labelledby="orders-heading" data-astro-cid-idhuhdga> <div class="block-head" data-astro-cid-idhuhdga> <h2 id="orders-heading" data-astro-cid-idhuhdga>Recent orders</h2> <a class="block-more" href="/account/orders" data-astro-cid-idhuhdga>All orders</a> </div> ${!ordersBlock.ok ? renderTemplate`<p class="notice notice-wrong" data-astro-cid-idhuhdga>We could not load your orders. Try again in a moment.</p>` : ordersBlock.value.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-idhuhdga> <p data-astro-cid-idhuhdga>No orders yet.</p> <p data-astro-cid-idhuhdga><a href="/shop" data-astro-cid-idhuhdga>Shop</a></p> </div>` : renderTemplate`<table class="data" data-astro-cid-idhuhdga> <thead data-astro-cid-idhuhdga> <tr data-astro-cid-idhuhdga> <th scope="col" data-astro-cid-idhuhdga>Number</th> <th scope="col" data-astro-cid-idhuhdga>Placed</th> <th scope="col" data-astro-cid-idhuhdga>What</th> <th scope="col" class="num" data-astro-cid-idhuhdga>Total</th> <th scope="col" data-astro-cid-idhuhdga>State</th> </tr> </thead> <tbody data-astro-cid-idhuhdga> ${ordersBlock.value.map((o) => renderTemplate`<tr data-astro-cid-idhuhdga> <td data-astro-cid-idhuhdga><a class="tnum number"${addAttribute(`/account/orders/${o.number}`, "href")} data-astro-cid-idhuhdga>${o.number}</a></td> <td data-astro-cid-idhuhdga>${formatDateTime(o.placed_at)}</td> <td data-astro-cid-idhuhdga>${o.summary}</td> <td class="num money" data-astro-cid-idhuhdga>${formatMoney(o.total_minor)} ${String(o.currency).toUpperCase()}</td> <td data-astro-cid-idhuhdga><span${addAttribute(["chip", `chip-${o.chip.tone}`], "class:list")} data-astro-cid-idhuhdga>${o.chip.text}</span></td> </tr>`)} </tbody> </table>`} </section> <section class="block" aria-labelledby="software-heading" data-astro-cid-idhuhdga> <div class="block-head" data-astro-cid-idhuhdga> <h2 id="software-heading" data-astro-cid-idhuhdga>Software</h2> <a class="block-more" href="/downloads" data-astro-cid-idhuhdga>Downloads</a> </div> ${!softwareBlock.ok || !newest ? renderTemplate`<p class="notice notice-wrong" data-astro-cid-idhuhdga>We could not load the release list. Try again in a moment.</p>` : renderTemplate`<div class="software card" data-astro-cid-idhuhdga> <div data-astro-cid-idhuhdga> <p class="software-version" data-astro-cid-idhuhdga>Arranger <span class="version" data-astro-cid-idhuhdga>${newest.version}</span></p> <p class="xsmall muted" data-astro-cid-idhuhdga>Build <span class="tnum" data-astro-cid-idhuhdga>${newest.build}</span></p> </div> ${isNewer ? renderTemplate`<span class="chip chip-progress" data-astro-cid-idhuhdga>Newer than the one you last saw</span>` : renderTemplate`<span class="chip" data-astro-cid-idhuhdga>You have seen this release</span>`} <a class="button button-quiet"${addAttribute(`/downloads/${newest.version}`, "href")} data-astro-cid-idhuhdga>Read the notes</a> </div>`} </section> ` })} `;
}, "/app/src/pages/account/index.astro", void 0);

const $$file = "/app/src/pages/account/index.astro";
const $$url = "/account";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
