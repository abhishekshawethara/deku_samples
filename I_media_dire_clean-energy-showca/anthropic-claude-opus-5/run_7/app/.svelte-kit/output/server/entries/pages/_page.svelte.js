import { h as head, k as attr_style, d as attr_class, i as ensure_array_like, e as escape_html, c as attr } from "../../chunks/index.js";
import { R as Reactor } from "../../chunks/Reactor.js";
import { P as Plate } from "../../chunks/Plate.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const OUTPUTS = [
      {
        kind: "heat",
        label: "Heat",
        note: "Process heat straight into an existing steam header."
      },
      {
        kind: "heat-and-power",
        label: "Heat and power",
        note: "Both duties from one plant, split to follow the site."
      },
      {
        kind: "hydrogen",
        label: "Hydrogen",
        note: "High temperature electrolysis, at mill and corridor scale."
      },
      {
        kind: "electricity",
        label: "Electricity",
        note: "Firm carbon free power behind the meter."
      }
    ];
    const FACTS = [
      "High-temperature gas-cooled reactor",
      "250 MW thermal a module",
      "750 degrees Celsius at the outlet"
    ];
    const INDUSTRIES = [
      { slug: "steel", name: "Steel" },
      { slug: "chemicals", name: "Chemicals" },
      { slug: "data-centres", name: "Data Centres" },
      { slug: "transport", name: "Transport" },
      { slug: "mining", name: "Mining" },
      { slug: "desalination", name: "Desalination" }
    ];
    let progress = 0;
    let hinted = false;
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Zettajoule, powering the world</title>`);
      });
    });
    $$renderer2.push(`<section class="hero svelte-1uha8ag"${attr_style(`--settle:${Math.min(1, progress * 2.2)}`)} data-testid="hero"><div class="wrap hero-inner svelte-1uha8ag"><h1 class="display svelte-1uha8ag">Powering the World</h1> <p class="promise svelte-1uha8ag">Small high-temperature reactor modules, owned and run by us. You buy the heat, the hydrogen or
      the electricity.</p> <div class="reactor-stage svelte-1uha8ag">`);
    Reactor($$renderer2, { progress, height: 430, idPrefix: "home" });
    $$renderer2.push(`<!----></div> <div${attr_class("hint svelte-1uha8ag", void 0, { "gone": hinted })} aria-hidden="true"><svg width="22" height="30" viewBox="0 0 22 30" focusable="false" class="svelte-1uha8ag"><path d="M11 2 v22 M4 18 l7 7 l7 -7" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1uha8ag"></path></svg></div> <p class="sr-only svelte-1uha8ag">Scroll to take the reactor apart. The same sequence is written out below.</p></div></section> <section class="section svelte-1uha8ag" id="facts"><div class="wrap svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">The module</p> <h2 class="svelte-1uha8ag">One engineered object that comes apart to explain itself.</h2> <ul class="facts svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(FACTS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let fact = each_array[$$index];
      $$renderer2.push(`<li class="svelte-1uha8ag">${escape_html(fact)}</li>`);
    }
    $$renderer2.push(`<!--]--></ul> <div class="grid grid-4 outputs svelte-1uha8ag"><!--[-->`);
    const each_array_1 = ensure_array_like(OUTPUTS);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let o = each_array_1[$$index_1];
      $$renderer2.push(`<a class="output svelte-1uha8ag"${attr("href", `/solutions?output_kind=${encodeURIComponent(o.kind)}`)}><span class="output-label svelte-1uha8ag">${escape_html(o.label)}</span> <span class="output-note svelte-1uha8ag">${escape_html(o.note)}</span> <span class="output-go svelte-1uha8ag" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 16 16" focusable="false" class="svelte-1uha8ag"><path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1uha8ag"></path></svg></span></a>`);
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="section section-warm svelte-1uha8ag"><div class="wrap wrap-narrow svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">The name and the need</p> <h2 class="svelte-1uha8ag">A zettajoule is the unit the future is measured in.</h2> <p class="svelte-1uha8ag">The world uses somewhere around six hundred exajoules of primary energy a year, and industry
      takes a quarter of it as heat rather than as electricity. Put the growth of the next few
      decades on top and the number stops being an exajoule problem and starts being a zettajoule
      problem. That is where the name comes from: the unit of the energy the world will need, not
      the unit of anything we have built yet.</p> <p class="svelte-1uha8ag">Almost none of that industrial heat can be delivered by a water-cooled reactor, because a
      water-cooled reactor stops around three hundred degrees Celsius. Ours leaves the core at seven
      hundred and fifty, which is the temperature at which steel, chemicals, refining and hydrogen
      all become possible.</p></div></section> <section class="section svelte-1uha8ag"><div class="wrap svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Industries</p> <h2 class="svelte-1uha8ag">Eight industries, one machine.</h2> <div class="rail svelte-1uha8ag"><!--[-->`);
    const each_array_2 = ensure_array_like(INDUSTRIES);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let ind = each_array_2[$$index_2];
      $$renderer2.push(`<a class="ind svelte-1uha8ag"${attr("href", `/solutions/${ind.slug}`)}>`);
      Plate($$renderer2, {
        seed: ind.slug,
        height: "120px",
        label: `Generated plate for ${ind.name}`
      });
      $$renderer2.push(`<!----> <span class="svelte-1uha8ag">${escape_html(ind.name)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></div> <p class="svelte-1uha8ag"><a href="/solutions" class="svelte-1uha8ag">Open the solutions explorer, all eight</a></p></div></section> <section class="section section-dark svelte-1uha8ag" data-testid="dark-beat"><div class="wrap wrap-narrow svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Unmatched heat</p> <h2 class="big svelte-1uha8ag">750 degrees. Nothing else in the fleet gets close.</h2> <p class="svelte-1uha8ag">A pressurised water reactor tops out around three hundred degrees Celsius. That is enough for
      electricity and nothing else. Helium carries heat out of our core at seven hundred and fifty,
      which is the line between making power and making steel, ammonia, fuel and hydrogen. Cross
      that line and the whole industrial base is in range.</p> <a class="btn svelte-1uha8ag" href="/technology">Read the technology</a></div></section> <section class="section svelte-1uha8ag"><div class="wrap tech-preview svelte-1uha8ag"><div class="svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Technology</p> <h2 class="svelte-1uha8ag">Proven, then modernised.</h2> <p class="svelte-1uha8ag">The design is a modernised version of a high-temperature gas-cooled reactor that has been
        running since the late 1990s, not a paper concept. Coated particle fuel, a graphite core and
        helium coolant, built in modules so a site can add capacity a module at a time.</p> <a class="btn btn-secondary svelte-1uha8ag" href="/edge">Why this is different</a></div> `);
    Plate($$renderer2, {
      seed: "technology-preview",
      height: "240px",
      label: "Generated technical ground"
    });
    $$renderer2.push(`<!----></div></section>`);
  });
}
export {
  _page as default
};
