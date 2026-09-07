import { aa as attr_class, ah as stringify, a8 as attr_style, ac as attr, a7 as escape_html, R as derived } from './index.js-CnICPAax.js';

function Plate($$renderer, $$props) {
  let {
    seed = "plate",
    kind = "industry",
    ratio = "16 / 9",
    label = "",
    initials = ""
  } = $$props;
  function hash(s) {
    let h2 = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h2 ^= s.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return Math.abs(h2);
  }
  const h = derived(() => hash(String(seed)));
  const angle = derived(() => h() % 140);
  const x1 = derived(() => 12 + h() % 55);
  const y1 = derived(() => 10 + (h() >> 3) % 60);
  const x2 = derived(() => 30 + (h() >> 5) % 60);
  const y2 = derived(() => 20 + (h() >> 7) % 65);
  const rot = derived(() => (h() >> 9) % 40 - 20);
  $$renderer.push(`<div${attr_class(`plate-gen plate-gen--${stringify(kind)}`, "svelte-1vp177v")}${attr_style(`--a:${stringify(angle())}deg; --x1:${stringify(x1())}%; --y1:${stringify(y1())}%; --x2:${stringify(x2())}%; --y2:${stringify(y2())}%; --rot:${stringify(rot())}deg;`, { "aspect-ratio": ratio })}${attr("role", label ? "img" : "presentation")}${attr("aria-label", label || void 0)}><span class="plate-gen__band svelte-1vp177v" aria-hidden="true"></span> `);
  if (initials) {
    $$renderer.push(`<!--[0--><span class="plate-gen__initials svelte-1vp177v" aria-hidden="true">${escape_html(initials)}</span>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
}

export { Plate as P };
//# sourceMappingURL=Plate.js-Dbshsp3s.js.map
