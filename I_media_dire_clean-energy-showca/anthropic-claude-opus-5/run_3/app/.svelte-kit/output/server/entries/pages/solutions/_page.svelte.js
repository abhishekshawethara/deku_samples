import { h as head, f as ensure_array_like, e as escape_html, a as attr, s as store_get, u as unsubscribe_stores, g as derived, d as attr_class } from "../../../chunks/index.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { P as Plate } from "../../../chunks/Plate.js";
import { S as SaveButton } from "../../../chunks/SaveButton.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
import { i as isSignedIn } from "../../../chunks/auth.js";
import { b as savedSlugs } from "../../../chunks/saves.js";
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
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
    const industries = derived(() => [...new Set(data.all.map((s) => s.industry))].sort());
    let filters = { ...data.filters };
    let busy = false;
    let banner = null;
    let searchName = "";
    let savingSearch = false;
    async function apply(next) {
      filters = { ...filters, ...next };
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
      busy = true;
      const qs = params.toString();
      await goto(`/solutions${qs ? `?${qs}` : ""}`, {});
      busy = false;
    }
    const activeCount = derived(() => Object.values(filters).filter(Boolean).length);
    head("1bxacmn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Solutions · Zettajoule</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Eight industries, four filters. Find the ones that fit your site."/>`);
    });
    $$renderer2.push(`<section class="head svelte-1bxacmn"><div class="wrap"><p class="eyebrow">Solutions</p> `);
    Reveal($$renderer2, { as: "h1", text: "What can this power?" });
    $$renderer2.push(`<!----> <p class="lede">Eight industries, each wanting a different temperature and a different output. Narrow them to
			the ones that fit your site.</p></div></section> <section class="wrap explorer svelte-1bxacmn"><form class="filters svelte-1bxacmn" aria-label="Filter the solutions"><div class="filters__grid svelte-1bxacmn"><div class="field svelte-1bxacmn"><label for="f-industry">Industry</label> `);
    $$renderer2.select(
      {
        id: "f-industry",
        value: filters.industry,
        onchange: (e) => apply({ industry: e.currentTarget.value })
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All industries`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(industries());
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let i = each_array[$$index];
          $$renderer3.option({ value: i }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(i)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="field svelte-1bxacmn"><label for="f-output">What you want out</label> `);
    $$renderer2.select(
      {
        id: "f-output",
        value: filters.output_kind,
        onchange: (e) => apply({ output_kind: e.currentTarget.value })
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Any output`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(OUTPUT_KINDS);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let [value, label] = each_array_1[$$index_1];
          $$renderer3.option({ value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="field svelte-1bxacmn"><label for="f-band">How hot you need it</label> `);
    $$renderer2.select(
      {
        id: "f-band",
        value: filters.temperature_band,
        onchange: (e) => apply({ temperature_band: e.currentTarget.value })
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
    $$renderer2.push(`</div> <div class="field svelte-1bxacmn"><label for="f-deploy">How it would be deployed</label> `);
    $$renderer2.select(
      {
        id: "f-deploy",
        value: filters.deployment,
        onchange: (e) => apply({ deployment: e.currentTarget.value })
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Any deployment`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(DEPLOYMENTS);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let [value, label] = each_array_3[$$index_3];
          $$renderer3.option({ value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="field filters__search svelte-1bxacmn"><label for="f-q">Search in plain language</label> <input id="f-q" type="search" placeholder="hydrogen for a steel works"${attr("value", filters.q)}/></div></div> <div class="filters__foot svelte-1bxacmn"><p class="count svelte-1bxacmn" role="status" aria-live="polite">`);
    if (busy) {
      $$renderer2.push(`<!--[0--><span class="spinner" aria-hidden="true"></span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <strong>Showing ${escape_html(data.total)} of ${escape_html(data.universe)}</strong> `);
    if (activeCount()) {
      $$renderer2.push(`<!--[0--><span class="muted">· ${escape_html(activeCount())}
						${escape_html(activeCount() === 1 ? "filter" : "filters")} applied</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></p> <button class="btn btn--ghost btn--sm" type="button"${attr("disabled", activeCount() === 0, true)}>Clear filters</button></div></form> `);
    if (banner) {
      $$renderer2.push(`<!--[0--><div${attr_class(`banner banner--${banner.kind === "ok" ? "ok" : "fail"}`)} role="status"><strong>${escape_html(banner.kind === "ok" ? "Saved" : "Not saved")}</strong> <span>${escape_html(banner.text)}</span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form class="save-search svelte-1bxacmn"><label for="search-name">Save this search</label> <div class="save-search__row svelte-1bxacmn"><input id="search-name" type="text" placeholder="Hydrogen sites"${attr("value", searchName)} autocomplete="off" class="svelte-1bxacmn"/> <button class="btn btn--ghost" type="submit"${attr("disabled", savingSearch, true)}>`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Save search</button></div> <p class="field__hint">`);
    if (store_get($$store_subs ??= {}, "$isSignedIn", isSignedIn)) {
      $$renderer2.push(`<!--[0-->A name is unique on your account: reusing one replaces its filters.`);
    } else {
      $$renderer2.push(`<!--[-1--><a href="/signin?next=/solutions">Sign in</a> to keep a search under a name.`);
    }
    $$renderer2.push(`<!--]--></p></form> `);
    if (data.solutions.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><h2>No solution matches those four filters</h2> <p>Nothing in the eight fits that exact combination. Widen the temperature band, or clear the
				filters and start again.</p> <button class="btn" type="button">Clear filters</button></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="cards svelte-1bxacmn"${attr("data-count", data.total)}><!--[-->`);
      const each_array_4 = ensure_array_like(data.solutions);
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let s = each_array_4[$$index_4];
        $$renderer2.push(`<li class="card-item"><article class="sol svelte-1bxacmn"><a class="sol__plate svelte-1bxacmn"${attr("href", `/solutions/${s.slug}`)} tabindex="-1" aria-hidden="true">`);
        Plate($$renderer2, { seed: s.slug, ratio: "16 / 9" });
        $$renderer2.push(`<!----></a> <h2 class="sol__industry svelte-1bxacmn"><a${attr("href", `/solutions/${s.slug}`)} class="svelte-1bxacmn">${escape_html(s.industry)}</a></h2> <p class="sol__title svelte-1bxacmn">${escape_html(s.title)}</p> <p class="sol__summary svelte-1bxacmn">${escape_html(s.summary)}</p> <ul class="sol__meta svelte-1bxacmn"><li class="svelte-1bxacmn">${escape_html(s.output_kind)}</li> <li class="svelte-1bxacmn">${escape_html(s.temperature_band)}</li> <li class="svelte-1bxacmn">${escape_html(s.deployment)}</li> <li class="svelte-1bxacmn">${escape_html(s.module_count)} ${escape_html(s.module_count === 1 ? "module" : "modules")}</li></ul> <div class="sol__actions svelte-1bxacmn">`);
        SaveButton($$renderer2, {
          slug: s.slug,
          compact: true,
          onmessage: (m) => banner = { kind: m.kind, text: m.text }
        });
        $$renderer2.push(`<!----> <a class="btn btn--ghost btn--sm"${attr("href", `/solutions/${s.slug}`)}>Open</a></div></article></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--> <details class="plain svelte-1bxacmn"><summary class="svelte-1bxacmn">Read the ${escape_html(data.total)} matching ${escape_html(data.total === 1 ? "solution" : "solutions")} as a list</summary> <table class="data svelte-1bxacmn"><thead><tr><th scope="col">Industry</th><th scope="col">Output</th><th scope="col">Temperature</th><th scope="col">Deployment</th><th scope="col">Modules</th></tr></thead><tbody><!--[-->`);
    const each_array_5 = ensure_array_like(data.solutions);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let s = each_array_5[$$index_5];
      $$renderer2.push(`<tr><th scope="row"><a${attr("href", `/solutions/${s.slug}`)}>${escape_html(s.industry)}</a></th><td>${escape_html(s.output_kind)}</td><td>${escape_html(s.temperature_band)}</td><td>${escape_html(s.deployment)}</td><td>${escape_html(s.module_count)}</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></details> <p class="compare-link svelte-1bxacmn">${escape_html(store_get($$store_subs ??= {}, "$savedSlugs", savedSlugs).size)} saved. <a href="/compare">Compare up to four side by side</a>.</p></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
