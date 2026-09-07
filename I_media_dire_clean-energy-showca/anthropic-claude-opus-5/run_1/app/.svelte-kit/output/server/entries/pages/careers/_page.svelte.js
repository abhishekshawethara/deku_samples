import { h as head, e as escape_html, g as ensure_array_like, a as attr, s as store_get, u as unsubscribe_stores, d as derived } from "../../../chunks/index.js";
import { M as Modal } from "../../../chunks/Modal.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
import { P as Plate } from "../../../chunks/Plate.js";
import "../../../chunks/api.js";
import { b as account } from "../../../chunks/session.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    let applying = null;
    let name = "";
    let email = "";
    let note = "";
    let busy = false;
    const nameError = derived(() => "");
    const emailError = derived(() => "");
    const noteError = derived(() => "");
    head("1thlcsk", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Careers, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1thlcsk"><div class="wrap"><h1 class="big svelte-1thlcsk">${escape_html(data.copy.lede?.heading || "help us build what's next in nuclear energy")}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="section"><div class="wrap culture svelte-1thlcsk"><div>`);
    Reveal($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2>${escape_html(data.copy.culture?.heading)}</h2>`);
      }
    });
    $$renderer2.push(`<!----> <p>${escape_html(data.copy.culture?.body)}</p></div> `);
    Plate($$renderer2, { seed: "careers-culture", ratio: "4 / 3", label: "Rotterdam" });
    $$renderer2.push(`<!----></div></section> <section class="section jobs-section svelte-1thlcsk"><div class="wrap"><h2>Open roles</h2> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (data.jobs.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><h3>No roles open right now</h3> <p>Nothing is being advertised today. Write to us and we will keep you in mind.</p> <a class="btn btn-primary btn-sm" href="/contact">Get in Touch</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="jobs svelte-1thlcsk"><!--[-->`);
      const each_array = ensure_array_like(data.jobs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let job = each_array[$$index];
        $$renderer2.push(`<li class="svelte-1thlcsk"><div><h3 class="svelte-1thlcsk">${escape_html(job.title)}</h3> <p class="meta mono svelte-1thlcsk">${escape_html(job.location)} · ${escape_html(job.team)}</p> <p class="muted svelte-1thlcsk">${escape_html(job.description)}</p></div> <button class="btn btn-primary btn-sm" type="button"${attr("data-testid", `apply-${job.slug}`)}>Apply</button></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section academy"><div class="wrap-narrow"><h2>${escape_html(data.copy.academy?.heading || "The Operations Academy")}</h2> <p class="lede">${escape_html(data.copy.academy?.body)}</p></div></section> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<button class="btn btn-quiet" type="button">Cancel</button> <button class="btn btn-primary" type="submit" form="apply-form"${attr("disabled", busy, true)} data-testid="apply-submit">`);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> ${escape_html("Submit application")}</button>`);
      };
      Modal($$renderer2, {
        open: !!applying,
        title: applying ? `Apply: ${applying.title}` : "Apply",
        onclose: () => applying = null,
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<p class="muted">${escape_html(applying?.location)} · ${escape_html(applying?.team)}. There is no attachment: the note is the whole
		application.</p> `);
          if (!store_get($$store_subs ??= {}, "$account", account)) {
            $$renderer3.push(`<!--[0--><p class="banner banner-info">An application belongs to an account. <a href="/signin?next=/careers">Sign in</a> or <a href="/signup?next=/careers">create an account</a> first.</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <form novalidate="" id="apply-form"><div class="field"><label for="a-name">Name</label> <input id="a-name" type="text"${attr("value", name)}${attr("aria-invalid", nameError() ? "true" : "false")} data-testid="apply-name"/> `);
          if (nameError()) {
            $$renderer3.push(`<!--[0--><p class="field-error">${escape_html(nameError())}</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="field"><label for="a-email">Email</label> <input id="a-email" type="email"${attr("value", email)}${attr("aria-invalid", emailError() ? "true" : "false")} data-testid="apply-email"/> `);
          if (emailError()) {
            $$renderer3.push(`<!--[0--><p class="field-error">${escape_html(emailError())}</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="field"><label for="a-note">Your note</label> <textarea id="a-note"${attr("aria-invalid", noteError() ? "true" : "false")} data-testid="apply-note">`);
          const $$body = escape_html(note);
          if ($$body) {
            $$renderer3.push(`${$$body}`);
          }
          $$renderer3.push(`</textarea> `);
          if (noteError()) {
            $$renderer3.push(`<!--[0--><p class="field-error">${escape_html(noteError())}</p>`);
          } else {
            $$renderer3.push(`<!--[-1--><p class="field-hint">What you have built, and why this role.</p>`);
          }
          $$renderer3.push(`<!--]--></div></form>`);
        }
      });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
