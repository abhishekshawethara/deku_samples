import { aa as attr_class, ac as attr, a7 as escape_html, R as derived, a9 as store_get, ad as unsubscribe_stores } from './index.js-CnICPAax.js';
import './exports.js-8HOoaa4e.js';
import './utils2.js-BQzn9ikS.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-GlEKx5p3.js';
import './state.svelte.js-CoYBmM9v.js';
import './auth.js-CRCsruHm.js';
import { b as savedSlugs } from './saves.js-CaRXZihz.js';

function SaveButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { slug, compact = false, onmessage } = $$props;
    let busy = false;
    const saved = derived(() => store_get($$store_subs ??= {}, "$savedSlugs", savedSlugs).has(slug));
    $$renderer2.push(`<button${attr_class(`btn ${compact ? "btn--sm" : ""} ${saved() ? "btn--ghost" : ""}`)} type="button"${attr("data-save-slug", slug)}${attr("data-saved", saved())}${attr("disabled", busy, true)}>`);
    if (saved()) {
      $$renderer2.push(`<!--[1--><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 8.5 L6 12.5 L14 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span>Saved</span>`);
    } else {
      $$renderer2.push(`<!--[-1--><span>Save</span>`);
    }
    $$renderer2.push(`<!--]--> <span class="visually-hidden">${escape_html(saved() ? `Remove ${slug} from saves` : `Save ${slug}`)}</span></button>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { SaveButton as S };
//# sourceMappingURL=SaveButton.js-D5QSOsu8.js.map
