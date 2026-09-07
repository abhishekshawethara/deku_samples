import { h as head, i as ensure_array_like, e as escape_html, k as attr_style, c as attr } from "../../../chunks/index.js";
import { R as Reactor } from "../../../chunks/Reactor.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const FACTS = [
      "High-temperature gas-cooled reactor",
      "250 MW thermal a module",
      "750 degrees Celsius at the outlet"
    ];
    let turn = 55;
    let progress = 0.62;
    head("143q2h7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Technology, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Technology</p> <h1>Helium at 750 degrees, out of a core that cannot melt.</h1> <ul class="facts svelte-143q2h7"><!--[-->`);
    const each_array = ensure_array_like(FACTS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let f = each_array[$$index];
      $$renderer2.push(`<li class="svelte-143q2h7">${escape_html(f)}</li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section> <section class="section-tight" id="diagram"><div class="wrap diagram-row svelte-143q2h7"><div class="stage svelte-143q2h7"${attr_style(`--turn:${turn - 50}deg`)}>`);
    Reactor($$renderer2, { progress, interactive: true, height: 430, idPrefix: "tech" });
    $$renderer2.push(`<!----></div> <div><h2>Pick the diagram apart</h2> <p class="small muted">Choose a part to read what it does, or turn the drawing with the slider. Everything the
        drawing says is also written out below it.</p> <div class="field"><label for="turn">Turn the diagram</label> <input id="turn" type="range" min="0" max="100"${attr("value", turn)} data-testid="turn" class="svelte-143q2h7"/> <p class="small muted">Rotation ${escape_html(turn - 50)} degrees.</p></div></div></div></section> <section class="section-tight section-warm"><div class="wrap grid grid-3"><div class="card"><h2>The fuel</h2> <p class="small">Tiny grains of uranium, each wrapped in layers of carbon and silicon carbide that act as
        their own pressure vessel. The coatings hold together far above any temperature the reactor
        can reach, so the fission products stay where they are made even with all cooling removed.</p></div> <div class="card"><h2>The graphite</h2> <p class="small">Graphite surrounds the fuel, slows the neutrons and holds an enormous amount of heat. Its
        thermal mass is why the core responds in hours rather than seconds, and why there is time
        for physics to settle an upset without a pump running.</p></div> <div class="card"><h2>The helium</h2> <p class="small">Helium carries the heat out. It is chemically inert, so it corrodes nothing and reacts with
        nothing, it does not change phase at any temperature the plant sees, and it barely activates
        in the neutron flux. It is the reason the outlet can be this hot at all.</p></div></div></section> <section class="section-tight"><div class="wrap two svelte-143q2h7"><div><h2>A living digital copy</h2> <p>Every module has a digital twin fed by its own instrumentation, running the same physics as
        the plant. It spots a drifting bearing or a fouling exchanger before either becomes an
        outage, schedules maintenance against real condition rather than the calendar, and keeps the
        cost of operating a fleet flat as the fleet grows.</p></div> <div><h2>The safety case</h2> <p>Ours is not a paper argument. It rests on a real high-temperature test reactor that has been
        running since the late 1990s, on the operating record that machine has produced, and on fuel
        that has been irradiated and tested to the conditions the case claims. That is the whole
        reason a regulator can move faster on this than on a concept.</p></div> <div><h2>Built in modules</h2> <p>A module is built in a factory and finished on site, so the programme is licensing and site
        works rather than a decade of construction. A site that needs more energy later adds a
        module. The tenth plant is a repeat, not a first of a kind, and cost follows repetition.</p></div> <div><h2>What comes out</h2> <p>Heat, heat and power, hydrogen or electricity, depending on what the site buys. The <a href="/solutions">solutions explorer</a> shows all eight industries we serve and the <a href="/calculator">calculator</a> turns a site need into a module count.</p></div></div></section>`);
  });
}
export {
  _page as default
};
