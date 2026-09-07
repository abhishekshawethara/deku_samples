import { c as createComponent, b as createAstro } from '../chunks/astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
import { r as revokeToken } from '../chunks/auth_BN47AvzA.mjs';
import { S as SESSION_COOKIE } from '../chunks/middleware_7r_lkVyN.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$SignOut = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SignOut;
  const token = Astro2.cookies.get(SESSION_COOKIE)?.value;
  if (token) await revokeToken(token);
  Astro2.cookies.delete(SESSION_COOKIE, { path: "/" });
  return Astro2.redirect("/", 303);
}, "/app/src/pages/sign-out.astro", void 0);

const $$file = "/app/src/pages/sign-out.astro";
const $$url = "/sign-out";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$SignOut,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
