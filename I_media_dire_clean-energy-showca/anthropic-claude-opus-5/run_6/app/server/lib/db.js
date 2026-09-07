import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 10,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 10000
});

export function query(text, params) {
	return pool.query(text, params);
}

export async function one(text, params) {
	const r = await pool.query(text, params);
	return r.rows[0] || null;
}

export async function many(text, params) {
	const r = await pool.query(text, params);
	return r.rows;
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
