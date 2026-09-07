import { a5 as head, a6 as escape_html, a9 as ensure_array_like } from '../../../chunks/index.js-DtYBOeIk.js';
import { R as Reveal } from '../../../chunks/Reveal.js-BBjsK3lr.js';
import '../../../chunks/api.js-LBSLTNEi.js';
import '../../../chunks/session.js-EMz6Q6iE.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/index2.js-DXE0eiF0.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/root.js-DzEA886G.js';
import '../../../chunks/state.svelte.js-DiBp0ONL.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("10l0o2u", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Investors, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-10l0o2u"><div class="wrap"><p class="eyebrow">Investors</p> <h1>${escape_html(data.copy.lede?.heading)}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="section"><div class="wrap grid-3 case svelte-10l0o2u"><!--[-->`);
    const each_array = ensure_array_like(["market", "model", "compare"]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let key = each_array[$$index];
      Reveal($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<article class="card svelte-10l0o2u"><h2 class="svelte-10l0o2u">${escape_html(data.copy[key]?.heading)}</h2> <p class="svelte-10l0o2u">${escape_html(data.copy[key]?.body)}</p></article>`);
        }
      });
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section roadmap-section svelte-10l0o2u"><div class="wrap"><h2>The roadmap, from a proven test reactor to first deployment</h2> <ol class="timeline svelte-10l0o2u"><!--[-->`);
    const each_array_1 = ensure_array_like(data.roadmap);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let r = each_array_1[$$index_1];
      $$renderer2.push(`<li class="svelte-10l0o2u"><span class="year mono svelte-10l0o2u">${escape_html(r.year)}</span> <div class="dot svelte-10l0o2u" aria-hidden="true"></div> <div><h3 class="svelte-10l0o2u">${escape_html(r.title)}</h3> <p class="svelte-10l0o2u">${escape_html(r.body)}</p></div></li>`);
    }
    $$renderer2.push(`<!--]--></ol></div></section> <section class="section room-section"><div class="wrap-narrow"><h2>The private document room</h2> <p class="lede">Three documents sit behind an approval: the investor deck, the technology dossier and the
			licensing roadmap. Request access here; it reads pending until it is approved, and only an
			account whose own request is approved sees the room.</p> `);
    {
      $$renderer2.push(`<!--[0--><p class="loading svelte-10l0o2u"><span class="spinner" aria-hidden="true"></span> Checking your request</p>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-C13RgvyP.js.map
