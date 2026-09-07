import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
	if (!pool) {
		const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
		if (!connectionString) throw new Error('DATABASE_URL is not set');
		pool = new Pool({ connectionString, max: 10 });
		pool.on('error', (err) =>
			console.error(JSON.stringify({ level: 'error', msg: 'pg pool error', err: err.message }))
		);
	}
	return pool;
}

export async function query(text, params) {
	return getPool().query(text, params);
}

export async function one(text, params) {
	const res = await getPool().query(text, params);
	return res.rows[0] || null;
}

export async function many(text, params) {
	const res = await getPool().query(text, params);
	return res.rows;
}

export async function withClient(fn) {
	const client = await getPool().connect();
	try {
		return await fn(client);
	} finally {
		client.release();
	}
}
