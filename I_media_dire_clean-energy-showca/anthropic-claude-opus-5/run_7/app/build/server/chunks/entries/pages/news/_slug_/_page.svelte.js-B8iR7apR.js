import { ae as head, a9 as escape_html, a7 as ensure_array_like, ad as bind_props } from '../../../../chunks/index.js-D2EWZzu8.js';
import { P as Plate } from '../../../../chunks/Plate.js-BhKHJ0mJ.js';
import '../../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let s, paragraphs;
    let data = $$props["data"];
    const dt = (v) => v ? String(v).slice(0, 10) : "";
    s = data.story;
    paragraphs = (s.body || "").split("\n\n").filter(Boolean);
    head("1gyup5m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(s.title)}, Zettajoule news</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap wrap-narrow"><p class="eyebrow"><a href="/news">News</a> / ${escape_html(s.outlet)}</p> <h1>${escape_html(s.title)}</h1> <p class="lede">${escape_html(s.outlet)}, published ${escape_html(dt(s.published_at))}${escape_html(s.featured ? ", featured story" : "")}</p></div></section> <section class="section-tight"><div class="wrap wrap-narrow">`);
    Plate($$renderer2, {
      seed: s.slug,
      height: "230px",
      label: `Generated plate for ${s.title}`
    });
    $$renderer2.push(`<!----> <div class="body svelte-1gyup5m"><!--[-->`);
    const each_array = ensure_array_like(paragraphs);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let p = each_array[i];
      $$renderer2.push(`<p>${escape_html(p)}</p>`);
    }
    $$renderer2.push(`<!--]--></div> <p><a href="/news">Back to the newsroom</a></p></div></section>`);
    bind_props($$props, { data });
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-B8iR7apR.js.map
