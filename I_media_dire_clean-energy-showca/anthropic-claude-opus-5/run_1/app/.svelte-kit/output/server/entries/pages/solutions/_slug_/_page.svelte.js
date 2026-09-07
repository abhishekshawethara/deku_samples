import { h as head, e as escape_html, a as attr, g as ensure_array_like, d as derived } from "../../../../chunks/index.js";
import { P as Plate } from "../../../../chunks/Plate.js";
import { S as SaveButton } from "../../../../chunks/SaveButton.js";
import { R as Reveal } from "../../../../chunks/Reveal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const s = derived(() => data.solution);
    const BLOCKS = [
      {
        key: "source",
        title: "The source",
        line: "A module delivers 250 MW thermal with helium leaving the core at 750 degrees Celsius."
      },
      {
        key: "transfer",
        title: "The transfer",
        line: "Heat crosses into the site loop at the band this industry works in, with no combustion anywhere in the chain."
      },
      {
        key: "use",
        title: "The use",
        line: "The energy goes into the process itself rather than into a grid connection beside it."
      },
      {
        key: "model",
        title: "The arrangement",
        line: "Zettajoule owns, runs and staffs the plant. You buy the delivered energy."
      }
    ];
    head("1vo9te1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(s().industry)}, Zettajoule solutions</title>`);
      });
    });
    $$renderer2.push(`<article><section class="head svelte-1vo9te1"><div class="wrap"><p class="eyebrow"><a href="/solutions">Solutions</a> / ${escape_html(s().industry)}</p> <h1>${escape_html(s().title)}</h1> <p class="lede">${escape_html(s().summary)}</p> <dl class="specs svelte-1vo9te1"><div><dt class="svelte-1vo9te1">Output</dt><dd class="mono svelte-1vo9te1">${escape_html(s().output_kind)}</dd></div> <div><dt class="svelte-1vo9te1">Temperature band</dt><dd class="mono svelte-1vo9te1">${escape_html(s().temperature_band)}</dd></div> <div><dt class="svelte-1vo9te1">Deployment</dt><dd class="mono svelte-1vo9te1">${escape_html(s().deployment)}</dd></div> <div><dt class="svelte-1vo9te1">Modules</dt> <dd class="mono svelte-1vo9te1">${escape_html(s().module_count)}</dd></div></dl> <div class="actions svelte-1vo9te1">`);
    SaveButton($$renderer2, { slug: s().slug, label: "Save this solution" });
    $$renderer2.push(`<!----> <a class="btn btn-quiet"${attr("href", `/contact?topic=Solutions&solution=${s().slug}`)}>Enquire</a> <a class="btn btn-quiet" href="/contact">Get in Touch</a></div></div></section> <section class="section"><div class="wrap detail-grid svelte-1vo9te1"><div>`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2>What the reactor does here</h2>`);
      }
    });
    $$renderer2.push(`<!----> <p>${escape_html(s().detail)}</p></div> <div>`);
    Plate($$renderer2, { seed: s().slug, ratio: "4 / 3", label: s().industry });
    $$renderer2.push(`<!----></div></div></section> <section class="section blocks svelte-1vo9te1"><div class="wrap"><h2>Block by block</h2> <ol class="block-list svelte-1vo9te1"><!--[-->`);
    const each_array = ensure_array_like(BLOCKS);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let b = each_array[i];
      $$renderer2.push(`<li class="svelte-1vo9te1"><svg viewBox="0 0 120 80" class="diagram svelte-1vo9te1" role="img"${attr("aria-label", `${b.title} diagram`)}><rect x="8" y="16" width="46" height="48" rx="5" fill="none" stroke="var(--ink)" stroke-width="1.4"></rect><rect x="66" y="16" width="46" height="48" rx="5" fill="none" stroke="var(--accent)" stroke-width="1.4"${attr("stroke-dasharray", i % 2 ? "4 3" : "none")}></rect><path d="M54 40 H66" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#arrow)"></path><path d="M60 36 L66 40 L60 44 Z" fill="var(--accent)"></path><text x="31" y="43" text-anchor="middle" font-size="8" fill="var(--ink-muted)">${escape_html(i + 1)}</text></svg> <div><h3 class="svelte-1vo9te1">${escape_html(b.title)}</h3> <p class="svelte-1vo9te1">${escape_html(b.line)}</p></div></li>`);
    }
    $$renderer2.push(`<!--]--></ol></div></section> `);
    if (data.related.length) {
      $$renderer2.push(`<!--[0--><section class="section related"><div class="wrap"><h2>Others taking ${escape_html(s().output_kind)}</h2> <ul class="rel-list svelte-1vo9te1"><!--[-->`);
      const each_array_1 = ensure_array_like(data.related);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let r = each_array_1[$$index_1];
        $$renderer2.push(`<li><a${attr("href", `/solutions/${r.slug}`)} class="svelte-1vo9te1"><strong>${escape_html(r.industry)}</strong> <span class="svelte-1vo9te1">${escape_html(r.summary)}</span></a></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></article>`);
  });
}
export {
  _page as default
};
