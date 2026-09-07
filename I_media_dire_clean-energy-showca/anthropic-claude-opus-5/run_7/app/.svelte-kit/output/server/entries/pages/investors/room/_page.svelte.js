import { h as head, i as ensure_array_like, c as attr, e as escape_html, g as bind_props } from "../../../../chunks/index.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let documents;
    let data = $$props["data"];
    const dt = (v) => v ? String(v).slice(0, 10) : "";
    documents = data.documents ?? [];
    head("dm15ji", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Document room, Zettajoule investors</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow"><a href="/investors">Investors</a> / Document room</p> <h1>The document room</h1> <p class="lede">This room answers only while your own access request reads approved. Everything here is
      confidential to the account that opened it.</p></div></section> <section class="section-tight"><div class="wrap">`);
    if (documents.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><p><strong>No documents are published yet.</strong></p> <p>Your access is approved but the room is empty. We will write to you when it fills.</p> <a class="btn btn-secondary" href="/investors">Back to the investor case</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="docs svelte-dm15ji" data-testid="document-list"><!--[-->`);
      const each_array = ensure_array_like(documents);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let d = each_array[$$index];
        $$renderer2.push(`<li class="doc svelte-dm15ji"${attr("data-slug", d.slug)}><svg viewBox="0 0 40 52" class="mark svelte-dm15ji" role="img"${attr("aria-label", `Document mark for ${d.title}`)}><path d="M4 2 h22 l10 10 v38 h-32 z" fill="none" stroke="var(--navy)" stroke-width="1.6"></path><path d="M26 2 v10 h10" fill="none" stroke="var(--navy)" stroke-width="1.6"></path><path d="M10 22 h20 M10 30 h20 M10 38 h13" stroke="var(--rule-strong)" stroke-width="1.4"></path></svg> <div><h2 class="svelte-dm15ji">${escape_html(d.title)}</h2> <p class="small muted svelte-dm15ji">${escape_html(d.category)}, published ${escape_html(dt(d.published_at))}</p> `);
        if (d.summary) {
          $$renderer2.push(`<!--[0--><p class="small svelte-dm15ji">${escape_html(d.summary)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></li>`);
      }
      $$renderer2.push(`<!--]--></ul> <p class="small muted">${escape_html(documents.length)} documents. Ask us for a walkthrough of any of them.</p>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
