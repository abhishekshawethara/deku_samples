import { c as createComponent, b as createAstro } from '../../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
import { p as parseQuantity, v as variantBySku, e as ensureCart, C as CART_COOKIE } from '../../chunks/cart_C--Khl-8.mjs';
import { q as query } from '../../chunks/db_gZE7iOnF.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Add = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Add;
  if (Astro2.request.method !== "POST") return Astro2.redirect("/cart", 303);
  const form = await Astro2.request.formData();
  const sku = String(form.get("sku") ?? "");
  try {
    const quantity = parseQuantity(form.get("quantity") ?? 1);
    const variant = await variantBySku(sku);
    if (variant.kind === "protection" || variant.product_status === "discontinued") {
      return Astro2.redirect("/shop", 303);
    }
    if (variant.inventory_policy === "deny" && variant.available < quantity) {
      return Astro2.redirect(`/shop/${variant.handle}?variant=${variant.sku}`, 303);
    }
    const cart = await ensureCart(Astro2.locals.cartToken, Astro2.locals.customer?.id ?? null);
    Astro2.cookies.set(CART_COOKIE, cart.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30
    });
    await query(
      `INSERT INTO cart_line (cart_id,variant_id,quantity,unit_price_minor)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (cart_id,variant_id) DO UPDATE
       SET quantity = LEAST(10, cart_line.quantity + EXCLUDED.quantity)`,
      [cart.id, variant.id, quantity, variant.price_minor]
    );
    await query("UPDATE cart SET updated_at=now() WHERE id=$1", [cart.id]);
  } catch {
    return Astro2.redirect("/shop", 303);
  }
  return Astro2.redirect("/cart", 303);
}, "/app/src/pages/cart/add.astro", void 0);

const $$file = "/app/src/pages/cart/add.astro";
const $$url = "/cart/add";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Add,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
