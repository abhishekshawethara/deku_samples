import { f as attr_class, a as attr, e as escape_html } from "./index.js";
import "./api.js";
import "./session.js";
function SaveButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { slug, label = "Save", small = false, onsaved } = $$props;
    let busy = false;
    $$renderer2.push(`<div class="save svelte-1f3klnr"><button${attr_class(`btn ${small ? "btn-sm" : ""} ${"btn-primary"}`, "svelte-1f3klnr")} type="button"${attr("disabled", busy, true)}${attr("data-testid", `save-${slug}`)}>`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[-1-->${escape_html(label)}`);
    }
    $$renderer2.push(`<!--]--></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  SaveButton as S
};
