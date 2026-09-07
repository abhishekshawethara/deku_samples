import { h as head, i as ensure_array_like, e as escape_html } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ROADMAP = [
      [
        "1998",
        "Test reactor first criticality",
        "The machine this design modernises begins operating, and has run since."
      ],
      [
        "2024",
        "Company founded",
        "Zettajoule forms in Rotterdam around an energy-as-a-service model."
      ],
      [
        "2026",
        "Licensing step cleared",
        "The fuel qualification basis and the safety case approach are accepted in pre-application review."
      ],
      [
        "2027",
        "Topical reports submitted",
        "Intermediate heat exchanger and helium circuit reports go to the regulator."
      ],
      [
        "2029",
        "Construction permit",
        "First site permitted, long lead items already in the factory."
      ],
      [
        "2032",
        "First deployment",
        "First module delivering heat under a twenty year energy supply agreement."
      ]
    ];
    const COMPARISON = [
      [
        "Zettajoule module",
        "750 C",
        "Heat, hydrogen, power",
        "Modular, factory built",
        "Owned and run by us"
      ],
      [
        "Water-cooled SMR",
        "About 300 C",
        "Power only",
        "Modular",
        "Sold to the customer"
      ],
      [
        "Gas boiler or fired heater",
        "Any temperature",
        "Heat only",
        "Site built",
        "Owned by the customer"
      ],
      [
        "Wind or solar plus storage",
        "Not thermal",
        "Power, intermittent",
        "Land hungry",
        "Owned by the customer"
      ]
    ];
    head("10l0o2u", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Investors, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Investors</p> <h1>A proven machine, sold as a service.</h1> <p class="lede">The world will need energy measured in zettajoules, and a quarter of what industry uses is
      heat no water-cooled reactor can make. We modernise a reactor that already runs, build it in
      modules, own it, staff it and sell the energy on long contracts.</p></div></section> <section class="section-tight"><div class="wrap grid grid-3"><div class="card"><h2>The size of it</h2> <p class="small">Global primary energy sits near six hundred exajoules a year. Industrial heat is roughly a
        quarter of it and is almost entirely fossil today, because the temperature has not been
        available from anything clean and firm.</p></div> <div class="card"><h2>Why the model works</h2> <p class="small">Selling energy rather than reactors puts the licence, the fuel and the operators on our side
        of the fence. The customer signs an energy supply agreement, not a nuclear project, which is
        the difference between a decision that takes months and one that takes a decade.</p></div> <div class="card"><h2>Repeat, do not reinvent</h2> <p class="small">Factory-built modules mean the tenth plant is not a first of a kind. Cost falls with
        repetition, and a site that grows adds a module instead of starting a new programme.</p></div></div></section> <section class="section-tight section-warm"><div class="wrap"><h2>How we stack up</h2> <div class="scroller svelte-10l0o2u"><table class="data svelte-10l0o2u"><caption class="sr-only">Zettajoule compared with the alternatives</caption><thead><tr><th scope="col">Option</th><th scope="col">Temperature</th><th scope="col">Products</th><th scope="col">Build</th><th scope="col">Ownership</th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(COMPARISON);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let row = each_array[$$index];
      $$renderer2.push(`<tr><th scope="row">${escape_html(row[0])}</th><td>${escape_html(row[1])}</td><td>${escape_html(row[2])}</td><td>${escape_html(row[3])}</td><td>${escape_html(row[4])}</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></section> <section class="section-tight"><div class="wrap"><h2>Roadmap, from the proven test reactor to first deployment</h2> <ol class="timeline svelte-10l0o2u"><!--[-->`);
    const each_array_1 = ensure_array_like(ROADMAP);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let [year, title, body] = each_array_1[$$index_1];
      $$renderer2.push(`<li class="svelte-10l0o2u"><span class="year svelte-10l0o2u">${escape_html(year)}</span> <div><h3 class="svelte-10l0o2u">${escape_html(title)}</h3> <p class="small muted">${escape_html(body)}</p></div></li>`);
    }
    $$renderer2.push(`<!--]--></ol></div></section> <section class="section-tight section-sky" id="access"><div class="wrap wrap-narrow"><h2>The private document room</h2> <p>Serious investors request access from here. A request is logged as pending and stays pending
      until it is approved outside this product; the room answers only while your own request is
      approved.</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><div class="skeleton"><span class="spinner" aria-hidden="true"></span> Checking your request…</div>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
export {
  _page as default
};
