import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
/* empty css                               */
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Not found \u2014 Vela", "current": "", "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="missing" data-astro-cid-zetdm5md> <h1 data-astro-cid-zetdm5md>That page does not exist.</h1> <p class="muted" data-astro-cid-zetdm5md>Check the address, or start from one of these.</p> <ul class="ways" data-astro-cid-zetdm5md> <li data-astro-cid-zetdm5md><a href="/shop" data-astro-cid-zetdm5md>Shop</a></li> <li data-astro-cid-zetdm5md><a href="/downloads" data-astro-cid-zetdm5md>Downloads</a></li> <li data-astro-cid-zetdm5md><a href="/" data-astro-cid-zetdm5md>The letter</a></li> </ul> </div> ` })} `;
}, "/app/src/pages/404.astro", void 0);

const $$file = "/app/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
