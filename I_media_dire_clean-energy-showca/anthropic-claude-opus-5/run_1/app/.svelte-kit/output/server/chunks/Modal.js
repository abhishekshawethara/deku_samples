import { a as attr, e as escape_html } from "./index.js";
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, title = "", onclose, children, footer } = $$props;
    let titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;
    if (open) {
      $$renderer2.push(`<!--[0--><div class="scrim svelte-ta60gp"><button class="scrim-hit svelte-ta60gp" type="button" tabindex="-1" aria-hidden="true"></button> <div class="panel svelte-ta60gp" role="dialog" aria-modal="true"${attr("aria-labelledby", titleId)} tabindex="-1"><header class="head svelte-ta60gp"><h2${attr("id", titleId)} class="svelte-ta60gp">${escape_html(title)}</h2> <button class="x svelte-ta60gp" type="button"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path></svg> <span class="visually-hidden">Close</span></button></header> <div class="body svelte-ta60gp">`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div> `);
      if (footer) {
        $$renderer2.push(`<!--[0--><footer class="foot svelte-ta60gp">`);
        footer($$renderer2);
        $$renderer2.push(`<!----></footer>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  Modal as M
};
