import { h as head, a as attr, f as ensure_array_like, e as escape_html } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import "../../../chunks/auth.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let need = "251";
    let kind = "thermal";
    let busy = false;
    head("1xmkimt", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Calculator · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1xmkimt"><div class="wrap"><p class="eyebrow">Calculator</p> <h1>Size a site</h1> <p class="lede">Give a need in megawatts and what you want out of it. Modules round up to a whole module, and
			the energy figure follows the modules built rather than the need asked for.</p></div></section> <section class="wrap calc svelte-1xmkimt"><form class="calc__form card card--pad svelte-1xmkimt" novalidate="">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="field"><label for="need">Need in megawatts</label> <input id="need" name="need_mw" type="number" min="1" step="1"${attr("value", need)} aria-describedby="need-hint"/> <p class="field__hint" id="need-hint">A need of zero or less is not valid.</p></div> <fieldset class="field kinds svelte-1xmkimt"><legend class="svelte-1xmkimt">What you want out</legend> <!--[-->`);
    const each_array = ensure_array_like([
      ["thermal", "Thermal, 250 MW a module"],
      ["electrical", "Electrical, 100 MW a module"]
    ]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [value, label] = each_array[$$index];
      $$renderer2.push(`<label class="kind svelte-1xmkimt"><input type="radio" name="kind"${attr("value", value)}${attr("checked", kind === value, true)} class="svelte-1xmkimt"/> <span>${escape_html(label)}</span></label>`);
    }
    $$renderer2.push(`<!--]--></fieldset> <button class="btn btn--block" type="submit"${attr("disabled", busy, true)}>`);
    {
      $$renderer2.push(`<!--[-1-->Calculate`);
    }
    $$renderer2.push(`<!--]--></button></form> <div class="calc__out">`);
    {
      $$renderer2.push(`<!--[-1--><div class="empty-state"><h2>No figures yet</h2> <p>Enter a need in megawatts and press Calculate to see the three figures.</p></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="worked svelte-1xmkimt"><h2>The arithmetic</h2> <table class="data"><thead><tr><th scope="col">Need</th><th scope="col">Kind</th><th scope="col">Modules</th><th scope="col">GWh</th><th scope="col">Tonnes</th></tr></thead><tbody><tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr><tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr><tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr><tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr></tbody></table> <p class="muted small svelte-1xmkimt">One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs
				8000 hours a year.</p></div></div></section>`);
  });
}
export {
  _page as default
};
