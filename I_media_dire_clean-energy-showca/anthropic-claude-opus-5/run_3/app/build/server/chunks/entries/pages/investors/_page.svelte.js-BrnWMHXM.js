import { ae as head, ab as ensure_array_like, a7 as escape_html } from '../../../chunks/index.js-CnICPAax.js';
import { R as Reveal } from '../../../chunks/Reveal.js-Bfh9vo4k.js';
import { P as Plate } from '../../../chunks/Plate.js-Dbshsp3s.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-GlEKx5p3.js';
import '../../../chunks/state.svelte.js-CoYBmM9v.js';
import '../../../chunks/auth.js-CRCsruHm.js';
import '../../../chunks/scroll.js-XFfYl84w.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const TIMELINE = [
      [
        "1998",
        "The reference test reactor goes critical and begins the operating record this design rests on."
      ],
      [
        "2024",
        "Modernized module design frozen; the digital twin programme starts against the test reactor data."
      ],
      [
        "2026",
        "Pre-application review closed out; first firm module order signed."
      ],
      [
        "2027",
        "Formal design submission and long lead procurement for vessel and circulators."
      ],
      [
        "2029",
        "Construction permit and factory build of the first modules."
      ],
      [
        "2031",
        "First deployment delivering heat and power under an energy supply agreement."
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
        "300 C",
        "Electricity only",
        "Modular",
        "Customer or utility operated"
      ],
      [
        "Gas-fired heat",
        "700 C plus",
        "Heat and power",
        "Bespoke build",
        "Customer operated, emitting"
      ],
      [
        "Renewables plus storage",
        "Low grade",
        "Electricity",
        "Land hungry",
        "Weather dependent"
      ]
    ];
    head("10l0o2u", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Investors · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-10l0o2u"><div class="wrap"><p class="eyebrow">Investors</p> `);
    Reveal($$renderer2, { as: "h1", text: "The case" });
    $$renderer2.push(`<!----> <p class="lede">The world will need a zettajoule of clean energy, most of it as heat, and most of that hotter
			than a water-cooled reactor can reach. This is a proven machine, modernized, sold as a service.</p></div></section> <section class="section wrap grid grid--2"><div><h2>The size of the need</h2> <p>Industrial process heat is roughly a quarter of global final energy use and it is the part that
			has no easy substitute. Electrification reaches some of it; the rest wants temperature, and
			temperature is what burns fuel today. That is the demand this business is pointed at, and it
			does not shrink on any credible path.</p> <h2>Why a service, not a sale</h2> <p>Selling reactors means selling an operating obligation to a customer who does not want one.
			Selling energy means Zettajoule owns the module, runs it and staffs it through its own
			Operations Academy, and the customer signs the kind of supply agreement they already sign. It
			puts the risk with the party that understands it and gives the business recurring revenue over
			the life of each installation.</p></div> <div>`);
    Plate($$renderer2, {
      seed: "investor-case",
      ratio: "4 / 3",
      label: "Generated plate: the investment case"
    });
    $$renderer2.push(`<!----> <h2 class="mt svelte-10l0o2u">How it stacks up</h2> <div class="scroller svelte-10l0o2u"><table class="data"><thead><tr><th scope="col">Option</th><th scope="col">Temperature</th><th scope="col">Outputs</th><th scope="col">Build</th><th scope="col">Operation</th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(COMPARISON);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let row = each_array[$$index];
      $$renderer2.push(`<tr><th scope="row">${escape_html(row[0])}</th><td>${escape_html(row[1])}</td><td>${escape_html(row[2])}</td><td>${escape_html(row[3])}</td><td>${escape_html(row[4])}</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></section> <section class="section wrap"><h2>Roadmap</h2> <p class="lede">From the proven test reactor to first deployment.</p> <ol class="timeline svelte-10l0o2u"><!--[-->`);
    const each_array_1 = ensure_array_like(TIMELINE);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let [year, text] = each_array_1[$$index_1];
      $$renderer2.push(`<li class="svelte-10l0o2u"><span class="timeline__year svelte-10l0o2u">${escape_html(year)}</span> <span class="timeline__text svelte-10l0o2u">${escape_html(text)}</span></li>`);
    }
    $$renderer2.push(`<!--]--></ol></section> <section class="section wrap room-ask svelte-10l0o2u" id="access"><div class="card card--pad"><h2>The document room</h2> `);
    {
      $$renderer2.push(`<!--[0--><p class="loading-row"><span class="spinner" aria-hidden="true"></span> Checking your request…</p>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-BrnWMHXM.js.map
