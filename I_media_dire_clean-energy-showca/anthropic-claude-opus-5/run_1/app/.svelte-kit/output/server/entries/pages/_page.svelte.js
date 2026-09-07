import { h as head, c as attr_style, e as escape_html, g as ensure_array_like, a as attr, d as derived } from "../../chunks/index.js";
import { R as Reactor } from "../../chunks/Reactor.js";
import { R as Reveal } from "../../chunks/Reveal.js";
import { P as Plate } from "../../chunks/Plate.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const copy = derived(() => data.copy || {});
    const solutions = derived(() => data.solutions || []);
    const OUTPUTS = [
      { kind: "heat", label: "Heat" },
      { kind: "heat-and-power", label: "Heat and power" },
      { kind: "hydrogen", label: "Hydrogen" },
      { kind: "electricity", label: "Electricity" }
    ];
    const FACTS = [
      "High-temperature gas-cooled reactor",
      "250 MW thermal a module",
      "750 degrees Celsius at the outlet"
    ];
    let progress = 0;
    const stage = derived(
      () => "Whole and metallic"
    );
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Zettajoule, Powering the World</title>`);
      });
    });
    $$renderer2.push(`<section class="scene svelte-1uha8ag"><div class="sticky svelte-1uha8ag"><div class="wash svelte-1uha8ag"${attr_style("", { "--p": progress })}></div> <div class="stage-inner wrap svelte-1uha8ag"><h1 class="display svelte-1uha8ag">Powering the World</h1> <div class="reactor-slot svelte-1uha8ag">`);
    Reactor($$renderer2, { progress, mode: "auto", size: 430 });
    $$renderer2.push(`<!----></div> <p class="promise svelte-1uha8ag">${escape_html(copy().hero?.body || "We build small high-temperature reactor modules, own them, run them, and sell you the energy.")}</p> <ul class="facts svelte-1uha8ag" aria-label="Key facts"><!--[-->`);
    const each_array = ensure_array_like(FACTS);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let fact = each_array[i];
      $$renderer2.push(`<li class="svelte-1uha8ag"${attr_style("", { opacity: progress > 0.34 + i * 0.06 ? 1 : 0.25 })}>${escape_html(fact)}</li>`);
    }
    $$renderer2.push(`<!--]--></ul> <ul class="outputs svelte-1uha8ag" aria-label="What it delivers"><!--[-->`);
    const each_array_1 = ensure_array_like(OUTPUTS);
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let o = each_array_1[i];
      $$renderer2.push(`<li class="svelte-1uha8ag"${attr_style("", { opacity: progress > 0.5 + i * 0.04 ? 1 : 0.3 })}><a${attr("href", `/solutions?output_kind=${encodeURIComponent(o.kind)}`)} class="svelte-1uha8ag"><span class="svelte-1uha8ag">${escape_html(o.label)}</span> <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" class="svelte-1uha8ag"><path d="M4 12 L12 4 M6 4 h6 v6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"></path></svg></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul> `);
    {
      $$renderer2.push(`<!--[0--><p class="hint svelte-1uha8ag" aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" focusable="false" class="svelte-1uha8ag"><path d="M10 3 v13 M5 11 l5 5 5-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"></path></svg> <span class="svelte-1uha8ag">Scroll</span></p>`);
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="section-tight written svelte-1uha8ag"><div class="wrap svelte-1uha8ag"><h2 class="visually-hidden svelte-1uha8ag">The reactor sequence in words</h2> <p class="stage-line svelte-1uha8ag"><span class="eyebrow svelte-1uha8ag" style="margin:0">Sequence</span> <span aria-live="polite" class="svelte-1uha8ag">${escape_html(stage())}</span></p> <ol class="stages svelte-1uha8ag"><li class="svelte-1uha8ag">The module stands whole, a metallic pressure vessel on its base.</li> <li class="svelte-1uha8ag">The tall control rods lift up and pull free of the core.</li> <li class="svelte-1uha8ag">The rounded lid rises off and the dark column of fuel inside is laid bare.</li> <li class="svelte-1uha8ag">The metal resolves into a clean technical line drawing with the helium circuit named.</li></ol></div></section> <section class="section name-section svelte-1uha8ag"><div class="wrap-narrow svelte-1uha8ag">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="svelte-1uha8ag">${escape_html(copy().name?.heading || "Why Zettajoule")}</h2>`);
      }
    });
    $$renderer2.push(`<!----> `);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<p class="lede svelte-1uha8ag">${escape_html(copy().name?.body)}</p>`);
      }
    });
    $$renderer2.push(`<!----></div></section> <section class="section industries svelte-1uha8ag"><div class="wrap svelte-1uha8ag">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="svelte-1uha8ag">${escape_html(copy().industries?.heading || "Eight industries, one object")}</h2>`);
      }
    });
    $$renderer2.push(`<!----> `);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<p class="lede svelte-1uha8ag">${escape_html(copy().industries?.body)}</p>`);
      }
    });
    $$renderer2.push(`<!----> <ul class="rail svelte-1uha8ag"><!--[-->`);
    const each_array_2 = ensure_array_like(solutions());
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let s = each_array_2[$$index_2];
      $$renderer2.push(`<li class="svelte-1uha8ag"><a class="ind-card svelte-1uha8ag"${attr("href", `/solutions/${s.slug}`)}>`);
      Plate($$renderer2, { seed: s.slug, ratio: "4 / 3" });
      $$renderer2.push(`<!----> <h3 class="svelte-1uha8ag">${escape_html(s.industry)}</h3> <p class="svelte-1uha8ag">${escape_html(s.summary)}</p> <span class="ind-meta mono svelte-1uha8ag">${escape_html(s.output_kind)} · ${escape_html(s.temperature_band)}</span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section> <section class="section tech-preview svelte-1uha8ag"><div class="wrap tech-grid svelte-1uha8ag"><div class="svelte-1uha8ag">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="svelte-1uha8ag">${escape_html(copy().technology?.heading || "A reactor that runs hot")}</h2>`);
      }
    });
    $$renderer2.push(`<!----> `);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<p class="lede svelte-1uha8ag">${escape_html(copy().technology?.body)}</p>`);
      }
    });
    $$renderer2.push(`<!----> <p class="svelte-1uha8ag"><a class="btn btn-quiet svelte-1uha8ag" href="/technology">Read the technology</a></p></div> <div class="tech-plate svelte-1uha8ag">`);
    Plate($$renderer2, {
      seed: "technology-preview",
      ratio: "4 / 3",
      label: "Module cutaway"
    });
    $$renderer2.push(`<!----></div></div></section> <section class="section inverse heat svelte-1uha8ag"><div class="wrap-narrow svelte-1uha8ag">`);
    Reveal($$renderer2, {
      distance: 34,
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="heat-head svelte-1uha8ag">${escape_html(copy().heat?.heading || "Nothing else runs this hot")}</h2>`);
      }
    });
    $$renderer2.push(`<!----> `);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<p class="lede svelte-1uha8ag">${escape_html(copy().heat?.body)}</p>`);
      }
    });
    $$renderer2.push(`<!----> <p class="big mono svelte-1uha8ag">750 °C</p> <p class="svelte-1uha8ag"><a class="btn btn-primary svelte-1uha8ag" href="/edge">See why that matters</a></p></div></section>`);
  });
}
export {
  _page as default
};
