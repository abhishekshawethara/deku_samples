import { ae as head, a7 as ensure_array_like, a9 as escape_html, a8 as attr, ad as bind_props } from '../../../chunks/index.js-D2EWZzu8.js';
import { M as Modal } from '../../../chunks/Modal.js-BmpfbcHC.js';
import { P as Plate } from '../../../chunks/Plate.js-BhKHJ0mJ.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let team;
    let data = $$props["data"];
    let bio = null;
    team = data.team ?? [];
    head("1cobqru", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Our Team, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Our Team</p> <h1 class="opening svelte-1cobqru">shaping the future of nuclear together</h1> <p class="lede">An international group of recognised experts in reactor engineering, licensing and industrial
      operations, working across Rotterdam, Chicago and Tokyo.</p></div></section> <section class="section-tight"><div class="wrap">`);
    if (team.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><p><strong>The team list is unavailable.</strong></p> <p>We could not read it just now. Write to us and we will introduce you directly.</p> <a class="btn btn-secondary" href="/contact">Get in Touch</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="grid grid-4" data-testid="team-grid"><!--[-->`);
      const each_array = ensure_array_like(team);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let m = each_array[$$index];
        $$renderer2.push(`<article class="member svelte-1cobqru">`);
        Plate($$renderer2, {
          seed: m.slug,
          kind: "portrait",
          height: "190px",
          label: `Generated portrait plate for ${m.name}`
        });
        $$renderer2.push(`<!----> <h2 class="svelte-1cobqru">${escape_html(m.name)}</h2> <p class="small muted svelte-1cobqru">${escape_html(m.role_title)}</p> <div class="member-actions svelte-1cobqru"><button class="btn btn-secondary btn-sm" type="button"${attr("data-testid", `bio-${m.slug}`)}>View bio<span class="sr-only">for ${escape_html(m.name)}</span></button> <a class="small"${attr("href", m.profile_url)} rel="noreferrer noopener nofollow">Profile<span class="sr-only">for ${escape_html(m.name)}</span></a></div></article>`);
      }
      $$renderer2.push(`<!--]--></div> <p class="small muted">The portraits are generated plates rather than photographs, and the names are stand-ins.</p>`);
    }
    $$renderer2.push(`<!--]--></div></section> `);
    Modal($$renderer2, {
      open: !!bio,
      title: bio ? `${bio.name}, ${bio.role_title}` : "",
      labelledBy: "bio-title",
      onClose: () => bio = null,
      children: ($$renderer3) => {
        if (bio) {
          $$renderer3.push("<!--[0-->");
          Plate($$renderer3, {
            seed: bio.slug,
            kind: "portrait",
            height: "170px",
            label: `Generated portrait plate for ${bio.name}`
          });
          $$renderer3.push(`<!----> <p>${escape_html(bio.bio)}</p> <p><a${attr("href", bio.profile_url)} rel="noreferrer noopener nofollow" data-autofocus="">Professional profile</a></p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data });
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-CBCT-XbY.js.map
