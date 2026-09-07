import { ae as head, a8 as attr } from '../../../chunks/index.js-D2EWZzu8.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-DYTbTUbw.js';
import '../../../chunks/state.svelte.js-CqN4U7qs.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let q = "";
    let category = "";
    head("1bex8oj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Questions, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">FAQ</p> <h1>Common questions</h1> <p class="lede">Search the questions people ask most, on the technology and on deployment.</p></div></section> <section class="section-tight"><div class="wrap wrap-narrow"><div class="controls svelte-1bex8oj"><div class="field grow svelte-1bex8oj"><label for="faq-q">Search the questions</label> <input id="faq-q" type="search"${attr("value", q)} placeholder="helium, licence, land" data-testid="faq-search"/></div> <div class="field"><label for="faq-cat">Category</label> `);
    $$renderer2.select(
      {
        id: "faq-cat",
        value: category,
        "data-testid": "faq-category"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All categories`);
        });
        $$renderer3.option({ value: "Technology" }, ($$renderer4) => {
          $$renderer4.push(`Technology`);
        });
        $$renderer3.option({ value: "Deployment" }, ($$renderer4) => {
          $$renderer4.push(`Deployment`);
        });
      }
    );
    $$renderer2.push(`</div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><div class="skeleton"><span class="spinner" aria-hidden="true"></span> Loading questions…</div>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-BGI2xfOz.js.map
