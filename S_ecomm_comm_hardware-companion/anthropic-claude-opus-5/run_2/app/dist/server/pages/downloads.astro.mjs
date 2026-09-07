import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$ReleaseBlock } from '../chunks/ReleaseBlock_XlMNLQJE.mjs';
import { b as formatBytes } from '../chunks/view_5k7OaDvH.mjs';
import { q as query } from '../chunks/db_gZE7iOnF.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { rows: releases } = await query("SELECT * FROM app_release ORDER BY build DESC");
  const newest = releases[0];
  const { rows: firmware } = await query(
    `SELECT f.*, p.title AS model, p.handle
     FROM firmware f JOIN product p ON p.id = f.product_id
    WHERE f.channel = 'general'
    ORDER BY p.position, f.build DESC`
  );
  const cricketFirmware = firmware.find((f) => f.handle === "compact");
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Downloads \u2014 Vela", "current": "downloads", "data-astro-cid-i2rmdg4n": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-i2rmdg4n> <h1 data-astro-cid-i2rmdg4n>Downloads</h1> <p class="requirement" data-astro-cid-i2rmdg4n>Arranger requires macOS 13.0 or later. Download the app below.</p> </header> <section class="primary" aria-label="Arranger" data-astro-cid-i2rmdg4n> <div class="primary-row" data-astro-cid-i2rmdg4n> <!-- Adapts to the reader's platform but is never disabled and never
           hidden, because fetching an installer on a work laptop for a machine
           at home is an ordinary thing to do. --> <a class="button button-primary get"${addAttribute(`/downloads/${newest.version}`, "href")} data-platform-control data-astro-cid-i2rmdg4n>
Download Arranger ${newest.version} </a> <div class="primary-facts" data-astro-cid-i2rmdg4n> <span class="tnum" data-astro-cid-i2rmdg4n>${formatBytes(newest.size_bytes)}</span> <span class="digest xsmall muted" data-astro-cid-i2rmdg4n>${newest.sha256}</span> </div> </div> <p class="xsmall muted platform-note" data-platform-note hidden data-astro-cid-i2rmdg4n>Arranger is a macOS application.</p> </section> <section class="firmware" aria-label="Firmware" data-astro-cid-i2rmdg4n> <h2 data-astro-cid-i2rmdg4n>Firmware</h2> <div class="firmware-row" data-astro-cid-i2rmdg4n> ${cricketFirmware && renderTemplate`<a class="button"${addAttribute(`/api/firmware/manifest?model=${cricketFirmware.handle}`, "href")} data-astro-cid-i2rmdg4n>
Download ${cricketFirmware.model} Firmware ${cricketFirmware.version} </a>`} <!-- The web path is never the primary control. --> <div class="web-path" data-astro-cid-i2rmdg4n> <a class="quiet-link" href="/doctor" data-astro-cid-i2rmdg4n>Firmware install (web-based)</a> <p class="xsmall muted warning" data-astro-cid-i2rmdg4n>Only use this if Arranger cannot see your camera.</p> </div> </div> </section> <section class="archive" aria-label="Release archive" data-astro-cid-i2rmdg4n> <h2 data-astro-cid-i2rmdg4n>Every release</h2> ${releases.map((r, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-i2rmdg4n": true }, { "default": async ($$result3) => renderTemplate`${i > 0 && renderTemplate`<div class="separator" aria-hidden="true" data-astro-cid-i2rmdg4n></div>`}${renderComponent($$result3, "ReleaseBlock", $$ReleaseBlock, { "release": r, "open": i === 0, "data-astro-cid-i2rmdg4n": true })} ` })}`)} </section>  ` })} `;
}, "/app/src/pages/downloads/index.astro", void 0);

const $$file = "/app/src/pages/downloads/index.astro";
const $$url = "/downloads";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
