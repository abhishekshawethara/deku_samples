import { ae as head, ab as ensure_array_like, a8 as attr_style, a7 as escape_html } from '../../../chunks/index.js-CnICPAax.js';
import { R as Reveal } from '../../../chunks/Reveal.js-Bfh9vo4k.js';
import { P as Plate } from '../../../chunks/Plate.js-Dbshsp3s.js';
import '../../../chunks/scroll.js-XFfYl84w.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("3id43s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Company · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-3id43s"><div class="wrap"><p class="eyebrow">Company</p> `);
    Reveal($$renderer2, {
      as: "h1",
      text: "clean heat and electricity to power a world of industrial applications"
    });
    $$renderer2.push(`<!----></div></section> <section class="section wrap grid grid--2"><div><h2>The vision</h2> <p>A world where the heat industry runs on stops being the reason industry emits. Not electricity
			alone, which is the part everyone already knows how to decarbonise, but the hot, continuous,
			unglamorous energy that makes steel, fuel, chemicals and fresh water.</p> <h2>The mission</h2> <p>To provide clean, reliable heat and power at the temperatures industry actually uses, in units
			small enough to build in a factory and put where the demand already is. Reliable is the load
			bearing word: a plant that cannot ride out an interruption needs a supply that does not have
			one.</p></div> `);
    Plate($$renderer2, {
      seed: "company-vision",
      ratio: "4 / 3",
      label: "Generated plate: the company vision"
    });
    $$renderer2.push(`<!----></section> <section class="section name-sec svelte-3id43s"><div class="wrap"><p class="eyebrow">The name</p> `);
    Reveal($$renderer2, {
      as: "h2",
      text: "Built from the units of energy the world will need"
    });
    $$renderer2.push(`<!----> <p class="lede">A joule is the small unit. A zettajoule is a sextillion of them, and it is the scale at which
			the world's future energy need is measured. We took the company name from the unit rather than
			from a metaphor, because the size of the problem is the whole reason the company exists.</p></div></section> <section class="section wrap"><h2>Where we are</h2> <ul class="offices svelte-3id43s"><!--[-->`);
    const each_array = ensure_array_like(data.offices);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let o = each_array[i];
      $$renderer2.push(`<li class="office svelte-3id43s"${attr_style("", { "--i": i })}>`);
      Plate($$renderer2, { seed: `office-${o.city}`, ratio: "16 / 9" });
      $$renderer2.push(`<!----> <h3 class="svelte-3id43s">${escape_html(o.city)}</h3> <p class="muted svelte-3id43s">${escape_html(o.country)}</p> <p class="office__role svelte-3id43s">${escape_html(o.role_label)}</p></li>`);
    }
    $$renderer2.push(`<!--]--></ul></section> <section class="section owned svelte-3id43s"><div class="wrap grid grid--2"><div><p class="eyebrow">The model</p> `);
    Reveal($$renderer2, { as: "h2", text: "We do not only\nbuild the reactor." });
    $$renderer2.push(`<!----></div> <div><p>We own it, we run it and we staff it. The customer does not buy a reactor, take on a nuclear
				operating licence or hire operators: they sign an energy supply agreement and buy heat,
				hydrogen or electricity by the unit, the way they already buy energy today.</p> <p>That decision shapes everything else about the company. It is why we run our own Operations
				Academy, why the digital twin matters enough to fund properly, and why the licensing
				strategy leans on a machine with a real operating record instead of a concept. The operating
				risk sits with the organisation built around understanding it.</p> <a class="btn btn--ghost" href="/edge">What makes this different</a></div></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-D3w1ZV9Q.js.map
