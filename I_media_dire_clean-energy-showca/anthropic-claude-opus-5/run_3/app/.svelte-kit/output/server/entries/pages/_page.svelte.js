import { h as head, e as escape_html, f as ensure_array_like, d as attr_class, a as attr, g as derived, s as store_get, u as unsubscribe_stores } from "../../chunks/index.js";
import { R as Reactor } from "../../chunks/Reactor.js";
import { R as Reveal } from "../../chunks/Reveal.js";
import { P as Plate } from "../../chunks/Plate.js";
import { r as reducedMotion } from "../../chunks/scroll.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    let seqProgress = 0;
    let lowPower = false;
    const still = derived(() => store_get($$store_subs ??= {}, "$reducedMotion", reducedMotion) || lowPower);
    const FACTS = [
      "High-temperature gas-cooled reactor",
      "250 MW thermal a module",
      "750 degrees Celsius at the outlet"
    ];
    const OUTPUTS = [
      {
        label: "Heat",
        kind: "heat",
        note: "Process heat straight into the header."
      },
      {
        label: "Heat and power",
        kind: "heat-and-power",
        note: "Both at once, from one installation."
      },
      {
        label: "Hydrogen",
        kind: "hydrogen",
        note: "High-temperature production at works scale."
      },
      {
        label: "Electricity",
        kind: "electricity",
        note: "Firm power that does not wait for a queue."
      }
    ];
    const STAGES = [
      [
        "Whole",
        "The module stands sealed and metallic, as it ships."
      ],
      [
        "Rods lift",
        "Six control rods pull clear of the graphite channels."
      ],
      [
        "Dome opens",
        "The rounded lid rises off the pressure vessel."
      ],
      ["Core exposed", "A dark column of TRISO fuel is laid bare."],
      [
        "Drawn",
        "The metal resolves into a clean technical drawing."
      ]
    ];
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Zettajoule · Powering the World</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Small high-temperature gas-cooled reactor modules delivering heat, hydrogen and electricity. We own, run and staff them; you buy the energy."/>`);
    });
    $$renderer2.push(`<section class="hero svelte-1uha8ag"><div class="hero__wash svelte-1uha8ag"></div> <div class="wrap hero__inner svelte-1uha8ag"><h1 class="display svelte-1uha8ag">Powering the World</h1> <div class="hero__reactor svelte-1uha8ag">`);
    Reactor($$renderer2, {
      progress: still() ? 0 : Math.min(seqProgress * 1.15, 1),
      still: false,
      height: "min(58vh, 460px)"
    });
    $$renderer2.push(`<!----></div> <p class="hero__promise svelte-1uha8ag">Small modular reactors that deliver clean heat, hydrogen and electricity to industry. We own
			them, run them and staff them; you buy the energy.</p> <div class="row hero__actions svelte-1uha8ag"><a class="btn svelte-1uha8ag" href="/solutions">Explore the solutions</a> <a class="btn btn--ghost svelte-1uha8ag" href="/technology">See the technology</a></div></div> `);
    {
      $$renderer2.push(`<!--[0--><div class="hint svelte-1uha8ag" aria-hidden="true"><svg width="20" height="26" viewBox="0 0 20 26" focusable="false" class="svelte-1uha8ag"><path d="M10 1 V22 M3 15 L10 23 L17 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"></path></svg></div> <p class="visually-hidden svelte-1uha8ag">Scroll to take the reactor apart.</p>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="sequence svelte-1uha8ag" aria-labelledby="seq-head"><div class="wrap sequence__inner svelte-1uha8ag"><div class="sequence__stage svelte-1uha8ag"><div class="sequence__sticky svelte-1uha8ag">`);
    Reactor($$renderer2, {
      progress: seqProgress,
      still: still(),
      height: "min(66vh, 540px)"
    });
    $$renderer2.push(`<!----> <p class="sequence__caption svelte-1uha8ag">`);
    if (still()) {
      $$renderer2.push(`<!--[0-->Reduced motion: the reactor holds one clean frame.`);
    } else {
      $$renderer2.push(`<!--[-1-->Stage ${escape_html(Math.min(STAGES.length, Math.floor(seqProgress * STAGES.length) + 1))} of ${escape_html(STAGES.length)}:
						${escape_html(STAGES[Math.min(STAGES.length - 1, Math.floor(seqProgress * STAGES.length))][0])}`);
    }
    $$renderer2.push(`<!--]--></p></div></div> <div class="sequence__text svelte-1uha8ag">`);
    Reveal($$renderer2, {
      as: "h2",
      id: "seq-head",
      text: "One engineered\nobject, taken apart."
    });
    $$renderer2.push(`<!----> <p class="lede svelte-1uha8ag">Zettajoule builds the reactor in modules, small enough to be made in a factory and shipped
				whole. Scroll and it comes apart; scroll back and it goes together again.</p> <ol class="stages svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(STAGES);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let [name, text] = each_array[i];
      $$renderer2.push(`<li${attr_class("svelte-1uha8ag", void 0, {
        "stages__now": !still() && Math.floor(seqProgress * STAGES.length) === i
      })}><strong class="svelte-1uha8ag">${escape_html(name)}.</strong> ${escape_html(text)}</li>`);
    }
    $$renderer2.push(`<!--]--></ol> <h3 class="svelte-1uha8ag">The three key facts</h3> <ul class="facts svelte-1uha8ag"><!--[-->`);
    const each_array_1 = ensure_array_like(FACTS);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let fact = each_array_1[$$index_1];
      $$renderer2.push(`<li class="svelte-1uha8ag"><span class="facts__dot svelte-1uha8ag" aria-hidden="true"></span>${escape_html(fact)}</li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div></section> <section class="section outputs svelte-1uha8ag" aria-labelledby="outputs-head"><div class="wrap svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">What comes out</p> `);
    Reveal($$renderer2, {
      as: "h2",
      id: "outputs-head",
      text: "Four outputs, one machine"
    });
    $$renderer2.push(`<!----> <p class="lede svelte-1uha8ag">Each output links into the explorer already filtered, so you can see which industries it
			serves.</p> <ul class="outputs__grid svelte-1uha8ag"><!--[-->`);
    const each_array_2 = ensure_array_like(OUTPUTS);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let o = each_array_2[$$index_2];
      $$renderer2.push(`<li class="svelte-1uha8ag"><a class="output svelte-1uha8ag"${attr("href", `/solutions?output_kind=${encodeURIComponent(o.kind)}`)}><span class="output__label svelte-1uha8ag">${escape_html(o.label)}</span> <span class="output__note svelte-1uha8ag">${escape_html(o.note)}</span> <span class="output__go svelte-1uha8ag" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" focusable="false" class="svelte-1uha8ag"><path d="M3 13 L13 3 M6 3 h7 v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"></path></svg></span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section> <section class="section name svelte-1uha8ag"><div class="wrap grid grid--2 svelte-1uha8ag"><div class="svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">The name</p> `);
    Reveal($$renderer2, { as: "h2", text: "A zettajoule is the\nsize of the problem." });
    $$renderer2.push(`<!----> <p class="svelte-1uha8ag">The world uses hundreds of exajoules of primary energy a year, and the demand curve for
				industrial heat and clean electricity bends upward from here, not down. A zettajoule is a
				thousand exajoules: we took the name from the unit the future need is measured in, because
				that is the size of the thing this has to serve.</p> <p class="svelte-1uha8ag">Most of that demand is heat, not electricity, and most of it is hot enough that a
				water-cooled reactor cannot reach it. That is the gap this machine was built for.</p></div> <div class="name__plate svelte-1uha8ag">`);
    Plate($$renderer2, {
      seed: "zettajoule-scale",
      ratio: "4 / 3",
      label: "Generated plate: the scale of future energy demand"
    });
    $$renderer2.push(`<!----></div></div></section> <section class="section industries svelte-1uha8ag" aria-labelledby="ind-head"><div class="wrap svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Who it serves</p> `);
    Reveal($$renderer2, { as: "h2", id: "ind-head", text: "Eight industries" });
    $$renderer2.push(`<!----> <p class="lede svelte-1uha8ag">Each one wants a different temperature and a different output.</p></div> <ul class="rail svelte-1uha8ag"><!--[-->`);
    const each_array_3 = ensure_array_like(data.solutions);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let s = each_array_3[$$index_3];
      $$renderer2.push(`<li class="rail__item svelte-1uha8ag"><a class="ind svelte-1uha8ag"${attr("href", `/solutions/${s.slug}`)}>`);
      Plate($$renderer2, { seed: s.slug, ratio: "16 / 10" });
      $$renderer2.push(`<!----> <span class="ind__industry svelte-1uha8ag">${escape_html(s.industry)}</span> <span class="ind__title svelte-1uha8ag">${escape_html(s.title)}</span> <span class="ind__meta svelte-1uha8ag">${escape_html(s.output_kind)} · ${escape_html(s.temperature_band)} · ${escape_html(s.module_count)} modules</span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <div class="wrap svelte-1uha8ag"><a class="btn btn--ghost svelte-1uha8ag" href="/solutions">Open the explorer</a></div></section> <section class="section tech-preview svelte-1uha8ag"><div class="wrap grid grid--2 svelte-1uha8ag"><div class="tech-preview__art svelte-1uha8ag">`);
    Reactor($$renderer2, { progress: 0.85, still: true, height: "360px" });
    $$renderer2.push(`<!----></div> <div class="svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Technology</p> `);
    Reveal($$renderer2, { as: "h2", text: "Proven metal,\nmodernized." });
    $$renderer2.push(`<!----> <p class="svelte-1uha8ag">The design is a modernized version of a high-temperature gas-cooled reactor that has been
				operating since the late 1990s. Fuel comes as tiny uranium grains wrapped in tough ceramic
				shells that hold together far past anything the reactor sees in service; graphite surrounds
				them; helium carries the heat out and stays chemically calm around everything it touches.</p> <a class="btn btn--ghost svelte-1uha8ag" href="/technology">Pick the reactor apart</a></div></div></section> <section class="heat svelte-1uha8ag"><div class="wrap heat__inner svelte-1uha8ag"><p class="eyebrow heat__eyebrow svelte-1uha8ag">Unmatched heat</p> `);
    Reveal($$renderer2, {
      as: "h2",
      class: "heat__head",
      text: "750 degrees.\nNothing else\ncomes close."
    });
    $$renderer2.push(`<!----> <p class="heat__body svelte-1uha8ag">An ordinary water-cooled reactor tops out around 300 degrees Celsius, which is hot enough to
			make electricity and nothing else. At 750 the machine reaches the chemistry: direct reduction
			of iron, high-temperature electrolysis, cracking, reforming, thermal desalination. The
			temperature is not a specification. It is the whole argument.</p> <div class="heat__scale svelte-1uha8ag" aria-hidden="true"><div class="heat__bar heat__bar--water svelte-1uha8ag"><span class="svelte-1uha8ag">Water-cooled, 300 C</span></div> <div class="heat__bar heat__bar--zj svelte-1uha8ag"><span class="svelte-1uha8ag">Zettajoule, 750 C</span></div></div> <p class="visually-hidden svelte-1uha8ag">A water-cooled reactor delivers about 300 degrees Celsius; a Zettajoule module delivers 750.</p> <a class="btn heat__cta svelte-1uha8ag" href="/edge">Why this is different</a></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
