import { h as head, e as escape_html, f as ensure_array_like, g as derived, a as attr } from "../../../../chunks/index.js";
import { P as Plate } from "../../../../chunks/Plate.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const s = derived(() => data.story);
    function when(value) {
      return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
    head("1gyup5m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(s().title)} · News · Zettajoule</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", s().title)}/>`);
    });
    $$renderer2.push(`<article class="story-page"><header class="wrap story-head svelte-1gyup5m"><p class="eyebrow"><a href="/news">News</a> / ${escape_html(s().outlet)}</p> <h1 class="svelte-1gyup5m">${escape_html(s().title)}</h1> <p class="muted meta svelte-1gyup5m">${escape_html(s().outlet)} · ${escape_html(when(s().published_at))} `);
    if (s().featured) {
      $$renderer2.push(`<!--[0--><span class="status-tag status-tag--approved">Featured</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></p></header> <div class="wrap">`);
    Plate($$renderer2, {
      seed: s().slug,
      ratio: "21 / 9",
      label: `Generated plate for ${s().title}`
    });
    $$renderer2.push(`<!----></div> <div class="wrap body svelte-1gyup5m"><!--[-->`);
    const each_array = ensure_array_like(s().body.split("\n\n"));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let para = each_array[$$index];
      $$renderer2.push(`<p class="svelte-1gyup5m">${escape_html(para)}</p>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="wrap section--tight"><a class="btn btn--ghost" href="/news">Back to the newsroom</a></div></article>`);
  });
}
export {
  _page as default
};
