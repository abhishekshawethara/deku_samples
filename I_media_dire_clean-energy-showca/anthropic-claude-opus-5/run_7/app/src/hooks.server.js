/**
 * During server rendering, SvelteKit resolves a same-origin fetch through its own
 * router, which does not carry the /api prefix: that belongs to Fastify on the same
 * listener. Send those calls back over the loopback interface instead.
 */
const INTERNAL_ORIGIN = `http://127.0.0.1:${process.env.PORT || 4173}`;

export async function handleFetch({ request, fetch }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api')) {
    return fetch(new Request(`${INTERNAL_ORIGIN}${url.pathname}${url.search}`, request));
  }
  return fetch(request);
}
