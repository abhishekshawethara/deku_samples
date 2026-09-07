const INTERNAL_ORIGIN = `http://127.0.0.1:${process.env.PORT || 4173}`;
async function handleFetch({ request, fetch }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api")) {
    return fetch(new Request(`${INTERNAL_ORIGIN}${url.pathname}${url.search}`, request));
  }
  return fetch(request);
}

export { handleFetch };
//# sourceMappingURL=hooks.server.js-DE5r3o7I.js.map
