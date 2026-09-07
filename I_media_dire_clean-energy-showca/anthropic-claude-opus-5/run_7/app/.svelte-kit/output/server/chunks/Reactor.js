import { f as fallback, k as attr_style, c as attr, d as attr_class, i as ensure_array_like, g as bind_props } from "./index.js";
function Reactor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let p, rodLift, domeLift, coreReveal, lineMode, metal;
    let progress = fallback($$props["progress"], 0);
    let interactive = fallback($$props["interactive"], false);
    let height = fallback($$props["height"], 460);
    let idPrefix = fallback($$props["idPrefix"], "rx");
    let activePart = null;
    const parts = {
      rods: "Control rods, lifted clear of the core",
      dome: "Pressure vessel dome, the rounded lid",
      core: "Core, a dark column of coated particle fuel in graphite",
      vessel: "Steel pressure vessel holding the helium primary circuit",
      base: "Base and helium circulator, returning gas to the core"
    };
    p = Math.max(0, Math.min(1, progress));
    rodLift = Math.min(1, p / 0.35) * 78;
    domeLift = Math.max(0, Math.min(1, (p - 0.25) / 0.35)) * 104;
    coreReveal = Math.max(0, Math.min(1, (p - 0.35) / 0.3));
    lineMode = Math.max(0, Math.min(1, (p - 0.6) / 0.35));
    metal = 1 - lineMode;
    $$renderer2.push(`<div class="reactor svelte-tyrlqq"${attr_style(`--h:${height}px`)}><svg viewBox="0 0 320 480"${attr("height", height)} role="img" aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, dome, core, vessel and base" class="svg svelte-tyrlqq"><defs><linearGradient${attr("id", `${idPrefix}-steel`)} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8d949c"></stop><stop offset="16%" stop-color="#e9edf1"></stop><stop offset="34%" stop-color="#aeb6be"></stop><stop offset="52%" stop-color="#f6f8fa"></stop><stop offset="72%" stop-color="#9aa2ab"></stop><stop offset="88%" stop-color="#d8dde2"></stop><stop offset="100%" stop-color="#767d85"></stop></linearGradient><linearGradient${attr("id", `${idPrefix}-steel-dark`)} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#5d646c"></stop><stop offset="22%" stop-color="#c4cbd2"></stop><stop offset="50%" stop-color="#7f868e"></stop><stop offset="78%" stop-color="#d3d9df"></stop><stop offset="100%" stop-color="#565d64"></stop></linearGradient><linearGradient${attr("id", `${idPrefix}-core`)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a2a1c"></stop><stop offset="45%" stop-color="#6b3f14"></stop><stop offset="100%" stop-color="#241a12"></stop></linearGradient><radialGradient${attr("id", `${idPrefix}-glow`)} cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#ffb45e" stop-opacity="0.85"></stop><stop offset="100%" stop-color="#ffb45e" stop-opacity="0"></stop></radialGradient></defs><ellipse cx="160" cy="432" rx="104" ry="13" fill="#0b1f3d"${attr("opacity", 0.1 * metal + 0.04)}></ellipse><g${attr_class("part svelte-tyrlqq", void 0, { "active": activePart === "base" })}${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? parts.base : void 0)}><rect x="72" y="368" width="176" height="52" rx="8"${attr("fill", `url(#${idPrefix}-steel-dark)`)}${attr("fill-opacity", metal)} stroke="var(--navy)" stroke-width="1.4"></rect><rect x="96" y="382" width="46" height="24" rx="4" fill="none" stroke="var(--navy)" stroke-width="1.1"></rect><circle cx="200" cy="394" r="15" fill="none" stroke="var(--navy)" stroke-width="1.1"></circle><path d="M190 394 h20 M200 384 v20" stroke="var(--navy)" stroke-width="1.1"></path></g><g${attr_class("part svelte-tyrlqq", void 0, { "active": activePart === "vessel" })}${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? parts.vessel : void 0)}><rect x="94" y="176" width="132" height="196" rx="14"${attr("fill", `url(#${idPrefix}-steel)`)}${attr("fill-opacity", metal)} stroke="var(--navy)" stroke-width="1.6"></rect><path d="M110 210 h100 M110 250 h100 M110 290 h100 M110 330 h100" stroke="var(--navy)" stroke-width="0.8"${attr("opacity", 0.35 + 0.5 * lineMode)}></path><path d="M226 300 h56 v-46" fill="none" stroke="var(--navy)" stroke-width="1.6"></path><path d="M276 258 l6 -12 l6 12 z" fill="var(--navy)"></path></g><g${attr_class("part svelte-tyrlqq", void 0, { "active": activePart === "core" })}${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? parts.core : void 0)}${attr("opacity", interactive ? 1 : 0.25 + 0.75 * coreReveal)}><ellipse cx="160" cy="270" rx="86" ry="86"${attr("fill", `url(#${idPrefix}-glow)`)}${attr("opacity", coreReveal * 0.7)}></ellipse><rect x="126" y="206" width="68" height="140" rx="6"${attr("fill", `url(#${idPrefix}-core)`)}${attr("fill-opacity", 0.25 + 0.75 * metal)} stroke="var(--navy)" stroke-width="1.4"></rect><!--[-->`);
    const each_array = ensure_array_like([0, 1, 2, 3, 4]);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let row = each_array[$$index_1];
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like([0, 1, 2]);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let col = each_array_1[$$index];
        $$renderer2.push(`<circle${attr("cx", 140 + col * 20)}${attr("cy", 222 + row * 26)} r="6" fill="none"${attr("stroke", lineMode > 0.5 ? "var(--navy)" : "#f2c98a")} stroke-width="1.1"></circle>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></g><g${attr_class("part svelte-tyrlqq", void 0, { "active": activePart === "dome" })}${attr("transform", `translate(0 ${-domeLift})`)}${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? parts.dome : void 0)}><path d="M94 190 a66 58 0 0 1 132 0 z"${attr("fill", `url(#${idPrefix}-steel)`)}${attr("fill-opacity", metal)} stroke="var(--navy)" stroke-width="1.6"></path><path d="M112 170 a48 40 0 0 1 96 0" fill="none" stroke="var(--navy)" stroke-width="0.8" opacity="0.6"></path><rect x="94" y="186" width="132" height="10" rx="3"${attr("fill", `url(#${idPrefix}-steel-dark)`)}${attr("fill-opacity", metal)} stroke="var(--navy)" stroke-width="1.2"></rect></g><g${attr_class("part svelte-tyrlqq", void 0, { "active": activePart === "rods" })}${attr("transform", `translate(0 ${-rodLift - domeLift * 0.55})`)}${attr("role", interactive ? "button" : void 0)}${attr("tabindex", interactive ? 0 : void 0)}${attr("aria-label", interactive ? parts.rods : void 0)}><!--[-->`);
    const each_array_2 = ensure_array_like([130, 152, 174, 196]);
    for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
      let x = each_array_2[i];
      $$renderer2.push(`<rect${attr("x", x - 5)}${attr("y", 70 + i % 2 * 8)} width="10"${attr("height", 104 - i % 2 * 8)} rx="4"${attr("fill", `url(#${idPrefix}-steel-dark)`)}${attr("fill-opacity", metal)} stroke="var(--navy)" stroke-width="1.2"></rect><rect${attr("x", x - 11)}${attr("y", 60 + i % 2 * 8)} width="22" height="12" rx="3"${attr("fill", `url(#${idPrefix}-steel)`)}${attr("fill-opacity", metal)} stroke="var(--navy)" stroke-width="1.2"></rect>`);
    }
    $$renderer2.push(`<!--]--><path d="M118 58 h84" stroke="var(--navy)" stroke-width="1.4"></path></g><g class="labels"${attr("opacity", Math.max(0, Math.min(1, (p - 0.3) / 0.3)))} font-size="10" fill="var(--ink-muted)" font-family="var(--font-body)"><path d="M226 120 h58" stroke="var(--rule-strong)" stroke-width="1"></path><text x="288" y="123">Control rods</text><path d="M40 196 h50" stroke="var(--rule-strong)" stroke-width="1"></path><text x="4" y="192">Dome</text><path d="M40 276 h82" stroke="var(--rule-strong)" stroke-width="1"></path><text x="4" y="272">Core</text><path d="M40 396 h28" stroke="var(--rule-strong)" stroke-width="1"></path><text x="4" y="392">Base</text></g></svg> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <details class="plain svelte-tyrlqq"><summary class="svelte-tyrlqq">Read the reactor sequence as text</summary> <ol class="svelte-tyrlqq"><li>Whole: a metallic module, dome closed, control rods seated in the core.</li> <li>The control rods lift up and pull clear of the core.</li> <li>The rounded dome rises off the pressure vessel.</li> <li>The core is laid bare: a dark column of coated particle fuel held in graphite.</li> <li>The metal resolves into a clean technical line drawing, labelled part by part.</li></ol> <p class="small">High-temperature gas-cooled reactor. 250 MW thermal a module. 750 degrees Celsius at the
      outlet. Helium leaves the core through the hot duct to the heat interface and is returned by
      the circulator in the base.</p></details></div>`);
    bind_props($$props, { progress, interactive, height, idPrefix });
  });
}
export {
  Reactor as R
};
