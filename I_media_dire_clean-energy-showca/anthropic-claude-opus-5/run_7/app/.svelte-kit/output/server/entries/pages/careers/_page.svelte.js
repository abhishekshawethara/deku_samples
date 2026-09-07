import { h as head, i as ensure_array_like, e as escape_html, c as attr, g as bind_props } from "../../../chunks/index.js";
import { M as Modal } from "../../../chunks/Modal.js";
import { P as Plate } from "../../../chunks/Plate.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let jobs, nameError, emailError, noteError;
    let data = $$props["data"];
    let applying = null;
    let form = { name: "", email: "", note: "" };
    let busy = false;
    let touched = {};
    jobs = data.jobs ?? [];
    nameError = touched.name && !form.name.trim() ? "Tell us your name." : "";
    emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "Enter an email address in the form name@example.com." : "";
    noteError = touched.note && !form.note.trim() ? "The note is the whole application. Write it." : "";
    head("1thlcsk", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Careers, Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="section-tight"><div class="wrap"><p class="eyebrow">Careers</p> <h1>help us build what's next in nuclear energy</h1> <p class="lede">We try to do right by our partners, the planet and the people who work here, in that order
      only when the three agree and in plain conversation when they do not.</p></div></section> <section class="section-tight"><div class="wrap culture svelte-1thlcsk"><div><h2>How it is here</h2> <p>We are a small company doing something that has to be exactly right, so we work slowly on
        the parts that carry a safety case and quickly on everything else. Engineers speak to
        customers. Nobody is protected from the consequences of their own drawing. Claims trace to
        measurements, and when the data does not support the schedule we change the schedule.</p> <p>We are in Rotterdam, Chicago and Tokyo, and we hire people who have run real plants as
        readily as people who have designed them.</p></div> `);
    Plate($$renderer2, {
      seed: "careers-culture",
      height: "220px",
      label: "Generated plate for the workplace"
    });
    $$renderer2.push(`<!----></div></section> <section class="section-tight"><div class="wrap"><h2>Open roles</h2> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (jobs.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty"><p><strong>No roles are open right now.</strong></p> <p>Nothing is advertised at the moment. Write to us and we will keep your note on file.</p> <a class="btn btn-secondary" href="/contact?topic=Careers">Send an enquiry</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="jobs svelte-1thlcsk" data-testid="job-list"><!--[-->`);
      const each_array = ensure_array_like(jobs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let job = each_array[$$index];
        $$renderer2.push(`<li class="job svelte-1thlcsk"><div><h3 class="svelte-1thlcsk">${escape_html(job.title)}</h3> <p class="small muted svelte-1thlcsk">${escape_html(job.location)}, ${escape_html(job.team)}</p> <p class="small svelte-1thlcsk">${escape_html(job.description)}</p></div> <button class="btn" type="button"${attr("data-testid", `apply-${job.slug}`)}>Apply<span class="sr-only">for ${escape_html(job.title)}</span></button></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="section-tight section-sky"><div class="wrap wrap-narrow"><h2>The Operations Academy</h2> <p>Because we own and run the reactors we sell energy from, we have to be able to produce
      operators at the rate we produce modules. The Operations Academy is that answer: eighteen
      months of classroom work, simulator time and secondments to operating plants, taking process
      operators, marine engineers and graduates through to licensed operation. It is why a customer
      never has to hire a nuclear operator.</p></div></section> `);
    Modal($$renderer2, {
      open: !!applying,
      title: applying ? `Apply: ${applying.title}` : "",
      labelledBy: "apply-title",
      onClose: () => applying = null,
      children: ($$renderer3) => {
        if (applying) {
          $$renderer3.push(`<!--[0--><p class="small muted">${escape_html(applying.location)}, ${escape_html(applying.team)}. The note is the whole application; there is no file to
      attach.</p> `);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <form novalidate=""><div class="field"><label for="a-name">Your name</label> <input id="a-name" type="text"${attr("value", form.name)} data-autofocus="" data-testid="apply-name"/> `);
          if (nameError) {
            $$renderer3.push(`<!--[0--><p class="field-error">${escape_html(nameError)}</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="field"><label for="a-email">Email</label> <input id="a-email" type="email"${attr("value", form.email)} data-testid="apply-email"/> `);
          if (emailError) {
            $$renderer3.push(`<!--[0--><p class="field-error">${escape_html(emailError)}</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="field"><label for="a-note">Your note</label> <textarea id="a-note" data-testid="apply-note">`);
          const $$body = escape_html(form.note);
          if ($$body) {
            $$renderer3.push(`${$$body}`);
          }
          $$renderer3.push(`</textarea> `);
          if (noteError) {
            $$renderer3.push(`<!--[0--><p class="field-error">${escape_html(noteError)}</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <button class="btn" type="submit"${attr("disabled", busy, true)} data-testid="apply-submit">`);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> Send application</button></form>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
