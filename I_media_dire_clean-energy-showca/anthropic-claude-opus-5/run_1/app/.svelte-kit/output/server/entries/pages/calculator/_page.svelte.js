import { h as head, e as escape_html, a as attr, g as ensure_array_like } from "../../../chunks/index.js";
import "../../../chunks/api.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let need = "250";
    let kind = "thermal";
    let busy = false;
    head("1xmkimt", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Calculator, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1xmkimt"><div class="wrap"><p class="eyebrow">Calculator</p> <h1>${escape_html(data.copy.lede?.heading || "Size your site")}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="section"><div class="wrap calc-grid svelte-1xmkimt"><form novalidate="" class="svelte-1xmkimt"><div class="field"><label for="need">Your need in megawatts</label> <input id="need" type="number" inputmode="decimal" step="any" min="0.0001"${attr("value", need)}${attr("aria-invalid", "false")}${attr("aria-describedby", "need-hint")} data-testid="need-input"/> `);
    {
      $$renderer2.push(`<!--[-1--><p class="field-hint" id="need-hint">A module gives 250 MW thermal, or 100 MW electrical at 40 percent conversion.</p>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><span class="field-label" id="kind-label">Output kind</span> <div class="radios svelte-1xmkimt" role="radiogroup" aria-labelledby="kind-label"><!--[-->`);
    const each_array = ensure_array_like([
      { v: "thermal", l: "Thermal" },
      { v: "electrical", l: "Electrical" }
    ]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let k = each_array[$$index];
      $$renderer2.push(`<label class="radio svelte-1xmkimt"><input type="radio" name="kind"${attr("value", k.v)}${attr("checked", kind === k.v, true)} class="svelte-1xmkimt"/> <span>${escape_html(k.l)}</span></label>`);
    }
    $$renderer2.push(`<!--]--></div></div> <button class="btn btn-primary" type="submit"${attr("disabled", busy, true)} data-testid="calc-submit">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> ${escape_html("Calculate")}</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></form> <div class="out svelte-1xmkimt">`);
    {
      $$renderer2.push(`<!--[-1--><div class="empty"><h3>No figures yet</h3> <p>Enter a need above and calculate. Try 251 MW thermal, which needs two modules and
						delivers 4000 GWh a year.</p></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="worked-scroll svelte-1xmkimt"><table class="data worked svelte-1xmkimt"><caption class="svelte-1xmkimt">Worked rows</caption><thead><tr><th scope="col">Need</th><th scope="col">Kind</th><th scope="col">Modules</th><th scope="col">GWh</th><th scope="col">Tonnes CO2</th></tr></thead><tbody><tr><td>250 MW</td><td>thermal</td><td>1</td><td>2000</td><td>900000</td></tr><tr><td>251 MW</td><td>thermal</td><td>2</td><td>4000</td><td>1800000</td></tr><tr><td>100 MW</td><td>electrical</td><td>1</td><td>800</td><td>360000</td></tr><tr><td>260 MW</td><td>electrical</td><td>3</td><td>2400</td><td>1080000</td></tr></tbody></table></div></div></div></section>`);
  });
}
export {
  _page as default
};
