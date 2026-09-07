import pg from 'pg';

// Money is an integer count of minor units everywhere. Never let pg hand back
// a float for an integer column, and keep numerics as strings.
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v))); // int8
pg.types.setTypeParser(1700, (v) => v); // numeric stays a string

/**
 * The pool is built on first use rather than at import.
 *
 * No backing service is reachable while the image is built, and Astro imports
 * these modules to render its routes during the build, so reading DATABASE_URL
 * at import time would fail the build. Every host is read from the environment
 * at container start instead, which is also the only moment it is meaningful.
 */
let _pool = null;

function getPool() {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');
  _pool = new pg.Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 12),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  _pool.on('error', (err) => {
    console.log(JSON.stringify({ level: 'error', msg: 'pg pool error', error: String(err) }));
  });
  return _pool;
}

/** A stand-in with the shape of a pg.Pool, so callers need not know about the above. */
export const pool = {
  query: (...args) => getPool().query(...args),
  connect: (...args) => getPool().connect(...args),
  end: () => (_pool ? _pool.end() : Promise.resolve()),
};

export function query(text, params) {
  return getPool().query(text, params);
}

export async function withTx(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* connection already gone */ }
    throw err;
  } finally {
    client.release();
  }
}

export const PG_UNIQUE_VIOLATION = '23505';
export const PG_CHECK_VIOLATION = '23514';
