import { h as head, e as escape_html, s as store_get, f as ensure_array_like, a as attr, u as unsubscribe_stores, g as derived } from "../../../chunks/index.js";
import { P as Plate } from "../../../chunks/Plate.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { i as isSignedIn } from "../../../chunks/auth.js";
import { s as savesLoading, a as saves } from "../../../chunks/saves.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let chosen = [];
    let rows = [];
    const available = derived(() => store_get($$store_subs ??= {}, "$saves", saves).filter((r) => !chosen.includes(r.slug)));
    const FIELDS = [
      ["industry", "Industry"],
      ["output_kind", "Output"],
      ["temperature_band", "Temperature"],
      ["deployment", "Deployment"],
      ["module_count", "Modules"]
    ];
    head("1ez3k3s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Compare · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1ez3k3s"><div class="wrap"><p class="eyebrow">Compare</p> <h1>Four saves, side by side</h1> <p class="lede">The comparison holds at most four. A fifth is refused, and the four you have stay where they
			are.</p></div></section> <section class="wrap section--tight">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <p class="tray-count svelte-1ez3k3s" role="status"><strong>${escape_html(chosen.length)} of 4</strong> compared.</p> `);
    if (store_get($$store_subs ??= {}, "$savesLoading", savesLoading)) {
      $$renderer2.push(`<!--[0--><p class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading your saves…</p>`);
    } else if (store_get($$store_subs ??= {}, "$saves", saves).length === 0) {
      $$renderer2.push(`<!--[1--><div class="empty-state"><h2>Nothing saved yet</h2> <p>`);
      if (store_get($$store_subs ??= {}, "$isSignedIn", isSignedIn)) {
        $$renderer2.push(`<!--[0-->Save a solution from the explorer and it appears here to compare.`);
      } else {
        $$renderer2.push(`<!--[-1-->Save a solution from the explorer, then sign in and it follows you here.`);
      }
      $$renderer2.push(`<!--]--></p> <a class="btn" href="/solutions">Open the explorer</a></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      if (available().length) {
        $$renderer2.push(`<!--[0--><div class="tray svelte-1ez3k3s"><p class="label">Add another save</p> <div class="row"><!--[-->`);
        const each_array = ensure_array_like(available());
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let r = each_array[$$index];
          $$renderer2.push(`<button class="btn btn--ghost btn--sm" type="button">Add ${escape_html(r.slug)}</button>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (rows.length) {
        $$renderer2.push(`<!--[0--><div class="scroller svelte-1ez3k3s"><table class="data compare-table svelte-1ez3k3s"><caption class="visually-hidden">Saved solutions compared across industry, output, temperature, deployment and module
						count.</caption><thead class="svelte-1ez3k3s"><tr><th scope="col" class="svelte-1ez3k3s">Field</th><!--[-->`);
        const each_array_1 = ensure_array_like(rows);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let r = each_array_1[$$index_1];
          $$renderer2.push(`<th scope="col" class="svelte-1ez3k3s">`);
          Plate($$renderer2, { seed: r.slug, ratio: "16 / 9" });
          $$renderer2.push(`<!----> <a${attr("href", `/solutions/${r.slug}`)} class="svelte-1ez3k3s">${escape_html(r.industry)}</a> <button class="btn btn--danger btn--sm" type="button">Remove <span class="visually-hidden">${escape_html(r.industry)} from the comparison</span></button></th>`);
        }
        $$renderer2.push(`<!--]--></tr></thead><tbody><!--[-->`);
        const each_array_2 = ensure_array_like(FIELDS);
        for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
          let [key, label] = each_array_2[$$index_3];
          $$renderer2.push(`<tr><th scope="row">${escape_html(label)}</th><!--[-->`);
          const each_array_3 = ensure_array_like(rows);
          for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
            let r = each_array_3[$$index_2];
            $$renderer2.push(`<td>${escape_html(r[key])}</td>`);
          }
          $$renderer2.push(`<!--]--></tr>`);
        }
        $$renderer2.push(`<!--]--><tr><th scope="row">Summary</th><!--[-->`);
        const each_array_4 = ensure_array_like(rows);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let r = each_array_4[$$index_4];
          $$renderer2.push(`<td class="summary-cell svelte-1ez3k3s">${escape_html(r.summary)}</td>`);
        }
        $$renderer2.push(`<!--]--></tr></tbody></table></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
