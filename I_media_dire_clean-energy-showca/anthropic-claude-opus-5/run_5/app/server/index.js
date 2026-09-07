import Fastify from 'fastify';
import { migrate, pool } from './db.js';
import { seed } from './seed.js';
import { registerApi } from './api.js';

const PORT = Number(process.env.PORT || 4173);
const HOST = '0.0.0.0';

const app = Fastify({
	logger: {
		level: process.env.LOG_LEVEL || 'info',
		formatters: { level: (label) => ({ level: label }) }
	},
	disableRequestLogging: true,
	trustProxy: true
});

// One structured line per request. Non-API traffic is hijacked and logged from
// its own response 'finish' below, so this hook covers the API only.
app.addHook('onResponse', (req, reply, done) => {
	if (!(req.raw.url || '').startsWith('/api/')) return done();
	app.log.info({
		event: 'request',
		method: req.method,
		url: req.url,
		status: reply.statusCode,
		duration_ms: Number(reply.elapsedTime?.toFixed?.(2) ?? 0)
	});
	done();
});

async function start() {
	let attempts = 0;
	for (;;) {
		try {
			await pool.query('SELECT 1');
			break;
		} catch (err) {
			attempts += 1;
			if (attempts > 60) throw err;
			app.log.warn({ event: 'db_wait', attempt: attempts });
			await new Promise((r) => setTimeout(r, 1000));
		}
	}

	await migrate();
	await seed(app.log);
	await registerApi(app);

	const { handler } = await import('../build/handler.js');

	// Non-API traffic goes to the SvelteKit node handler. Hooking on onRequest
	// keeps Fastify's body parser away from those requests.
	app.addHook('onRequest', (req, reply, done) => {
		const url = req.raw.url || '';
		if (url.startsWith('/api/')) return done();
		const startedAt = process.hrtime.bigint();
		reply.hijack();
		reply.raw.on('finish', () => {
			app.log.info({
				event: 'request',
				method: req.method,
				url,
				status: reply.raw.statusCode,
				duration_ms: Number((Number(process.hrtime.bigint() - startedAt) / 1e6).toFixed(2))
			});
		});
		handler(req.raw, reply.raw, () => {
			if (!reply.raw.writableEnded) {
				reply.raw.statusCode = 404;
				reply.raw.end('Not found');
			}
		});
	});

	app.setNotFoundHandler((req, reply) =>
		reply.code(404).send({ error: 'not_found', message: 'No such endpoint' })
	);

	await app.listen({ port: PORT, host: HOST });
	app.log.info({ event: 'listening', port: PORT, host: HOST });
}

for (const sig of ['SIGINT', 'SIGTERM']) {
	process.on(sig, async () => {
		app.log.info({ event: 'shutdown', signal: sig });
		try {
			await app.close();
			await pool.end();
		} catch {
			/* ignore */
		}
		process.exit(0);
	});
}

start().catch((err) => {
	app.log.error({ event: 'startup_failed', error: String(err && (err.stack || err)) });
	process.exit(1);
});
