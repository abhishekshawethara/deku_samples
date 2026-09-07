import { a5 as head, a6 as escape_html, aa as attr, a9 as ensure_array_like, P as derived } from '../../../chunks/index.js-DtYBOeIk.js';
import '../../../chunks/exports.js-8HOoaa4e.js';
import '../../../chunks/utils2.js-BQzn9ikS.js';
import '../../../chunks/utils.js-Bzpr6vQU.js';
import '../../../chunks/root.js-DzEA886G.js';
import '../../../chunks/state.svelte.js-DiBp0ONL.js';
import '../../../chunks/api.js-LBSLTNEi.js';
import '../../../chunks/session.js-EMz6Q6iE.js';
import '../../../chunks/index2.js-DXE0eiF0.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const TOPICS = [
      "Technology",
      "Solutions",
      "Investor relations",
      "Careers",
      "Suppliers"
    ];
    const COUNTRIES = [
      { code: "+31", label: "Netherlands +31" },
      { code: "+1", label: "United States +1" },
      { code: "+81", label: "Japan +81" },
      { code: "+44", label: "United Kingdom +44" },
      { code: "+49", label: "Germany +49" },
      { code: "+33", label: "France +33" },
      { code: "+61", label: "Australia +61" },
      { code: "+91", label: "India +91" }
    ];
    let name = "";
    let email = "";
    let phone_country = "+31";
    let phone = "";
    let topic = "Technology";
    let message = "";
    let busy = false;
    const nameError = derived(() => "");
    const emailError = derived(() => "");
    const messageError = derived(() => "");
    head("1bv7ezn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Contact, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1bv7ezn"><div class="wrap"><p class="eyebrow">Contact</p> <h1>${escape_html(data.copy.lede?.heading || "Get in touch")}</h1> <p class="lede">${escape_html(data.copy.lede?.body)}</p></div></section> <section class="section"><div class="wrap contact-grid svelte-1bv7ezn"><div>`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><form novalidate="" data-testid="enquiry-form"><div class="field"><label for="name">Name</label> <input id="name" type="text" autocomplete="name"${attr("value", name)}${attr("aria-invalid", nameError() ? "true" : "false")}${attr("aria-describedby", nameError() ? "name-error" : void 0)} data-testid="enq-name"/> `);
      if (nameError()) {
        $$renderer2.push(`<!--[0--><p class="field-error" id="name-error">${escape_html(nameError())}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="field"><label for="email">Email</label> <input id="email" type="email" autocomplete="email"${attr("value", email)}${attr("aria-invalid", emailError() ? "true" : "false")}${attr("aria-describedby", emailError() ? "email-error" : void 0)} data-testid="enq-email"/> `);
      if (emailError()) {
        $$renderer2.push(`<!--[0--><p class="field-error" id="email-error">${escape_html(emailError())}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="field phone svelte-1bv7ezn"><div><label for="country">Country code</label> `);
      $$renderer2.select(
        {
          id: "country",
          value: phone_country,
          "data-testid": "enq-country"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(COUNTRIES);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let c = each_array[$$index];
            $$renderer3.option({ value: c.code }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(c.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <div><label for="phone">Phone, optional</label> <input id="phone" type="tel" autocomplete="tel"${attr("value", phone)} data-testid="enq-phone"/></div></div> <div class="field"><label for="topic">Topic</label> `);
      $$renderer2.select({ id: "topic", value: topic, "data-testid": "enq-topic" }, ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(TOPICS);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let t = each_array_1[$$index_1];
          $$renderer3.option({ value: t }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(t)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> <div class="field"><label for="message">Message</label> <textarea id="message"${attr("aria-invalid", messageError() ? "true" : "false")}${attr("aria-describedby", messageError() ? "message-error" : "message-hint")} data-testid="enq-message">`);
      const $$body = escape_html(message);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea> `);
      if (messageError()) {
        $$renderer2.push(`<!--[0--><p class="field-error" id="message-error">${escape_html(messageError())}</p>`);
      } else {
        $$renderer2.push(`<!--[-1--><p class="field-hint" id="message-hint">We reply by email, and you get a reference back on this page straight away.</p>`);
      }
      $$renderer2.push(`<!--]--></div> <button class="btn btn-primary" type="submit"${attr("disabled", busy, true)} data-testid="enquiry-submit">`);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> ${escape_html("Send enquiry")}</button></form>`);
    }
    $$renderer2.push(`<!--]--></div> <aside class="svelte-1bv7ezn"><h2 class="svelte-1bv7ezn">Where we are</h2> <ul class="offices svelte-1bv7ezn"><!--[-->`);
    const each_array_2 = ensure_array_like(data.offices);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let o = each_array_2[$$index_2];
      $$renderer2.push(`<li class="svelte-1bv7ezn"><strong>${escape_html(o.city)}</strong> <span class="svelte-1bv7ezn">${escape_html(o.country)}</span> <span class="badge svelte-1bv7ezn">${escape_html(o.role_label)}</span></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <h2 class="mt svelte-1bv7ezn">What happens next</h2> <ol class="steps svelte-1bv7ezn"><li class="svelte-1bv7ezn">You get a reference in place, on this page, straight away.</li> <li class="svelte-1bv7ezn">An acknowledgement carrying that reference arrives in your inbox.</li> <li class="svelte-1bv7ezn">Signed in, the enquiry sits on <a href="/account">your account</a> where you can close it.</li></ol></aside></div></section>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-uM-JVg73.js.map
