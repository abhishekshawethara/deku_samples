import Fastify from 'fastify';
import { migrate, pool } from './db.js';
import { seed } from './seed.js';
import api from './api.js';

const PORT = Number(process.env.PORT || 4173);
const HOST = '0.0.0.0';

const app = Fastify({
	logger: { level: process.env.LOG_LEVEL || 'info' },
	disableRequestLogging: true,
	trustProxy: true
});

app.addHook('onResponse', (req, reply, done) => {
	req.log.info({
		event: 'request',
		method: req.method,
		path: req.url,
		status: reply.statusCode,
		duration_ms: Number(reply.elapsedTime?.toFixed?.(1) ?? 0),
		ip: req.ip
	});
	done();
});

await app.register(api, { prefix: '/api' });

/**
 * Server-side page loads call the API in this same process rather than looping
 * back over the network. Same routes, same handlers, same database.
 */
globalThis.__zjApiInject = async (path, headers = {}) => {
	const res = await app.inject({
		method: 'GET',
		url: `/api${path}`,
		headers: headers || {}
	});
	let body = null;
	if (res.body) {
		try {
			body = JSON.parse(res.body);
		} catch {
			body = { message: res.body };
		}
	}
	return { status: res.statusCode, headers: res.headers, body };
};

let ready = false;

async function bootstrap() {
	let lastErr;
	for (let attempt = 1; attempt <= 30; attempt++) {
		try {
			await migrate();
			await seed((m) => app.log.info({ event: 'seed', message: m }));
			ready = true;
			app.log.info({ event: 'database_ready' });
			return;
		} catch (err) {
			lastErr = err;
			app.log.warn({ event: 'database_wait', attempt, error: String(err?.message || err) });
			await new Promise((r) => setTimeout(r, 2000));
		}
	}
	app.log.error({ event: 'database_failed', error: String(lastErr?.message || lastErr) });
	process.exit(1);
}

async function start() {
	// SvelteKit built handler; built by `vite build` into ../build
	const { handler } = await import('../build/handler.js');

	app.setNotFoundHandler((req, reply) => {
		reply.hijack();
		handler(req.raw, reply.raw, (err) => {
			if (err) {
				app.log.error({ event: 'ssr_error', error: String(err?.stack || err) });
			}
			if (!reply.raw.writableEnded) {
				reply.raw.statusCode = 404;
				reply.raw.setHeader('content-type', 'text/plain; charset=utf-8');
				reply.raw.end('We cannot find that page');
			}
		});
	});

	await bootstrap();
	await app.listen({ port: PORT, host: HOST });
	app.log.info({ event: 'listening', port: PORT, host: HOST, ready });
}

for (const sig of ['SIGTERM', 'SIGINT']) {
	process.on(sig, async () => {
		app.log.info({ event: 'shutdown', signal: sig });
		try {
			await app.close();
			await pool.end();
		} catch {}
		process.exit(0);
	});
}

start().catch((err) => {
	app.log.error({ event: 'startup_failed', error: String(err?.stack || err) });
	process.exit(1);
});
