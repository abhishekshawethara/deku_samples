import { query, pool } from './db.js';
import {
	accountFromRequest,
	hashPassword,
	verifyPassword,
	issueToken,
	reference,
	newSaveToken
} from './auth.js';
import { sendMail } from './mail.js';

const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMPERATURE_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];

const MODULE_THERMAL_MW = 250;
const MODULE_ELECTRICAL_MW = 100;
const HOURS_PER_YEAR = 8000;
const TONNES_PER_GWH = 450;

class HttpError extends Error {
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code || 'error';
	}
}

const bad = (m) => new HttpError(400, m, 'invalid_request');
const notFound = (m = 'Not found') => new HttpError(404, m, 'not_found');
const unauthorized = (m = 'Authentication required') => new HttpError(401, m, 'unauthorized');

function str(v) {
	return typeof v === 'string' ? v.trim() : '';
}

function positiveId(v) {
	const n = Number(v);
	if (!Number.isInteger(n) || n <= 0) return null;
	return n;
}

async function requireAccount(req) {
	const { account, reason } = await accountFromRequest(req);
	if (!account) {
		throw new HttpError(401, reason === 'expired' ? 'Token expired' : 'Authentication required', reason === 'expired' ? 'token_expired' : 'unauthorized');
	}
	return account;
}

async function optionalAccount(req) {
	const { account } = await accountFromRequest(req);
	return account;
}

function solutionRow(r, withDetail = false) {
	const base = {
		id: r.id,
		slug: r.slug,
		industry: r.industry,
		title: r.title,
		summary: r.summary,
		output_kind: r.output_kind,
		temperature_band: r.temperature_band,
		deployment: r.deployment,
		module_count: r.module_count
	};
	if (withDetail) base.detail = r.detail;
	return base;
}

export function calculate(needRaw, kindRaw) {
	const need = Number(needRaw);
	const kind = str(kindRaw) || 'thermal';
	if (!Number.isFinite(need) || need <= 0) {
		throw bad('need_mw must be a number greater than zero');
	}
	if (kind !== 'thermal' && kind !== 'electrical') {
		throw bad('kind must be thermal or electrical');
	}
	const perModule = kind === 'thermal' ? MODULE_THERMAL_MW : MODULE_ELECTRICAL_MW;
	const modules_required = Math.ceil(need / perModule);
	const annual_clean_energy_gwh = (modules_required * perModule * HOURS_PER_YEAR) / 1000;
	const annual_co2_avoided_tonnes = annual_clean_energy_gwh * TONNES_PER_GWH;
	return { modules_required, annual_clean_energy_gwh, annual_co2_avoided_tonnes };
}

async function claimSaves(client, accountId, saveToken) {
	const token = str(saveToken);
	if (!token) return;
	await client.query(
		`UPDATE saved_solutions SET account_id = $1, save_token = NULL
     WHERE save_token = $2
       AND solution_id NOT IN (SELECT solution_id FROM saved_solutions WHERE account_id = $1)`,
		[accountId, token]
	);
	await client.query('DELETE FROM saved_solutions WHERE save_token = $1', [token]);
}

export async function registerApi(app) {
	app.setErrorHandler((err, req, reply) => {
		const status = err.status || err.statusCode || 500;
		if (status >= 500) req.log.error({ event: 'unhandled_error', err: String(err.stack || err) });
		reply.code(status).send({
			error: err.code || (status === 404 ? 'not_found' : 'error'),
			message: status >= 500 ? 'Internal server error' : err.message || 'Request failed'
		});
	});

	app.get('/api/health', async (req, reply) => {
		try {
			await query('SELECT 1');
			return { status: 'ok' };
		} catch {
			return reply.code(503).send({ status: 'unavailable' });
		}
	});

	/* ---------- auth ---------- */

	app.post('/api/auth/signup', async (req, reply) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = typeof body.password === 'string' ? body.password : '';
		const display_name = str(body.display_name);
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('A valid email address is required');
		if (password.length < 8) throw bad('Password must be at least 8 characters');
		if (!display_name) throw bad('A display name is required');

		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const existing = await client.query('SELECT id FROM accounts WHERE email = $1', [email]);
			if (existing.rows.length) throw new HttpError(409, 'That email address already has an account', 'email_taken');
			const { rows } = await client.query(
				'INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id, email, display_name',
				[email, hashPassword(password), display_name]
			);
			await claimSaves(client, rows[0].id, body.save_token);
			await client.query('COMMIT');
			const account = rows[0];
			return reply.code(201).send({
				id: account.id,
				email: account.email,
				display_name: account.display_name,
				access_token: issueToken(account.id),
				token_type: 'Bearer'
			});
		} catch (err) {
			await client.query('ROLLBACK').catch(() => {});
			if (err.code === '23505') throw new HttpError(409, 'That email address already has an account', 'email_taken');
			throw err;
		} finally {
			client.release();
		}
	});

	app.post('/api/auth/login', async (req) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = typeof body.password === 'string' ? body.password : '';
		const { rows } = await query(
			'SELECT id, email, display_name, password_hash FROM accounts WHERE email = $1',
			[email]
		);
		const account = rows[0];
		if (!account || !verifyPassword(password, account.password_hash)) {
			throw new HttpError(401, 'Email or password is not correct', 'invalid_credentials');
		}
		if (str(body.save_token)) {
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				await claimSaves(client, account.id, body.save_token);
				await client.query('COMMIT');
			} catch (err) {
				await client.query('ROLLBACK').catch(() => {});
				throw err;
			} finally {
				client.release();
			}
		}
		return {
			access_token: issueToken(account.id),
			token_type: 'Bearer',
			account: { id: account.id, email: account.email, display_name: account.display_name }
		};
	});

	app.get('/api/accounts/me', async (req) => {
		const account = await requireAccount(req);
		return { id: account.id, email: account.email, display_name: account.display_name };
	});

	/* ---------- solutions ---------- */

	app.get('/api/solutions', async (req, reply) => {
		const q = req.query || {};
		const clauses = [];
		const params = [];
		const add = (sql, value) => {
			params.push(value);
			clauses.push(sql.replace('$?', `$${params.length}`));
		};
		if (str(q.industry)) add('industry = $?', str(q.industry));
		if (str(q.output_kind)) add('output_kind = $?', str(q.output_kind));
		if (str(q.temperature_band)) add('temperature_band = $?', str(q.temperature_band));
		if (str(q.deployment)) add('deployment = $?', str(q.deployment));
		if (str(q.q)) {
			params.push(`%${str(q.q).toLowerCase()}%`);
			const i = params.length;
			clauses.push(
				`(lower(title) LIKE $${i} OR lower(industry) LIKE $${i} OR lower(summary) LIKE $${i} OR lower(detail) LIKE $${i} OR lower(slug) LIKE $${i})`
			);
		}
		const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
		const { rows } = await query(`SELECT * FROM solutions ${where} ORDER BY id`, params);
		reply.header('X-Total-Count', String(rows.length));
		return rows.map((r) => solutionRow(r));
	});

	app.get('/api/solutions/:slug', async (req) => {
		const { rows } = await query('SELECT * FROM solutions WHERE slug = $1', [req.params.slug]);
		if (!rows.length) throw notFound('No solution with that slug');
		return solutionRow(rows[0], true);
	});

	app.get('/api/compare', async (req, reply) => {
		const raw = req.query?.slugs;
		let slugs = [];
		if (Array.isArray(raw)) slugs = raw.flatMap((v) => String(v).split(','));
		else if (typeof raw === 'string') slugs = raw.split(',');
		slugs = slugs.map((s) => s.trim()).filter(Boolean);
		const unique = [...new Set(slugs)];
		if (unique.length > 4) throw bad('The comparison holds at most four solutions');
		if (!unique.length) {
			reply.header('X-Total-Count', '0');
			return [];
		}
		const { rows } = await query('SELECT * FROM solutions WHERE slug = ANY($1) ORDER BY id', [unique]);
		reply.header('X-Total-Count', String(rows.length));
		return rows.map((r) => solutionRow(r, true));
	});

	/* ---------- saves ---------- */

	app.get('/api/saves', async (req) => {
		const account = await optionalAccount(req);
		const token = str(req.query?.save_token);
		if (!account && !token) throw unauthorized('Sign in or supply a save_token to read saves');
		const sql = `SELECT ss.id, ss.solution_id, ss.save_token, s.slug, s.title, s.industry, s.summary,
                    s.output_kind, s.temperature_band, s.deployment, s.module_count, ss.created_at
             FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
             WHERE ${account ? 'ss.account_id = $1' : 'ss.save_token = $1 AND ss.account_id IS NULL'}
             ORDER BY ss.id`;
		const { rows } = await query(sql, [account ? account.id : token]);
		return rows.map((r) => ({
			id: r.id,
			solution_id: r.solution_id,
			slug: r.slug,
			title: r.title,
			industry: r.industry,
			summary: r.summary,
			output_kind: r.output_kind,
			temperature_band: r.temperature_band,
			deployment: r.deployment,
			module_count: r.module_count,
			created_at: r.created_at
		}));
	});

	app.post('/api/saves', async (req, reply) => {
		const account = await optionalAccount(req);
		const body = req.body || {};
		const slug = str(body.solution_slug);
		if (!slug) throw bad('solution_slug is required');
		const sol = await query('SELECT id, slug FROM solutions WHERE slug = $1', [slug]);
		if (!sol.rows.length) throw notFound('No solution with that slug');
		const solutionId = sol.rows[0].id;

		if (account) {
			const ins = await query(
				`INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
         ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING
         RETURNING id`,
				[account.id, solutionId]
			);
			let id = ins.rows[0]?.id;
			if (!id) {
				const ex = await query(
					'SELECT id FROM saved_solutions WHERE account_id = $1 AND solution_id = $2',
					[account.id, solutionId]
				);
				id = ex.rows[0].id;
			}
			return reply.code(201).send({ id, solution_id: solutionId, slug, save_token: null });
		}

		const token = str(body.save_token) || newSaveToken();
		const ins = await query(
			`INSERT INTO saved_solutions (save_token, solution_id) VALUES ($1,$2)
       ON CONFLICT (save_token, solution_id) WHERE save_token IS NOT NULL DO NOTHING
       RETURNING id`,
			[token, solutionId]
		);
		let id = ins.rows[0]?.id;
		if (!id) {
			const ex = await query(
				'SELECT id FROM saved_solutions WHERE save_token = $1 AND solution_id = $2',
				[token, solutionId]
			);
			id = ex.rows[0].id;
		}
		return reply.code(201).send({ id, solution_id: solutionId, slug, save_token: token });
	});

	app.delete('/api/saves/:id', async (req, reply) => {
		const account = await optionalAccount(req);
		const token = str(req.query?.save_token);
		if (!account && !token) throw unauthorized('Sign in or supply a save_token to remove a save');
		const id = positiveId(req.params.id);
		if (!id) throw notFound('No saved solution with that id');
		const { rows } = await query(
			`DELETE FROM saved_solutions
       WHERE id = $1 AND ${account ? 'account_id = $2' : 'save_token = $2 AND account_id IS NULL'}
       RETURNING id`,
			[id, account ? account.id : token]
		);
		if (!rows.length) throw notFound('No saved solution with that id');
		return reply.code(200).send({ id: rows[0].id, deleted: true });
	});

	/* ---------- saved searches ---------- */

	app.get('/api/searches', async (req) => {
		const account = await requireAccount(req);
		const { rows } = await query(
			'SELECT id, name, query, industry, output_kind, temperature_band, deployment, created_at FROM saved_searches WHERE account_id = $1 ORDER BY id',
			[account.id]
		);
		return rows;
	});

	app.post('/api/searches', async (req, reply) => {
		const account = await requireAccount(req);
		const b = req.body || {};
		const name = str(b.name);
		if (!name) throw bad('A name is required for a saved search');
		const check = (value, list, label) => {
			const v = str(value);
			if (v && !list.includes(v)) throw bad(`${label} is not one of the accepted values`);
			return v;
		};
		const output_kind = check(b.output_kind, OUTPUT_KINDS, 'output_kind');
		const temperature_band = check(b.temperature_band, TEMPERATURE_BANDS, 'temperature_band');
		const deployment = check(b.deployment, DEPLOYMENTS, 'deployment');
		const { rows } = await query(
			`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (account_id, name) DO UPDATE SET query = EXCLUDED.query, industry = EXCLUDED.industry,
         output_kind = EXCLUDED.output_kind, temperature_band = EXCLUDED.temperature_band,
         deployment = EXCLUDED.deployment
       RETURNING id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
			[account.id, name, str(b.query), str(b.industry), output_kind, temperature_band, deployment]
		);
		return reply.code(201).send(rows[0]);
	});

	app.delete('/api/searches/:id', async (req) => {
		const account = await requireAccount(req);
		const id = positiveId(req.params.id);
		if (!id) throw notFound('No saved search with that id');
		const { rows } = await query(
			'DELETE FROM saved_searches WHERE id = $1 AND account_id = $2 RETURNING id',
			[id, account.id]
		);
		if (!rows.length) throw notFound('No saved search with that id');
		return { id: rows[0].id, deleted: true };
	});

	/* ---------- enquiries ---------- */

	app.post('/api/enquiries', async (req, reply) => {
		const account = await optionalAccount(req);
		const b = req.body || {};
		const name = str(b.name);
		const email = str(b.email);
		const topic = str(b.topic);
		const message = str(b.message);
		if (!name) throw bad('A name is required');
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('A valid email address is required');
		if (!TOPICS.includes(topic)) throw bad(`topic must be one of ${TOPICS.join(', ')}`);
		if (!message) throw bad('A message is required');

		let row = null;
		for (let attempt = 0; attempt < 5 && !row; attempt += 1) {
			try {
				const res = await query(
					`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'received')
           RETURNING id, reference, status, topic, created_at`,
					[reference('ENQ'), account?.id ?? null, name, email, str(b.phone_country), str(b.phone), topic, message]
				);
				row = res.rows[0];
			} catch (err) {
				if (err.code !== '23505') throw err;
			}
		}
		if (!row) throw new HttpError(500, 'Could not mint a unique reference');

		await sendMail(
			{
				to: email,
				subject: `Enquiry received: ${row.reference}`,
				text: `Hello ${name},\n\nThank you for contacting Zettajoule. We have logged your enquiry.\n\nReference: ${row.reference}\nTopic: ${topic}\n\nOur team answers enquiries on ${topic} within two working days. Quote the reference ${row.reference} in any reply.\n\nZettajoule`
			},
			req.log
		);
		return reply.code(201).send({
			id: row.id,
			reference: row.reference,
			status: row.status,
			topic: row.topic,
			created_at: row.created_at
		});
	});

	app.get('/api/enquiries', async (req) => {
		const account = await requireAccount(req);
		const { rows } = await query(
			'SELECT id, reference, name, email, phone_country, phone, topic, message, status, created_at FROM enquiries WHERE account_id = $1 ORDER BY id',
			[account.id]
		);
		return rows;
	});

	app.post('/api/enquiries/:id/close', async (req) => {
		const account = await requireAccount(req);
		const id = positiveId(req.params.id);
		if (!id) throw notFound('No enquiry with that id');
		const { rows } = await query(
			`UPDATE enquiries SET status = 'closed'
       WHERE id = $1 AND account_id = $2
       RETURNING id, reference, topic, status, created_at`,
			[id, account.id]
		);
		if (!rows.length) throw notFound('No enquiry with that id');
		return rows[0];
	});

	/* ---------- access requests ---------- */

	app.get('/api/access-request', async (req) => {
		const account = await requireAccount(req);
		const { rows } = await query(
			'SELECT id, reference, organisation, role_title, status, created_at FROM access_requests WHERE account_id = $1',
			[account.id]
		);
		if (!rows.length) throw notFound('No investor access request on this account');
		return rows[0];
	});

	app.post('/api/access-request', async (req, reply) => {
		const account = await requireAccount(req);
		const b = req.body || {};
		const organisation = str(b.organisation);
		const role_title = str(b.role_title);
		if (!organisation) throw bad('An organisation is required');
		if (!role_title) throw bad('A role title is required');

		let row = null;
		let created = false;
		for (let attempt = 0; attempt < 5 && !row; attempt += 1) {
			try {
				const res = await query(
					`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
           VALUES ($1,$2,$3,$4,'pending')
           ON CONFLICT (account_id) DO UPDATE SET organisation = EXCLUDED.organisation, role_title = EXCLUDED.role_title
           RETURNING id, reference, organisation, role_title, status, created_at, (xmax = 0) AS inserted`,
					[reference('IAR'), account.id, organisation, role_title]
				);
				row = res.rows[0];
				created = row.inserted === true;
			} catch (err) {
				if (err.code !== '23505') throw err;
			}
		}
		if (!row) throw new HttpError(500, 'Could not mint a unique reference');
		delete row.inserted;

		if (created) {
			await sendMail(
				{
					to: account.email,
					subject: `Investor access requested: ${row.reference}`,
					text: `Hello ${account.display_name},\n\nWe have received your request for access to the Zettajoule investor document room.\n\nOrganisation: ${organisation}\nRole: ${role_title}\nReference: ${row.reference}\n\nYour request for ${organisation} is pending review. You will be able to open the document room once it is approved. Quote the reference ${row.reference} if you contact us about it.\n\nZettajoule`
				},
				req.log
			);
		}
		return reply.code(created ? 201 : 200).send(row);
	});

	/* ---------- documents ---------- */

	app.get('/api/documents', async (req) => {
		const account = await requireAccount(req);
		const { rows } = await query(
			`SELECT status FROM access_requests WHERE account_id = $1`,
			[account.id]
		);
		if (!rows.length || rows[0].status !== 'approved') throw notFound('Not found');
		const docs = await query(
			'SELECT slug, title, category, published_at FROM documents ORDER BY published_at DESC, id'
		);
		return docs.rows;
	});

	/* ---------- stories ---------- */

	app.get('/api/stories', async (req, reply) => {
		const q = req.query || {};
		const clauses = [];
		const params = [];
		if (q.featured !== undefined && str(q.featured) !== '') {
			const v = str(q.featured).toLowerCase();
			params.push(v === 'true' || v === '1');
			clauses.push(`featured = $${params.length}`);
		}
		const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
		const total = await query(`SELECT count(*)::int AS c FROM stories ${where}`, params);
		const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 100);
		const offset = Math.max(Number(q.offset) || 0, 0);
		params.push(limit, offset);
		const { rows } = await query(
			`SELECT slug, title, outlet, published_at, featured FROM stories ${where}
       ORDER BY published_at DESC, id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
			params
		);
		reply.header('X-Total-Count', String(total.rows[0].c));
		return rows;
	});

	app.get('/api/stories/:slug', async (req) => {
		const { rows } = await query(
			'SELECT slug, title, outlet, published_at, featured, body FROM stories WHERE slug = $1',
			[req.params.slug]
		);
		if (!rows.length) throw notFound('No story with that slug');
		return rows[0];
	});

	/* ---------- jobs and applications ---------- */

	app.get('/api/jobs', async () => {
		const { rows } = await query('SELECT slug, title, location, team, description FROM jobs ORDER BY id');
		return rows;
	});

	app.post('/api/applications', async (req, reply) => {
		const account = await requireAccount(req);
		const b = req.body || {};
		const job_slug = str(b.job_slug);
		const name = str(b.name);
		const email = str(b.email);
		const note = str(b.note);
		if (!job_slug) throw bad('job_slug is required');
		if (!name) throw bad('A name is required');
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('A valid email address is required');
		if (!note) throw bad('A note is required');
		const job = await query('SELECT id, slug, title, location FROM jobs WHERE slug = $1', [job_slug]);
		if (!job.rows.length) throw notFound('No job with that slug');
		const j = job.rows[0];

		const { rows } = await query(
			`INSERT INTO applications (account_id, job_id, name, email, note, status)
       VALUES ($1,$2,$3,$4,$5,'received')
       ON CONFLICT (account_id, job_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, note = EXCLUDED.note
       RETURNING id, status, created_at, (xmax = 0) AS inserted`,
			[account.id, j.id, name, email, note]
		);
		const row = rows[0];

		await sendMail(
			{
				to: email,
				subject: `Application received: ${j.title}`,
				text: `Hello ${name},\n\nThank you for applying to Zettajoule.\n\nRole: ${j.title}\nLocation: ${j.location}\n\nWe have your application for ${j.title} in ${j.location} and the hiring team will read it in the next few days. No attachment is needed; your note is the whole application.\n\nZettajoule`
			},
			req.log
		);

		return reply.code(row.inserted ? 201 : 200).send({
			id: row.id,
			job_slug: j.slug,
			job_title: j.title,
			status: row.status,
			created_at: row.created_at
		});
	});

	app.get('/api/applications', async (req) => {
		const account = await requireAccount(req);
		const { rows } = await query(
			`SELECT a.id, j.slug AS job_slug, j.title AS job_title, j.location, a.name, a.email, a.note, a.status, a.created_at
       FROM applications a JOIN jobs j ON j.id = a.job_id
       WHERE a.account_id = $1 ORDER BY a.id`,
			[account.id]
		);
		return rows;
	});

	/* ---------- calculator, content ---------- */

	app.post('/api/calculator', async (req) => {
		const b = req.body || {};
		return calculate(b.need_mw, b.kind);
	});

	app.get('/api/team', async () => {
		const { rows } = await query(
			'SELECT slug, name, role_title, bio, profile_url FROM team_members ORDER BY sort_order, id'
		);
		return rows;
	});

	app.get('/api/offices', async () => {
		const { rows } = await query('SELECT city, country, role_label FROM offices ORDER BY id');
		return rows;
	});

	app.get('/api/faqs', async (req) => {
		const q = req.query || {};
		const clauses = [];
		const params = [];
		if (str(q.category)) {
			params.push(str(q.category));
			clauses.push(`category = $${params.length}`);
		}
		if (str(q.q)) {
			params.push(`%${str(q.q).toLowerCase()}%`);
			clauses.push(`(lower(question) LIKE $${params.length} OR lower(answer) LIKE $${params.length})`);
		}
		const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
		const { rows } = await query(
			`SELECT question, answer, category FROM faqs ${where} ORDER BY id`,
			params
		);
		return rows;
	});
}
