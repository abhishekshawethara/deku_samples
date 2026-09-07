import { a5 as head, a6 as escape_html, a9 as ensure_array_like, aa as attr, P as derived } from '../../../chunks/index.js-DtYBOeIk.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-DzEA886G.js';
import '../../../chunks/state.svelte.js-DiBp0ONL.js';
import { P as Plate } from '../../../chunks/Plate.js-mlTZc7RZ.js';
import { S as SaveButton } from '../../../chunks/SaveButton.js-BcmrpPS3.js';
import { a as api, A as ApiError } from '../../../chunks/api.js-LBSLTNEi.js';
import '../../../chunks/session.js-EMz6Q6iE.js';
import '../../../chunks/index2.js-DXE0eiF0.js';

function replaceState(url, state) {
  {
    throw new Error("Cannot call replaceState(...) on the server");
  }
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const OUTPUTS = [
      { value: "heat", label: "Heat" },
      { value: "heat-and-power", label: "Heat and power" },
      { value: "hydrogen", label: "Hydrogen" },
      { value: "electricity", label: "Electricity" }
    ];
    const BANDS = ["up to 250 C", "250 to 550 C", "550 to 750 C"];
    const DEPLOYMENTS = [
      { value: "single-module", label: "Single module" },
      { value: "multi-module", label: "Multi module" }
    ];
    let live = null;
    let loading = false;
    let error = "";
    const filters = derived(() => live?.filters ?? data.filters);
    const solutions = derived(() => live?.solutions ?? data.solutions);
    const total = derived(() => live?.total ?? data.total);
    const allCount = derived(() => data.allCount || 8);
    const active = derived(() => Object.values(filters()).filter(Boolean).length);
    function queryString(f) {
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
      return p.toString();
    }
    async function apply(next) {
      const f = next ?? filters();
      const qs = queryString(f);
      loading = true;
      error = "";
      try {
        const { data: rows, headers } = await api(`/api/solutions${qs ? `?${qs}` : ""}`);
        live = {
          filters: { ...f },
          solutions: rows,
          total: Number(headers.get("x-total-count") ?? rows.length)
        };
        replaceState(qs ? `/solutions?${qs}` : "/solutions", {});
      } catch (err) {
        error = err instanceof ApiError ? err.message : "The filters could not be applied. Check your connection and try again.";
      } finally {
        loading = false;
      }
    }
    function set(key, value) {
      apply({ ...filters(), [key]: value });
    }
    head("1bxacmn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Solutions, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1bxacmn"><div class="wrap"><p class="eyebrow">Solutions</p> <h1>${escape_html(data.copy.lede?.heading || "What can this power?")}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="explorer svelte-1bxacmn"><div class="wrap"><form class="filters svelte-1bxacmn" role="search" aria-label="Filter solutions"><div class="f"><label for="f-industry">Industry</label> `);
    $$renderer2.select(
      {
        id: "f-industry",
        value: filters().industry,
        onchange: (e) => set("industry", e.currentTarget.value)
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All industries`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(data.industries);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let ind = each_array[$$index];
          $$renderer3.option({ value: ind }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(ind)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f"><label for="f-output">Output</label> `);
    $$renderer2.select(
      {
        id: "f-output",
        value: filters().output_kind,
        onchange: (e) => set("output_kind", e.currentTarget.value)
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Any output`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(OUTPUTS);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let o = each_array_1[$$index_1];
          $$renderer3.option({ value: o.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(o.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f"><label for="f-band">Temperature</label> `);
    $$renderer2.select(
      {
        id: "f-band",
        value: filters().temperature_band,
        onchange: (e) => set("temperature_band", e.currentTarget.value)
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
    $$renderer2.push(`</div> <div class="f"><label for="f-deploy">Deployment</label> `);
    $$renderer2.select(
      {
        id: "f-deploy",
        value: filters().deployment,
        onchange: (e) => set("deployment", e.currentTarget.value)
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Any deployment`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(DEPLOYMENTS);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let d = each_array_3[$$index_3];
          $$renderer3.option({ value: d.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(d.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="f f-wide svelte-1bxacmn"><label for="f-q">Search</label> <div class="row svelte-1bxacmn"><input id="f-q" type="search" placeholder="hydrogen, refinery, district heat"${attr("value", filters().q)}/> <button class="btn btn-quiet svelte-1bxacmn" type="submit">Search</button></div></div></form> <div class="count-row svelte-1bxacmn"><p class="count svelte-1bxacmn" data-testid="result-count" aria-live="polite">`);
    if (loading) {
      $$renderer2.push(`<!--[0--><span class="spinner" aria-hidden="true"></span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Showing <strong class="svelte-1bxacmn">${escape_html(total())}</strong> of ${escape_html(allCount())} solutions</p> <div class="count-actions svelte-1bxacmn">`);
    if (active() > 0) {
      $$renderer2.push(`<!--[0--><button class="btn btn-quiet btn-sm" type="button">Clear filters</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <a class="btn btn-quiet btn-sm" href="/compare">Compare saves</a></div></div> `);
    if (error) {
      $$renderer2.push(`<!--[0--><p class="banner banner-error" role="alert"><strong>That did not work.</strong> ${escape_html(error)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (solutions().length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><h3>No solution matches those four filters</h3> <p>Nothing in the eight fits that combination. Widen a filter, or clear them all and start
					again.</p> <button class="btn btn-primary btn-sm" type="button">Clear the filters</button></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="grid-cards svelte-1bxacmn" data-testid="solution-grid"><!--[-->`);
      const each_array_4 = ensure_array_like(solutions());
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let s = each_array_4[$$index_4];
        $$renderer2.push(`<li class="scard svelte-1bxacmn"${attr("data-slug", s.slug)}><a class="scard-link svelte-1bxacmn"${attr("href", `/solutions/${s.slug}`)}>`);
        Plate($$renderer2, { seed: s.slug, ratio: "16 / 9" });
        $$renderer2.push(`<!----> <h2 class="svelte-1bxacmn">${escape_html(s.industry)}</h2> <p class="svelte-1bxacmn">${escape_html(s.summary)}</p></a> <dl class="specs svelte-1bxacmn"><div><dt class="svelte-1bxacmn">Output</dt><dd class="svelte-1bxacmn">${escape_html(s.output_kind)}</dd></div> <div><dt class="svelte-1bxacmn">Temperature</dt><dd class="svelte-1bxacmn">${escape_html(s.temperature_band)}</dd></div> <div><dt class="svelte-1bxacmn">Deployment</dt><dd class="svelte-1bxacmn">${escape_html(s.deployment)}</dd></div> <div><dt class="svelte-1bxacmn">Modules</dt><dd class="svelte-1bxacmn">${escape_html(s.module_count)}</dd></div></dl> <div class="scard-actions svelte-1bxacmn">`);
        SaveButton($$renderer2, { slug: s.slug, small: true });
        $$renderer2.push(`<!----> <a class="btn btn-quiet btn-sm"${attr("href", `/contact?topic=Solutions&solution=${s.slug}`)}>Enquire</a></div></li>`);
      }
      $$renderer2.push(`<!--]--></ul> <details class="plain svelte-1bxacmn"><summary class="svelte-1bxacmn">Read the matching solutions as a plain list</summary> <ol class="svelte-1bxacmn"><!--[-->`);
      const each_array_5 = ensure_array_like(solutions());
      for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
        let s = each_array_5[$$index_5];
        $$renderer2.push(`<li class="svelte-1bxacmn"><strong>${escape_html(s.industry)}</strong>: ${escape_html(s.output_kind)}, ${escape_html(s.temperature_band)}, ${escape_html(s.deployment)},
							${escape_html(s.module_count)} module${escape_html(s.module_count === 1 ? "" : "s")}. ${escape_html(s.summary)}</li>`);
      }
      $$renderer2.push(`<!--]--></ol></details>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CnkRDMWs.js.map
