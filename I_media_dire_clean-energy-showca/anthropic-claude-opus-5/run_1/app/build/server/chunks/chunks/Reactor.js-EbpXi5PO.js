import { ac as attr_style, aa as attr, a9 as ensure_array_like, P as derived } from './index.js-DtYBOeIk.js';

function Reactor($$renderer, $$props) {
  let { progress = 0, mode = "auto", size = 460 } = $$props;
  const p = derived(() => Math.max(0, Math.min(1, progress)));
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const rodLift = derived(() => clamp01((p() - 0.05) / 0.3) * 96);
  const domeLift = derived(() => clamp01((p() - 0.25) / 0.3) * 132);
  const coreGlow = derived(() => clamp01((p() - 0.42) / 0.28));
  const lineDraw = derived(() => clamp01((p() - 0.62) / 0.3));
  const metal = derived(() => 1 - lineDraw());
  const spread = derived(() => clamp01((p() - 0.2) / 0.5) * 26);
  $$renderer.push(`<div class="reactor svelte-tyrlqq"${attr_style("", { "--size": `${size}px` })}><svg viewBox="0 0 320 460" width="100%" height="100%" role="img" aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, dome, core and base" focusable="false" class="svelte-tyrlqq"><defs><linearGradient id="zj-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8f9aa6"></stop><stop offset="14%" stop-color="#e8edf3"></stop><stop offset="30%" stop-color="#aab6c3"></stop><stop offset="48%" stop-color="#f7fafc"></stop><stop offset="62%" stop-color="#9aa6b3"></stop><stop offset="80%" stop-color="#dde5ed"></stop><stop offset="100%" stop-color="#7d8894"></stop></linearGradient><linearGradient id="zj-steel-dark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#5f6a76"></stop><stop offset="20%" stop-color="#b6c1cd"></stop><stop offset="46%" stop-color="#dde5ed"></stop><stop offset="70%" stop-color="#8d98a4"></stop><stop offset="100%" stop-color="#59636e"></stop></linearGradient><linearGradient id="zj-core" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b3129"></stop><stop offset="50%" stop-color="#221c17"></stop><stop offset="100%" stop-color="#100d0a"></stop></linearGradient><linearGradient id="zj-hot" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffb257"></stop><stop offset="100%" stop-color="#d8551a"></stop></linearGradient><radialGradient id="zj-sheen" cx="0.32" cy="0.22" r="0.75"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"></stop><stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop></radialGradient></defs><ellipse cx="160" cy="424" rx="112" ry="14" fill="#0b1a38" opacity="0.13"></ellipse><g id="reactor-base" data-part="base"><rect x="52" y="368" width="216" height="46" rx="8" fill="url(#zj-steel-dark)"${attr("opacity", metal())}></rect><rect x="52" y="368" width="216" height="46" rx="8" fill="none" stroke="var(--ink)" stroke-width="1.4"${attr("opacity", lineDraw())}></rect><line x1="76" y1="380" x2="244" y2="380" stroke="var(--ink)" stroke-width="1"${attr("opacity", lineDraw() * 0.7)}></line><line x1="76" y1="402" x2="244" y2="402" stroke="var(--ink)" stroke-width="1"${attr("opacity", lineDraw() * 0.7)}></line></g><g id="reactor-vessel" data-part="vessel"><rect x="84" y="150" width="152" height="222" rx="14" fill="url(#zj-steel)"${attr("opacity", metal())}></rect><rect x="84" y="150" width="152" height="222" rx="14" fill="url(#zj-sheen)"${attr("opacity", metal())}></rect><rect x="84" y="150" width="152" height="222" rx="14" fill="none" stroke="var(--ink)" stroke-width="1.6"${attr("opacity", lineDraw())}></rect><!--[-->`);
  const each_array = ensure_array_like([186, 224, 262, 300, 338]);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let y = each_array[$$index];
    $$renderer.push(`<line x1="90"${attr("y1", y)} x2="230"${attr("y2", y)}${attr("stroke", lineDraw() > 0.5 ? "var(--ink)" : "#6d7883")} stroke-width="0.9" opacity="0.45"></line>`);
  }
  $$renderer.push(`<!--]--></g><g id="reactor-core" data-part="core"${attr("opacity", coreGlow())}><rect x="124" y="176" width="72" height="180" rx="8" fill="url(#zj-core)"></rect><rect x="124" y="176" width="72" height="180" rx="8" fill="url(#zj-hot)"${attr("opacity", coreGlow() * 0.45)}></rect><!--[-->`);
  const each_array_1 = ensure_array_like([0, 1, 2, 3, 4]);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let i = each_array_1[$$index_1];
    $$renderer.push(`<line${attr("x1", 134 + i * 13)} y1="184"${attr("x2", 134 + i * 13)} y2="348" stroke="#f0a555" stroke-width="1.5"${attr("opacity", 0.35 + coreGlow() * 0.4)}></line>`);
  }
  $$renderer.push(`<!--]--><text x="160" y="368" text-anchor="middle" font-size="9" fill="var(--ink-muted)"${attr("opacity", lineDraw())}>core</text></g><g id="reactor-rods" data-part="rods"${attr("transform", `translate(0 ${-rodLift()})`)}><!--[-->`);
  const each_array_2 = ensure_array_like([-2, -1, 0, 1, 2]);
  for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
    let i = each_array_2[$$index_2];
    $$renderer.push(`<g${attr("transform", `translate(${i * (14 + spread() * 0.28)} 0)`)}><rect x="155" y="86" width="10" height="118" rx="5" fill="url(#zj-steel-dark)"${attr("opacity", metal())}></rect><rect x="155" y="86" width="10" height="118" rx="5" fill="none" stroke="var(--ink)" stroke-width="1.2"${attr("opacity", lineDraw())}></rect><circle cx="160" cy="82" r="6" fill="url(#zj-steel)"${attr("opacity", metal())}></circle><circle cx="160" cy="82" r="6" fill="none" stroke="var(--ink)" stroke-width="1.2"${attr("opacity", lineDraw())}></circle></g>`);
  }
  $$renderer.push(`<!--]--></g><g id="reactor-dome" data-part="dome"${attr("transform", `translate(0 ${-domeLift()})`)}><path d="M84 164 A76 60 0 0 1 236 164 Z" fill="url(#zj-steel)"${attr("opacity", metal())}></path><path d="M84 164 A76 60 0 0 1 236 164 Z" fill="url(#zj-sheen)"${attr("opacity", metal())}></path><path d="M84 164 A76 60 0 0 1 236 164 Z" fill="none" stroke="var(--ink)" stroke-width="1.6"${attr("opacity", lineDraw())}></path><rect x="80" y="160" width="160" height="12" rx="6" fill="url(#zj-steel-dark)"${attr("opacity", metal())}></rect><rect x="80" y="160" width="160" height="12" rx="6" fill="none" stroke="var(--ink)" stroke-width="1.4"${attr("opacity", lineDraw())}></rect></g><g id="reactor-circuit" data-part="helium-circuit"${attr("opacity", lineDraw())} fill="none"><path d="M236 210 H286 V330 H236" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3"></path><circle cx="286" cy="270" r="13" stroke="var(--accent)" stroke-width="1.6"></circle><text x="286" y="296" text-anchor="middle" font-size="8" fill="var(--accent)">He</text><path d="M84 232 H34 V320 H84" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3"></path><text x="34" y="338" text-anchor="middle" font-size="8" fill="var(--accent)">750 C</text></g></svg> `);
  if (mode === "still") {
    $$renderer.push(`<!--[0--><p class="visually-hidden">The reactor is shown as one still technical drawing because reduced motion is set. No
			information is lost: every stage is written out beside it.</p>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
}

export { Reactor as R };
//# sourceMappingURL=Reactor.js-EbpXi5PO.js.map
