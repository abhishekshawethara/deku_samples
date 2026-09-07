import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                     */
import { f as formatMoney } from './money_BIIhPbI9.mjs';
import './db_gZE7iOnF.mjs';

const $$Astro$1 = createAstro();
const $$CheckoutSteps = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CheckoutSteps;
  const { step } = Astro2.props;
  const steps = [
    { n: 1, label: "Where it goes", href: "/checkout/where-it-goes" },
    { n: 2, label: "How it gets there", href: "/checkout/how-it-gets-there" },
    { n: 3, label: "Payment", href: "/checkout/payment" }
  ];
  return renderTemplate`${maybeRenderHead()}<nav class="steps" aria-label="Checkout steps" data-astro-cid-tuvqhivp> <ol data-astro-cid-tuvqhivp> ${steps.map((s) => renderTemplate`<li${addAttribute(["step", { "step-current": s.n === step, "step-done": s.n < step }], "class:list")} data-astro-cid-tuvqhivp> ${s.n < step ? renderTemplate`<a${addAttribute(s.href, "href")} data-astro-cid-tuvqhivp> <span class="step-n tnum" data-astro-cid-tuvqhivp>${s.n}</span> <span class="step-label" data-astro-cid-tuvqhivp>${s.label}</span> <span class="visually-hidden" data-astro-cid-tuvqhivp>, completed</span> </a>` : renderTemplate`<span${addAttribute(s.n === step ? "step" : void 0, "aria-current")} data-astro-cid-tuvqhivp> <span class="step-n tnum" data-astro-cid-tuvqhivp>${s.n}</span> <span class="step-label" data-astro-cid-tuvqhivp>${s.label}</span> </span>`} </li>`)} </ol> </nav> `;
}, "/app/src/components/CheckoutSteps.astro", void 0);

const $$Astro = createAstro();
const $$CheckoutSummary = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CheckoutSummary;
  const { cart, exact = false } = Astro2.props;
  const label = (word) => exact ? word : `Estimated ${word.toLowerCase()}`;
  return renderTemplate`<!-- A persistent summary sits beside all three steps. -->${maybeRenderHead()}<aside class="summary card" aria-label="Order summary" data-astro-cid-r7eb5hxj> <h2 data-astro-cid-r7eb5hxj>Summary</h2> <ul class="lines" data-astro-cid-r7eb5hxj> ${cart.lines.map((l) => renderTemplate`<li data-astro-cid-r7eb5hxj> <span class="lines-title" data-astro-cid-r7eb5hxj>${l.title} <span class="muted" data-astro-cid-r7eb5hxj>x${l.quantity}</span></span> <span class="money" data-astro-cid-r7eb5hxj>${formatMoney(l.total_minor)}</span> </li>`)} </ul> <dl class="totals" data-astro-cid-r7eb5hxj> <div data-astro-cid-r7eb5hxj><dt data-astro-cid-r7eb5hxj>${exact ? "Subtotal" : "Estimated subtotal"}</dt><dd class="money" data-astro-cid-r7eb5hxj>${formatMoney(cart.subtotal_minor)}</dd></div> ${cart.protection_enabled && renderTemplate`<div data-astro-cid-r7eb5hxj><dt data-astro-cid-r7eb5hxj>Shipment protection</dt><dd class="money" data-astro-cid-r7eb5hxj>${formatMoney(cart.protection_minor)}</dd></div>`} <div data-astro-cid-r7eb5hxj><dt data-astro-cid-r7eb5hxj>${label("Delivery")}</dt><dd class="money" data-astro-cid-r7eb5hxj>${formatMoney(cart.shipping_minor)}</dd></div> <div data-astro-cid-r7eb5hxj><dt data-astro-cid-r7eb5hxj>${label("Tax")}</dt><dd class="money" data-astro-cid-r7eb5hxj>${formatMoney(cart.tax_minor)}</dd></div> <div class="totals-final" data-astro-cid-r7eb5hxj><dt data-astro-cid-r7eb5hxj>${exact ? "Total" : "Estimated total"}</dt><dd class="money" data-astro-cid-r7eb5hxj>${formatMoney(cart.total_minor)}</dd></div> </dl> ${!exact && renderTemplate`<p class="xsmall muted" data-astro-cid-r7eb5hxj>Estimated. We will show the exact amount once we know where it is going.</p>`} </aside> `;
}, "/app/src/components/CheckoutSummary.astro", void 0);

export { $$CheckoutSteps as $, $$CheckoutSummary as a };
