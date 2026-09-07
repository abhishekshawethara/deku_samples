import Fastify from 'fastify';
import { waitForDb, pool } from './db.js';
import { migrate } from './schema.js';
import { seed } from './seed.js';
import { registerApi } from './api.js';

const PORT = Number(process.env.PORT || 4173);
const HOST = '0.0.0.0';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: undefined
  },
  disableRequestLogging: true,
  trustProxy: true,
  bodyLimit: 1024 * 1024
});

app.addHook('onResponse', async (req, reply) => {
  req.log.info({
    event: 'request',
    method: req.method,
    url: req.url,
    status: reply.statusCode,
    duration_ms: Math.round(reply.elapsedTime || 0),
    account_id: req.account ? req.account.id : null
  });
});

async function main() {
  await waitForDb();
  await migrate();
  await seed();
  app.log.info({ event: 'startup', message: 'schema migrated and seeded' });

  registerApi(app);

  // SvelteKit SSR for everything that is not /api
  let ssr = null;
  try {
    ({ handler: ssr } = await import('../build/handler.js'));
  } catch (err) {
    app.log.error({ event: 'ssr_missing', error: String(err && err.message) });
  }

  if (ssr) {
    app.addHook('onRequest', (req, reply, done) => {
      if (req.raw.url && req.raw.url.startsWith('/api')) return done();
      const started = Date.now();
      reply.hijack();
      req.raw.res = reply.raw;
      reply.raw.on('finish', () => {
        app.log.info({
          event: 'request',
          method: req.method,
          url: req.url,
          status: reply.raw.statusCode,
          duration_ms: Date.now() - started,
          account_id: null
        });
      });
      ssr(req.raw, reply.raw, (err) => {
        if (err) app.log.error({ event: 'ssr_error', error: String(err && err.message) });
        if (!reply.raw.writableEnded) {
          reply.raw.statusCode = err ? 500 : 404;
          reply.raw.end(err ? 'Internal error' : 'Not found');
        }
      });
    });
  }

  await app.listen({ port: PORT, host: HOST });
  app.log.info({ event: 'listening', port: PORT, host: HOST });
}

for (const sig of ['SIGTERM', 'SIGINT']) {
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

main().catch((err) => {
  app.log.error({ event: 'fatal', error: String(err && err.stack) });
  process.exit(1);
});
