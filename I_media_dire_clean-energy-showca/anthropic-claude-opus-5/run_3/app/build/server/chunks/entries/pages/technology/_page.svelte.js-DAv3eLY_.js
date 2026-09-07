import { ae as head, ab as ensure_array_like, a7 as escape_html, a9 as store_get, ac as attr, ad as unsubscribe_stores } from '../../../chunks/index.js-CnICPAax.js';
import { R as Reactor } from '../../../chunks/Reactor.js-l_C6r6jz.js';
import { R as Reveal } from '../../../chunks/Reveal.js-Bfh9vo4k.js';
import { r as reducedMotion } from '../../../chunks/scroll.js-XFfYl84w.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/index2.js-Bm-nwO79.js';

function _page($$renderer) {
  var $$store_subs;
  let activePart = null;
  let spin = 0;
  let explode = 0.55;
  const PARTS = {
    rods: {
      name: "Control rods",
      text: "Six control rods sit in channels through the graphite and are the primary means of holding the reaction where the operator wants it. In the sequence they lift clear first."
    },
    dome: {
      name: "Pressure dome",
      text: "The rounded lid seals the vessel and carries the rod drives through it. It comes off second, which is what exposes the core."
    },
    core: {
      name: "Fuel core",
      text: "A stack of graphite blocks holding TRISO fuel. This is where the heat is made, and where the safety case says it stays."
    },
    vessel: {
      name: "Pressure vessel",
      text: "The steel vessel holds the helium at pressure. It is sized to be built in a factory and shipped whole rather than welded on site."
    },
    loop: {
      name: "Helium loop",
      text: "Helium enters cool, passes through the core and leaves at 750 degrees Celsius, carrying the heat to the customer through a heat exchanger."
    },
    base: {
      name: "Base and support",
      text: "The module sits on a supported base below grade. Modularity is the deployment argument: capacity arrives in module-sized steps."
    }
  };
  const KEY_FACTS = [
    ["Reactor type", "High-temperature gas-cooled reactor"],
    ["Thermal output", "250 MW thermal a module"],
    ["Outlet temperature", "750 degrees Celsius at the outlet"]
  ];
  let $$settled = true;
  let $$inner_renderer;
  function $$render_inner($$renderer2) {
    head("143q2h7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Technology · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-143q2h7"><div class="wrap"><p class="eyebrow">Technology</p> `);
    Reveal($$renderer2, { as: "h1", text: "The machine, part by part" });
    $$renderer2.push(`<!----> <p class="lede">A high-temperature gas-cooled reactor, modernized from one that has been running since the
			late 1990s. Turn it, tap a part, and read what it does.</p></div></section> <section class="wrap facts-strip svelte-143q2h7"><dl class="facts svelte-143q2h7"><!--[-->`);
    const each_array = ensure_array_like(KEY_FACTS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [label, value] = each_array[$$index];
      $$renderer2.push(`<div class="fact svelte-143q2h7"><dt class="svelte-143q2h7">${escape_html(label)}</dt> <dd class="svelte-143q2h7">${escape_html(value)}</dd></div>`);
    }
    $$renderer2.push(`<!--]--></dl></section> <section class="wrap diagram-sec svelte-143q2h7"><div class="diagram svelte-143q2h7">`);
    Reactor($$renderer2, {
      progress: explode,
      still: store_get($$store_subs ??= {}, "$reducedMotion", reducedMotion),
      height: "min(60vh, 480px)",
      interactive: true,
      spin,
      get activePart() {
        return activePart;
      },
      set activePart($$value) {
        activePart = $$value;
        $$settled = false;
      }
    });
    $$renderer2.push(`<!----></div> <div class="controls svelte-143q2h7"><h2>Pick it apart</h2> <div class="field"><label for="explode">Take it apart</label> <input id="explode" type="range" min="0" max="1" step="0.01"${attr("value", explode)} class="svelte-143q2h7"/> <p class="field__hint">Drag to move through the sequence, from whole to drawn.</p></div> <div class="field"><label for="spin">Turn it</label> <input id="spin" type="range" min="-24" max="24" step="1"${attr("value", spin)} class="svelte-143q2h7"/> <p class="field__hint">Turn the diagram to see it from another angle.</p></div> <h3>The parts</h3> <ul class="parts svelte-143q2h7"><!--[-->`);
    const each_array_1 = ensure_array_like(Object.entries(PARTS));
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let [id, part] = each_array_1[$$index_1];
      $$renderer2.push(`<li><button class="btn btn--ghost btn--sm svelte-143q2h7" type="button"${attr("aria-pressed", activePart === id)}>${escape_html(part.name)}</button></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <div class="readout svelte-143q2h7" role="status" aria-live="polite">`);
    if (activePart && PARTS[activePart]) {
      $$renderer2.push(`<!--[0--><h3 class="svelte-143q2h7">${escape_html(PARTS[activePart].name)}</h3> <p class="svelte-143q2h7">${escape_html(PARTS[activePart].text)}</p>`);
    } else {
      $$renderer2.push(`<!--[-1--><p class="muted svelte-143q2h7">Choose a part, on the drawing or in the list, to read what it does.</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="section wrap grid grid--2"><div><h2>The fuel</h2> <p>Uranium arrives as grains a fraction of a millimetre across, each wrapped in layers of carbon
			and silicon carbide. Every one of those shells is a pressure vessel in its own right, and it
			holds its fission products in at temperatures far beyond anything the reactor would reach in
			service. The fuel is its own containment: that is the sentence the whole safety case rests on.</p> <h2>The graphite</h2> <p>The particles are held in a graphite structure that moderates the neutrons and, just as
			importantly, holds an enormous amount of heat. A core with that much thermal mass changes
			temperature slowly, which is what gives the machine hours rather than seconds to respond to
			anything going wrong.</p></div> <div><h2>The helium</h2> <p>Helium is the coolant because it does nothing. It is chemically inert, so it does not corrode
			the metals or attack the graphite it circulates around; it stays a gas at any temperature the
			reactor reaches, so there is no phase change and no water chemistry to manage; and it carries
			heat out at 750 degrees Celsius, which water at practical pressures simply cannot do.</p> <h2>The digital twin</h2> <p>Each module runs alongside a living model of itself, fed by its own instrumentation. The model
			is accurate enough to notice a developing problem before a human would, which turns
			maintenance from a calendar into a response and takes real cost out of operating a fleet.</p></div></section> <section class="section safety svelte-143q2h7"><div class="wrap grid grid--2"><div><p class="eyebrow">The safety case</p> `);
    Reveal($$renderer2, { as: "h2", text: "Built on a reactor\nthat already runs." });
    $$renderer2.push(`<!----> <p>The reference machine has been operating since the late 1990s. That matters more than any
				argument we could make on paper: a regulator assessing measured behaviour from an operating
				reactor is doing a different job from a regulator assessing a projection. The fuel has been
				tested past its service conditions, and decay heat leaves the core by conduction and
				radiation without a pump, an operator or external power.</p></div> <div><p class="eyebrow">Modular</p> `);
    Reveal($$renderer2, { as: "h2", text: "Quick to deploy,\neasy to scale." });
    $$renderer2.push(`<!----> <p>Modules are built in a factory and assembled on site, which is what makes the schedule
				predictable instead of heroic. A site takes what it needs today and adds modules as demand
				grows, without redesigning the installation. One module for a district network or a remote
				mine; eight for a steel works on the hydrogen route.</p> <a class="btn btn--ghost" href="/solutions">See which industries</a></div></div></section>`);
  }
  do {
    $$settled = true;
    $$inner_renderer = $$renderer.copy();
    $$render_inner($$inner_renderer);
  } while (!$$settled);
  $$renderer.subsume($$inner_renderer);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-DAv3eLY_.js.map
