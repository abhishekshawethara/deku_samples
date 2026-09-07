import { h as head, f as ensure_array_like, e as escape_html } from "../../../chunks/index.js";
import { E as EnquiryForm } from "../../../chunks/EnquiryForm.js";
import { P as Plate } from "../../../chunks/Plate.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("1bv7ezn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Contact · Zettajoule</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Careers, investor and supplier enquiries. Every one gets a reference."/>`);
    });
    $$renderer2.push(`<section class="head svelte-1bv7ezn"><div class="wrap"><p class="eyebrow">Contact</p> <h1>Get in Touch</h1> <p class="lede">This form is for careers, investor and supplier enquiries, and for anything about the
			technology or a site you are sizing. Every enquiry comes back with a reference, and an
			acknowledgement carrying it reaches your inbox.</p></div></section> <section class="wrap contact svelte-1bv7ezn"><div class="contact__form card card--pad"><h2>Send an enquiry</h2> `);
    EnquiryForm($$renderer2, { topic: "Technology" });
    $$renderer2.push(`<!----></div> <aside class="contact__aside"><h2>Where we are</h2> <ul class="offices svelte-1bv7ezn"><!--[-->`);
    const each_array = ensure_array_like(data.offices);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let o = each_array[$$index];
      $$renderer2.push(`<li class="office svelte-1bv7ezn">`);
      Plate($$renderer2, { seed: o.city, ratio: "16 / 7" });
      $$renderer2.push(`<!----> <h3 class="svelte-1bv7ezn">${escape_html(o.city)}</h3> <p class="muted svelte-1bv7ezn">${escape_html(o.country)} · ${escape_html(o.role_label)}</p></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <div class="card"><h3>Looking for something else?</h3> <p class="muted">The <a href="/faq">common questions</a> cover the technology and how a deployment works, and
				the <a href="/calculator">calculator</a> will size a site before you write to us.</p></div></aside></section>`);
  });
}
export {
  _page as default
};
