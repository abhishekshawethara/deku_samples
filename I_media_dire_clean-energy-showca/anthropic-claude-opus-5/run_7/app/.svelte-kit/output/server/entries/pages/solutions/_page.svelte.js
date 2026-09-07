import { b as browser, a as store_get, h as head, i as ensure_array_like, e as escape_html, c as attr, u as unsubscribe_stores } from "../../../chunks/index.js";
import { p as page } from "../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { P as Plate } from "../../../chunks/Plate.js";
import { S as SaveButton } from "../../../chunks/SaveButton.js";
import "clsx";
function getToken() {
  return null;
}
class ApiError extends Error {
  constructor(status, message, code, body) {
    super(message);
    this.status = status;
    this.code = code;
    this.body = body;
  }
}
async function api(path, options = {}) {
  const { method = "GET", body, auth = true, headers = {}, redirectOnExpiry = true } = options;
  const h = { ...headers };
  if (body !== void 0) h["content-type"] = "application/json";
  const token = auth ? getToken() : null;
  if (token) h.authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
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
      payload = text;
    }
  }
  if (!res.ok) {
    const code = payload?.code;
    const message = payload?.message || payload?.error || `The request failed (${res.status}). Try again.`;
    if (res.status === 401 && code === "token_expired" && browser) ;
    throw new ApiError(res.status, message, code, payload);
  }
  return { data: payload, headers: res.headers, status: res.status };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let qs, activeCount;
    const INDUSTRIES = [
      "Oil and Gas",
      "Chemicals",
      "Transport",
      "Steel",
      "Mining",
      "Data Centres",
      "Communities",
      "Desalination"
    ];
    const OUTPUT_KINDS = [
      ["heat", "Heat"],
      ["heat-and-power", "Heat and power"],
      ["hydrogen", "Hydrogen"],
      ["electricity", "Electricity"]
    ];
    const BANDS = ["up to 250 C", "250 to 550 C", "550 to 750 C"];
    const DEPLOYMENTS = [
      ["single-module", "Single module"],
      ["multi-module", "Multi module"]
    ];
    let filters = {
      industry: "",
      output_kind: "",
      temperature_band: "",
      deployment: "",
      q: ""
    };
    let solutions = [];
    let total = 0;
    let loading = true;
    let error = "";
    let savedBySlug = {};
    let searchName = "";
    let searchBusy = false;
    let lastQs = null;
    function readUrl(url) {
      filters = {
        industry: url.searchParams.get("industry") || "",
        output_kind: url.searchParams.get("output_kind") || "",
        temperature_band: url.searchParams.get("temperature_band") || "",
        deployment: url.searchParams.get("deployment") || "",
        q: url.searchParams.get("q") || ""
      };
    }
    async function load(currentQs) {
      if (currentQs === lastQs) return;
      lastQs = currentQs;
      loading = true;
      error = "";
      try {
        const { data, headers } = await api(`/solutions${currentQs ? "?" + currentQs : ""}`, { auth: false });
        solutions = data;
        total = Number(headers.get("X-Total-Count") ?? data.length);
      } catch (err) {
        error = err.message || "The explorer could not load.";
        solutions = [];
        total = 0;
      } finally {
        loading = false;
      }
    }
    function onSaveChange({ slug, saved, id }) {
      savedBySlug = saved ? { ...savedBySlug, [slug]: id } : Object.fromEntries(Object.entries(savedBySlug).filter(([k]) => k !== slug));
    }
    readUrl(store_get($$store_subs ??= {}, "$page", page).url);
    qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    if (typeof window !== "undefined") load(qs);
    activeCount = Object.values(filters).filter(Boolean).length;
    head("1bxacmn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Solutions explorer, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Solutions</p> <h1>What can this power?</h1> <p class="lede">Eight industries, one machine. Choose an industry, what you want out of it, how hot you need
      it and how it would be deployed. The count reads how many of the eight are showing.</p></div></section> <section class="filters-bar svelte-1bxacmn"><div class="wrap"><form class="filters svelte-1bxacmn"><div class="f svelte-1bxacmn"><label for="f-industry" class="svelte-1bxacmn">Industry</label> `);
    $$renderer2.select(
      {
        id: "f-industry",
        value: filters.industry,
        "data-testid": "filter-industry"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All industries`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(INDUSTRIES);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let i = each_array[$$index];
          $$renderer3.option({ value: i }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(i)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f svelte-1bxacmn"><label for="f-output" class="svelte-1bxacmn">Output</label> `);
    $$renderer2.select(
      {
        id: "f-output",
        value: filters.output_kind,
        "data-testid": "filter-output"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All outputs`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(OUTPUT_KINDS);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let [v, l] = each_array_1[$$index_1];
          $$renderer3.option({ value: v }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(l)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f svelte-1bxacmn"><label for="f-band" class="svelte-1bxacmn">Temperature</label> `);
    $$renderer2.select(
      {
        id: "f-band",
        value: filters.temperature_band,
        "data-testid": "filter-band"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Any temperature`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(BANDS);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let b = each_array_2[$$index_2];
          $$renderer3.option({ value: b }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(b)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f svelte-1bxacmn"><label for="f-deploy" class="svelte-1bxacmn">Deployment</label> `);
    $$renderer2.select(
      {
        id: "f-deploy",
        value: filters.deployment,
        "data-testid": "filter-deployment"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Either deployment`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(DEPLOYMENTS);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let [v, l] = each_array_3[$$index_3];
          $$renderer3.option({ value: v }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(l)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f f-wide svelte-1bxacmn"><label for="f-q" class="svelte-1bxacmn">Search</label> <input id="f-q" type="search" placeholder="Plain language, for example hydrogen mill"${attr("value", filters.q)} data-testid="filter-q"/></div></form> <div class="count-row svelte-1bxacmn"><p class="count svelte-1bxacmn" aria-live="polite" data-testid="result-count">Showing <strong>${escape_html(total)}</strong> of 8 solutions</p> `);
    if (activeCount) {
      $$renderer2.push(`<!--[0--><button type="button" class="btn btn-secondary btn-sm">Clear ${escape_html(activeCount)} filter${escape_html(activeCount === 1 ? "" : "s")}</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="section-tight"><div class="wrap">`);
    if (error) {
      $$renderer2.push(`<!--[0--><div class="banner banner-failure" role="alert"><strong>The explorer could not load</strong> ${escape_html(error)} Reload the page, or <a href="/contact">tell us</a> if it keeps happening.</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (loading) {
      $$renderer2.push(`<!--[0--><div class="grid grid-4 grid-dense" data-testid="grid-loading"><!--[-->`);
      const each_array_4 = ensure_array_like([1, 2, 3, 4]);
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        each_array_4[$$index_4];
        $$renderer2.push(`<div class="skeleton"><span class="spinner" aria-hidden="true"></span> Loading solutions…</div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (solutions.length === 0) {
      $$renderer2.push(`<!--[1--><div class="empty" data-testid="grid-empty"><p><strong>No solution matches those filters.</strong></p> <p>Nothing in the eight combines what you have chosen. Widen one filter, or clear them all.</p> <button type="button" class="btn btn-secondary">Clear the filters</button></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="grid grid-4 grid-dense cards svelte-1bxacmn" data-testid="solution-grid"><!--[-->`);
      const each_array_5 = ensure_array_like(solutions);
      for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
        let s = each_array_5[$$index_5];
        $$renderer2.push(`<article class="scard svelte-1bxacmn"${attr("data-slug", s.slug)}>`);
        Plate($$renderer2, {
          seed: s.slug,
          height: "92px",
          label: `Generated plate for ${s.industry}`
        });
        $$renderer2.push(`<!----> <h2 class="svelte-1bxacmn"><a${attr("href", `/solutions/${s.slug}`)} class="svelte-1bxacmn">${escape_html(s.industry)}</a></h2> <p class="stitle svelte-1bxacmn">${escape_html(s.title)}</p> <ul class="meta svelte-1bxacmn"><li class="svelte-1bxacmn"><span class="svelte-1bxacmn">Output</span>${escape_html(s.output_kind)}</li> <li class="svelte-1bxacmn"><span class="svelte-1bxacmn">Heat</span>${escape_html(s.temperature_band)}</li> <li class="svelte-1bxacmn"><span class="svelte-1bxacmn">Build</span>${escape_html(s.deployment)}</li> <li class="svelte-1bxacmn"><span class="svelte-1bxacmn">Modules</span>${escape_html(s.module_count)}</li></ul> <div class="scard-actions svelte-1bxacmn">`);
        SaveButton($$renderer2, {
          slug: s.slug,
          small: true,
          saved: !!savedBySlug[s.slug],
          saveId: savedBySlug[s.slug] ?? null,
          onChange: onSaveChange
        });
        $$renderer2.push(`<!----> <a class="btn btn-secondary btn-sm"${attr("href", `/solutions/${s.slug}`)}>Open</a></div></article>`);
      }
      $$renderer2.push(`<!--]--></div> <details class="plain svelte-1bxacmn"><summary class="svelte-1bxacmn">Read the filtered set as a list</summary> <ol><!--[-->`);
      const each_array_6 = ensure_array_like(solutions);
      for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
        let s = each_array_6[$$index_6];
        $$renderer2.push(`<li>${escape_html(s.industry)}: ${escape_html(s.title)}. ${escape_html(s.output_kind)}, ${escape_html(s.temperature_band)}, ${escape_html(s.deployment)},
              ${escape_html(s.module_count)} modules.</li>`);
      }
      $$renderer2.push(`<!--]--></ol></details>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section-tight section-sky"><div class="wrap"><h2>Keep this search</h2> <p class="muted small">A saved search is unique by name in your account: reusing a name replaces its filters rather
      than adding a second row.</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form class="save-search svelte-1bxacmn"><div class="f f-wide svelte-1bxacmn"><label for="search-name" class="svelte-1bxacmn">Name this search</label> <input id="search-name" type="text"${attr("value", searchName)} placeholder="Hydrogen sites" data-testid="search-name"/></div> <button class="btn" type="submit"${attr("disabled", searchBusy, true)} data-testid="save-search">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Save this search</button></form></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
