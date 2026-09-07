import { h as head, e as escape_html, c as attr, i as ensure_array_like, g as bind_props } from "../../../../chunks/index.js";
import { P as Plate } from "../../../../chunks/Plate.js";
import { S as SaveButton } from "../../../../chunks/SaveButton.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let s;
    let data = $$props["data"];
    let savedId = null;
    const BLOCKS = [
      {
        key: "source",
        title: "The module",
        body: "A high-temperature gas-cooled reactor module. Helium leaves the core at 750 degrees Celsius carrying 250 MW thermal."
      },
      {
        key: "interface",
        title: "The interface",
        body: "An intermediate heat exchanger keeps the primary circuit separate from anything on your side of the fence."
      },
      {
        key: "use",
        title: "The duty",
        body: "Downstream the energy takes the form the site actually buys, delivered against a long term supply agreement."
      }
    ];
    s = data.solution;
    head("1vo9te1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(s.industry)}, Zettajoule solutions</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow"><a href="/solutions">Solutions</a> / ${escape_html(s.industry)}</p> <h1>${escape_html(s.title)}</h1> <p class="lede">${escape_html(s.summary)}</p> <div class="actions svelte-1vo9te1">`);
    SaveButton($$renderer2, { slug: s.slug, saved: false, saveId: savedId });
    $$renderer2.push(`<!----> <a class="btn btn-secondary"${attr("href", `/contact?topic=Solutions&subject=${encodeURIComponent(s.industry)}`)}>Enquire about ${escape_html(s.industry)}</a> <a class="btn btn-secondary" href="/compare">Compare saves</a></div></div></section> <section class="section-tight"><div class="wrap detail svelte-1vo9te1"><div><table class="data spec"><caption class="sr-only">Specification for the ${escape_html(s.industry)} solution</caption><tbody><tr><th scope="row">Industry</th><td>${escape_html(s.industry)}</td></tr><tr><th scope="row">Output kind</th><td>${escape_html(s.output_kind)}</td></tr><tr><th scope="row">Temperature band</th><td>${escape_html(s.temperature_band)}</td></tr><tr><th scope="row">Deployment</th><td>${escape_html(s.deployment)}</td></tr><tr><th scope="row">Modules</th><td>${escape_html(s.module_count)}</td></tr></tbody></table></div> `);
    Plate($$renderer2, {
      seed: s.slug,
      height: "220px",
      label: `Generated plate for ${s.industry}`
    });
    $$renderer2.push(`<!----></div></section> <section class="section-tight"><div class="wrap"><h2>What the reactor does for ${escape_html(s.industry)}, block by block</h2> <div class="blocks svelte-1vo9te1"><!--[-->`);
    const each_array = ensure_array_like(BLOCKS);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let b = each_array[i];
      $$renderer2.push(`<div class="block svelte-1vo9te1"><svg viewBox="0 0 160 90" class="diagram svelte-1vo9te1" role="img"${attr("aria-label", `Line diagram, block ${i + 1}: ${b.title}`)}><g fill="none" stroke="var(--navy)" stroke-width="1.3"><rect x="10" y="22" width="52" height="46" rx="5"></rect><rect x="98" y="22" width="52" height="46" rx="5"></rect><path d="M62 45 h36"></path><path d="M92 40 l6 5 l-6 5"></path>`);
      if (i === 0) {
        $$renderer2.push(`<!--[0--><circle cx="36" cy="45" r="12"></circle><path d="M36 33 v24 M24 45 h24"></path>`);
      } else if (i === 1) {
        $$renderer2.push(`<!--[1--><path d="M18 34 h36 M18 45 h36 M18 56 h36"></path>`);
      } else {
        $$renderer2.push(`<!--[-1--><path d="M106 60 v-14 h10 v-12 h10 v-8 h10 v34 z"></path>`);
      }
      $$renderer2.push(`<!--]--></g></svg> <h3 class="svelte-1vo9te1">${escape_html(b.title)}</h3> <p class="svelte-1vo9te1">${escape_html(b.body)}</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="section-tight section-warm"><div class="wrap wrap-narrow"><h2>In full</h2> <p>${escape_html(s.detail)}</p> <p><a href="/calculator">Size a plant for this duty in the calculator</a></p></div></section>`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
