import { ag as element, ab as ensure_array_like, a8 as attr_style, a7 as escape_html, ac as attr, aa as attr_class, ah as stringify, R as derived } from './index.js-CnICPAax.js';
import './scroll.js-XFfYl84w.js';

function Reveal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { text = "", as = "h2", class: klass = "", id = void 0 } = $$props;
    const lines = derived(() => String(text).split("\n"));
    element(
      $$renderer2,
      as,
      () => {
        $$renderer2.push(`${attr("id", id)}${attr_class(`reveal ${stringify(klass)}`, "svelte-o8agj6")}`);
      },
      () => {
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(lines());
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let line = each_array[i];
          $$renderer2.push(`<span class="reveal__mask svelte-o8agj6"><span class="reveal__line svelte-o8agj6"${attr_style("", { "--i": i })}>${escape_html(line)}</span></span>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
    );
  });
}

export { Reveal as R };
//# sourceMappingURL=Reveal.js-Bfh9vo4k.js.map
