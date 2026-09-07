import Fastify from 'fastify';
import middie from '@fastify/middie';
import apiRoutes from './api.js';
import { getPool } from './db.js';
import { migrateAndSeed } from './seed.js';

const PORT = Number(process.env.PORT || 4173);
const HOST = '0.0.0.0';

function log(entry) {
	process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), ...entry })}\n`);
}

async function start() {
	const app = Fastify({ logger: false, trustProxy: true, bodyLimit: 1024 * 512 });

	app.addHook('onRequest', (req, reply, done) => {
		const started = process.hrtime.bigint();
		reply.raw.on('finish', () => {
			log({
				level: 'info',
				msg: 'request',
				method: req.method,
				url: req.url,
				status: reply.raw.statusCode,
				duration_ms: Number(process.hrtime.bigint() - started) / 1e6,
				ip: req.ip
			});
		});
		done();
	});

	await app.register(middie);
	await app.register(apiRoutes, { prefix: '/api' });

	let svelteHandler = null;
	try {
		({ handler: svelteHandler } = await import('../build/handler.js'));
	} catch (err) {
		log({ level: 'error', msg: 'svelte build not found, serving api only', err: err.message });
	}

	if (svelteHandler) {
		app.use((req, res, next) => {
			if (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?')) return next();
			svelteHandler(req, res, next);
		});
	}

	const pool = getPool();
	let attempts = 0;
	for (;;) {
		try {
			await migrateAndSeed(pool);
			log({ level: 'info', msg: 'database ready' });
			break;
		} catch (err) {
			attempts += 1;
			log({ level: 'error', msg: 'database not ready, retrying', attempt: attempts, err: err.message });
			if (attempts >= 60) throw err;
			await new Promise((r) => setTimeout(r, 2000));
		}
	}

	await app.listen({ port: PORT, host: HOST });
	log({ level: 'info', msg: 'listening', port: PORT, host: HOST });

	const shutdown = async (signal) => {
		log({ level: 'info', msg: 'shutting down', signal });
		try {
			await app.close();
			await pool.end();
		} finally {
			process.exit(0);
		}
	};
	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
	log({ level: 'fatal', msg: 'startup failed', err: err.message, stack: err.stack });
	process.exit(1);
});
