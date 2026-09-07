import Fastify from 'fastify';
import middie from '@fastify/middie';
import { pool, waitForDb } from './db.js';
import { migrateAndSeed } from './seed.js';
import { registerApi } from './api.js';

const PORT = Number(process.env.PORT || 4173);
const HOST = '0.0.0.0';

const app = Fastify({
	logger: {
		level: process.env.LOG_LEVEL || 'info',
		transport: undefined
	},
	disableRequestLogging: true,
	trustProxy: true
});

app.addHook('onResponse', (req, reply, done) => {
	req.log.info(
		{
			method: req.method,
			url: req.url,
			status: reply.statusCode,
			duration_ms: Math.round(reply.elapsedTime ?? 0),
			ip: req.ip
		},
		'request'
	);
	done();
});

async function main() {
	await waitForDb();
	await migrateAndSeed(pool);

	await registerApi(app);

	await app.register(middie);
	const { handler } = await import('../build/handler.js');
	app.use((req, res, next) => {
		if (req.url === '/api' || req.url.startsWith('/api/')) return next();
		handler(req, res, next);
	});

	await app.listen({ port: PORT, host: HOST });
	app.log.info({ port: PORT, host: HOST }, 'zettajoule listening');
}

for (const sig of ['SIGINT', 'SIGTERM']) {
	process.on(sig, () => {
		app.close().then(
			() => process.exit(0),
			() => process.exit(1)
		);
	});
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(JSON.stringify({ level: 'fatal', msg: String(err?.stack || err) }));
	process.exit(1);
});
