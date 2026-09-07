import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../chunks/Shell_CddZJ8Bo.mjs';
import { $ as $$CameraCard } from '../../chunks/CameraCard_PhsmbFk2.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
import { b as registerDevice, d as decorateDevice } from '../../chunks/devices_CukBZqQZ.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const customer = Astro2.locals.customer;
  let formError = "";
  let formOk = "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const serial = String(form.get("serial") ?? "");
    try {
      await registerDevice(serial, customer.id);
      formOk = "That camera is now on your account.";
    } catch (err) {
      formError = err?.message || "That did not work.";
    }
  }
  const { rows } = await query(
    `SELECT d.*, p.title AS model, p.handle, v.option_value
     FROM device_ownership o
     JOIN device d ON d.id = o.device_id
     JOIN product p ON p.id = d.product_id
     JOIN variant v ON v.id = d.variant_id
    WHERE o.customer_id = $1 AND o.released_at IS NULL
    ORDER BY d.id`,
    [customer.id]
  );
  const devices = await Promise.all(rows.map(decorateDevice));
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Cameras \u2014 Vela", "current": "cameras", "data-astro-cid-xzlb2mys": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-xzlb2mys> <h1 data-astro-cid-xzlb2mys>Cameras</h1> <p class="muted small" data-astro-cid-xzlb2mys>The cameras registered to this account.</p> </header> <form class="register card" method="post" data-register data-astro-cid-xzlb2mys> <div class="register-field" data-astro-cid-xzlb2mys> <label for="serial" data-astro-cid-xzlb2mys>Register a camera</label> <input type="text" id="serial" name="serial" class="serial" maxlength="14" placeholder="VA2609KTMHX4" autocomplete="off" spellcheck="false" aria-describedby="serial-hint" required data-astro-cid-xzlb2mys> </div> <button type="submit" class="button" data-astro-cid-xzlb2mys>Register</button> <p class="field-hint" id="serial-hint" data-astro-cid-xzlb2mys>Twelve characters from the underside of the camera.</p> <p class="register-message" data-register-message role="status" aria-live="polite" data-astro-cid-xzlb2mys></p> ${formError && renderTemplate`<p class="register-message register-wrong" data-astro-cid-xzlb2mys>${formError}</p>`} ${formOk && renderTemplate`<p class="register-message register-done" data-astro-cid-xzlb2mys>${formOk}</p>`} </form> <p class="empty-state" data-camera-empty${addAttribute(devices.length > 0, "hidden")} data-astro-cid-xzlb2mys>No cameras registered yet.</p> <ul class="grid" data-camera-grid${addAttribute(devices.length === 0, "hidden")} data-astro-cid-xzlb2mys> ${devices.map((d) => renderTemplate`${renderComponent($$result2, "CameraCard", $$CameraCard, { "device": d, "data-astro-cid-xzlb2mys": true })}`)} </ul>  ` })} `;
}, "/app/src/pages/account/cameras/index.astro", void 0);

const $$file = "/app/src/pages/account/cameras/index.astro";
const $$url = "/account/cameras";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
