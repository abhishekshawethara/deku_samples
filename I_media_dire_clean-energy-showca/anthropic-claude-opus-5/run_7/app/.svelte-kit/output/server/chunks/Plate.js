import { f as fallback, d as attr_class, k as attr_style, c as attr, g as bind_props, ah as stringify } from "./index.js";
function Plate($$renderer, $$props) {
  let h, a, b, ang, l1, l2, sat;
  let seed = fallback($$props["seed"], "zettajoule");
  let height = fallback($$props["height"], "160px");
  let label = fallback($$props["label"], "");
  let kind = fallback($$props["kind"], "industry");
  function hash(str) {
    let h2 = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h2 ^= str.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return Math.abs(h2);
  }
  h = hash(seed);
  a = 195 + h % 40;
  b = 208 + (h >> 5) % 34;
  ang = 110 + h % 130;
  l1 = kind === "portrait" ? 92 : 72 + h % 12;
  l2 = kind === "portrait" ? 82 : 44 + (h >> 3) % 16;
  sat = kind === "portrait" ? 42 : 34 + (h >> 7) % 26;
  $$renderer.push(`<div${attr_class(`plate ${stringify(kind)}`, "svelte-1x8j3bw")}${attr_style(`height:${height};
    --g1:hsl(${a} ${sat}% ${l1}%);
    --g2:hsl(${b} ${sat}% ${l2}%);
    --ang:${ang}deg;
    --spot:${25 + h % 50}% ${20 + (h >> 4) % 60}%;`)} role="img"${attr("aria-label", label || `Generated plate for ${seed}`)}>`);
  if (kind === "portrait") {
    $$renderer.push(`<!--[0--><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false" class="svelte-1x8j3bw"><circle cx="50" cy="38" r="17" fill="rgba(255,255,255,0.62)"></circle><path d="M14 100 a36 30 0 0 1 72 0 z" fill="rgba(255,255,255,0.62)"></path></svg>`);
  } else if (kind === "industry") {
    $$renderer.push(`<!--[1--><svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true" focusable="false" class="svelte-1x8j3bw"><g stroke="rgba(255,255,255,0.5)" fill="none" stroke-width="1.2"><path d="M0 92 H200 M0 74 H200"></path><rect x="24" y="42" width="34" height="50"></rect><rect x="72" y="28" width="22" height="64"></rect><circle cx="140" cy="58" r="20"></circle><path d="M140 38 v40 M120 58 h40"></path></g></svg>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
  bind_props($$props, { seed, height, label, kind });
}
export {
  Plate as P
};
