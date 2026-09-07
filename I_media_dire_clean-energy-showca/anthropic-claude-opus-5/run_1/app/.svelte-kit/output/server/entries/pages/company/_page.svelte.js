import { h as head, e as escape_html, g as ensure_array_like, d as derived } from "../../../chunks/index.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
import { P as Plate } from "../../../chunks/Plate.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const c = derived(() => data.copy);
    head("3id43s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Company, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-3id43s"><div class="wrap"><p class="eyebrow">Company</p> <h1 class="opening svelte-3id43s">${escape_html(c().lede?.heading)}</h1> <p class="lede">${escape_html(c().lede?.body)}</p></div></section> <section class="section"><div class="wrap story svelte-3id43s"><!--[-->`);
    const each_array = ensure_array_like(["vision", "mission", "name"]);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let key = each_array[i];
      Reveal($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<article class="beat svelte-3id43s"><p class="beat-n mono svelte-3id43s">0${escape_html(i + 1)}</p> <div><h2>${escape_html(c()[key]?.heading)}</h2> <p class="svelte-3id43s">${escape_html(c()[key]?.body)}</p></div></article>`);
        }
      });
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section offices-section svelte-3id43s"><div class="wrap"><h2>Where we work</h2> <ul class="offices svelte-3id43s"><!--[-->`);
    const each_array_1 = ensure_array_like(data.offices);
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let o = each_array_1[i];
      $$renderer2.push(`<li class="card">`);
      Reveal($$renderer2, {
        distance: 20 + i * 6,
        children: ($$renderer3) => {
          Plate($$renderer3, { seed: `office-${o.city}`, ratio: "16 / 10" });
          $$renderer3.push(`<!----> <h3 class="svelte-3id43s">${escape_html(o.city)}</h3> <p class="muted svelte-3id43s">${escape_html(o.country)}</p> <span class="badge">${escape_html(o.role_label)}</span>`);
        }
      });
      $$renderer2.push(`<!----></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section> <section class="section model"><div class="wrap-narrow">`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2>${escape_html(c().model?.heading)}</h2>`);
      }
    });
    $$renderer2.push(`<!----> <p class="lede">${escape_html(c().model?.body)}</p> <p><a class="btn btn-primary" href="/solutions">See what it powers</a></p></div></section>`);
  });
}
export {
  _page as default
};
