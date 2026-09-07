import { c as customerForToken } from './auth_BN47AvzA.mjs';
import { C as CART_COOKIE, c as cartByToken, r as readCart } from './cart_C--Khl-8.mjs';

const SESSION_COOKIE = 'vela_session';

/**
 * Every server-rendered route knows who is reading it and what is in their cart,
 * so the browser receives readable, complete markup on first paint.
 */
async function onRequest(context, next) {
  const { cookies, locals, url } = context;

  const sessionToken = cookies.get(SESSION_COOKIE)?.value ?? null;
  const customer = sessionToken ? await customerForToken(sessionToken) : null;
  locals.customer = customer;
  locals.sessionToken = customer ? sessionToken : null;

  // A token that expires mid-action refuses the action, leaves the state
  // unchanged and returns the person to /sign-in.
  if (!customer && sessionToken) {
    cookies.delete(SESSION_COOKIE, { path: '/' });
  }

  const cartToken = cookies.get(CART_COOKIE)?.value ?? null;
  locals.cartToken = cartToken;
  locals.cart = null;
  locals.cartCount = 0;
  if (cartToken) {
    const cart = await cartByToken(cartToken);
    if (cart) {
      const view = await readCart(cart);
      locals.cart = view;
      locals.cartCount = view.item_count;
    }
  }

  // A signed-out request for any /account route lands on /sign-in carrying the
  // intended path and returns there after signing in.
  if (url.pathname.startsWith('/account') && !customer) {
    const next_ = encodeURIComponent(url.pathname + url.search);
    return context.redirect(`/sign-in?next=${next_}`, 302);
  }

  return next();
}

export { SESSION_COOKIE as S, onRequest as o };
