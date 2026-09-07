import { ac as attr, a8 as attr_style, aa as attr_class, ab as ensure_array_like, af as bind_props, R as derived } from './index.js-CnICPAax.js';

function Reactor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      progress = 0,
      // 0 whole and metallic .. 1 exploded technical drawing
      still = false,
      // reduced motion / low power: one clean frame
      height = "100%",
      interactive = false,
      // /technology: parts can be picked apart
      activePart = null,
      spin = 0
    } = $$props;
    const p = derived(() => still ? 0.62 : Math.min(1, Math.max(0, progress)));
    const rodLift = derived(() => Math.min(1, p() / 0.34));
    const domeLift = derived(() => Math.min(1, Math.max(0, (p() - 0.22) / 0.32)));
    const coreShow = derived(() => Math.min(1, Math.max(0, (p() - 0.4) / 0.28)));
    const lineArt = derived(() => Math.min(1, Math.max(0, (p() - 0.62) / 0.34)));
    const metal = derived(() => 1 - lineArt());
    $$renderer2.push(`<div class="reactor svelte-1t3cea1"${attr("data-progress", p().toFixed(2))}${attr_style("", { height })}><svg viewBox="0 0 320 420" class="reactor__svg svelte-1t3cea1" role="img" aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, pressure dome, fuel core, pressure vessel, helium loop and base."${attr_style("", { transform: `rotate(${spin}deg)` })}><defs><linearGradient id="zj-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6d737b"></stop><stop offset="14%" stop-color="#c9ced6"></stop><stop offset="30%" stop-color="#f4f7fa"></stop><stop offset="44%" stop-color="#aeb5be"></stop><stop offset="58%" stop-color="#e6eaf0"></stop><stop offset="74%" stop-color="#8f959e"></stop><stop offset="88%" stop-color="#c2c8d0"></stop><stop offset="100%" stop-color="#5e646c"></stop></linearGradient><linearGradient id="zj-steel-dome" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0%" stop-color="#767c84"></stop><stop offset="26%" stop-color="#eef2f6"></stop><stop offset="52%" stop-color="#b4bac2"></stop><stop offset="78%" stop-color="#e9edf2"></stop><stop offset="100%" stop-color="#666c74"></stop></linearGradient><linearGradient id="zj-core" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a2a1c"></stop><stop offset="45%" stop-color="#6b3d16"></stop><stop offset="100%" stop-color="#241a12"></stop></linearGradient><linearGradient id="zj-rod" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8a9099"></stop><stop offset="40%" stop-color="#f0f3f7"></stop><stop offset="100%" stop-color="#767c85"></stop></linearGradient><radialGradient id="zj-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#ffb347" stop-opacity="0.85"></stop><stop offset="100%" stop-color="#ffb347" stop-opacity="0"></stop></radialGradient></defs><g${attr_class("part svelte-1t3cea1", void 0, { "part--live": interactive })} data-part="base"${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? "Base and support" : void 0)}><rect x="86" y="352" width="148" height="20" rx="4" fill="url(#zj-steel)"${attr("opacity", metal())}></rect><rect x="86" y="352" width="148" height="20" rx="4" fill="none" stroke="var(--ink)" stroke-width="1.3"${attr("opacity", lineArt())}></rect><rect x="104" y="372" width="18" height="26" fill="url(#zj-steel)"${attr("opacity", metal())}></rect><rect x="198" y="372" width="18" height="26" fill="url(#zj-steel)"${attr("opacity", metal())}></rect><rect x="104" y="372" width="18" height="26" fill="none" stroke="var(--ink)" stroke-width="1.3"${attr("opacity", lineArt())}></rect><rect x="198" y="372" width="18" height="26" fill="none" stroke="var(--ink)" stroke-width="1.3"${attr("opacity", lineArt())}></rect></g><g${attr_class("part svelte-1t3cea1", void 0, { "part--live": interactive })} data-part="loop"${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? "Helium loop" : void 0)}><path d="M234 210 H272 V300 H244" fill="none" stroke="url(#zj-steel)" stroke-width="11"${attr("opacity", metal())}></path><path d="M234 210 H272 V300 H244" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3"${attr("opacity", lineArt())}></path><path d="M86 246 H48 V318 H84" fill="none" stroke="url(#zj-steel)" stroke-width="11"${attr("opacity", metal())}></path><path d="M86 246 H48 V318 H84" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3"${attr("opacity", lineArt())}></path></g><g${attr_class("part svelte-1t3cea1", void 0, { "part--live": interactive })} data-part="vessel"${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? "Pressure vessel" : void 0)}><rect x="94" y="150" width="132" height="204" rx="12" fill="url(#zj-steel)"${attr("opacity", metal())}></rect><rect x="94" y="150" width="132" height="204" rx="12" fill="none" stroke="var(--ink)" stroke-width="1.4"${attr("opacity", lineArt())}></rect><!--[-->`);
    const each_array = ensure_array_like([186, 226, 266, 306]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let y = each_array[$$index];
      $$renderer2.push(`<line x1="94"${attr("y1", y)} x2="226"${attr("y2", y)} stroke="rgba(255,255,255,0.5)" stroke-width="1.2"${attr("opacity", metal() * 0.8)}></line><line x1="94"${attr("y1", y)} x2="226"${attr("y2", y)} stroke="var(--rule-strong)" stroke-width="0.8" stroke-dasharray="3 3"${attr("opacity", lineArt())}></line>`);
    }
    $$renderer2.push(`<!--]--></g><g${attr_class("part svelte-1t3cea1", void 0, { "part--live": interactive })} data-part="core"${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? "Fuel core" : void 0)}${attr("opacity", coreShow())}><ellipse cx="160" cy="250" rx="82" ry="66" fill="url(#zj-glow)"${attr("opacity", 0.5 * coreShow())}></ellipse><rect x="124" y="176" width="72" height="160" rx="6" fill="url(#zj-core)"${attr("opacity", metal())}></rect><rect x="124" y="176" width="72" height="160" rx="6" fill="none" stroke="var(--ink)" stroke-width="1.3"${attr("opacity", lineArt())}></rect><!--[-->`);
    const each_array_1 = ensure_array_like([0, 1, 2, 3, 4]);
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let r = each_array_1[$$index_2];
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like([0, 1, 2]);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let c = each_array_2[$$index_1];
        $$renderer2.push(`<circle${attr("cx", 140 + c * 20)}${attr("cy", 196 + r * 28)} r="5.5" fill="none"${attr("stroke", lineArt() > 0.5 ? "var(--ink)" : "#e9a13b")} stroke-width="1.4"></circle>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></g><g${attr_class("part svelte-1t3cea1", void 0, { "part--live": interactive })} data-part="rods"${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? "Control rods" : void 0)}${attr_style("", { transform: `translateY(${-rodLift() * 96}px)` })}><!--[-->`);
    const each_array_3 = ensure_array_like([0, 1, 2, 3, 4, 5]);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let i = each_array_3[$$index_3];
      $$renderer2.push(`<rect${attr("x", 118 + i * 15)} y="96" width="7" height="118" rx="3" fill="url(#zj-rod)"${attr("opacity", metal())}></rect><rect${attr("x", 118 + i * 15)} y="96" width="7" height="118" rx="3" fill="none" stroke="var(--ink)" stroke-width="1.1"${attr("opacity", lineArt())}></rect><rect${attr("x", 115 + i * 15)} y="88" width="13" height="9" rx="2" fill="#8a9099"${attr("opacity", metal())}></rect><rect${attr("x", 115 + i * 15)} y="88" width="13" height="9" rx="2" fill="none" stroke="var(--ink)" stroke-width="1.1"${attr("opacity", lineArt())}></rect>`);
    }
    $$renderer2.push(`<!--]--></g><g${attr_class("part svelte-1t3cea1", void 0, { "part--live": interactive })} data-part="dome"${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? "Pressure dome" : void 0)}${attr_style("", { transform: `translateY(${-domeLift() * 62}px)` })}><path d="M94 156 A66 54 0 0 1 226 156 Z" fill="url(#zj-steel-dome)"${attr("opacity", metal())}></path><path d="M94 156 A66 54 0 0 1 226 156 Z" fill="none" stroke="var(--ink)" stroke-width="1.4"${attr("opacity", lineArt())}></path><rect x="94" y="152" width="132" height="10" rx="3" fill="url(#zj-steel)"${attr("opacity", metal())}></rect><rect x="94" y="152" width="132" height="10" rx="3" fill="none" stroke="var(--ink)" stroke-width="1.3"${attr("opacity", lineArt())}></rect></g></svg></div>`);
    bind_props($$props, { activePart });
  });
}

export { Reactor as R };
//# sourceMappingURL=Reactor.js-l_C6r6jz.js.map
