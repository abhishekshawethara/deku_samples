import { ag as ssr_context, f as fallback, c as attr, e as escape_html, j as slot, g as bind_props } from "./index.js";
import "clsx";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
async function tick() {
}
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let open = fallback($$props["open"], false);
    let title = fallback($$props["title"], "");
    let onClose = fallback($$props["onClose"], () => {
    });
    let labelledBy = fallback($$props["labelledBy"], "zj-modal-title");
    let panel;
    let opener = null;
    async function focusFirst() {
      await tick();
      return;
    }
    function close() {
      const back = opener;
      opener = null;
      onClose();
      if (back && typeof back.focus === "function") setTimeout(() => back.focus(), 0);
    }
    function onKeydown(e) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" && panel) ;
    }
    onDestroy(() => {
      if (typeof document !== "undefined") document.removeEventListener("keydown", onKeydown);
    });
    if (open) {
      if (typeof document !== "undefined" && !opener) opener = document.activeElement;
      focusFirst();
    }
    if (open) {
      $$renderer2.push(`<!--[0--><div class="scrim svelte-ta60gp" role="presentation"></div> <div class="shell svelte-ta60gp" role="dialog" aria-modal="true"${attr("aria-labelledby", labelledBy)} tabindex="-1"><div class="head svelte-ta60gp"><h2${attr("id", labelledBy)} class="svelte-ta60gp">${escape_html(title)}</h2> <button type="button" class="x svelte-ta60gp" aria-label="Close this dialog"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2"></path></svg> <span class="sr-only">Close</span></button></div> <div class="body svelte-ta60gp"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open, title, onClose, labelledBy });
  });
}
export {
  Modal as M
};
