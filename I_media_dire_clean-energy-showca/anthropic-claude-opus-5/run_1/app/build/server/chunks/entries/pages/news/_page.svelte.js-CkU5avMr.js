import { a5 as head, a6 as escape_html, aa as attr, a9 as ensure_array_like, P as derived } from '../../../chunks/index.js-DtYBOeIk.js';
import { P as Plate } from '../../../chunks/Plate.js-mlTZc7RZ.js';
import '../../../chunks/api.js-LBSLTNEi.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let extra = [];
    let busy = false;
    const wall = derived(() => [...data.wall, ...extra]);
    const total = derived(() => data.wallTotal);
    const more = derived(() => wall().length < total());
    function fmt(d) {
      return d ? new Date(d).toISOString().slice(0, 10) : "";
    }
    head("1gc460s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>News, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1gc460s"><div class="wrap"><h1 class="giant svelte-1gc460s">latest news</h1> <p class="lede">${escape_html(data.copy.lede?.body || "Browse company news, press coverage and media.")}</p></div></section> `);
    if (data.featured) {
      $$renderer2.push(`<!--[0--><section class="section-tight"><div class="wrap"><a class="feature svelte-1gc460s"${attr("href", `/news/${data.featured.slug}`)} data-testid="featured-story"><div class="feature-plate">`);
      Plate($$renderer2, { seed: data.featured.slug, ratio: "16 / 9" });
      $$renderer2.push(`<!----></div> <div><p class="badge">Featured</p> <h2 class="svelte-1gc460s">${escape_html(data.featured.title)}</h2> <p class="meta mono svelte-1gc460s">${escape_html(data.featured.outlet)} · ${escape_html(fmt(data.featured.published_at))}</p></div></a></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <section class="section-tight"><div class="wrap"><h2 class="wall-head svelte-1gc460s">The wall</h2> `);
    if (wall().length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><h3>No stories beyond the featured one</h3> <p>There is nothing else on the wall yet. The featured story is above.</p> <a class="btn btn-primary btn-sm" href="/">Back to the home page</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="wall svelte-1gc460s" data-testid="story-wall"><!--[-->`);
      const each_array = ensure_array_like(wall());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        $$renderer2.push(`<li><a${attr("href", `/news/${s.slug}`)} class="svelte-1gc460s">`);
        Plate($$renderer2, { seed: s.slug, ratio: "16 / 9" });
        $$renderer2.push(`<!----> <p class="meta mono svelte-1gc460s">${escape_html(s.outlet)} · ${escape_html(fmt(s.published_at))}</p> <h3 class="svelte-1gc460s">${escape_html(s.title)}</h3></a></li>`);
      }
      $$renderer2.push(`<!--]--></ul> <p class="count mono svelte-1gc460s" aria-live="polite">Showing ${escape_html(wall().length)} of ${escape_html(total())} stories on the wall</p> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (more()) {
        $$renderer2.push(`<!--[0--><button class="btn btn-quiet" type="button"${attr("disabled", busy, true)} data-testid="load-more">`);
        {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> ${escape_html("More stories")}</button>`);
      } else {
        $$renderer2.push(`<!--[-1--><p class="muted">That is every story on the wall.</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CkU5avMr.js.map
