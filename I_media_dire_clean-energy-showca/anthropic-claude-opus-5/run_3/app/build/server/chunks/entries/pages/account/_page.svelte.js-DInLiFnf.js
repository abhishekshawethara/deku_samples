import { ae as head, a7 as escape_html, a9 as store_get, ab as ensure_array_like, ac as attr, aa as attr_class, ah as stringify, ad as unsubscribe_stores } from '../../../chunks/index.js-CnICPAax.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-GlEKx5p3.js';
import '../../../chunks/state.svelte.js-CoYBmM9v.js';
import { a as account } from '../../../chunks/auth.js-CRCsruHm.js';
import { s as saves, a as savesLoading } from '../../../chunks/saves.js-CaRXZihz.js';
import { M as Modal } from '../../../chunks/Modal.js-Cvg6TxYe.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let searches = [];
    let enquiries = [];
    let applications = [];
    let confirm = null;
    function filtersOf(s) {
      const parts = [
        s.query && `“${s.query}”`,
        s.industry,
        s.output_kind,
        s.temperature_band,
        s.deployment
      ].filter(Boolean);
      return parts.length ? parts.join(" · ") : "No filters, everything";
    }
    function searchHref(s) {
      const p = new URLSearchParams();
      for (const k of [
        "query",
        "industry",
        "output_kind",
        "temperature_band",
        "deployment"
      ]) {
        if (s[k]) p.set(k === "query" ? "q" : k, s[k]);
      }
      const qs = p.toString();
      return `/solutions${qs ? `?${qs}` : ""}`;
    }
    head("8i5vi8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Account · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-8i5vi8"><div class="wrap"><p class="eyebrow">Account</p> <h1>${escape_html(store_get($$store_subs ??= {}, "$account", account)?.display_name || "Your account")}</h1> <p class="lede">${escape_html(store_get($$store_subs ??= {}, "$account", account)?.email || "")} · Everything below belongs to this account alone.</p> <button class="btn btn--ghost btn--sm" type="button">Sign out</button></div></section> <div class="wrap acct svelte-8i5vi8">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><p class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading your lists…</p>`);
    }
    $$renderer2.push(`<!--]--> <section class="list svelte-8i5vi8" aria-labelledby="l-saves"><div class="list__head svelte-8i5vi8"><h2 id="l-saves" class="svelte-8i5vi8">Saved solutions</h2> <a class="btn btn--ghost btn--sm" href="/compare">Compare</a></div> `);
    if (store_get($$store_subs ??= {}, "$savesLoading", savesLoading)) {
      $$renderer2.push(`<!--[0--><p class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading…</p>`);
    } else if (store_get($$store_subs ??= {}, "$saves", saves).length === 0) {
      $$renderer2.push(`<!--[1--><div class="empty-state"><p><strong>No saved solutions yet.</strong> Nothing has been kept on this account.</p> <a class="btn" href="/solutions">Find one in the explorer</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="rows svelte-8i5vi8"><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$saves", saves));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let row = each_array[$$index];
        $$renderer2.push(`<li class="row-item svelte-8i5vi8"><div><a class="row-item__title svelte-8i5vi8"${attr("href", `/solutions/${row.slug}`)}>${escape_html(row.industry)}</a> <p class="row-item__meta svelte-8i5vi8">${escape_html(row.output_kind)} · ${escape_html(row.temperature_band)} · ${escape_html(row.module_count)}
								${escape_html(row.module_count === 1 ? "module" : "modules")}</p></div> <button class="btn btn--danger btn--sm" type="button">Remove<span class="visually-hidden">${escape_html(row.industry)} from saved solutions</span></button></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="list svelte-8i5vi8" aria-labelledby="l-searches"><div class="list__head svelte-8i5vi8"><h2 id="l-searches" class="svelte-8i5vi8">Saved searches</h2> <a class="btn btn--ghost btn--sm" href="/solutions">New search</a></div> `);
    if (searches.length === 0 && false) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><p><strong>No saved searches yet.</strong> A search kept under a name comes back here.</p> <a class="btn" href="/solutions">Open the explorer</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="rows svelte-8i5vi8"><!--[-->`);
      const each_array_1 = ensure_array_like(searches);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let s = each_array_1[$$index_1];
        $$renderer2.push(`<li class="row-item svelte-8i5vi8"><div><a class="row-item__title svelte-8i5vi8"${attr("href", searchHref(s))}>${escape_html(s.name)}</a> <p class="row-item__meta svelte-8i5vi8">${escape_html(filtersOf(s))}</p></div> <button class="btn btn--danger btn--sm" type="button">Remove<span class="visually-hidden">the saved search ${escape_html(s.name)}</span></button></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="list svelte-8i5vi8" aria-labelledby="l-enq"><div class="list__head svelte-8i5vi8"><h2 id="l-enq" class="svelte-8i5vi8">Enquiries</h2> <a class="btn btn--ghost btn--sm" href="/contact">Send one</a></div> `);
    if (enquiries.length === 0 && false) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><p><strong>No enquiries yet.</strong> Nothing has been sent from this account.</p> <a class="btn" href="/contact">Get in Touch</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="rows svelte-8i5vi8"><!--[-->`);
      const each_array_2 = ensure_array_like(enquiries);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let e = each_array_2[$$index_2];
        $$renderer2.push(`<li class="row-item svelte-8i5vi8"><div><p class="row-item__title svelte-8i5vi8"><span class="ref svelte-8i5vi8">${escape_html(e.reference)}</span> <span${attr_class(`status-tag status-tag--${stringify(e.status)}`, "svelte-8i5vi8")}>${escape_html(e.status)}</span></p> <p class="row-item__meta svelte-8i5vi8">${escape_html(e.topic)} · ${escape_html(e.message.slice(0, 90))}${escape_html(e.message.length > 90 ? "…" : "")}</p></div> `);
        if (e.status !== "closed") {
          $$renderer2.push(`<!--[0--><button class="btn btn--ghost btn--sm" type="button">Close<span class="visually-hidden">enquiry ${escape_html(e.reference)}</span></button>`);
        } else {
          $$renderer2.push(`<!--[-1--><button class="btn btn--sm" type="button" disabled="" aria-disabled="true">Closed</button>`);
        }
        $$renderer2.push(`<!--]--></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="list svelte-8i5vi8" aria-labelledby="l-access"><div class="list__head svelte-8i5vi8"><h2 id="l-access" class="svelte-8i5vi8">Investor access</h2> <a class="btn btn--ghost btn--sm" href="/investors">Investors</a></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="list svelte-8i5vi8" aria-labelledby="l-apps"><div class="list__head svelte-8i5vi8"><h2 id="l-apps" class="svelte-8i5vi8">Job applications</h2> <a class="btn btn--ghost btn--sm" href="/careers">Open jobs</a></div> `);
    if (applications.length === 0 && false) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><p><strong>No applications yet.</strong> Nothing has been sent from this account.</p> <a class="btn" href="/careers">See the three open jobs</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="rows svelte-8i5vi8"><!--[-->`);
      const each_array_3 = ensure_array_like(applications);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let a = each_array_3[$$index_3];
        $$renderer2.push(`<li class="row-item svelte-8i5vi8"><div><p class="row-item__title svelte-8i5vi8">${escape_html(a.job_title)} <span${attr_class(`status-tag status-tag--${stringify(a.status)}`, "svelte-8i5vi8")}>${escape_html(a.status)}</span></p> <p class="row-item__meta svelte-8i5vi8">${escape_html(a.location)} · ${escape_html(a.note.slice(0, 90))}${escape_html(a.note.length > 90 ? "…" : "")}</p></div> <a class="btn btn--ghost btn--sm"${attr("href", `/careers`)}>View job</a></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></section></div> `);
    Modal($$renderer2, {
      open: Boolean(confirm),
      title: confirm?.title || "",
      onclose: () => confirm = null,
      children: ($$renderer3) => {
        $$renderer3.push(`<p>${escape_html(confirm?.body)}</p> <div class="row"><button class="btn btn--danger" type="button">${escape_html(confirm?.confirmLabel || "Confirm")}</button> <button class="btn btn--ghost" type="button">Cancel</button></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-DInLiFnf.js.map
