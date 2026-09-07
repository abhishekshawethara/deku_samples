const INTERNAL_ORIGIN = 'http://127.0.0.1:4173';

/**
 * The explorer count and the news wall read X-Total-Count during SSR, so that
 * header has to survive serialisation into the hydrated payload.
 */
export async function handle({ event, resolve }) {
	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'x-total-count' || name === 'content-type'
	});
}

/**
 * During server-side rendering the page's own API calls must reach the Fastify
 * listener in this same process. Node's fetch resolves "localhost" to ::1 while
 * the server binds IPv4, so /api requests are pinned to the loopback address.
 */
export async function handleFetch({ request, fetch }) {
	const url = new URL(request.url);
	if (url.pathname.startsWith('/api')) {
		const target = `${INTERNAL_ORIGIN}${url.pathname}${url.search}`;
		return fetch(new Request(target, request));
	}
	return fetch(request);
}
