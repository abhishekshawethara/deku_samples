import { ae as head, ab as ensure_array_like, a7 as escape_html, ac as attr } from '../../../chunks/index.js-CnICPAax.js';
import { R as Reveal } from '../../../chunks/Reveal.js-Bfh9vo4k.js';
import { P as Plate } from '../../../chunks/Plate.js-Dbshsp3s.js';
import { M as Modal } from '../../../chunks/Modal.js-Cvg6TxYe.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/scroll.js-XFfYl84w.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let openMember = null;
    function initials(name) {
      return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    }
    head("1cobqru", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Our Team · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1cobqru"><div class="wrap"><p class="eyebrow">Our Team</p> `);
    Reveal($$renderer2, { as: "h1", text: "shaping the future of nuclear together" });
    $$renderer2.push(`<!----> <p class="lede">An international group of recognised experts in reactor physics, licensing, large energy
			construction and plant operations, most of whom have done the thing before rather than read
			about it.</p></div></section> <section class="wrap team-sec svelte-1cobqru"><ul class="team svelte-1cobqru"><!--[-->`);
    const each_array = ensure_array_like(data.team);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let m = each_array[$$index];
      $$renderer2.push(`<li class="member svelte-1cobqru">`);
      Plate($$renderer2, {
        seed: m.slug,
        kind: "portrait",
        ratio: "1 / 1",
        initials: initials(m.name),
        label: `Generated portrait plate for ${m.name}`
      });
      $$renderer2.push(`<!----> <h2 class="svelte-1cobqru">${escape_html(m.name)}</h2> <p class="member__role svelte-1cobqru">${escape_html(m.role_title)}</p> <div class="row"><button class="btn btn--ghost btn--sm" type="button">View bio<span class="visually-hidden">for ${escape_html(m.name)}</span></button> <a class="member__profile svelte-1cobqru"${attr("href", m.profile_url)} rel="noopener noreferrer nofollow" target="_blank">Profile <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 13 L13 3 M6 3 h7 v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="visually-hidden">, professional profile for ${escape_html(m.name)}</span></a></div></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <p class="muted small svelte-1cobqru">The portraits are generated plates drawn from code, not photographs, and the names are
		stand-ins.</p></section> `);
    Modal($$renderer2, {
      open: Boolean(openMember),
      title: openMember ? `${openMember.name}, ${openMember.role_title}` : "",
      onclose: () => openMember = null,
      children: ($$renderer3) => {
        if (openMember) {
          $$renderer3.push(`<!--[0--><div class="bio">`);
          Plate($$renderer3, {
            seed: openMember.slug,
            kind: "portrait",
            ratio: "3 / 2",
            initials: initials(openMember.name)
          });
          $$renderer3.push(`<!----> <p class="bio__text svelte-1cobqru">${escape_html(openMember.bio)}</p> <a${attr("href", openMember.profile_url)} rel="noopener noreferrer nofollow" target="_blank">Professional profile for ${escape_html(openMember.name)}</a></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CZYWKmW1.js.map
