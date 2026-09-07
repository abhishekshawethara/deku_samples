import { ae as head, a7 as ensure_array_like, a8 as attr, a9 as escape_html, ad as bind_props } from '../../../chunks/index.js-D2EWZzu8.js';
import { P as Plate } from '../../../chunks/Plate.js-BhKHJ0mJ.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let offices;
    let data = $$props["data"];
    offices = data.offices ?? [];
    head("3id43s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Company, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Company</p> <h1 class="opening svelte-3id43s">clean heat and electricity to power a world of industrial applications</h1></div></section> <section class="section-tight"><div class="wrap grid grid-3"><div class="card"><h2>The vision</h2> <p class="small">A world where industry runs on clean, firm, high-temperature energy, because the alternative
        is a decarbonisation plan that quietly leaves out a quarter of all energy use.</p></div> <div class="card"><h2>The mission</h2> <p class="small">To provide clean, reliable heat and power at the temperatures industry actually needs, on
        contracts that make the decision an energy purchase rather than a nuclear project.</p></div> <div class="card"><h2>The name</h2> <p class="small">A zettajoule is a thousand exajoules. The world uses around six hundred exajoules of primary
        energy a year, and the growth of the next few decades makes zettajoules the honest unit for
        the need. The name is built from the units of the energy the world will need.</p></div></div></section> <section class="section-tight section-warm"><div class="wrap story svelte-3id43s"><div><h2>Where this came from</h2> <p>Zettajoule started in Rotterdam with a simple observation: industrial heat is the largest
        piece of the energy system that nobody has a clean answer for, and there is already a
        reactor design that reaches those temperatures and has been running since the late 1990s.
        The work was never to invent a reactor. It was to modernise one that already worked, put it
        in a factory, and sell what comes out of it.</p> <p>That decision shapes the company more than anything else on this site. Because we sell the
        energy, we carry the licence, the fuel, the operations and the risk that a customer would
        otherwise have to learn to carry.</p></div> `);
    Plate($$renderer2, {
      seed: "company-story",
      height: "230px",
      label: "Generated plate for the company story"
    });
    $$renderer2.push(`<!----></div></section> <section class="section-tight"><div class="wrap"><h2>Where we are</h2> `);
    if (offices.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><p><strong>Office list unavailable.</strong></p> <p>We could not read the offices just now. Write to us and we will point you at the nearest.</p> <a class="btn btn-secondary" href="/contact">Get in Touch</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="grid grid-3" data-testid="office-list"><!--[-->`);
      const each_array = ensure_array_like(offices);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let o = each_array[$$index];
        $$renderer2.push(`<div class="office svelte-3id43s"><svg viewBox="0 0 60 44" class="pinmark svelte-3id43s" role="img"${attr("aria-label", `Mark for the ${o.city} office`)}><g fill="none" stroke="var(--navy)" stroke-width="1.4"><rect x="6" y="14" width="20" height="28"></rect><rect x="30" y="4" width="24" height="38"></rect><path d="M10 20 h12 M10 27 h12 M10 34 h12 M34 10 h16 M34 18 h16 M34 26 h16 M34 34 h16" stroke="var(--rule-strong)"></path></g></svg> <h3 class="svelte-3id43s">${escape_html(o.city)}</h3> <p class="small muted svelte-3id43s">${escape_html(o.country)}</p> <span class="pill">${escape_html(o.role_label)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section-tight section-sky"><div class="wrap wrap-narrow"><h2>We do not only build the reactor.</h2> <p>We own it, we run it and we staff it. The customer buys heat, hydrogen or electricity against
      a long term energy supply agreement and never holds a nuclear licence, never procures fuel and
      never hires a reactor operator. Our own Operations Academy trains the people who run the
      plants, which is why the model scales at all.</p> <a class="btn" href="/edge">See why that matters</a></div></section>`);
    bind_props($$props, { data });
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-DOsl4F--.js.map
