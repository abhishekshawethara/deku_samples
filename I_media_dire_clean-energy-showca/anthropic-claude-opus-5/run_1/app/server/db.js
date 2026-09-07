import pg from 'pg';

const { Pool } = pg;

// The SvelteKit bundle and the Fastify entry both reach this module; one pool
// is shared between them through the process global.
const globalKey = Symbol.for('zettajoule.pool');

export const pool =
	globalThis[globalKey] ||
	(globalThis[globalKey] = new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 12
	}));

export async function query(text, params) {
	return pool.query(text, params);
}

export async function tx(fn) {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const out = await fn(client);
		await client.query('COMMIT');
		return out;
	} catch (err) {
		try {
			await client.query('ROLLBACK');
		} catch {
			/* ignore */
		}
		throw err;
	} finally {
		client.release();
	}
}

export async function waitForDb(attempts = 60) {
	for (let i = 0; i < attempts; i++) {
		try {
			await pool.query('select 1');
			return;
		} catch (err) {
			if (i === attempts - 1) throw err;
			await new Promise((r) => setTimeout(r, 1000));
		}
	}
}
