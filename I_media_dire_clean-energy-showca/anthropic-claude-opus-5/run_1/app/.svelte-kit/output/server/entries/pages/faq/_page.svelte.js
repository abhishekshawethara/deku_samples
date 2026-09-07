import { h as head, e as escape_html, a as attr, g as ensure_array_like, d as derived } from "../../../chunks/index.js";
import { a as api, A as ApiError } from "../../../chunks/api.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let q = "";
    let category = "";
    let searched = null;
    let busy = false;
    let error = "";
    const rows = derived(() => searched ?? data.faqs);
    const categories = derived(() => [...new Set(data.faqs.map((f) => f.category))]);
    async function run() {
      busy = true;
      error = "";
      try {
        const p = new URLSearchParams();
        if (q.trim()) p.set("q", q.trim());
        if (category) ;
        const qs = p.toString();
        const { data: out } = await api(`/api/faqs${qs ? `?${qs}` : ""}`);
        searched = out;
      } catch (err) {
        error = err instanceof ApiError ? err.message : "The search could not run.";
      } finally {
        busy = false;
      }
    }
    head("1bex8oj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>FAQ, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1bex8oj"><div class="wrap-narrow"><p class="eyebrow">FAQ</p> <h1>${escape_html(data.copy.lede?.heading || "Common questions")}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="section"><div class="wrap-narrow"><form class="search svelte-1bex8oj" role="search"><div class="f"><label for="faq-q">Search the questions</label> <input id="faq-q" type="search"${attr("value", q)} placeholder="helium, licence, land" data-testid="faq-search"/></div> <div class="f"><label for="faq-cat">Category</label> `);
    $$renderer2.select({ id: "faq-cat", value: category, onchange: run }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`All categories`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(categories());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let c = each_array[$$index];
        $$renderer3.option({ value: c }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(c)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</div> <button class="btn btn-quiet" type="submit"${attr("disabled", busy, true)}>`);
    if (busy) {
      $$renderer2.push(`<!--[0--><span class="spinner" aria-hidden="true"></span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Search</button></form> `);
    if (error) {
      $$renderer2.push(`<!--[0--><p class="banner banner-error" role="alert">${escape_html(error)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <p class="count mono svelte-1bex8oj" aria-live="polite">${escape_html(rows().length)} question${escape_html(rows().length === 1 ? "" : "s")}</p> `);
    if (rows().length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><h3>Nothing matches that</h3> <p>No question here uses those words. Clear the search, or ask us directly.</p> <div class="row svelte-1bex8oj"><button class="btn btn-primary btn-sm" type="button">Clear the search</button> <a class="btn btn-quiet btn-sm" href="/contact">Ask us</a></div></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="faqs svelte-1bex8oj" data-testid="faq-list"><!--[-->`);
      const each_array_1 = ensure_array_like(rows());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let f = each_array_1[$$index_1];
        $$renderer2.push(`<li><details class="svelte-1bex8oj"><summary class="svelte-1bex8oj"><span>${escape_html(f.question)}</span> <span class="badge">${escape_html(f.category)}</span></summary> <p class="svelte-1bex8oj">${escape_html(f.answer)}</p></details></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
export {
  _page as default
};
