import { f as attr_class, a as attr, c as attr_style, e as escape_html, d as derived } from "./index.js";
function Plate($$renderer, $$props) {
  let {
    seed = "plate",
    ratio = "16 / 9",
    label = "",
    kind = "scene",
    radius = "var(--radius)"
  } = $$props;
  function hash(s) {
    let h2 = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h2 ^= s.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return Math.abs(h2);
  }
  const h = derived(() => hash(seed));
  const a = derived(() => 198 + h() % 34);
  const b = derived(() => 24 + Math.floor(h() / 7) % 18);
  const isPortrait = derived(() => kind === "portrait");
  $$renderer.push(`<div${attr_class("plate svelte-1x8j3bw", void 0, { "portrait": isPortrait() })} role="img"${attr("aria-label", label || "Generated gradient plate")}${attr_style("", { "aspect-ratio": ratio, "border-radius": radius })}><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false" class="svelte-1x8j3bw"><defs><linearGradient${attr("id", `pg-${h()}`)} x1="0" y1="0" x2="1" y2="1"><stop offset="0%"${attr("stop-color", `hsl(${a()} 62% 88%)`)}></stop><stop offset="55%"${attr("stop-color", `hsl(${a()} 40% 74%)`)}></stop><stop offset="100%"${attr("stop-color", `hsl(${b()} 55% 86%)`)}></stop></linearGradient><radialGradient${attr("id", `pr-${h()}`)} cx="0.35" cy="0.3" r="0.8"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"></stop><stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop></radialGradient></defs><rect width="100" height="100"${attr("fill", `url(#pg-${h()})`)}></rect><rect width="100" height="100"${attr("fill", `url(#pr-${h()})`)}></rect>`);
  if (isPortrait()) {
    $$renderer.push(`<!--[0--><circle cx="50" cy="38" r="17"${attr("fill", `hsl(${a()} 30% 55%)`)} opacity="0.55"></circle><path d="M18 100 C18 74 32 62 50 62 C68 62 82 74 82 100 Z"${attr("fill", `hsl(${a()} 30% 55%)`)} opacity="0.55"></path>`);
  } else {
    $$renderer.push(`<!--[-1--><g${attr("stroke", `hsl(${a()} 45% 42%)`)} stroke-width="0.6" opacity="0.35" fill="none"><path d="M0 72 L26 48 L46 62 L72 30 L100 52"></path><path d="M0 88 L30 68 L58 80 L78 56 L100 74"></path></g><circle cx="76" cy="24" r="9"${attr("fill", `hsl(${b()} 70% 80%)`)} opacity="0.7"></circle>`);
  }
  $$renderer.push(`<!--]--></svg> `);
  if (label) {
    $$renderer.push(`<!--[0--><span class="cap svelte-1x8j3bw">${escape_html(label)}</span>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
export {
  Plate as P
};
