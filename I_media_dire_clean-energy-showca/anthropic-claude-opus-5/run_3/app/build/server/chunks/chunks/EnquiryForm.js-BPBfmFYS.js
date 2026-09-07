import { a9 as store_get, aa as attr_class, ac as attr, a7 as escape_html, ab as ensure_array_like, ad as unsubscribe_stores, R as derived } from './index.js-CnICPAax.js';
import './exports.js-8HOoaa4e.js';
import './utils2.js-BQzn9ikS.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-GlEKx5p3.js';
import './state.svelte.js-CoYBmM9v.js';
import { a as account } from './auth.js-CRCsruHm.js';

function EnquiryForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let {
      topic = "Technology",
      presetMessage = "",
      onsent,
      compact = false
    } = $$props;
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
      ["+44", "United Kingdom +44"],
      ["+81", "Japan +81"],
      ["+49", "Germany +49"],
      ["+33", "France +33"],
      ["+971", "United Arab Emirates +971"],
      ["+61", "Australia +61"]
    ];
    let form = {
      name: store_get($$store_subs ??= {}, "$account", account)?.display_name || "",
      email: store_get($$store_subs ??= {}, "$account", account)?.email || "",
      phone_country: "+31",
      phone: "",
      topic,
      message: presetMessage
    };
    let touched = {};
    let submitting = false;
    function errorFor(field) {
      const v = String(form[field] || "").trim();
      if (field === "name" && !v) return "Tell us your name.";
      if (field === "email") {
        if (!v) return "We need an email to reply to.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "That does not look like an email address.";
      }
      if (field === "message") {
        if (!v) return "Write us a message.";
        if (v.length < 10) return "A little more detail, please: at least 10 characters.";
      }
      return "";
    }
    const errors = derived(() => ({
      name: errorFor("name"),
      email: errorFor("email"),
      message: errorFor("message")
    }));
    {
      $$renderer2.push(`<!--[-1--><form novalidate=""${attr_class("", void 0, { "compact": compact })}>`);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="two svelte-18pwew2"><div class="field"><label for="e-name">Name</label> <input id="e-name" type="text" autocomplete="name"${attr("value", form.name)}${attr("aria-invalid", touched.name && errors().name ? "true" : void 0)}${attr("aria-describedby", touched.name && errors().name ? "e-name-err" : void 0)}/> `);
      if (touched.name && errors().name) {
        $$renderer2.push(`<!--[0--><p class="field__error" id="e-name-err">${escape_html(errors().name)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="field"><label for="e-email">Email</label> <input id="e-email" type="email" autocomplete="email"${attr("value", form.email)}${attr("aria-invalid", touched.email && errors().email ? "true" : void 0)}${attr("aria-describedby", touched.email && errors().email ? "e-email-err" : void 0)}/> `);
      if (touched.email && errors().email) {
        $$renderer2.push(`<!--[0--><p class="field__error" id="e-email-err">${escape_html(errors().email)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="two svelte-18pwew2"><div class="field"><label for="e-country">Country code</label> `);
      $$renderer2.select({ id: "e-country", value: form.phone_country }, ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(COUNTRIES);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let [code, label] = each_array[$$index];
          $$renderer3.option({ value: code }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> <div class="field"><label for="e-phone">Phone <span class="muted">(optional)</span></label> <input id="e-phone" type="tel" autocomplete="tel"${attr("value", form.phone)}/></div></div> <div class="field"><label for="e-topic">Topic</label> `);
      $$renderer2.select({ id: "e-topic", value: form.topic }, ($$renderer3) => {
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
      $$renderer2.push(`</div> <div class="field"><label for="e-message">Message</label> <textarea id="e-message"${attr("aria-invalid", touched.message && errors().message ? "true" : void 0)}${attr("aria-describedby", touched.message && errors().message ? "e-msg-err" : "e-msg-hint")}>`);
      const $$body = escape_html(form.message);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea> `);
      if (touched.message && errors().message) {
        $$renderer2.push(`<!--[0--><p class="field__error" id="e-msg-err">${escape_html(errors().message)}</p>`);
      } else {
        $$renderer2.push(`<!--[-1--><p class="field__hint" id="e-msg-hint">Tell us about the site, the load and the timing if you know them.</p>`);
      }
      $$renderer2.push(`<!--]--></div> <button class="btn" type="submit"${attr("disabled", submitting, true)}>`);
      {
        $$renderer2.push(`<!--[-1--><span>Send enquiry</span>`);
      }
      $$renderer2.push(`<!--]--></button></form>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { EnquiryForm as E };
//# sourceMappingURL=EnquiryForm.js-BPBfmFYS.js.map
