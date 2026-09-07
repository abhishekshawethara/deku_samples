import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute, F as Fragment } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$ReleaseBlock } from '../../chunks/ReleaseBlock_XlMNLQJE.mjs';
import { b as formatBytes } from '../../chunks/view_5k7OaDvH.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$version = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$version;
  const { version } = Astro2.params;
  const { rows: releases } = await query("SELECT * FROM app_release ORDER BY build DESC");
  const current = releases.find((r) => r.version === version);
  if (!current) return new Response(null, { status: 404 });
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": `Arranger ${current.version} \u2014 Vela`, "current": "downloads", "data-astro-cid-63uv547v": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<nav class="crumbs" aria-label="Breadcrumb" data-astro-cid-63uv547v> <a href="/downloads" data-astro-cid-63uv547v>Downloads</a> <span aria-hidden="true" data-astro-cid-63uv547v>/</span> <span class="version" data-astro-cid-63uv547v>Arranger ${current.version}</span> </nav> <header class="head" data-astro-cid-63uv547v> <h1 data-astro-cid-63uv547v>Downloads</h1> <p class="requirement" data-astro-cid-63uv547v>Arranger requires macOS 13.0 or later. Download the app below.</p> </header> <section class="primary"${addAttribute(`Arranger ${current.version}`, "aria-label")} data-astro-cid-63uv547v> <div class="primary-row" data-astro-cid-63uv547v> <a class="button button-primary get"${addAttribute(`/api/releases/${current.version}`, "href")} data-astro-cid-63uv547v>
Download Arranger ${current.version} </a> <div class="primary-facts" data-astro-cid-63uv547v> <span class="tnum" data-astro-cid-63uv547v>${formatBytes(current.size_bytes)}</span> <span class="digest xsmall muted" data-astro-cid-63uv547v>${current.sha256}</span> </div> </div> </section> <section class="archive" aria-label="Release archive" data-astro-cid-63uv547v> <h2 data-astro-cid-63uv547v>Every release</h2> <!-- This address renders its own release expanded with the rest collapsed,
         and the whole archive stays in the markup. --> ${releases.map((r, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-63uv547v": true }, { "default": async ($$result3) => renderTemplate`${i > 0 && renderTemplate`<div class="separator" aria-hidden="true" data-astro-cid-63uv547v></div>`}${renderComponent($$result3, "ReleaseBlock", $$ReleaseBlock, { "release": r, "open": r.version === current.version, "data-astro-cid-63uv547v": true })} ` })}`)} </section> ` })} `;
}, "/app/src/pages/downloads/[version].astro", void 0);

const $$file = "/app/src/pages/downloads/[version].astro";
const $$url = "/downloads/[version]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$version,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
