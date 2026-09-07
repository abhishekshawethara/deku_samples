import { h as head, e as escape_html } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { M as Modal } from "../../../chunks/Modal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let confirm = null;
    head("8i5vi8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Your account, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Account</p> <h1>${escape_html("Your account")}</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push(`<!--[0--><section class="section-tight"><div class="wrap"><div class="skeleton"><span class="spinner" aria-hidden="true"></span> Loading your lists…</div></div></section>`);
    }
    $$renderer2.push(`<!--]--> `);
    Modal($$renderer2, {
      open: !!confirm,
      title: "Confirm this removal",
      labelledBy: "confirm-title",
      onClose: () => confirm = null,
      children: ($$renderer3) => {
        if (confirm) {
          $$renderer3.push(`<!--[0--><p><strong>${escape_html(confirm.label)}</strong></p> <p class="muted">${escape_html(confirm.detail)}</p> <div class="confirm-actions svelte-8i5vi8"><button class="btn btn-danger" type="button" data-autofocus="">Yes, remove it</button> <button class="btn btn-secondary" type="button">Keep it</button></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
