import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                        */

const $$Astro = createAstro();
const $$ProductMedia = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ProductMedia;
  const { handle, option = "", ratio = "4 / 3", alt = "" } = Astro2.props;
  const bodies = {
    Graphite: "#3f4247",
    Sand: "#b9a184",
    Yellow: "#d8a318",
    Clamp: "#8d9198",
    VESA: "#8d9198",
    Standard: "#4a4d52",
    "1 m": "#5b5f66",
    "2 m": "#5b5f66"
  };
  const body = bodies[option] ?? "#4a4d52";
  const isCamera = handle === "flagship" || handle === "compact";
  const big = handle === "flagship";
  return renderTemplate`${maybeRenderHead()}<div class="media"${addAttribute(`aspect-ratio:${ratio}`, "style")}${addAttribute(alt ? "img" : "presentation", "role")}${addAttribute(alt || void 0, "aria-label")} data-astro-cid-tn5un4km> <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid meet"${addAttribute(alt ? void 0 : "true", "aria-hidden")} data-astro-cid-tn5un4km> ${isCamera ? renderTemplate`<g data-astro-cid-tn5un4km> <rect${addAttribute(big ? 22 : 30, "x")}${addAttribute(big ? 30 : 34, "y")}${addAttribute(big ? 76 : 60, "width")}${addAttribute(big ? 40 : 32, "height")} rx="3"${addAttribute(body, "fill")} data-astro-cid-tn5un4km></rect> <rect${addAttribute(big ? 46 : 48, "x")}${addAttribute(big ? 24 : 28, "y")}${addAttribute(big ? 28 : 22, "width")}${addAttribute(big ? 8 : 7, "height")} rx="2"${addAttribute(body, "fill")} opacity="0.85" data-astro-cid-tn5un4km></rect> <circle${addAttribute(big ? 60 : 60, "cx")}${addAttribute(big ? 50 : 50, "cy")}${addAttribute(big ? 15 : 11, "r")} fill="#17181a" opacity="0.85" data-astro-cid-tn5un4km></circle> <circle${addAttribute(big ? 60 : 60, "cx")}${addAttribute(big ? 50 : 50, "cy")}${addAttribute(big ? 9 : 6.5, "r")} fill="#0d0d0e" data-astro-cid-tn5un4km></circle> <circle${addAttribute(big ? 56 : 57, "cx")}${addAttribute(big ? 46 : 47, "cy")}${addAttribute(big ? 3 : 2, "r")} fill="#f2efea" opacity="0.35" data-astro-cid-tn5un4km></circle> <rect${addAttribute(big ? 84 : 78, "x")}${addAttribute(big ? 35 : 38, "y")} width="6" height="3" rx="1" fill="#f2efea" opacity="0.5" data-astro-cid-tn5un4km></rect> </g>` : handle === "case" ? renderTemplate`<g data-astro-cid-tn5un4km> <rect x="24" y="30" width="72" height="42" rx="4"${addAttribute(body, "fill")} data-astro-cid-tn5un4km></rect> <rect x="24" y="46" width="72" height="3" fill="#17181a" opacity="0.35" data-astro-cid-tn5un4km></rect> <rect x="52" y="24" width="16" height="8" rx="3"${addAttribute(body, "fill")} opacity="0.8" data-astro-cid-tn5un4km></rect> <rect x="36" y="56" width="10" height="6" rx="1" fill="#17181a" opacity="0.25" data-astro-cid-tn5un4km></rect> <rect x="74" y="56" width="10" height="6" rx="1" fill="#17181a" opacity="0.25" data-astro-cid-tn5un4km></rect> </g>` : handle === "cable" ? renderTemplate`<g data-astro-cid-tn5un4km> <path d="M28 62 C 44 62, 44 34, 60 34 S 76 62, 92 62" fill="none"${addAttribute(body, "stroke")} stroke-width="5" stroke-linecap="round" data-astro-cid-tn5un4km></path> <rect x="22" y="57" width="10" height="10" rx="2" fill="#3f4247" data-astro-cid-tn5un4km></rect> <rect x="88" y="57" width="10" height="10" rx="2" fill="#3f4247" data-astro-cid-tn5un4km></rect> </g>` : renderTemplate`<g data-astro-cid-tn5un4km> <rect x="34" y="26" width="8" height="42" rx="2"${addAttribute(body, "fill")} data-astro-cid-tn5un4km></rect> <rect x="34" y="26" width="46" height="7" rx="2"${addAttribute(body, "fill")} data-astro-cid-tn5un4km></rect> <rect x="74" y="30" width="14" height="22" rx="2"${addAttribute(body, "fill")} opacity="0.8" data-astro-cid-tn5un4km></rect> <rect x="28" y="64" width="20" height="6" rx="2" fill="#3f4247" data-astro-cid-tn5un4km></rect> </g>`} </svg> </div> `;
}, "/app/src/components/ProductMedia.astro", void 0);

export { $$ProductMedia as $ };
