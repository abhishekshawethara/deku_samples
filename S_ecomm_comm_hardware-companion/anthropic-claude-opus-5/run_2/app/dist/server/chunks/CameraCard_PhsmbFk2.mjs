import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
import { f as formatDate } from './view_5k7OaDvH.mjs';
/* empty css                         */

const $$Astro = createAstro();
const $$CameraCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CameraCard;
  const { device } = Astro2.props;
  const firmwareChip = device.firmware_state === "unknown" ? { text: "Not yet connected", tone: "" } : device.firmware_state === "behind" ? { text: "Update available", tone: "progress" } : { text: `Firmware ${device.firmware_version}`, tone: "done" };
  const warrantyChip = !device.warranty_until ? { text: "No warranty on record"} : device.warranty_expired ? { text: `Warranty ended ${formatDate(device.warranty_until)}`} : { text: `Under warranty until ${formatDate(device.warranty_until)}`};
  return renderTemplate`${maybeRenderHead()}<li class="camera card" data-astro-cid-to7jz4mq> <div class="camera-head" data-astro-cid-to7jz4mq> <h3 data-astro-cid-to7jz4mq> <a${addAttribute(`/account/cameras/${device.serial}`, "href")} data-astro-cid-to7jz4mq>${device.model}</a> </h3> ${device.nickname && renderTemplate`<p class="nickname small" data-astro-cid-to7jz4mq>${device.nickname}</p>`} </div> <p class="serial-line" data-astro-cid-to7jz4mq> <span class="visually-hidden" data-astro-cid-to7jz4mq>Serial number </span> <span class="serial" data-astro-cid-to7jz4mq>${device.serial}</span> </p> <div class="chips" data-astro-cid-to7jz4mq> <span${addAttribute(["chip", firmwareChip.tone && `chip-${firmwareChip.tone}`], "class:list")} data-astro-cid-to7jz4mq>${firmwareChip.text}</span> <span class="chip" data-astro-cid-to7jz4mq>${warrantyChip.text}</span> </div> </li> `;
}, "/app/src/components/CameraCard.astro", void 0);

export { $$CameraCard as $ };
