import { a as attr, e as escape_html } from "./index.js";
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      title = "",
      describedby = "",
      onclose,
      children
    } = $$props;
    if (open) {
      $$renderer2.push(`<!--[0--><div class="modal-layer svelte-5awcn0"><button class="modal-scrim svelte-5awcn0" type="button" tabindex="-1"><span class="visually-hidden">Close this dialog</span></button> <div class="modal svelte-5awcn0" role="dialog" aria-modal="true"${attr("aria-label", title)}${attr("aria-describedby", describedby || void 0)} tabindex="-1"><div class="modal__head svelte-5awcn0"><h2 class="modal__title svelte-5awcn0">${escape_html(title)}</h2> <button class="modal__x svelte-5awcn0" type="button"><svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <span class="visually-hidden">Close</span></button></div> <div class="modal__body svelte-5awcn0">`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  Modal as M
};
