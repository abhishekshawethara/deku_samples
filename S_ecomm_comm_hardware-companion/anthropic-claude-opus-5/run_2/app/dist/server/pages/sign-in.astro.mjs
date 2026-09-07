import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
import { q as query } from '../chunks/db_gZE7iOnF.mjs';
import { v as verifyPassword, i as issueToken } from '../chunks/auth_BN47AvzA.mjs';
import { S as SESSION_COOKIE } from '../chunks/middleware_7r_lkVyN.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$SignIn = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SignIn;
  const next = Astro2.url.searchParams.get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  let error = "";
  let email = "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const target = String(form.get("next") ?? safeNext);
    const { rows } = await query("SELECT * FROM customer WHERE lower(email)=lower($1)", [email]);
    const customer = rows[0];
    if (!customer || customer.status !== "active" || !verifyPassword(password, customer.password_hash)) {
      error = "That email and password do not match an account.";
    } else {
      const { token, expiresAt } = await issueToken(customer.id);
      Astro2.cookies.set(SESSION_COOKIE, token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        expires: expiresAt
      });
      return Astro2.redirect(target.startsWith("/") && !target.startsWith("//") ? target : "/account", 303);
    }
  }
  if (Astro2.locals.customer) return Astro2.redirect(safeNext, 302);
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Sign in \u2014 Vela", "current": "", "data-astro-cid-4d26bl7g": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth" data-astro-cid-4d26bl7g> <h1 data-astro-cid-4d26bl7g>Sign in</h1> <p class="muted small" data-astro-cid-4d26bl7g>Your orders and the cameras on your account.</p> ${error && renderTemplate`<p class="notice notice-wrong" role="alert" data-astro-cid-4d26bl7g>${error}</p>`} <form method="post" data-astro-cid-4d26bl7g> <input type="hidden" name="next"${addAttribute(safeNext, "value")} data-astro-cid-4d26bl7g> <div class="field" data-astro-cid-4d26bl7g> <label for="email" data-astro-cid-4d26bl7g>Email</label> <input type="email" id="email" name="email"${addAttribute(email, "value")} autocomplete="email" required data-astro-cid-4d26bl7g> </div> <div class="field" data-astro-cid-4d26bl7g> <label for="password" data-astro-cid-4d26bl7g>Password</label> <input type="password" id="password" name="password" autocomplete="current-password" required data-astro-cid-4d26bl7g> </div> <button type="submit" class="button button-primary wide" data-astro-cid-4d26bl7g>Sign in</button> </form> <p class="small alt" data-astro-cid-4d26bl7g>
No account? <a${addAttribute(`/sign-up?next=${encodeURIComponent(safeNext)}`, "href")} data-astro-cid-4d26bl7g>Create one</a>.
      You never need one to buy.
</p> </div> ` })} `;
}, "/app/src/pages/sign-in.astro", void 0);

const $$file = "/app/src/pages/sign-in.astro";
const $$url = "/sign-in";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SignIn,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
