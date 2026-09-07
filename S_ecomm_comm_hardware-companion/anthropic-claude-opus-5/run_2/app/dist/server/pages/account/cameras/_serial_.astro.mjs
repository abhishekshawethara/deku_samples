import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../../../chunks/Shell_CddZJ8Bo.mjs';
import { f as formatDate } from '../../../chunks/view_5k7OaDvH.mjs';
import { r as renameDevice, a as releaseDevice, o as ownedDevice, d as decorateDevice } from '../../../chunks/devices_CukBZqQZ.mjs';
/* empty css                                          */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$serial = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$serial;
  const customer = Astro2.locals.customer;
  const { serial } = Astro2.params;
  let notice = "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const action = String(form.get("action") ?? "");
    try {
      if (action === "rename") {
        await renameDevice(serial, customer.id, String(form.get("nickname") ?? ""));
        notice = "Saved.";
      } else if (action === "release") {
        await releaseDevice(serial, customer.id);
        return Astro2.redirect("/account/cameras", 303);
      }
    } catch (err) {
      notice = err?.message || "That did not work.";
    }
  }
  let raw;
  try {
    raw = await ownedDevice(serial, customer.id);
  } catch {
    return new Response(null, { status: 404 });
  }
  const device = await decorateDevice(raw);
  const firmwareChip = device.firmware_state === "unknown" ? { text: "Not yet connected", tone: "" } : device.firmware_state === "behind" ? { text: "Update available", tone: "progress" } : { text: "Up to date", tone: "done" };
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": `${device.model} ${device.serial} \u2014 Vela`, "current": "cameras", "data-astro-cid-nd76frh6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<nav class="crumbs" aria-label="Breadcrumb" data-astro-cid-nd76frh6> <a href="/account/cameras" data-astro-cid-nd76frh6>Cameras</a> <span aria-hidden="true" data-astro-cid-nd76frh6>/</span> <span class="serial" data-astro-cid-nd76frh6>${device.serial}</span> </nav> <header class="head" data-astro-cid-nd76frh6> <h1 data-astro-cid-nd76frh6>${device.model}</h1> <p class="serial-line serial" data-astro-cid-nd76frh6>${device.serial}</p> ${device.nickname && renderTemplate`<p class="muted small" data-astro-cid-nd76frh6>${device.nickname}</p>`} </header> ${notice && renderTemplate`<p class="notice" role="status" data-astro-cid-nd76frh6>${notice}</p>`}<div class="panels" data-astro-cid-nd76frh6> <section class="panel card" data-astro-cid-nd76frh6> <h2 data-astro-cid-nd76frh6>State</h2> <table class="data" data-astro-cid-nd76frh6> <tbody data-astro-cid-nd76frh6> <tr data-astro-cid-nd76frh6> <th scope="row" data-astro-cid-nd76frh6>Firmware</th> <td data-astro-cid-nd76frh6> <span${addAttribute(["chip", firmwareChip.tone && `chip-${firmwareChip.tone}`], "class:list")} data-astro-cid-nd76frh6>${firmwareChip.text}</span> ${device.firmware_version && renderTemplate`<span class="version" data-astro-cid-nd76frh6> ${device.firmware_version}</span>`} </td> </tr> <tr data-astro-cid-nd76frh6> <th scope="row" data-astro-cid-nd76frh6>Newest firmware</th> <td class="version" data-astro-cid-nd76frh6>${device.latest_firmware ?? "None published"}</td> </tr> <tr data-astro-cid-nd76frh6> <th scope="row" data-astro-cid-nd76frh6>Warranty</th> <td data-astro-cid-nd76frh6> ${device.warranty_until ? device.warranty_expired ? `Ended ${formatDate(device.warranty_until)}` : `Until ${formatDate(device.warranty_until)}` : "Not on record"} </td> </tr> <tr data-astro-cid-nd76frh6><th scope="row" data-astro-cid-nd76frh6>Finish</th><td data-astro-cid-nd76frh6>${device.option_value}</td></tr> </tbody> </table> ${device.firmware_state === "behind" && renderTemplate`<p class="small update-note" data-astro-cid-nd76frh6>
Update it with Arranger, or with the <a href="/doctor" data-astro-cid-nd76frh6>firmware installer</a> if Arranger
          cannot see it.
</p>`} </section> <section class="panel card" data-astro-cid-nd76frh6> <h2 data-astro-cid-nd76frh6>Name</h2> <form method="post" data-astro-cid-nd76frh6> <input type="hidden" name="action" value="rename" data-astro-cid-nd76frh6> <div class="field" data-astro-cid-nd76frh6> <label for="nickname" data-astro-cid-nd76frh6>What you call it</label> <input type="text" id="nickname" name="nickname"${addAttribute(device.nickname ?? "", "value")} maxlength="60" placeholder="The one with the dent" data-astro-cid-nd76frh6> </div> <button type="submit" class="button" data-astro-cid-nd76frh6>Save</button> </form> </section> <section class="panel card" data-astro-cid-nd76frh6> <h2 data-astro-cid-nd76frh6>Ownership</h2> <!-- Two different actions, and the copy never blurs them. --> <p class="small" data-astro-cid-nd76frh6>
Removing this camera releases it without giving it to anyone. It is what you do when you
        sell it to a stranger: they can then register it themselves.
</p> <form method="post" data-confirm-release data-astro-cid-nd76frh6> <input type="hidden" name="action" value="release" data-astro-cid-nd76frh6> <button type="submit" class="button" data-astro-cid-nd76frh6>Remove from my account</button> </form> <p class="small hand-note" data-astro-cid-nd76frh6> <strong data-astro-cid-nd76frh6>Hand this camera to someone else</strong> is the same first step: remove it here,
        then give the new owner the serial number so they can register it.
</p> </section> </div>  ` })} `;
}, "/app/src/pages/account/cameras/[serial].astro", void 0);

const $$file = "/app/src/pages/account/cameras/[serial].astro";
const $$url = "/account/cameras/[serial]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$serial,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
