import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getRequestListener } from '@hono/node-server';
import { api } from './api.js';
import { migrateAndSeed } from '../db/seed.js';
import { logLine, newRequestId, logRequest } from './lib/log.js';
import { pool } from './lib/db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// The port mapping is <APP_PUBLIC_PORT>:4173, where 4173 is the container-internal
// port. Read both from the environment; never hardcode either.
const PORT = Number(process.env.PORT || 4173);
// Bind 0.0.0.0: a loopback-only listener is unreachable from outside the container.
const HOST = process.env.HOST || '0.0.0.0';

const apiListener = getRequestListener(api.fetch);

const CLIENT_DIR = path.join(root, 'dist/client');

const MIME = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/**
 * Serve the built client assets. This is a production build behind this server,
 * never a dev server, and the islands are unreachable without it.
 */
function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const target = path.join(CLIENT_DIR, path.normalize(decoded));
  // Never serve outside the client directory.
  if (!target.startsWith(CLIENT_DIR)) return false;

  let stat;
  try {
    stat = fs.statSync(target);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const ext = path.extname(target).toLowerCase();
  res.statusCode = 200;
  res.setHeader('content-type', MIME[ext] || 'application/octet-stream');
  res.setHeader('content-length', stat.size);
  // Astro fingerprints these filenames, so they are safe to cache hard.
  res.setHeader(
    'cache-control',
    decoded.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
  );
  if (req.method === 'HEAD') {
    res.end();
    return true;
  }
  fs.createReadStream(target).pipe(res);
  return true;
}

async function loadAstro() {
  const entry = path.join(root, 'dist/server/entry.mjs');
  if (!fs.existsSync(entry)) {
    throw new Error(`Astro build missing at ${entry}. Run "npm run build" before starting.`);
  }
  const mod = await import(entry);
  return mod.handler;
}

async function main() {
  // The database is re-created from scratch for grading, so the schema and the
  // seed must be applied by the image itself.
  await waitForDatabase();
  await migrateAndSeed();

  const astroHandler = await loadAstro();

  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    if (url === '/api' || url.startsWith('/api/')) {
      apiListener(req, res);
      return;
    }

    const pathname = url.split('?')[0];
    if (
      (req.method === 'GET' || req.method === 'HEAD') &&
      pathname !== '/' &&
      serveStatic(req, res, pathname)
    ) {
      return;
    }

    const started = performance.now();
    const requestId = req.headers['x-request-id'] || newRequestId();
    res.setHeader('x-request-id', requestId);
    res.on('finish', () => {
      logRequest({
        method: req.method,
        route: url.split('?')[0],
        status: res.statusCode,
        ms: performance.now() - started,
        requestId,
      });
    });
    astroHandler(req, res, (err) => {
      if (err) {
        logLine({ level: 'error', msg: 'ssr error', request_id: requestId, error: String(err?.stack || err) });
      }
      if (!res.headersSent) {
        res.statusCode = err ? 500 : 404;
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(errorPage(res.statusCode, requestId));
      }
    });
  });

  server.listen(PORT, HOST, () => {
    logLine({
      level: 'info', msg: 'listening', port: PORT, host: HOST,
      public_url: process.env.APP_PUBLIC_URL || null,
    });
  });

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
      logLine({ level: 'info', msg: 'shutting down', signal });
      server.close(() => pool.end().then(() => process.exit(0)));
      setTimeout(() => process.exit(0), 8000).unref();
    });
  }
}

/** Nothing is reachable during build; wait for the database at container start. */
async function waitForDatabase(attempts = 60) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      logLine({ level: 'warn', msg: 'waiting for database', attempt: i, error: String(err?.message || err) });
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('database never became reachable');
}

/** Every error is a rendered page, never a crash and never a blank screen. */
function errorPage(status, requestId) {
  const message =
    status === 404
      ? 'That page does not exist.'
      : `Something went wrong at our end. Reference ${requestId}.`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${status === 404 ? 'Not found' : 'Error'} — Vela</title>
<style>
:root{color-scheme:light}
body{margin:0;font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
background:#f4f2ef;color:#17181a;display:grid;place-items:center;min-height:100vh}
main{max-width:34rem;padding:2rem}
h1{font-size:1.25rem;margin:0 0 .5rem}
p{margin:0 0 1rem;color:#4a4d52}
a{color:#8a3a12}
</style></head><body><main>
<h1>${message}</h1>
<p>${status === 404 ? 'Check the address, or start from the shop.' : 'Try again in a moment.'}</p>
<a href="/shop">Go to the shop</a>
</main></body></html>`;
}

main().catch((err) => {
  logLine({ level: 'error', msg: 'failed to start', error: String(err?.stack || err) });
  process.exit(1);
});
