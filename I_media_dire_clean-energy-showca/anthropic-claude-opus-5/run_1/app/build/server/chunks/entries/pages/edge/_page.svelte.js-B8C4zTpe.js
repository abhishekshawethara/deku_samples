import { a5 as head, a6 as escape_html, a9 as ensure_array_like, aa as attr, P as derived } from '../../../chunks/index.js-DtYBOeIk.js';
import { R as Reveal } from '../../../chunks/Reveal.js-BBjsK3lr.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const c = derived(() => data.copy);
    const OUTPUTS = [
      { kind: "heat", label: "Heat" },
      { kind: "heat-and-power", label: "Heat and power" },
      { kind: "hydrogen", label: "Hydrogen" },
      { kind: "electricity", label: "Electricity" }
    ];
    head("1q8myiy", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Our Edge, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1q8myiy"><div class="wrap"><p class="eyebrow">Our Edge</p> <h1>${escape_html(c().lede?.heading)}</h1> <p class="lede">${escape_html(c().lede?.body)}</p></div></section> <section class="section"><div class="wrap-narrow">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="lead-claim svelte-1q8myiy">${escape_html(c().proven?.heading)}</h2>`);
      }
    });
    $$renderer2.push(`<!----> <p class="lede">${escape_html(c().proven?.body)}</p></div></section> <section class="section hotter svelte-1q8myiy"><div class="wrap">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2>${escape_html(c().hotter?.heading)}</h2>`);
      }
    });
    $$renderer2.push(`<!----> <p class="lede">${escape_html(c().hotter?.body)}</p> <div class="scale svelte-1q8myiy" role="img" aria-label="A water-cooled reactor reaches about 300 degrees Celsius; this module reaches 750"><div class="bar svelte-1q8myiy"><span class="bar-label svelte-1q8myiy">Water-cooled reactor</span> <span class="track svelte-1q8myiy"><span class="fill grey svelte-1q8myiy" style="width:40%"></span></span> <span class="mono">300 °C</span></div> <div class="bar svelte-1q8myiy"><span class="bar-label svelte-1q8myiy">Zettajoule module</span> <span class="track svelte-1q8myiy"><span class="fill svelte-1q8myiy" style="width:100%"></span></span> <span class="mono">750 °C</span></div></div> <p class="muted small svelte-1q8myiy">In words: a water-cooled reactor tops out around 300 degrees Celsius; this module delivers 750,
			which is where steel, hydrogen and chemistry live.</p></div></section> <section class="section"><div class="wrap two svelte-1q8myiy">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<article class="card"><h2 class="svelte-1q8myiy">${escape_html(c().modular?.heading)}</h2> <p class="svelte-1q8myiy">${escape_html(c().modular?.body)}</p></article>`);
      }
    });
    $$renderer2.push(`<!----> `);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<article class="card"><h2 class="svelte-1q8myiy">${escape_html(c().model?.heading)}</h2> <p class="svelte-1q8myiy">${escape_html(c().model?.body)}</p></article>`);
      }
    });
    $$renderer2.push(`<!----></div></section> <section class="section outputs-section svelte-1q8myiy"><div class="wrap"><h2>The four outputs</h2> <ul class="outputs svelte-1q8myiy"><!--[-->`);
    const each_array = ensure_array_like(OUTPUTS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let o = each_array[$$index];
      $$renderer2.push(`<li><a${attr("href", `/solutions?output_kind=${encodeURIComponent(o.kind)}`)} class="svelte-1q8myiy"><span>${escape_html(o.label)}</span> <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M4 12 L12 4 M6 4 h6 v6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-B8C4zTpe.js.map
