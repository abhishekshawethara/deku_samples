import { h as head, f as ensure_array_like, a as attr, e as escape_html } from "../../../chunks/index.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
import { P as Plate } from "../../../chunks/Plate.js";
function _page($$renderer) {
  const OUTPUTS = [
    [
      "Heat",
      "heat",
      "Process heat straight into the header, no combustion at the boundary."
    ],
    [
      "Heat and power",
      "heat-and-power",
      "Both from one installation, for plants that need both."
    ],
    [
      "Hydrogen",
      "hydrogen",
      "High-temperature production, where the heat does part of the work."
    ],
    [
      "Electricity",
      "electricity",
      "Firm power that does not wait for a grid connection queue."
    ]
  ];
  head("1q8myiy", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Our Edge · Zettajoule</title>`);
    });
  });
  $$renderer.push(`<section class="head svelte-1q8myiy"><div class="wrap"><p class="eyebrow">Our Edge</p> `);
  Reveal($$renderer, { as: "h1", text: "Why this one is different" });
  $$renderer.push(`<!----> <p class="lede">Four arguments, and the first one carries most of the weight.</p></div></section> <section class="section wrap grid grid--2"><div><p class="eyebrow">The strong point</p> `);
  Reveal($$renderer, { as: "h2", text: "Not a paper concept.\nA machine that runs." });
  $$renderer.push(`<!----> <p>Most advanced reactor companies are asking a regulator, an investor and a customer to believe
			a design that has never been built. We are asking them to assess a modernized version of a
			high-temperature gas-cooled reactor that has been operating since the late 1990s.</p> <p>That difference is not marketing. It changes what a licensing submission contains: measured
			behaviour from an operating machine instead of a projection from a model. It is why we expect
			to license faster, why the safety case is arguable today, and why a customer signed a fifteen
			year supply agreement off the back of it.</p></div> `);
  Plate($$renderer, {
    seed: "edge-proven",
    ratio: "4 / 3",
    label: "Generated plate: a proven design, modernized"
  });
  $$renderer.push(`<!----></section> <section class="section hotter svelte-1q8myiy"><div class="wrap"><p class="eyebrow">Temperature</p> `);
  Reveal($$renderer, { as: "h2", text: "It runs much hotter" });
  $$renderer.push(`<!----> <p class="lede">An ordinary water-cooled reactor tops out near 300 degrees Celsius. Ours delivers 750, which
			is the difference between making electricity and doing the chemistry.</p> <div class="scale svelte-1q8myiy"><div class="scale__row svelte-1q8myiy"><span class="scale__label">Water-cooled reactor</span> <span class="scale__track svelte-1q8myiy"><span class="scale__fill scale__fill--water svelte-1q8myiy"></span></span> <span class="scale__value svelte-1q8myiy">300 C</span></div> <div class="scale__row svelte-1q8myiy"><span class="scale__label">Zettajoule module</span> <span class="scale__track svelte-1q8myiy"><span class="scale__fill scale__fill--zj svelte-1q8myiy"></span></span> <span class="scale__value svelte-1q8myiy">750 C</span></div></div> <p>Direct reduction of iron, high-temperature electrolysis, cracking, reforming and thermal
			desalination all live above the line a water-cooled reactor can reach. Those jobs are not
			harder for us; they are simply impossible for the alternative.</p></div></section> <section class="section wrap grid grid--2"><div><h2>One module or several</h2> <p>Capacity arrives in module-sized steps. A remote mine, a district heat network or a small
			campus takes one; a refinery or a desalination plant takes two to four; a primary steel works
			on the hydrogen route takes eight. A site starts with what it needs and grows without a
			redesign, because the unit of growth is a whole machine built in a factory.</p></div> <div><h2>We own it, run it and staff it</h2> <p>The customer buys energy, not a reactor, and takes on no nuclear operating obligation. We hold
			the licence, we run the plant and we supply the operators through our own Operations Academy.
			It is a supply agreement of the kind every industrial site already signs, and it puts the risk
			with the party built to carry it.</p></div></section> <section class="section outputs"><div class="wrap"><h2>The four outputs, again</h2> <ul class="outputs__grid svelte-1q8myiy"><!--[-->`);
  const each_array = ensure_array_like(OUTPUTS);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [label, kind, note] = each_array[$$index];
    $$renderer.push(`<li><a class="output svelte-1q8myiy"${attr("href", `/solutions?output_kind=${encodeURIComponent(kind)}`)}><span class="output__label svelte-1q8myiy">${escape_html(label)}</span> <span class="output__note svelte-1q8myiy">${escape_html(note)}</span></a></li>`);
  }
  $$renderer.push(`<!--]--></ul></div></section>`);
}
export {
  _page as default
};
