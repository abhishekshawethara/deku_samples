import { h as head, c as attr, e as escape_html, i as ensure_array_like } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let nameError, emailError, messageError;
    const TOPICS = [
      "Technology",
      "Solutions",
      "Investor relations",
      "Careers",
      "Suppliers"
    ];
    const COUNTRIES = [
      ["+31", "Netherlands +31"],
      ["+1", "United States +1"],
      ["+81", "Japan +81"],
      ["+44", "United Kingdom +44"],
      ["+49", "Germany +49"],
      ["+33", "France +33"],
      ["+971", "United Arab Emirates +971"],
      ["+61", "Australia +61"]
    ];
    let form = {
      name: "",
      email: "",
      phone_country: "+31",
      phone: "",
      topic: "Technology",
      message: ""
    };
    let touched = {};
    let busy = false;
    let offices = [];
    nameError = touched.name && !form.name.trim() ? "Tell us who you are." : "";
    emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "Enter an email address in the form name@example.com. The acknowledgement goes there." : "";
    messageError = touched.message && !form.message.trim() ? "Write us a message." : "";
    form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.message.trim() && TOPICS.includes(form.topic);
    head("1bv7ezn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Contact, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Contact</p> <h1>Get in Touch</h1> <p class="lede">This form is for careers, investor and supplier enquiries as well as technical questions. You
      get a reference back on the page and an acknowledgement carrying it in your inbox.</p></div></section> <section class="section-tight"><div class="wrap contact svelte-1bv7ezn"><div>`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form novalidate="" class="svelte-1bv7ezn"><div class="field"><label for="c-name">Your name</label> <input id="c-name" type="text" autocomplete="name"${attr("value", form.name)}${attr("aria-invalid", !!nameError)} data-testid="name"/> `);
    if (nameError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(nameError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="field"><label for="c-email">Email</label> <input id="c-email" type="email" autocomplete="email"${attr("value", form.email)}${attr("aria-invalid", !!emailError)} data-testid="email"/> `);
    if (emailError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(emailError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="phone svelte-1bv7ezn"><div class="field"><label for="c-country">Country code</label> `);
    $$renderer2.select(
      {
        id: "c-country",
        value: form.phone_country,
        "data-testid": "phone_country"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(COUNTRIES);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let [code, label] = each_array[$$index];
          $$renderer3.option({ value: code }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="field"><label for="c-phone">Phone, optional</label> <input id="c-phone" type="tel" autocomplete="tel"${attr("value", form.phone)} data-testid="phone"/></div></div> <div class="field"><label for="c-topic">Topic</label> `);
    $$renderer2.select({ id: "c-topic", value: form.topic, "data-testid": "topic" }, ($$renderer3) => {
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
    $$renderer2.push(`</div> <div class="field"><label for="c-message">Message</label> <textarea id="c-message"${attr("aria-invalid", !!messageError)} data-testid="message">`);
    const $$body = escape_html(form.message);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> `);
    if (messageError) {
      $$renderer2.push(`<!--[0--><p class="field-error">${escape_html(messageError)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="btn" type="submit"${attr("disabled", busy, true)} data-testid="send">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> Send enquiry</button></form></div> <aside><h2>Offices</h2> `);
    if (offices.length === 0) {
      $$renderer2.push(`<!--[0--><p class="muted small">Office list unavailable right now. The form still works.</p>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="offices svelte-1bv7ezn"><!--[-->`);
      const each_array_2 = ensure_array_like(offices);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let o = each_array_2[$$index_2];
        $$renderer2.push(`<li class="svelte-1bv7ezn"><strong>${escape_html(o.city)}</strong> <span class="small muted">${escape_html(o.country)}, ${escape_html(o.role_label)}</span></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--> <h2>What happens next</h2> <p class="small muted">Every enquiry gets a reference of the form ENQ- and eight characters, is stored as received,
        and is answered by a person at the address you gave us. You can close your own enquiry from
        your account at any time.</p></aside></div></section>`);
  });
}
export {
  _page as default
};
