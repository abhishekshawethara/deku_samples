import { ae as head, a7 as ensure_array_like, a8 as attr, a9 as escape_html } from '../../../chunks/index.js-D2EWZzu8.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';

function _page($$renderer) {
  const OUTPUTS = [
    [
      "heat",
      "Heat",
      "Straight into the steam header a plant already runs."
    ],
    [
      "heat-and-power",
      "Heat and power",
      "Both duties from one plant, split to follow the site."
    ],
    [
      "hydrogen",
      "Hydrogen",
      "High temperature electrolysis, cheaper per kilogram because heat does part of the work."
    ],
    [
      "electricity",
      "Electricity",
      "Firm carbon free power behind the meter, flat profile, no grid queue."
    ]
  ];
  head("1q8myiy", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Our Edge, Zettajoule</title>`);
    });
  });
  $$renderer.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Our Edge</p> <h1>Not a concept. A machine that already ran.</h1> <p class="lede">Most advanced reactor companies are asking a regulator and a customer to believe a drawing.
      Ours is a modernised version of a high-temperature gas-cooled reactor that has been operating
      since the late 1990s, which is a completely different conversation.</p></div></section> <section class="section-tight"><div class="wrap grid grid-2"><div class="card"><h2>Proven, then modernised</h2> <p class="small">The physics, the fuel and the coolant have an operating record behind them. We modernised
        the plant around them: factory build, digital twin, modular deployment. A regulator reviewing
        this is checking a modernisation against data, not adjudicating a claim.</p></div> <div class="card"><h2>Hotter than the fleet</h2> <p class="small">A pressurised water reactor leaves its core near 300 degrees Celsius. Ours leaves at 750.
        That difference is not incremental: it is the line between making electricity and making
        steel, ammonia, refined product and hydrogen.</p></div> <div class="card"><h2>One module or several</h2> <p class="small">A remote mine takes one. A steel mill takes eight. The same module, repeated, so a site
        scales by adding rather than by starting again, and the factory gets better at building it
        every time.</p></div> <div class="card"><h2>You buy energy, not a reactor</h2> <p class="small">We own the plant, we run it and we staff it from our own Operations Academy. The customer
        signs an energy supply agreement. No nuclear licence, no fuel procurement, no operators to
        hire, no decommissioning liability.</p></div></div></section> <section class="section-tight section-warm"><div class="wrap"><h2>Temperature is the whole argument</h2> <div class="scale svelte-1q8myiy" role="img" aria-label="Temperature scale: water-cooled reactors reach about 300 degrees Celsius, this reactor reaches 750 degrees Celsius, which covers district heat, desalination, refining, chemicals and hydrogen"><div class="track svelte-1q8myiy"><div class="span pwr svelte-1q8myiy"><span>Water-cooled, to about 300 C</span></div> <div class="span zj svelte-1q8myiy"><span>Zettajoule, to 750 C</span></div></div> <ul class="ticks svelte-1q8myiy"><li class="svelte-1q8myiy">0 C</li><li class="svelte-1q8myiy">250 C</li><li class="svelte-1q8myiy">550 C</li><li class="svelte-1q8myiy">750 C</li></ul></div> <p class="small muted">Below 250 degrees sits district heat and desalination. Between 250 and 550 sits refining and
      much of chemicals. Above 550 sits hydrogen and the hardest chemical duties. A water-cooled
      plant reaches the first band only.</p></div></section> <section class="section-tight"><div class="wrap"><h2>The four outputs</h2> <div class="grid grid-4"><!--[-->`);
  const each_array = ensure_array_like(OUTPUTS);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [kind, label, note] = each_array[$$index];
    $$renderer.push(`<a class="output svelte-1q8myiy"${attr("href", `/solutions?output_kind=${encodeURIComponent(kind)}`)}><span class="olabel svelte-1q8myiy">${escape_html(label)}</span> <span class="small muted">${escape_html(note)}</span></a>`);
  }
  $$renderer.push(`<!--]--></div></div></section>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-De-1gquk.js.map
