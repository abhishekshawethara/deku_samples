import { SCHEMA_SQL } from './schema.js';
import { hashPassword } from './auth.js';
import {
	SOLUTIONS,
	DOCUMENTS,
	JOBS,
	STORIES,
	TEAM,
	OFFICES,
	FAQS,
	SITE_COPY
} from './seed-content.js';

const DEMO_PASSWORD = 'deku-demo-pw-2026';

export async function migrateAndSeed(pool) {
	const client = await pool.connect();
	try {
		// Serialise concurrent boots behind one advisory lock.
		await client.query('SELECT pg_advisory_lock(918273645)');
		await client.query(SCHEMA_SQL);
		await seedRows(client);
	} finally {
		try {
			await client.query('SELECT pg_advisory_unlock(918273645)');
		} catch {
			/* ignore */
		}
		client.release();
	}
}

async function seedRows(c) {
	for (const [i, s] of SOLUTIONS.entries()) {
		await c.query(
			`INSERT INTO solutions (slug, industry, title, summary, detail, output_kind, temperature_band, deployment, module_count, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (slug) DO UPDATE SET industry=EXCLUDED.industry, title=EXCLUDED.title,
         summary=EXCLUDED.summary, detail=EXCLUDED.detail, output_kind=EXCLUDED.output_kind,
         temperature_band=EXCLUDED.temperature_band, deployment=EXCLUDED.deployment,
         module_count=EXCLUDED.module_count, sort_order=EXCLUDED.sort_order`,
			[
				s.slug,
				s.industry,
				s.title,
				s.summary,
				s.detail,
				s.output_kind,
				s.temperature_band,
				s.deployment,
				s.module_count,
				i
			]
		);
	}

	for (const d of DOCUMENTS) {
		await c.query(
			`INSERT INTO documents (slug, title, category, published_at, summary) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category,
         published_at=EXCLUDED.published_at, summary=EXCLUDED.summary`,
			[d.slug, d.title, d.category, d.published_at, d.summary]
		);
	}

	for (const j of JOBS) {
		await c.query(
			`INSERT INTO jobs (slug, title, location, team, description) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, location=EXCLUDED.location,
         team=EXCLUDED.team, description=EXCLUDED.description`,
			[j.slug, j.title, j.location, j.team, j.description]
		);
	}

	for (const s of STORIES) {
		await c.query(
			`INSERT INTO stories (slug, title, outlet, published_at, featured, body) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, outlet=EXCLUDED.outlet,
         published_at=EXCLUDED.published_at, featured=EXCLUDED.featured, body=EXCLUDED.body`,
			[s.slug, s.title, s.outlet, s.published_at, s.featured, s.body]
		);
	}

	for (const [i, t] of TEAM.entries()) {
		await c.query(
			`INSERT INTO team_members (slug, name, role_title, bio, profile_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, role_title=EXCLUDED.role_title,
         bio=EXCLUDED.bio, profile_url=EXCLUDED.profile_url, sort_order=EXCLUDED.sort_order`,
			[t.slug, t.name, t.role_title, t.bio, t.profile_url, i]
		);
	}

	for (const o of OFFICES) {
		await c.query(
			`INSERT INTO offices (city, country, role_label) VALUES ($1,$2,$3)
       ON CONFLICT (city) DO UPDATE SET country=EXCLUDED.country, role_label=EXCLUDED.role_label`,
			[o.city, o.country, o.role_label]
		);
	}

	for (const [i, f] of FAQS.entries()) {
		await c.query(
			`INSERT INTO faqs (question, answer, category, sort_order) VALUES ($1,$2,$3,$4)
       ON CONFLICT (question) DO UPDATE SET answer=EXCLUDED.answer, category=EXCLUDED.category,
         sort_order=EXCLUDED.sort_order`,
			[f.question, f.answer, f.category, i]
		);
	}

	for (const b of SITE_COPY) {
		await c.query(
			`INSERT INTO site_copy (route_key, block_key, heading, body, sort_order) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (route_key, block_key) DO UPDATE SET heading=EXCLUDED.heading,
         body=EXCLUDED.body, sort_order=EXCLUDED.sort_order`,
			[b.route_key, b.block_key, b.heading, b.body, b.sort_order]
		);
	}

	const ada = await upsertAccount(c, 'visitor@example.com', 'Ada Moreau');
	const ken = await upsertAccount(c, 'visitor2@example.com', 'Ken Adeyemi');

	await saveSolution(c, ada, 'steel');
	await saveSolution(c, ada, 'data-centres');
	await saveSolution(c, ken, 'mining');

	await c.query(
		`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
     VALUES ($1,'Hydrogen sites',NULL,NULL,'hydrogen',NULL,NULL)
     ON CONFLICT (account_id, name) DO UPDATE SET output_kind=EXCLUDED.output_kind`,
		[ada]
	);

	await c.query(
		`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
     VALUES ('ENQ-7K2M9QD4',$1,'Ada Moreau','visitor@example.com','+31','610000001','Investor relations',
       'I would like to understand the roadmap to first deployment and how the energy supply agreements are structured.','answered')
     ON CONFLICT (reference) DO NOTHING`,
		[ada]
	);
	await c.query(
		`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
     VALUES ('ENQ-5R8X1CJ2',$1,'Ken Adeyemi','visitor2@example.com','+1','3120000002','Careers',
       'Is the Operations Academy open to applicants coming from conventional power generation?','received')
     ON CONFLICT (reference) DO NOTHING`,
		[ken]
	);

	await c.query(
		`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
     VALUES ('IAR-4H7N2PQ8',$1,'Moreau Capital','Managing Partner','approved')
     ON CONFLICT (account_id) DO UPDATE SET reference=EXCLUDED.reference,
       organisation=EXCLUDED.organisation, role_title=EXCLUDED.role_title, status=EXCLUDED.status`,
		[ada]
	);
	await c.query(
		`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
     VALUES ('IAR-9T3V6BLM',$1,'Adeyemi Industrial','Head of Strategy','pending')
     ON CONFLICT (account_id) DO UPDATE SET reference=EXCLUDED.reference,
       organisation=EXCLUDED.organisation, role_title=EXCLUDED.role_title, status=EXCLUDED.status`,
		[ken]
	);
}

async function upsertAccount(c, email, display_name) {
	const existing = await c.query('SELECT id FROM accounts WHERE email=$1', [email]);
	if (existing.rows.length) {
		await c.query('UPDATE accounts SET display_name=$2 WHERE id=$1', [
			existing.rows[0].id,
			display_name
		]);
		return existing.rows[0].id;
	}
	const res = await c.query(
		'INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id',
		[email, hashPassword(DEMO_PASSWORD), display_name]
	);
	return res.rows[0].id;
}

async function saveSolution(c, accountId, slug) {
	await c.query(
		`INSERT INTO saved_solutions (account_id, solution_id)
     SELECT $1, id FROM solutions WHERE slug=$2
     ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING`,
		[accountId, slug]
	);
}
