import Fastify from 'fastify';
import api from './api.js';
import { migrate } from './db.js';
import { seed } from './seed.js';

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

app.addHook('onResponse', async (request, reply) => {
  request.log.info({
    event: 'request',
    method: request.method,
    url: request.url,
    status: reply.statusCode,
    duration_ms: Number(reply.elapsedTime?.toFixed?.(2) ?? 0),
    account_id: request.account?.id ?? null,
    ip: request.ip
  });
});

app.setErrorHandler((err, request, reply) => {
  request.log.error({ event: 'error', url: request.url, error: String(err?.message), stack: err?.stack });
  const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 500 ? err.statusCode : 500;
  reply.code(status).send({
    error: status === 500 ? 'Something went wrong on our side.' : err.message,
    message: status === 500 ? 'Something went wrong on our side.' : err.message
  });
});

// SvelteKit handler for everything that is not the JSON API.
const { handler } = await import('../build/handler.js');

app.addHook('onRequest', (request, reply, done) => {
  if (request.raw.url && request.raw.url.startsWith('/api')) return done();
  reply.hijack();
  handler(request.raw, reply.raw, (err) => {
    if (err) {
      request.log.error({ event: 'ssr_error', url: request.raw.url, error: String(err) });
    }
    if (!reply.raw.writableEnded) {
      reply.raw.statusCode = 404;
      reply.raw.setHeader('content-type', 'text/plain');
      reply.raw.end('Not found');
    }
  });
});

await app.register(api, { prefix: '/api' });

async function boot() {
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      await migrate();
      await seed();
      app.log.info({ event: 'db_ready', attempt });
      return;
    } catch (err) {
      app.log.error({ event: 'db_boot_failed', attempt, error: String(err?.message) });
      if (attempt >= 30) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

await boot();
await app.listen({ port: PORT, host: HOST });
app.log.info({ event: 'listening', port: PORT, host: HOST });

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    app.log.info({ event: 'shutdown', signal: sig });
    await app.close();
    process.exit(0);
  });
}
