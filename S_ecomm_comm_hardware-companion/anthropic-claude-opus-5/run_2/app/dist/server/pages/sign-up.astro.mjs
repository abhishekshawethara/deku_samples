import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import { $ as $$Shell } from '../chunks/Shell_CddZJ8Bo.mjs';
import { q as query } from '../chunks/db_gZE7iOnF.mjs';
import { a as hashPassword, i as issueToken } from '../chunks/auth_BN47AvzA.mjs';
import { S as SESSION_COOKIE } from '../chunks/middleware_7r_lkVyN.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$SignUp = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SignUp;
  const next = Astro2.url.searchParams.get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  let errors = {};
  let email = "";
  let name = "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    email = String(form.get("email") ?? "").trim();
    name = String(form.get("name") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const target = String(form.get("next") ?? safeNext);
    if (!name) errors.name = "Name is required.";
    if (!email) errors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Email is required.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (Object.keys(errors).length === 0) {
      const { rows } = await query("SELECT id FROM customer WHERE lower(email)=lower($1)", [email]);
      if (rows.length) {
        errors.email = "That address already has an account. Sign in instead.";
      } else {
        const { rows: made } = await query(
          "INSERT INTO customer (email,name,password_hash,status) VALUES (lower($1),$2,$3,$4) RETURNING id",
          [email, name, hashPassword(password), "active"]
        );
        const { token, expiresAt } = await issueToken(made[0].id);
        Astro2.cookies.set(SESSION_COOKIE, token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          expires: expiresAt
        });
        return Astro2.redirect(target.startsWith("/") && !target.startsWith("//") ? target : "/account", 303);
      }
    }
  }
  if (Astro2.locals.customer) return Astro2.redirect(safeNext, 302);
  return renderTemplate`${renderComponent($$result, "Shell", $$Shell, { "title": "Create an account \u2014 Vela", "current": "", "data-astro-cid-eti64xk7": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth" data-astro-cid-eti64xk7> <h1 data-astro-cid-eti64xk7>Create an account</h1> <p class="muted small" data-astro-cid-eti64xk7>Anyone may create one. You never need one to buy.</p> <form method="post" data-astro-cid-eti64xk7> <input type="hidden" name="next"${addAttribute(safeNext, "value")} data-astro-cid-eti64xk7> <div class="field" data-astro-cid-eti64xk7> <label for="name" data-astro-cid-eti64xk7>Name</label> <input type="text" id="name" name="name"${addAttribute(name, "value")} autocomplete="name"${addAttribute(errors.name ? "true" : void 0, "aria-invalid")} required data-astro-cid-eti64xk7> ${errors.name && renderTemplate`<p class="field-error" data-astro-cid-eti64xk7>${errors.name}</p>`} </div> <div class="field" data-astro-cid-eti64xk7> <label for="email" data-astro-cid-eti64xk7>Email</label> <input type="email" id="email" name="email"${addAttribute(email, "value")} autocomplete="email"${addAttribute(errors.email ? "true" : void 0, "aria-invalid")} required data-astro-cid-eti64xk7> ${errors.email && renderTemplate`<p class="field-error" data-astro-cid-eti64xk7>${errors.email}</p>`} </div> <div class="field" data-astro-cid-eti64xk7> <label for="password" data-astro-cid-eti64xk7>Password</label> <input type="password" id="password" name="password" autocomplete="new-password"${addAttribute(errors.password ? "true" : void 0, "aria-invalid")} required minlength="8" data-astro-cid-eti64xk7> ${errors.password ? renderTemplate`<p class="field-error" data-astro-cid-eti64xk7>${errors.password}</p>` : renderTemplate`<p class="field-hint" data-astro-cid-eti64xk7>At least 8 characters.</p>`} </div> <button type="submit" class="button button-primary wide" data-astro-cid-eti64xk7>Create account</button> </form> <p class="small alt" data-astro-cid-eti64xk7>
Already have one? <a${addAttribute(`/sign-in?next=${encodeURIComponent(safeNext)}`, "href")} data-astro-cid-eti64xk7>Sign in</a>.
</p> </div> ` })} `;
}, "/app/src/pages/sign-up.astro", void 0);

const $$file = "/app/src/pages/sign-up.astro";
const $$url = "/sign-up";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SignUp,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
