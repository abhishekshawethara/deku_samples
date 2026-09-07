import { a5 as head, a6 as escape_html, a9 as ensure_array_like, aa as attr, P as derived } from '../../../../chunks/index.js-DtYBOeIk.js';
import { P as Plate } from '../../../../chunks/Plate.js-mlTZc7RZ.js';
import '../../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const s = derived(() => data.story);
    const paragraphs = derived(() => (s().body || "").split("\n\n").filter(Boolean));
    function fmt(d) {
      return d ? new Date(d).toISOString().slice(0, 10) : "";
    }
    head("1gyup5m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(s().title)}, Zettajoule news</title>`);
      });
    });
    $$renderer2.push(`<article><section class="head svelte-1gyup5m"><div class="wrap-narrow"><p class="eyebrow"><a href="/news">News</a> / ${escape_html(s().outlet)}</p> <h1>${escape_html(s().title)}</h1> <p class="meta mono svelte-1gyup5m">${escape_html(s().outlet)} · ${escape_html(fmt(s().published_at))} `);
    if (s().featured) {
      $$renderer2.push(`<!--[0--><span class="badge">Featured</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></p></div></section> <div class="wrap-narrow">`);
    Plate($$renderer2, { seed: s().slug, ratio: "16 / 9", label: s().outlet });
    $$renderer2.push(`<!----></div> <section class="section"><div class="wrap-narrow body svelte-1gyup5m"><!--[-->`);
    const each_array = ensure_array_like(paragraphs());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let p = each_array[$$index];
      $$renderer2.push(`<p class="svelte-1gyup5m">${escape_html(p)}</p>`);
    }
    $$renderer2.push(`<!--]--></div></section> `);
    if (data.others.length) {
      $$renderer2.push(`<!--[0--><section class="section-tight others svelte-1gyup5m"><div class="wrap-narrow"><h2 class="svelte-1gyup5m">More from the newsroom</h2> <ul class="svelte-1gyup5m"><!--[-->`);
      const each_array_1 = ensure_array_like(data.others);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let o = each_array_1[$$index_1];
        $$renderer2.push(`<li><a${attr("href", `/news/${o.slug}`)} class="svelte-1gyup5m"><strong>${escape_html(o.title)}</strong> <span class="mono svelte-1gyup5m">${escape_html(o.outlet)} · ${escape_html(fmt(o.published_at))}</span></a></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></article>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-AUPQ7Dlg.js.map
