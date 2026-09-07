import { ac as fallback, a6 as attr_class, a8 as attr, a9 as escape_html, ad as bind_props } from './index.js-D2EWZzu8.js';
import './exports.js-8HOoaa4e.js';
import './utils2.js-BQzn9ikS.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-DYTbTUbw.js';
import './state.svelte.js-CqN4U7qs.js';

function SaveButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let slug = $$props["slug"];
    let saved = fallback($$props["saved"], false);
    let saveId = fallback($$props["saveId"], null);
    let small = fallback($$props["small"], false);
    let onChange = fallback($$props["onChange"], () => {
    });
    let busy = false;
    $$renderer2.push(`<div class="save svelte-1f3klnr"><button type="button"${attr_class(`btn ${saved ? "btn-secondary" : ""} ${small ? "btn-sm" : ""}`)}${attr("disabled", busy, true)}${attr("aria-pressed", saved)}${attr("data-testid", `save-${slug}`)}>`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> ${escape_html(saved ? "Saved" : "Save")} <span class="sr-only">${escape_html(saved ? `${slug} is saved. Activate to remove it.` : `Save ${slug}`)}</span></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { slug, saved, saveId, small, onChange });
  });
}

export { SaveButton as S };
//# sourceMappingURL=SaveButton.js-CG0oEF6D.js.map
