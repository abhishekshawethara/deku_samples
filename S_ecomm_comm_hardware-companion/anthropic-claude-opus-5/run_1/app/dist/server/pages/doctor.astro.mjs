import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const $$Doctor = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Firmware installer \u2014 Vela", "current": "doctor", "data-astro-cid-zyq4rxkj": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="head" data-astro-cid-zyq4rxkj> <h1 data-astro-cid-zyq4rxkj>Firmware installer</h1> <p class="lede" data-astro-cid-zyq4rxkj>
This page writes new software to a camera that Arranger cannot see. If Arranger can see
      your camera, use Arranger instead: it is the ordinary path and it is safer.
</p> </header> <div class="doctor" data-doctor data-astro-cid-zyq4rxkj> <!-- One polite live region carries the current step and status. --> <p class="visually-hidden" role="status" aria-live="polite" data-live data-astro-cid-zyq4rxkj></p> <ol class="steps" data-astro-cid-zyq4rxkj> <li class="step" data-astro-cid-zyq4rxkj> <h2 data-astro-cid-zyq4rxkj><span class="step-n tnum" data-astro-cid-zyq4rxkj>1</span> Whether this browser can talk to a camera</h2> <div class="step-body" data-astro-cid-zyq4rxkj> <!-- It opens by stating plainly whether this browser can talk to a
               device and naming which can. --> <p class="small" data-support-yes hidden data-astro-cid-zyq4rxkj>
This browser can talk to a camera over USB. Plug the camera in with the cable it came
            with, then continue below.
</p> <p class="small" data-support-no hidden data-astro-cid-zyq4rxkj>
This browser cannot talk to a camera over USB. Chrome, Edge and Opera on a desktop
            computer can. Open this page in one of those, or use Arranger, which does not need a
            browser at all.
</p> <noscript> <p class="small" data-astro-cid-zyq4rxkj>
This page needs scripting to talk to a camera. Use Arranger instead, or open this
              page in Chrome, Edge or Opera on a desktop computer.
</p> </noscript> </div> </li> <li class="step" data-astro-cid-zyq4rxkj> <h2 data-astro-cid-zyq4rxkj><span class="step-n tnum" data-astro-cid-zyq4rxkj>2</span> Before you start</h2> <div class="step-body" data-astro-cid-zyq4rxkj> <!-- A warning block that is real, focusable and readable rather than
               a tooltip. --> <div class="warning" data-warning tabindex="0" role="group" aria-label="Before you start" data-astro-cid-zyq4rxkj> <p data-astro-cid-zyq4rxkj>
This replaces the software inside your camera. It takes about ninety seconds. Do not
              unplug the camera and do not let your computer go to sleep. If you are on a laptop,
              plug it in.
</p> </div> <button type="button" class="button" data-accept data-astro-cid-zyq4rxkj>I understand</button> </div> </li> <li class="step" data-astro-cid-zyq4rxkj> <h2 data-astro-cid-zyq4rxkj><span class="step-n tnum" data-astro-cid-zyq4rxkj>3</span> Find your camera</h2> <div class="step-body" data-astro-cid-zyq4rxkj> <div class="find-row" data-astro-cid-zyq4rxkj> <div class="field find-field" data-astro-cid-zyq4rxkj> <label for="serial" data-astro-cid-zyq4rxkj>Serial number</label> <input type="text" id="serial" class="serial" data-serial placeholder="VC2609PVDA7Q" maxlength="14" autocomplete="off" spellcheck="false" disabled aria-describedby="serial-hint" data-astro-cid-zyq4rxkj> <p class="field-hint" id="serial-hint" data-astro-cid-zyq4rxkj>
Twelve characters, engraved on the underside of the camera.
</p> </div> <button type="button" class="button" data-connect disabled aria-describedby="connect-blocked" data-astro-cid-zyq4rxkj>Find my camera</button> </div> <!-- Unavailability is never signalled by colour alone. --> <p class="xsmall muted" id="connect-blocked" data-connect-blocked data-astro-cid-zyq4rxkj>
Read the warning above and choose “I understand” before this can be used.
</p> <p class="connect-error" data-connect-error role="alert" data-astro-cid-zyq4rxkj></p> </div> </li> <li class="step" data-astro-cid-zyq4rxkj> <h2 data-astro-cid-zyq4rxkj><span class="step-n tnum" data-astro-cid-zyq4rxkj>4</span> Choose the software</h2> <div class="step-body" data-astro-cid-zyq4rxkj> <div data-identified hidden data-astro-cid-zyq4rxkj> <p class="identity" data-identity data-astro-cid-zyq4rxkj></p> <ul class="images" data-images data-astro-cid-zyq4rxkj></ul> </div> <p class="small muted" data-awaiting data-astro-cid-zyq4rxkj>Find your camera first and the versions it can take will appear here.</p> </div> </li> <li class="step" data-astro-cid-zyq4rxkj> <h2 data-astro-cid-zyq4rxkj><span class="step-n tnum" data-astro-cid-zyq4rxkj>5</span> The write</h2> <div class="step-body" data-astro-cid-zyq4rxkj> <div data-write-step hidden data-astro-cid-zyq4rxkj> <!-- A figure that came from the device, and no cancel, because
                 there is no safe cancel. --> <p class="write-line" data-write-line data-astro-cid-zyq4rxkj>Writing, 0 percent. Do not unplug your camera.</p> <progress class="meter" data-meter max="100" value="0" data-astro-cid-zyq4rxkj>0 percent</progress> </div> <p class="result" data-result tabindex="-1" hidden data-astro-cid-zyq4rxkj></p> <p class="small muted" data-idle-note data-astro-cid-zyq4rxkj>
Nothing has been written yet. You can leave this page at any point before the write and
            nothing on your camera will have changed.
</p> </div> </li> </ol> </div>   ` })} `;
}, "/app/src/pages/doctor.astro", void 0);

const $$file = "/app/src/pages/doctor.astro";
const $$url = "/doctor";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Doctor,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
