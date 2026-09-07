import pg from 'pg';

export const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL || process.env.DB_URL,
	max: 10,
	idleTimeoutMillis: 30000
});

export async function query(text, params) {
	return pool.query(text, params);
}

export async function withTx(fn) {
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

const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS solutions (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT NOT NULL,
  output_kind TEXT NOT NULL CHECK (output_kind IN ('heat','heat-and-power','hydrogen','electricity')),
  temperature_band TEXT NOT NULL CHECK (temperature_band IN ('up to 250 C','250 to 550 C','550 to 750 C')),
  deployment TEXT NOT NULL CHECK (deployment IN ('single-module','multi-module')),
  module_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_solutions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  save_token TEXT,
  solution_id INTEGER NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT saved_solutions_owner_ck CHECK (
    (account_id IS NOT NULL AND save_token IS NULL) OR (account_id IS NULL AND save_token IS NOT NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS saved_solutions_account_uq
  ON saved_solutions (account_id, solution_id) WHERE account_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS saved_solutions_token_uq
  ON saved_solutions (save_token, solution_id) WHERE save_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT,
  industry TEXT,
  output_kind TEXT,
  temperature_band TEXT,
  deployment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE UNIQUE INDEX IF NOT EXISTS saved_searches_account_name_uq ON saved_searches (account_id, name);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_country TEXT,
  phone TEXT,
  topic TEXT NOT NULL CHECK (topic IN ('Technology','Solutions','Investor relations','Careers','Suppliers')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','answered','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  account_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  organisation TEXT NOT NULL,
  role_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  team TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','reviewing','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE UNIQUE INDEX IF NOT EXISTS applications_account_job_uq ON applications (account_id, job_id);

CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  outlet TEXT NOT NULL,
  published_at DATE NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  bio TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS offices (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  role_label TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS offices_city_uq ON offices (city);

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS faqs_question_uq ON faqs (question);
`;

export async function migrate() {
	await pool.query(SCHEMA);
}
