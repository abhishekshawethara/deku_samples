import { ae as head, ac as attr, ab as ensure_array_like, a7 as escape_html, R as derived, a5 as browser } from '../../../chunks/index.js-CnICPAax.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-GlEKx5p3.js';
import '../../../chunks/state.svelte.js-CoYBmM9v.js';
import '../../../chunks/auth.js-CRCsruHm.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

class ApiError extends Error {
  constructor(status, payload) {
    super(payload?.message || `Request failed (${status})`);
    this.status = status;
    this.code = payload?.error || "error";
    this.payload = payload;
  }
}
async function api(path, options = {}) {
  const { method = "GET", body, auth = true, fetcher = fetch, headers = {} } = options;
  const h = { ...headers };
  if (body !== void 0) h["content-type"] = "application/json";
  const res = await fetcher(`/api${path}`, {
    method,
    headers: h,
    body: body === void 0 ? void 0 : JSON.stringify(body)
  });
  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }
  if (!res.ok) {
    res.status === 401 && browser;
    throw new ApiError(res.status, payload);
  }
  return { data: payload, headers: res.headers, status: res.status };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let query = "";
    let category = "";
    let rows = [...data.faqs];
    let busy = false;
    const categories = derived(() => [...new Set(data.faqs.map((f) => f.category))]);
    async function search() {
      busy = true;
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category) ;
        const qs = params.toString();
        const { data: found } = await api(`/faqs${qs ? `?${qs}` : ""}`, { auth: false });
        rows = found;
      } finally {
        busy = false;
      }
    }
    head("1bex8oj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>FAQ · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1bex8oj"><div class="wrap"><p class="eyebrow">FAQ</p> <h1>Common questions</h1> <p class="lede">The technology and how a deployment actually works.</p></div></section> <section class="wrap faq svelte-1bex8oj"><form class="faq__filters svelte-1bex8oj" role="search"><div class="field"><label for="q">Search the questions</label> <input id="q" type="search"${attr("value", query)} placeholder="helium, fuel, modules"/></div> <div class="field"><label for="cat">Category</label> `);
    $$renderer2.select({ id: "cat", value: category, onchange: search }, ($$renderer3) => {
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
    $$renderer2.push(`</div></form> <p class="count svelte-1bex8oj" role="status" aria-live="polite">`);
    if (busy) {
      $$renderer2.push(`<!--[0--><span class="spinner" aria-hidden="true"></span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Showing ${escape_html(rows.length)} of ${escape_html(data.faqs.length)}</p> `);
    if (rows.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><p><strong>No question matches that.</strong> Nothing here answers what you typed.</p> <div class="row" style="justify-content:center"><button class="btn btn--ghost" type="button">Clear the search</button> <a class="btn" href="/contact">Ask us directly</a></div></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="qs svelte-1bex8oj"><!--[-->`);
      const each_array_1 = ensure_array_like(rows);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let f = each_array_1[$$index_1];
        $$renderer2.push(`<li class="svelte-1bex8oj"><details class="svelte-1bex8oj"><summary class="svelte-1bex8oj"><span class="q svelte-1bex8oj">${escape_html(f.question)}</span> <span class="cat svelte-1bex8oj">${escape_html(f.category)}</span></summary> <p class="svelte-1bex8oj">${escape_html(f.answer)}</p></details></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--> <p class="muted">Still stuck? <a href="/contact">Send an enquiry</a> and you will get a reference back.</p></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CpDUuDcV.js.map
