import { h as head, e as escape_html, f as ensure_array_like, g as derived, a as attr, d as attr_class } from "../../../../chunks/index.js";
import { P as Plate } from "../../../../chunks/Plate.js";
import { S as SaveButton } from "../../../../chunks/SaveButton.js";
import { M as Modal } from "../../../../chunks/Modal.js";
import { E as EnquiryForm } from "../../../../chunks/EnquiryForm.js";
import "../../../../chunks/saves.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const s = derived(() => data.solution);
    let banner = null;
    let enquiryOpen = false;
    const BLOCKS = derived(() => [
      {
        title: "The module",
        body: `${s().module_count} ${s().module_count === 1 ? "module" : "modules"}, ${s().deployment.replace("-", " ")}, each delivering 250 MW thermal.`
      },
      {
        title: "The heat",
        body: `Helium leaves the core and carries heat out in the ${s().temperature_band} band, which is what this process needs.`
      },
      {
        title: "The output",
        body: `Delivered as ${s().output_kind.replaceAll("-", " ")}, into the plant you already run.`
      },
      {
        title: "The arrangement",
        body: "Zettajoule owns the modules, runs them and staffs them. You buy the energy by the unit."
      }
    ]);
    head("1vo9te1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(s().industry)} · Solutions · Zettajoule</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", s().summary)}/>`);
    });
    $$renderer2.push(`<article class="sol-page"><header class="sol-head svelte-1vo9te1"><div class="wrap"><p class="eyebrow"><a href="/solutions">Solutions</a> / ${escape_html(s().industry)}</p> <h1>${escape_html(s().title)}</h1> <p class="lede">${escape_html(s().summary)}</p> <ul class="chips svelte-1vo9te1"><li class="svelte-1vo9te1">${escape_html(s().output_kind)}</li> <li class="svelte-1vo9te1">${escape_html(s().temperature_band)}</li> <li class="svelte-1vo9te1">${escape_html(s().deployment)}</li> <li class="svelte-1vo9te1">${escape_html(s().module_count)} ${escape_html(s().module_count === 1 ? "module" : "modules")}</li></ul> `);
    if (banner) {
      $$renderer2.push(`<!--[0--><div${attr_class(`banner banner--${banner.kind === "ok" ? "ok" : "fail"}`)} role="status"><strong>${escape_html(banner.kind === "ok" ? "Done" : "Not done")}</strong> <span>${escape_html(banner.text)}</span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="row">`);
    SaveButton($$renderer2, { slug: s().slug, onmessage: (m) => banner = m });
    $$renderer2.push(`<!----> <button class="btn btn--ghost" type="button">Enquire about ${escape_html(s().industry)}</button> <a class="btn btn--ghost" href="/contact">Contact</a></div></div></header> <div class="wrap sol-body svelte-1vo9te1"><div class="sol-body__text"><h2>What the reactor does here</h2> <!--[-->`);
    const each_array = ensure_array_like(s().detail.split("\n\n"));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let para = each_array[$$index];
      $$renderer2.push(`<p>${escape_html(para)}</p>`);
    }
    $$renderer2.push(`<!--]--></div> <aside class="sol-body__plate">`);
    Plate($$renderer2, {
      seed: s().slug,
      ratio: "4 / 3",
      label: `Generated plate for ${s().industry}`
    });
    $$renderer2.push(`<!----> <p class="muted plate-note svelte-1vo9te1">Every plate on this site is drawn from code as a gradient, so it stays sharp at any size and
				nothing has to be downloaded.</p></aside></div> <section class="wrap blocks svelte-1vo9te1" aria-labelledby="blocks-head"><h2 id="blocks-head">Block by block</h2> <ol class="blocks__grid svelte-1vo9te1"><!--[-->`);
    const each_array_1 = ensure_array_like(BLOCKS());
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let b = each_array_1[i];
      $$renderer2.push(`<li class="block svelte-1vo9te1"><svg class="block__dia svelte-1vo9te1" viewBox="0 0 120 70" aria-hidden="true" focusable="false"><rect x="6" y="14" width="42" height="42" rx="4" fill="none" stroke="var(--ink)" stroke-width="1.4"></rect><path d="M48 35 H74" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3"></path><path d="M68 30 L74 35 L68 40" fill="none" stroke="var(--accent)" stroke-width="1.6"></path><rect x="74" y="20" width="40" height="30" rx="4" fill="none" stroke="var(--ink)" stroke-width="1.4"></rect><text x="27" y="39" text-anchor="middle" font-size="13" fill="var(--ink)">${escape_html(i + 1)}</text></svg> <h3 class="svelte-1vo9te1">${escape_html(b.title)}</h3> <p class="svelte-1vo9te1">${escape_html(b.body)}</p></li>`);
    }
    $$renderer2.push(`<!--]--></ol></section> <section class="wrap section--tight"><a class="btn btn--ghost" href="/solutions">Back to the explorer</a> <a class="btn btn--ghost" href="/compare">Compare saved solutions</a> <a class="btn btn--ghost" href="/calculator">Size this site</a></section></article> `);
    Modal($$renderer2, {
      open: enquiryOpen,
      title: `Enquire about ${s().industry}`,
      onclose: () => enquiryOpen = false,
      children: ($$renderer3) => {
        EnquiryForm($$renderer3, {
          topic: "Solutions",
          presetMessage: `I am interested in ${s().industry.toLowerCase()} (${s().title}). `,
          onsent: (enq) => {
            banner = {
              kind: "ok",
              text: `Enquiry sent. Your reference is ${enq.reference}.`
            };
            enquiryOpen = false;
          }
        });
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
