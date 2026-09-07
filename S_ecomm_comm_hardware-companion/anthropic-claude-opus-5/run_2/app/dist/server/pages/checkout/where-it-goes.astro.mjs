import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$CheckoutSteps, a as $$CheckoutSummary } from '../../chunks/CheckoutSummary_Awe98YC2.mjs';
import { c as cartByToken, r as readCart } from '../../chunks/cart_C--Khl-8.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
/* empty css                                            */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$WhereItGoes = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$WhereItGoes;
  const cart = Astro2.locals.cart;
  if (!cart || cart.lines.length === 0) {
    return Astro2.redirect("/cart", 302);
  }
  let errors = {};
  let values = cart.draft?.shipping_address ?? {};
  let email = cart.draft?.email ?? "";
  let consent = !!cart.draft?.marketing_consent;
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    email = String(form.get("email") ?? "").trim();
    consent = form.get("marketing_consent") === "on";
    values = {
      name: String(form.get("name") ?? "").trim(),
      line1: String(form.get("line1") ?? "").trim(),
      line2: String(form.get("line2") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      region: String(form.get("region") ?? "").trim(),
      postal_code: String(form.get("postal_code") ?? "").trim(),
      country: String(form.get("country") ?? "US").trim().toUpperCase(),
      phone: String(form.get("phone") ?? "").trim()
    };
    if (!email) errors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Email is required.";
    for (const [field, label] of [
      ["name", "Name"],
      ["line1", "Address"],
      ["city", "City"],
      ["region", "Region"],
      ["postal_code", "Postal code"],
      ["country", "Country"]
    ]) {
      if (!values[field]) errors[field] = `${label} is required.`;
    }
    const raw = await cartByToken(Astro2.locals.cartToken);
    if (raw) {
      const draft = {
        ...raw.draft || {},
        email,
        marketing_consent: consent,
        shipping_address: values
      };
      await query("UPDATE cart SET draft=$2, email=$3, updated_at=now() WHERE id=$1", [
        raw.id,
        JSON.stringify(draft),
        email || raw.email
      ]);
      if (Object.keys(errors).length === 0) {
        return Astro2.redirect("/checkout/how-it-gets-there", 303);
      }
    }
  }
  const fresh = await cartByToken(Astro2.locals.cartToken);
  const view = fresh ? await readCart(fresh) : cart;
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Where it goes \u2014 Vela", "current": "shop", "data-astro-cid-25lwhesj": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="page-title" data-astro-cid-25lwhesj>Checkout</h1> ${renderComponent($$result2, "CheckoutSteps", $$CheckoutSteps, { "step": 1, "data-astro-cid-25lwhesj": true })} <div class="layout" data-astro-cid-25lwhesj> <section class="panel" data-astro-cid-25lwhesj> <h2 data-astro-cid-25lwhesj>Where it goes</h2> <form method="post" novalidate data-astro-cid-25lwhesj> <div class="field" data-astro-cid-25lwhesj> <label for="email" data-astro-cid-25lwhesj>Email</label> <input type="email" id="email" name="email"${addAttribute(email, "value")} autocomplete="email"${addAttribute(errors.email ? "email-error" : "email-hint", "aria-describedby")}${addAttribute(errors.email ? "true" : void 0, "aria-invalid")} required data-astro-cid-25lwhesj> ${errors.email ? renderTemplate`<p class="field-error" id="email-error" data-astro-cid-25lwhesj>${errors.email}</p>` : renderTemplate`<p class="field-hint" id="email-hint" data-astro-cid-25lwhesj>We send the confirmation here.</p>`} </div> <label class="consent" data-astro-cid-25lwhesj> <input type="checkbox" name="marketing_consent"${addAttribute(consent, "checked")} data-astro-cid-25lwhesj> <span data-astro-cid-25lwhesj>Send me a note when we make something new</span> </label> <div class="field" data-astro-cid-25lwhesj> <label for="name" data-astro-cid-25lwhesj>Name</label> <input type="text" id="name" name="name"${addAttribute(values.name ?? "", "value")} autocomplete="name"${addAttribute(errors.name ? "true" : void 0, "aria-invalid")}${addAttribute(errors.name ? "name-error" : void 0, "aria-describedby")} required data-astro-cid-25lwhesj> ${errors.name && renderTemplate`<p class="field-error" id="name-error" data-astro-cid-25lwhesj>${errors.name}</p>`} </div> <div class="field" data-astro-cid-25lwhesj> <label for="line1" data-astro-cid-25lwhesj>Address</label> <input type="text" id="line1" name="line1"${addAttribute(values.line1 ?? "", "value")} autocomplete="address-line1"${addAttribute(errors.line1 ? "true" : void 0, "aria-invalid")}${addAttribute(errors.line1 ? "line1-error" : void 0, "aria-describedby")} required data-astro-cid-25lwhesj> ${errors.line1 && renderTemplate`<p class="field-error" id="line1-error" data-astro-cid-25lwhesj>${errors.line1}</p>`} </div> <div class="field" data-astro-cid-25lwhesj> <label for="line2" data-astro-cid-25lwhesj>Apartment, suite, or floor</label> <input type="text" id="line2" name="line2"${addAttribute(values.line2 ?? "", "value")} autocomplete="address-line2" data-astro-cid-25lwhesj> </div> <div class="row" data-astro-cid-25lwhesj> <div class="field" data-astro-cid-25lwhesj> <label for="city" data-astro-cid-25lwhesj>City</label> <input type="text" id="city" name="city"${addAttribute(values.city ?? "", "value")} autocomplete="address-level2"${addAttribute(errors.city ? "true" : void 0, "aria-invalid")}${addAttribute(errors.city ? "city-error" : void 0, "aria-describedby")} required data-astro-cid-25lwhesj> ${errors.city && renderTemplate`<p class="field-error" id="city-error" data-astro-cid-25lwhesj>${errors.city}</p>`} </div> <div class="field" data-astro-cid-25lwhesj> <label for="region" data-astro-cid-25lwhesj>State</label> <input type="text" id="region" name="region"${addAttribute(values.region ?? "", "value")} autocomplete="address-level1"${addAttribute(errors.region ? "true" : void 0, "aria-invalid")}${addAttribute(errors.region ? "region-error" : void 0, "aria-describedby")} required data-astro-cid-25lwhesj> ${errors.region && renderTemplate`<p class="field-error" id="region-error" data-astro-cid-25lwhesj>${errors.region}</p>`} </div> <div class="field" data-astro-cid-25lwhesj> <label for="postal_code" data-astro-cid-25lwhesj>ZIP code</label> <input type="text" id="postal_code" name="postal_code"${addAttribute(values.postal_code ?? "", "value")} autocomplete="postal-code" inputmode="numeric"${addAttribute(errors.postal_code ? "true" : void 0, "aria-invalid")}${addAttribute(errors.postal_code ? "postal-error" : void 0, "aria-describedby")} required data-astro-cid-25lwhesj> ${errors.postal_code && renderTemplate`<p class="field-error" id="postal-error" data-astro-cid-25lwhesj>${errors.postal_code}</p>`} </div> </div> <div class="row" data-astro-cid-25lwhesj> <div class="field" data-astro-cid-25lwhesj> <label for="country" data-astro-cid-25lwhesj>Country</label> <select id="country" name="country" required data-astro-cid-25lwhesj> <option value="US"${addAttribute((values.country ?? "US") === "US", "selected")} data-astro-cid-25lwhesj>United States</option> </select> <p class="field-hint" data-astro-cid-25lwhesj>We ship within the United States.</p> </div> <div class="field" data-astro-cid-25lwhesj> <label for="phone" data-astro-cid-25lwhesj>Phone (optional)</label> <input type="tel" id="phone" name="phone"${addAttribute(values.phone ?? "", "value")} autocomplete="tel" data-astro-cid-25lwhesj> </div> </div> <div class="actions" data-astro-cid-25lwhesj> <button type="submit" class="button button-primary" data-astro-cid-25lwhesj>Continue to delivery</button> <a class="button button-quiet" href="/cart" data-astro-cid-25lwhesj>Back to cart</a> </div> </form> </section> ${renderComponent($$result2, "CheckoutSummary", $$CheckoutSummary, { "cart": view, "data-astro-cid-25lwhesj": true })} </div> ` })} `;
}, "/app/src/pages/checkout/where-it-goes.astro", void 0);

const $$file = "/app/src/pages/checkout/where-it-goes.astro";
const $$url = "/checkout/where-it-goes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$WhereItGoes,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
