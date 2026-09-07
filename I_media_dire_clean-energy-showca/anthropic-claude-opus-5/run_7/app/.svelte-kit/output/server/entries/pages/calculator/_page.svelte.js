import { h as head, c as attr, e as escape_html } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let needError;
    let need = "251";
    let kind = "thermal";
    let busy = false;
    needError = "";
    head("1xmkimt", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Energy calculator, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Calculator</p> <h1>How many modules does your site need?</h1> <p class="lede">One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs
      8000 hours a year. Each GWh delivered avoids 450 tonnes of carbon. Modules round up, and the
      energy figure follows the modules built rather than the need you asked for.</p></div></section> <section class="section-tight"><div class="wrap calc svelte-1xmkimt"><form novalidate="">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="field"><label for="need">Site need, in megawatts</label> <input id="need" type="number" min="1" step="any"${attr("value", need)}${attr("aria-invalid", !!needError)} data-testid="need"/> `);
    if (needError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(needError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="kind">Output kind</label> `);
    $$renderer2.select({ id: "kind", value: kind, "data-testid": "kind" }, ($$renderer3) => {
      $$renderer3.option({ value: "thermal" }, ($$renderer4) => {
        $$renderer4.push(`Thermal, 250 MW a module`);
      });
      $$renderer3.option({ value: "electrical" }, ($$renderer4) => {
        $$renderer4.push(`Electrical, 100 MW a module`);
      });
    });
    $$renderer2.push(`</div> <button class="btn" type="submit"${attr("disabled", busy, true)} data-testid="calculate">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Calculate</button></form> <div class="results" aria-live="polite">`);
    {
      $$renderer2.push(`<!--[-1--><div class="empty"><p><strong>No figures yet.</strong></p> <p>Enter a need in megawatts and choose thermal or electrical, then calculate.</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="section-tight section-warm"><div class="wrap"><h2>Worked rows</h2> <table class="data"><caption class="sr-only">Worked examples of the calculator arithmetic</caption><thead><tr><th scope="col">Need</th><th scope="col">Kind</th><th scope="col">Modules</th><th scope="col">GWh a year</th><th scope="col">Tonnes avoided</th></tr></thead><tbody><tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr><tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr><tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr><tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr></tbody></table></div></section>`);
  });
}
export {
  _page as default
};
