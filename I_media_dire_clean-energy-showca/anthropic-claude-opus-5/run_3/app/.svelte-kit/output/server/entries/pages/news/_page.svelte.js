import { h as head, a as attr, e as escape_html, f as ensure_array_like, g as derived } from "../../../chunks/index.js";
import { P as Plate } from "../../../chunks/Plate.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import "../../../chunks/auth.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let wall = [...data.wall];
    let loading = false;
    const remaining = derived(() => data.wallTotal - wall.length);
    function when(value) {
      return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
    head("1gc460s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>News · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1gc460s"><div class="wrap">`);
    Reveal($$renderer2, { as: "h1", class: "giant", text: "latest news" });
    $$renderer2.push(`<!----> <p class="lede">Browse company news, press coverage and media.</p></div></section> `);
    if (data.featured) {
      $$renderer2.push(`<!--[0--><section class="wrap featured-wrap svelte-1gc460s"><article class="featured svelte-1gc460s"><a class="featured__plate"${attr("href", `/news/${data.featured.slug}`)} tabindex="-1" aria-hidden="true">`);
      Plate($$renderer2, { seed: data.featured.slug, ratio: "21 / 9" });
      $$renderer2.push(`<!----></a> <p class="eyebrow">Featured · ${escape_html(data.featured.outlet)} · ${escape_html(when(data.featured.published_at))}</p> <h2 class="svelte-1gc460s"><a${attr("href", `/news/${data.featured.slug}`)} class="svelte-1gc460s">${escape_html(data.featured.title)}</a></h2></article></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <section class="wrap wall-wrap svelte-1gc460s"><h2 class="wall__head svelte-1gc460s">The wall</h2> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (wall.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><p><strong>No other stories yet.</strong> Only the featured story is published.</p> <a class="btn" href="/">Back to home</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="wall svelte-1gc460s"><!--[-->`);
      const each_array = ensure_array_like(wall);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        $$renderer2.push(`<li><article class="story svelte-1gc460s"><a class="story__plate"${attr("href", `/news/${s.slug}`)} tabindex="-1" aria-hidden="true">`);
        Plate($$renderer2, { seed: s.slug, ratio: "16 / 9" });
        $$renderer2.push(`<!----></a> <p class="story__meta svelte-1gc460s">${escape_html(s.outlet)} · ${escape_html(when(s.published_at))}</p> <h3 class="svelte-1gc460s"><a${attr("href", `/news/${s.slug}`)} class="svelte-1gc460s">${escape_html(s.title)}</a></h3></article></li>`);
      }
      $$renderer2.push(`<!--]--></ul> <p class="wall__count svelte-1gc460s" role="status">Showing ${escape_html(wall.length)} of ${escape_html(data.wallTotal)}.</p> `);
      if (remaining() > 0) {
        $$renderer2.push(`<!--[0--><button class="btn btn--ghost" type="button"${attr("disabled", loading, true)}>`);
        {
          $$renderer2.push(`<!--[-1-->More stories`);
        }
        $$renderer2.push(`<!--]--></button>`);
      } else {
        $$renderer2.push(`<!--[-1--><p class="muted">That is every story on the wall.</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
export {
  _page as default
};
