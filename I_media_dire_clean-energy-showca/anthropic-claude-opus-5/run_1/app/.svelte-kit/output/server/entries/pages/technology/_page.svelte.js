import { h as head, e as escape_html, g as ensure_array_like, c as attr_style, a as attr, f as attr_class, d as derived } from "../../../chunks/index.js";
import { R as Reactor } from "../../../chunks/Reactor.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const c = derived(() => data.copy);
    const FACTS = [
      "High-temperature gas-cooled reactor",
      "250 MW thermal a module",
      "750 degrees Celsius at the outlet"
    ];
    const PARTS = [
      {
        id: "rods",
        name: "Control rods",
        text: "Absorbers that drop into channels in the graphite to shut the chain reaction down. They lift clear when the module runs at power."
      },
      {
        id: "dome",
        name: "The dome",
        text: "The rounded upper closure of the pressure boundary. It lifts off for refuelling and inspection and is drawn separately in the sequence."
      },
      {
        id: "core",
        name: "The core",
        text: "A dark column of coated particle fuel inside a graphite block. Thousands of grain-sized particles, each its own pressure vessel."
      },
      {
        id: "vessel",
        name: "The vessel",
        text: "The steel pressure boundary holding the helium inventory. Factory built, road transportable, assembled on site."
      },
      {
        id: "helium-circuit",
        name: "The helium circuit",
        text: "Helium leaves the core at 750 degrees Celsius, gives its heat to the customer process through an exchanger, and is returned by the circulator."
      },
      {
        id: "base",
        name: "The base",
        text: "The supporting structure and the interface to the site: the anchor, the shielding and the connections into the process."
      }
    ];
    let turn = 0;
    let zoom = 1;
    let selected = PARTS[2];
    let progress = 0.55;
    head("143q2h7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Technology, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-143q2h7"><div class="wrap"><p class="eyebrow">Technology</p> <h1>${escape_html(c().lede?.heading)}</h1> <p class="lede">${escape_html(c().lede?.body)}</p> <ul class="facts svelte-143q2h7"><!--[-->`);
    const each_array = ensure_array_like(FACTS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let f = each_array[$$index];
      $$renderer2.push(`<li class="mono svelte-143q2h7">${escape_html(f)}</li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section> <section class="section diagram-section svelte-143q2h7"><div class="wrap diagram-grid svelte-143q2h7"><div class="stage svelte-143q2h7"><div class="drag svelte-143q2h7" role="application" aria-label="Reactor diagram. Drag to turn it, or use the part buttons beside it."${attr_style("", { transform: `rotate(${turn * 0.12}deg) scale(${zoom})` })}>`);
    Reactor($$renderer2, {
      progress,
      mode: "auto",
      size: 360
    });
    $$renderer2.push(`<!----></div> <div class="stage-controls svelte-143q2h7"><label class="ctl svelte-143q2h7" for="turn">Turn</label> <input id="turn" type="range" min="-40" max="40" step="1"${attr("value", turn)} class="svelte-143q2h7"/> <label class="ctl svelte-143q2h7" for="zoom">Zoom</label> <input id="zoom" type="range" min="0.7" max="1.5" step="0.05"${attr("value", zoom)} class="svelte-143q2h7"/> <label class="ctl svelte-143q2h7" for="apart">Take apart</label> <input id="apart" type="range" min="0" max="1" step="0.01"${attr("value", progress)} class="svelte-143q2h7"/></div></div> <div><h2>Pick it apart</h2> <p class="muted">Each part is separately named. Choose one to read what it does; the same text is here whether
				you use the diagram or the list.</p> <ul class="parts svelte-143q2h7"><!--[-->`);
    const each_array_1 = ensure_array_like(PARTS);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let p = each_array_1[$$index_1];
      $$renderer2.push(`<li><button type="button"${attr("aria-pressed", selected.id === p.id)}${attr_class("svelte-143q2h7", void 0, { "selected": selected.id === p.id })}>${escape_html(p.name)}</button></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <div class="part-detail card svelte-143q2h7" aria-live="polite"><h3 class="svelte-143q2h7">${escape_html(selected.name)}</h3> <p class="svelte-143q2h7">${escape_html(selected.text)}</p></div></div></div></section> <section class="section"><div class="wrap deep svelte-143q2h7"><!--[-->`);
    const each_array_2 = ensure_array_like(["fuel", "graphite", "helium"]);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let key = each_array_2[$$index_2];
      Reveal($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<article class="card"><h2 class="svelte-143q2h7">${escape_html(c()[key]?.heading)}</h2> <p class="svelte-143q2h7">${escape_html(c()[key]?.body)}</p></article>`);
        }
      });
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section alt svelte-143q2h7"><div class="wrap deep svelte-143q2h7"><!--[-->`);
    const each_array_3 = ensure_array_like(["twin", "safety", "modular"]);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let key = each_array_3[$$index_3];
      Reveal($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<article class="card"><h2 class="svelte-143q2h7">${escape_html(c()[key]?.heading)}</h2> <p class="svelte-143q2h7">${escape_html(c()[key]?.body)}</p></article>`);
        }
      });
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
export {
  _page as default
};
