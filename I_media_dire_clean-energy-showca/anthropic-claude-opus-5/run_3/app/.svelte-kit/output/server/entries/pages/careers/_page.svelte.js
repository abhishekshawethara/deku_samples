import { h as head, f as ensure_array_like, e as escape_html, s as store_get, a as attr, u as unsubscribe_stores, g as derived } from "../../../chunks/index.js";
import { R as Reveal } from "../../../chunks/Reveal.js";
import { P as Plate } from "../../../chunks/Plate.js";
import { M as Modal } from "../../../chunks/Modal.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { t as token } from "../../../chunks/auth.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    let openJob = null;
    let form = { name: "", email: "", note: "" };
    let touched = {};
    let busy = false;
    const errors = derived(() => ({
      name: form.name.trim() ? "" : "Tell us your name.",
      email: !form.email.trim() ? "We need an email to reply to." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "" : "That does not look like an email address.",
      note: form.note.trim().length >= 10 ? "" : "Write at least 10 characters: the note is the whole application."
    }));
    head("1thlcsk", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Careers · Zettajoule</title>`);
      });
    });
    $$renderer2.push(`<section class="head svelte-1thlcsk"><div class="wrap"><p class="eyebrow">Careers</p> `);
    Reveal($$renderer2, {
      as: "h1",
      text: "help us build what's next in nuclear energy"
    });
    $$renderer2.push(`<!----> <p class="lede">We try to do right by our partners, the planet and the people who work here, in that order on
			the hard days and all at once on the good ones.</p></div></section> <section class="section wrap grid grid--2"><div><h2>The culture</h2> <p>We are a small company doing something that has been done before, deliberately. That shapes
			how we work: evidence over enthusiasm, an operating record over a projection, and a written
			argument that a regulator could follow over a diagram that only makes sense out loud.</p> <p>The people here have built offshore wind, run nuclear and process plant, assessed submissions
			from inside a regulator and taught operators their trade. Nobody is precious about their
			discipline, because a licensing decision is an engineering decision and an engineering
			decision is a schedule decision.</p></div> `);
    Plate($$renderer2, {
      seed: "careers-culture",
      ratio: "4 / 3",
      label: "Generated plate: working at Zettajoule"
    });
    $$renderer2.push(`<!----></section> <section class="section wrap" id="jobs"><h2>Open roles</h2> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (data.jobs.length === 0) {
      $$renderer2.push(`<!--[0--><div class="empty-state"><p><strong>No open roles right now.</strong> Nothing is being advertised today.</p> <a class="btn" href="/contact">Write to us anyway</a></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><ul class="jobs svelte-1thlcsk"><!--[-->`);
      const each_array = ensure_array_like(data.jobs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let job = each_array[$$index];
        $$renderer2.push(`<li class="job svelte-1thlcsk"><div class="job__head svelte-1thlcsk"><div><h3 class="svelte-1thlcsk">${escape_html(job.title)}</h3> <p class="job__meta svelte-1thlcsk">${escape_html(job.location)} · ${escape_html(job.team)}</p></div> <button class="btn btn--sm" type="button">Apply<span class="visually-hidden">for ${escape_html(job.title)}</span></button></div> <p class="job__desc svelte-1thlcsk">${escape_html(job.description)}</p></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="section academy svelte-1thlcsk"><div class="wrap grid grid--2"><div><p class="eyebrow">Operations Academy</p> <h2>How we staff what we run</h2> <p>Because Zettajoule owns and operates every module it sells energy from, it has to supply the
				operators too. The Operations Academy is that answer: an eighteen month programme taking
				experienced process and power operators to licensed high-temperature reactor operators,
				through reactor physics, helium systems, the digital twin and simulator time.</p> <p>The first cohort of twenty four started at the Rotterdam campus, drawn from process
				industry, conventional power and naval propulsion. The intake schedule is a real constraint
				on the deployment schedule, which is why the academy sits at the centre of the company
				rather than at the edge of it.</p></div> `);
    Plate($$renderer2, {
      seed: "operations-academy",
      ratio: "4 / 3",
      label: "Generated plate: the Operations Academy"
    });
    $$renderer2.push(`<!----></div></section> `);
    Modal($$renderer2, {
      open: Boolean(openJob),
      title: openJob ? `Apply: ${openJob.title}` : "",
      onclose: () => openJob = null,
      children: ($$renderer3) => {
        if (openJob) {
          $$renderer3.push(`<!--[0--><p class="muted">${escape_html(openJob.location)} · ${escape_html(openJob.team)}. No file is attached anywhere: the note is the whole
			application.</p> `);
          if (!store_get($$store_subs ??= {}, "$token", token)) {
            $$renderer3.push(`<!--[0--><div class="banner banner--info"><strong>Sign in first</strong> <span>An application belongs to an account, so we can show you where it stands.</span></div> <a class="btn" href="/signin?next=/careers">Sign in</a>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <form novalidate=""><div class="field"><label for="a-name">Name</label> <input id="a-name" type="text"${attr("value", form.name)}${attr("aria-invalid", touched.name && errors().name ? "true" : void 0)}/> `);
            if (touched.name && errors().name) {
              $$renderer3.push(`<!--[0--><p class="field__error">${escape_html(errors().name)}</p>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="field"><label for="a-email">Email</label> <input id="a-email" type="email"${attr("value", form.email)}${attr("aria-invalid", touched.email && errors().email ? "true" : void 0)}/> `);
            if (touched.email && errors().email) {
              $$renderer3.push(`<!--[0--><p class="field__error">${escape_html(errors().email)}</p>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="field"><label for="a-note">Your note</label> <textarea id="a-note"${attr("aria-invalid", touched.note && errors().note ? "true" : void 0)}>`);
            const $$body = escape_html(form.note);
            if ($$body) {
              $$renderer3.push(`${$$body}`);
            }
            $$renderer3.push(`</textarea> `);
            if (touched.note && errors().note) {
              $$renderer3.push(`<!--[0--><p class="field__error">${escape_html(errors().note)}</p>`);
            } else {
              $$renderer3.push(`<!--[-1--><p class="field__hint">Tell us what you have run, built or licensed.</p>`);
            }
            $$renderer3.push(`<!--]--></div> <button class="btn" type="submit"${attr("disabled", busy, true)}>`);
            {
              $$renderer3.push(`<!--[-1-->Submit application`);
            }
            $$renderer3.push(`<!--]--></button></form>`);
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
