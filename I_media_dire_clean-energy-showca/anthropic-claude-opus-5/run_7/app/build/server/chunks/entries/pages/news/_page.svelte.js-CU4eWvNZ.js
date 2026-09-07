import { ae as head, a8 as attr, a9 as escape_html, a7 as ensure_array_like, ad as bind_props } from '../../../chunks/index.js-D2EWZzu8.js';
import { P as Plate } from '../../../chunks/Plate.js-BhKHJ0mJ.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let featured, wall, visible, remaining;
    let data = $$props["data"];
    const PAGE = 3;
    let shown = PAGE;
    const dt = (v) => v ? String(v).slice(0, 10) : "";
    featured = data.featured;
    wall = data.wall ?? [];
    visible = wall.slice(0, shown);
    remaining = Math.max(0, wall.length - shown);
    head("1gc460s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Newsroom, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><h1 class="giant svelte-1gc460s">latest news</h1> <p class="lede">Browse company news, press coverage and media.</p></div></section> `);
    if (featured) {
      $$renderer2.push(`<!--[0--><section class="section-tight"><div class="wrap"><a class="featured svelte-1gc460s"${attr("href", `/news/${featured.slug}`)} data-testid="featured-story">`);
      Plate($$renderer2, {
        seed: featured.slug,
        height: "240px",
        label: `Generated plate for ${featured.title}`
      });
      $$renderer2.push(`<!----> <div><p class="eyebrow">Featured, ${escape_html(featured.outlet)}, ${escape_html(dt(featured.published_at))}</p> <h2 class="svelte-1gc460s">${escape_html(featured.title)}</h2> <span class="more svelte-1gc460s">Read the story</span></div></a></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <section class="section-tight"><div class="wrap"><h2>The wall</h2> `);
    if (wall.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><p><strong>No stories on the wall yet.</strong></p> <p>Nothing beyond the featured story has been published.</p> <a class="btn btn-secondary" href="/company">Read about the company instead</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="grid grid-3" data-testid="story-wall"><!--[-->`);
      const each_array = ensure_array_like(visible);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        $$renderer2.push(`<a class="story svelte-1gc460s"${attr("href", `/news/${s.slug}`)}>`);
        Plate($$renderer2, {
          seed: s.slug,
          height: "130px",
          label: `Generated plate for ${s.title}`
        });
        $$renderer2.push(`<!----> <p class="meta small muted svelte-1gc460s">${escape_html(s.outlet)}, ${escape_html(dt(s.published_at))}</p> <h3 class="svelte-1gc460s">${escape_html(s.title)}</h3></a>`);
      }
      $$renderer2.push(`<!--]--></div> <p class="small muted" aria-live="polite" data-testid="wall-count">Showing ${escape_html(visible.length)} of ${escape_html(wall.length)} stories.</p> `);
      if (remaining > 0) {
        $$renderer2.push(`<!--[0--><button class="btn btn-secondary" type="button" data-testid="load-more">More stories, ${escape_html(Math.min(PAGE, remaining))} of ${escape_html(remaining)} left</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
    bind_props($$props, { data });
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CU4eWvNZ.js.map
