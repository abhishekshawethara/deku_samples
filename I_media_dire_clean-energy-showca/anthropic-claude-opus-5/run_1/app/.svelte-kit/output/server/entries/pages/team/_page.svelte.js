import { h as head, e as escape_html, g as ensure_array_like, a as attr } from "../../../chunks/index.js";
import { P as Plate } from "../../../chunks/Plate.js";
import { M as Modal } from "../../../chunks/Modal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let showing = null;
    head("1cobqru", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Our Team, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1cobqru"><div class="wrap"><p class="eyebrow">Our Team</p> <h1 class="opening svelte-1cobqru">${escape_html(data.copy.lede?.heading || "shaping the future of nuclear together")}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="section"><div class="wrap"><ul class="team svelte-1cobqru"><!--[-->`);
    const each_array = ensure_array_like(data.team);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let m = each_array[$$index];
      $$renderer2.push(`<li class="member svelte-1cobqru">`);
      Plate($$renderer2, { seed: m.slug, kind: "portrait", ratio: "4 / 5", label: "" });
      $$renderer2.push(`<!----> <h2 class="svelte-1cobqru">${escape_html(m.name)}</h2> <p class="role svelte-1cobqru">${escape_html(m.role_title)}</p> <div class="member-actions svelte-1cobqru"><button class="btn btn-quiet btn-sm" type="button"${attr("data-testid", `bio-${m.slug}`)}>View bio</button> <a class="profile svelte-1cobqru"${attr("href", m.profile_url)} rel="nofollow noopener">Professional profile <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4 12 L12 4 M6 4 h6 v6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<button class="btn btn-quiet" type="button">Close</button>`);
      };
      Modal($$renderer2, {
        open: !!showing,
        title: showing ? showing.name : "",
        onclose: () => showing = null,
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<p class="modal-role svelte-1cobqru">${escape_html(showing?.role_title)}</p> <p>${escape_html(showing?.bio)}</p> <p><a${attr("href", showing?.profile_url)} rel="nofollow noopener">Professional profile</a></p>`);
        }
      });
    }
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
