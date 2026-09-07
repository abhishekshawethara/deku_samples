import { query, pool } from './db.js';
import { hashPassword, verifyPassword, newToken, reference } from './auth.js';
import { sendMail, enquiryMail, accessRequestMail, applicationMail } from './mail.js';
import { ROADMAP } from './seed-content.js';

const TOKEN_TTL_HOURS = 24 * 14;
const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMPERATURE_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];
const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];

class HttpError extends Error {
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

const bad = (message) => new HttpError(400, message, 'invalid_request');
const notFound = (message = 'Not found') => new HttpError(404, message, 'not_found');
const unauthorized = (message = 'Authentication required') =>
	new HttpError(401, message, 'unauthenticated');

function str(v) {
	return typeof v === 'string' ? v.trim() : '';
}

function requireStr(body, field, { max = 4000, min = 1 } = {}) {
	const v = str(body?.[field]);
	if (v.length < min) throw bad(`${field} is required`);
	if (v.length > max) throw bad(`${field} is too long`);
	return v;
}

function validEmail(v) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function intId(raw) {
	const n = Number(raw);
	if (!Number.isInteger(n) || n <= 0) throw notFound();
	return n;
}

async function accountFromRequest(req) {
	const header = req.headers['authorization'] || '';
	const m = /^Bearer\s+(.+)$/i.exec(header);
	if (!m) return null;
	const token = m[1].trim();
	const res = await query(
		`SELECT a.id, a.email, a.display_name, s.expires_at
     FROM sessions s JOIN accounts a ON a.id = s.account_id
     WHERE s.token = $1`,
		[token]
	);
	if (!res.rows.length) return null;
	const row = res.rows[0];
	if (new Date(row.expires_at).getTime() <= Date.now()) {
		await query('DELETE FROM sessions WHERE token=$1', [token]);
		return null;
	}
	return { id: row.id, email: row.email, display_name: row.display_name };
}

async function requireAccount(req) {
	const account = await accountFromRequest(req);
	if (!account) throw unauthorized();
	return account;
}

async function claimSaves(accountId, saveToken) {
	const token = str(saveToken);
	if (!token) return;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const rows = await client.query(
			'SELECT id, solution_id FROM saved_solutions WHERE save_token=$1 ORDER BY id',
			[token]
		);
		for (const row of rows.rows) {
			const moved = await client.query(
				`UPDATE saved_solutions SET account_id=$1, save_token=NULL
         WHERE id=$2 AND NOT EXISTS (
           SELECT 1 FROM saved_solutions s2 WHERE s2.account_id=$1 AND s2.solution_id=$3
         ) RETURNING id`,
				[accountId, row.id, row.solution_id]
			);
			if (!moved.rows.length) {
				await client.query('DELETE FROM saved_solutions WHERE id=$1', [row.id]);
			}
		}
		await client.query('COMMIT');
	} catch (err) {
		await client.query('ROLLBACK').catch(() => {});
		throw err;
	} finally {
		client.release();
	}
}

async function issueSession(accountId) {
	const token = newToken();
	const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000);
	await query('INSERT INTO sessions (token, account_id, expires_at) VALUES ($1,$2,$3)', [
		token,
		accountId,
		expires
	]);
	return { token, expires };
}

const solutionFields = `slug, industry, title, summary, output_kind, temperature_band, deployment, module_count`;

function solutionRow(r) {
	return {
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
}

async function findSolutions(q) {
	const where = [];
	const params = [];
	const add = (sql, value) => {
		params.push(value);
		where.push(sql.replace('$?', `$${params.length}`));
	};
	if (str(q.industry)) add('industry = $?', str(q.industry));
	if (str(q.output_kind)) add('output_kind = $?', str(q.output_kind));
	if (str(q.temperature_band)) add('temperature_band = $?', str(q.temperature_band));
	if (str(q.deployment)) add('deployment = $?', str(q.deployment));
	if (str(q.q)) {
		params.push(`%${str(q.q).toLowerCase()}%`);
		const i = params.length;
		where.push(
			`(lower(title) LIKE $${i} OR lower(industry) LIKE $${i} OR lower(summary) LIKE $${i} OR lower(detail) LIKE $${i} OR lower(slug) LIKE $${i})`
		);
	}
	const sql = `SELECT id, ${solutionFields} FROM solutions ${
		where.length ? 'WHERE ' + where.join(' AND ') : ''
	} ORDER BY sort_order, id`;
	const res = await query(sql, params);
	return res.rows.map(solutionRow);
}

export function calculate(need_mw, kind) {
	const need = Number(need_mw);
	if (!Number.isFinite(need) || need <= 0) throw bad('need_mw must be greater than zero');
	const k = str(kind) || 'thermal';
	if (k !== 'thermal' && k !== 'electrical') throw bad('kind must be thermal or electrical');
	const perModule = k === 'thermal' ? 250 : 100;
	const modules_required = Math.ceil(need / perModule);
	const annual_clean_energy_gwh = (modules_required * perModule * 8000) / 1000;
	const annual_co2_avoided_tonnes = annual_clean_energy_gwh * 450;
	return { modules_required, annual_clean_energy_gwh, annual_co2_avoided_tonnes };
}

async function safeSend(app, message) {
	try {
		await sendMail(message);
		app.log.info({ mail_to: message.to, mail_subject: message.subject }, 'mail sent');
		return true;
	} catch (err) {
		app.log.error({ err: String(err), mail_to: message.to }, 'mail send failed');
		return false;
	}
}

export async function registerApi(app) {
	app.setErrorHandler((err, req, reply) => {
		if (err instanceof HttpError || err.status) {
			return reply
				.code(err.status || 400)
				.send({ error: err.code || 'error', message: err.message });
		}
		if (err.validation || err.statusCode === 400) {
			return reply.code(400).send({ error: 'invalid_request', message: err.message });
		}
		req.log.error({ err: err.stack || String(err) }, 'unhandled error');
		return reply.code(500).send({ error: 'server_error', message: 'Something went wrong' });
	});

	app.get('/api/health', async () => {
		await query('SELECT 1');
		return { status: 'ok' };
	});

	// ---- auth ----
	app.post('/api/auth/signup', async (req, reply) => {
		const body = req.body || {};
		const email = requireStr(body, 'email', { max: 320 }).toLowerCase();
		if (!validEmail(email)) throw bad('email must be a valid email address');
		const password = str(body.password);
		if (password.length < 8) throw bad('password must be at least 8 characters');
		const display_name = requireStr(body, 'display_name', { max: 120 });
		const exists = await query('SELECT id FROM accounts WHERE email=$1', [email]);
		if (exists.rows.length) throw new HttpError(409, 'An account with that email already exists', 'conflict');
		let account;
		try {
			const res = await query(
				'INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id, email, display_name',
				[email, hashPassword(password), display_name]
			);
			account = res.rows[0];
		} catch (err) {
			if (err.code === '23505')
				throw new HttpError(409, 'An account with that email already exists', 'conflict');
			throw err;
		}
		await claimSaves(account.id, body.save_token);
		const { token } = await issueSession(account.id);
		return reply.code(201).send({
			id: account.id,
			email: account.email,
			display_name: account.display_name,
			access_token: token,
			token_type: 'Bearer'
		});
	});

	app.post('/api/auth/login', async (req) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = str(body.password);
		if (!email || !password) throw bad('email and password are required');
		const res = await query(
			'SELECT id, email, display_name, password_hash FROM accounts WHERE email=$1',
			[email]
		);
		const row = res.rows[0];
		if (!row || !verifyPassword(password, row.password_hash))
			throw new HttpError(401, 'Those details do not match an account', 'invalid_credentials');
		await claimSaves(row.id, body.save_token);
		const { token, expires } = await issueSession(row.id);
		return {
			access_token: token,
			token_type: 'Bearer',
			expires_at: expires.toISOString(),
			account: { id: row.id, email: row.email, display_name: row.display_name }
		};
	});

	app.post('/api/auth/logout', async (req) => {
		const header = req.headers['authorization'] || '';
		const m = /^Bearer\s+(.+)$/i.exec(header);
		if (m) await query('DELETE FROM sessions WHERE token=$1', [m[1].trim()]);
		return { ok: true };
	});

	app.get('/api/accounts/me', async (req) => {
		const account = await requireAccount(req);
		return { id: account.id, email: account.email, display_name: account.display_name };
	});

	// ---- solutions ----
	app.get('/api/solutions', async (req, reply) => {
		const rows = await findSolutions(req.query || {});
		reply.header('X-Total-Count', String(rows.length));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return rows;
	});

	app.get('/api/solutions/:slug', async (req) => {
		const res = await query(`SELECT id, ${solutionFields}, detail FROM solutions WHERE slug=$1`, [
			req.params.slug
		]);
		if (!res.rows.length) throw notFound('No solution with that slug');
		return { ...solutionRow(res.rows[0]), detail: res.rows[0].detail };
	});

	app.get('/api/compare', async (req) => {
		const raw = req.query?.slugs;
		const list = (Array.isArray(raw) ? raw.join(',') : str(raw))
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const unique = [...new Set(list)];
		if (unique.length > 4) throw bad('The comparison holds at most four solutions');
		if (!unique.length) return [];
		const res = await query(
			`SELECT id, ${solutionFields}, detail FROM solutions WHERE slug = ANY($1::text[]) ORDER BY sort_order, id`,
			[unique]
		);
		return res.rows.map((r) => ({ ...solutionRow(r), detail: r.detail }));
	});

	// ---- saves ----
	app.get('/api/saves', async (req) => {
		const account = await accountFromRequest(req);
		const saveToken = str(req.query?.save_token);
		if (!account && !saveToken) throw unauthorized('Sign in or supply a save_token');
		const res = account
			? await query(
					`SELECT ss.id, ss.solution_id, s.slug, s.title, s.industry, s.summary, s.output_kind,
             s.temperature_band, s.deployment, s.module_count, ss.created_at
       FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
       WHERE ss.account_id=$1 ORDER BY ss.id`,
					[account.id]
				)
			: await query(
					`SELECT ss.id, ss.solution_id, s.slug, s.title, s.industry, s.summary, s.output_kind,
             s.temperature_band, s.deployment, s.module_count, ss.created_at
       FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
       WHERE ss.save_token=$1 ORDER BY ss.id`,
					[saveToken]
				);
		return res.rows;
	});

	app.post('/api/saves', async (req, reply) => {
		const account = await accountFromRequest(req);
		const body = req.body || {};
		const slug = requireStr(body, 'solution_slug', { max: 120 });
		const sol = await query('SELECT id, slug FROM solutions WHERE slug=$1', [slug]);
		if (!sol.rows.length) throw bad('No solution with that slug');
		const solutionId = sol.rows[0].id;

		if (account) {
			const res = await query(
				`INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
         ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING
         RETURNING id`,
				[account.id, solutionId]
			);
			let id = res.rows[0]?.id;
			if (!id) {
				const existing = await query(
					'SELECT id FROM saved_solutions WHERE account_id=$1 AND solution_id=$2',
					[account.id, solutionId]
				);
				id = existing.rows[0]?.id;
			}
			return reply.code(201).send({ id, solution_id: solutionId, slug, save_token: null });
		}

		const token = str(body.save_token) || newToken();
		const res = await query(
			`INSERT INTO saved_solutions (save_token, solution_id) VALUES ($1,$2)
       ON CONFLICT (save_token, solution_id) WHERE save_token IS NOT NULL DO NOTHING
       RETURNING id`,
			[token, solutionId]
		);
		let id = res.rows[0]?.id;
		if (!id) {
			const existing = await query(
				'SELECT id FROM saved_solutions WHERE save_token=$1 AND solution_id=$2',
				[token, solutionId]
			);
			id = existing.rows[0]?.id;
		}
		return reply.code(201).send({ id, solution_id: solutionId, slug, save_token: token });
	});

	app.delete('/api/saves/:id', async (req) => {
		const account = await accountFromRequest(req);
		const saveToken = str(req.query?.save_token);
		const id = intId(req.params.id);
		if (!account && !saveToken) throw unauthorized('Sign in or supply a save_token');
		const res = account
			? await query('DELETE FROM saved_solutions WHERE id=$1 AND account_id=$2 RETURNING id', [
					id,
					account.id
				])
			: await query('DELETE FROM saved_solutions WHERE id=$1 AND save_token=$2 RETURNING id', [
					id,
					saveToken
				]);
		if (!res.rows.length) throw notFound('No saved solution with that id');
		return { id, deleted: true };
	});

	// ---- searches ----
	app.get('/api/searches', async (req) => {
		const account = await requireAccount(req);
		const res = await query(
			`SELECT id, name, query, industry, output_kind, temperature_band, deployment, created_at
       FROM saved_searches WHERE account_id=$1 ORDER BY id`,
			[account.id]
		);
		return res.rows;
	});

	app.post('/api/searches', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		const name = requireStr(body, 'name', { max: 120 });
		const fields = {
			query: str(body.query) || null,
			industry: str(body.industry) || null,
			output_kind: str(body.output_kind) || null,
			temperature_band: str(body.temperature_band) || null,
			deployment: str(body.deployment) || null
		};
		if (fields.output_kind && !OUTPUT_KINDS.includes(fields.output_kind))
			throw bad('output_kind is not one of the four kinds');
		if (fields.temperature_band && !TEMPERATURE_BANDS.includes(fields.temperature_band))
			throw bad('temperature_band is not one of the three bands');
		if (fields.deployment && !DEPLOYMENTS.includes(fields.deployment))
			throw bad('deployment is not one of the two deployments');
		const res = await query(
			`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (account_id, name) DO UPDATE SET query=EXCLUDED.query, industry=EXCLUDED.industry,
         output_kind=EXCLUDED.output_kind, temperature_band=EXCLUDED.temperature_band,
         deployment=EXCLUDED.deployment
       RETURNING id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
			[
				account.id,
				name,
				fields.query,
				fields.industry,
				fields.output_kind,
				fields.temperature_band,
				fields.deployment
			]
		);
		return reply.code(201).send(res.rows[0]);
	});

	app.delete('/api/searches/:id', async (req) => {
		const account = await requireAccount(req);
		const id = intId(req.params.id);
		const res = await query('DELETE FROM saved_searches WHERE id=$1 AND account_id=$2 RETURNING id', [
			id,
			account.id
		]);
		if (!res.rows.length) throw notFound('No saved search with that id');
		return { id, deleted: true };
	});

	// ---- enquiries ----
	app.post('/api/enquiries', async (req, reply) => {
		const account = await accountFromRequest(req);
		const body = req.body || {};
		const name = requireStr(body, 'name', { max: 160 });
		const email = requireStr(body, 'email', { max: 320 }).toLowerCase();
		if (!validEmail(email)) throw bad('email must be a valid email address');
		const topic = requireStr(body, 'topic', { max: 60 });
		if (!TOPICS.includes(topic)) throw bad('topic is not one of the five topics');
		const message = requireStr(body, 'message', { max: 5000, min: 4 });
		const phone_country = str(body.phone_country).slice(0, 12) || null;
		const phone = str(body.phone).slice(0, 40) || null;

		let row = null;
		for (let attempt = 0; attempt < 5 && !row; attempt++) {
			try {
				const res = await query(
					`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'received')
           RETURNING id, reference, account_id, name, email, phone_country, phone, topic, message, status, created_at`,
					[reference('ENQ'), account?.id ?? null, name, email, phone_country, phone, topic, message]
				);
				row = res.rows[0];
			} catch (err) {
				if (err.code !== '23505') throw err;
			}
		}
		if (!row) throw new HttpError(503, 'Could not mint a reference, please try again', 'retry');
		await safeSend(app, enquiryMail(row));
		return reply.code(201).send(row);
	});

	app.get('/api/enquiries', async (req) => {
		const account = await requireAccount(req);
		const res = await query(
			`SELECT id, reference, name, email, phone_country, phone, topic, message, status, created_at
       FROM enquiries WHERE account_id=$1 ORDER BY id DESC`,
			[account.id]
		);
		return res.rows;
	});

	app.post('/api/enquiries/:id/close', async (req) => {
		const account = await requireAccount(req);
		const id = intId(req.params.id);
		const res = await query(
			`UPDATE enquiries SET status='closed' WHERE id=$1 AND account_id=$2
       RETURNING id, reference, topic, status, created_at`,
			[id, account.id]
		);
		if (!res.rows.length) throw notFound('No enquiry with that id');
		return res.rows[0];
	});

	// ---- access request ----
	app.get('/api/access-request', async (req) => {
		const account = await requireAccount(req);
		const res = await query(
			`SELECT id, reference, organisation, role_title, status, created_at
       FROM access_requests WHERE account_id=$1`,
			[account.id]
		);
		if (!res.rows.length) throw notFound('No access request for this account');
		return res.rows[0];
	});

	app.post('/api/access-request', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		const organisation = requireStr(body, 'organisation', { max: 160 });
		const role_title = requireStr(body, 'role_title', { max: 160 });
		let row = null;
		for (let attempt = 0; attempt < 5 && !row; attempt++) {
			try {
				const res = await query(
					`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
           VALUES ($1,$2,$3,$4,'pending')
           ON CONFLICT (account_id) DO UPDATE SET organisation=EXCLUDED.organisation,
             role_title=EXCLUDED.role_title
           RETURNING id, reference, organisation, role_title, status, created_at`,
					[reference('IAR'), account.id, organisation, role_title]
				);
				row = res.rows[0];
			} catch (err) {
				if (err.code !== '23505') throw err;
			}
		}
		if (!row) throw new HttpError(503, 'Could not record the request, please try again', 'retry');
		await safeSend(app, accessRequestMail(account, row));
		return reply.code(201).send(row);
	});

	app.get('/api/documents', async (req) => {
		const account = await requireAccount(req);
		const req_res = await query('SELECT status FROM access_requests WHERE account_id=$1', [
			account.id
		]);
		if (req_res.rows[0]?.status !== 'approved') throw notFound('Not found');
		const res = await query(
			'SELECT slug, title, category, published_at, summary FROM documents ORDER BY published_at DESC, id'
		);
		return res.rows;
	});

	// ---- stories ----
	app.get('/api/stories', async (req, reply) => {
		const q = req.query || {};
		const where = [];
		const params = [];
		if (q.featured !== undefined && str(q.featured) !== '') {
			const v = str(q.featured).toLowerCase();
			params.push(v === 'true' || v === '1');
			where.push(`featured = $${params.length}`);
		}
		const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
		const total = await query(`SELECT count(*)::int AS n FROM stories ${whereSql}`, params);
		const limitRaw = Number(q.limit);
		const offsetRaw = Number(q.offset);
		const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : null;
		const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;
		const params2 = [...params];
		let sql = `SELECT slug, title, outlet, published_at, featured FROM stories ${whereSql} ORDER BY published_at DESC, id DESC`;
		if (limit !== null) {
			params2.push(limit);
			sql += ` LIMIT $${params2.length}`;
		}
		if (offset) {
			params2.push(offset);
			sql += ` OFFSET $${params2.length}`;
		}
		const res = await query(sql, params2);
		reply.header('X-Total-Count', String(total.rows[0].n));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return res.rows;
	});

	app.get('/api/stories/:slug', async (req) => {
		const res = await query(
			'SELECT slug, title, outlet, published_at, featured, body FROM stories WHERE slug=$1',
			[req.params.slug]
		);
		if (!res.rows.length) throw notFound('No story with that slug');
		return res.rows[0];
	});

	// ---- jobs and applications ----
	app.get('/api/jobs', async () => {
		const res = await query('SELECT slug, title, location, team, description FROM jobs ORDER BY id');
		return res.rows;
	});

	app.post('/api/applications', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		const job_slug = requireStr(body, 'job_slug', { max: 120 });
		const name = requireStr(body, 'name', { max: 160 });
		const email = requireStr(body, 'email', { max: 320 }).toLowerCase();
		if (!validEmail(email)) throw bad('email must be a valid email address');
		const note = requireStr(body, 'note', { max: 5000, min: 4 });
		const job = await query('SELECT id, slug, title, location, team FROM jobs WHERE slug=$1', [
			job_slug
		]);
		if (!job.rows.length) throw bad('No job with that slug');
		const j = job.rows[0];
		const res = await query(
			`INSERT INTO applications (account_id, job_id, name, email, note, status)
       VALUES ($1,$2,$3,$4,$5,'received')
       ON CONFLICT (account_id, job_id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email,
         note=EXCLUDED.note
       RETURNING id, account_id, job_id, name, email, note, status, created_at`,
			[account.id, j.id, name, email, note]
		);
		const row = res.rows[0];
		await safeSend(app, applicationMail(row, j));
		return reply.code(201).send({ ...row, job_slug: j.slug, job_title: j.title });
	});

	app.get('/api/applications', async (req) => {
		const account = await requireAccount(req);
		const res = await query(
			`SELECT a.id, a.name, a.email, a.note, a.status, a.created_at, j.slug AS job_slug,
              j.title AS job_title, j.location, j.team
       FROM applications a JOIN jobs j ON j.id = a.job_id
       WHERE a.account_id=$1 ORDER BY a.id DESC`,
			[account.id]
		);
		return res.rows;
	});

	// ---- calculator ----
	app.post('/api/calculator', async (req) => {
		const body = req.body || {};
		if (body.need_mw === undefined || body.need_mw === null || body.need_mw === '')
			throw bad('need_mw is required');
		return calculate(body.need_mw, body.kind);
	});

	// ---- reference content ----
	app.get('/api/team', async () => {
		const res = await query(
			'SELECT slug, name, role_title, bio, profile_url FROM team_members ORDER BY sort_order, id'
		);
		return res.rows;
	});

	app.get('/api/offices', async () => {
		const res = await query('SELECT city, country, role_label FROM offices ORDER BY id');
		return res.rows;
	});

	app.get('/api/faqs', async (req) => {
		const q = req.query || {};
		const where = [];
		const params = [];
		if (str(q.category)) {
			params.push(str(q.category));
			where.push(`category = $${params.length}`);
		}
		if (str(q.q)) {
			params.push(`%${str(q.q).toLowerCase()}%`);
			const i = params.length;
			where.push(`(lower(question) LIKE $${i} OR lower(answer) LIKE $${i})`);
		}
		const res = await query(
			`SELECT question, answer, category FROM faqs ${
				where.length ? 'WHERE ' + where.join(' AND ') : ''
			} ORDER BY sort_order, id`,
			params
		);
		return res.rows;
	});

	app.get('/api/copy', async (req) => {
		const routeKey = str(req.query?.route_key);
		const res = routeKey
			? await query(
					'SELECT route_key, block_key, heading, body FROM site_copy WHERE route_key=$1 ORDER BY sort_order, id',
					[routeKey]
				)
			: await query(
					'SELECT route_key, block_key, heading, body FROM site_copy ORDER BY route_key, sort_order, id'
				);
		return res.rows;
	});

	app.get('/api/roadmap', async () => ROADMAP);

	app.all('/api/*', async (req, reply) => {
		reply.code(404).send({ error: 'not_found', message: 'No such endpoint' });
	});
}
