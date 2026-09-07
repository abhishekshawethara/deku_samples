import { c as createComponent, a as addAttribute, f as renderHead, e as renderSlot, r as renderTemplate, b as createAstro } from './astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                            */

const $$Astro = createAstro();
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const {
    title,
    description = "Vela makes two cameras and supports them for a long time.",
    ground = "light",
    bodyClass = ""
  } = Astro2.props;
  return renderTemplate`<html lang="en"${addAttribute(`ground-${ground}`, "class")}> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="icon" href="/favicon.svg" type="image/svg+xml">${renderHead()}</head> <body${addAttribute(`ground-${ground} ${bodyClass}`, "class")}> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/app/src/layouts/Base.astro", void 0);

export { $$Base as $ };
