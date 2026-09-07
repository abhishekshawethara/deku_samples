import http from 'node:http';
import Fastify from 'fastify';
import { waitForDb } from './lib/db.js';
import { migrateAndSeed } from './lib/seed.js';
import { registerApi } from './lib/api.js';
import { log } from './lib/log.js';

const PORT = 4173;
const HOST = '0.0.0.0';

let sveltekitHandler = null;

const app = Fastify({
	logger: false,
	disableRequestLogging: true,
	trustProxy: true,
	bodyLimit: 1024 * 512,
	serverFactory(fastifyDispatch) {
		return http.createServer((req, res) => {
			const started = process.hrtime.bigint();
			res.on('finish', () => {
				log.info({
					event: 'request',
					method: req.method,
					path: req.url,
					status: res.statusCode,
					duration_ms: Math.round((Number(process.hrtime.bigint() - started) / 1e6) * 100) / 100
				});
			});
			if ((req.url || '').startsWith('/api')) return fastifyDispatch(req, res);
			if (sveltekitHandler) {
				return sveltekitHandler(req, res, (err) => {
					if (err) log.error({ event: 'ssr_error', path: req.url, error: String(err?.message || err) });
					if (!res.headersSent) {
						res.statusCode = err ? 500 : 404;
						res.setHeader('content-type', 'text/plain; charset=utf-8');
					}
					res.end(err ? 'Internal server error' : 'Not found');
				});
			}
			res.statusCode = 503;
			res.setHeader('content-type', 'text/plain; charset=utf-8');
			res.end('Application build not available');
		});
	}
});

app.addHook('onRequest', (req, reply, done) => {
	req.log = log;
	done();
});

app.setErrorHandler((err, req, reply) => {
	log.error({
		event: 'error',
		method: req.method,
		path: req.url,
		error: String(err?.message || err),
		stack: err?.stack
	});
	const status = err?.statusCode && err.statusCode < 500 ? err.statusCode : 500;
	const message = status < 500 ? err.message : 'Internal server error';
	return reply.code(status).send({ error: message, message });
});

app.setNotFoundHandler((req, reply) =>
	reply.code(404).send({ error: 'Not found', message: 'Not found' })
);

registerApi(app);

async function start() {
	await waitForDb();
	await migrateAndSeed();
	log.info({ event: 'migrate_seed_complete' });

	try {
		const mod = await import('../build/handler.js');
		sveltekitHandler = mod.handler;
		log.info({ event: 'sveltekit_handler_loaded' });
	} catch (err) {
		log.error({ event: 'sveltekit_handler_missing', error: String(err?.message || err) });
	}

	await app.listen({ port: PORT, host: HOST });
	log.info({ event: 'listening', port: PORT, host: HOST });
}

for (const sig of ['SIGINT', 'SIGTERM']) {
	process.on(sig, () => {
		log.info({ event: 'shutdown', signal: sig });
		app.close().finally(() => process.exit(0));
	});
}

process.on('unhandledRejection', (err) => {
	log.error({ event: 'unhandled_rejection', error: String(err?.message || err) });
});

start().catch((err) => {
	log.error({ event: 'startup_failed', error: String(err?.message || err), stack: err?.stack });
	process.exit(1);
});
