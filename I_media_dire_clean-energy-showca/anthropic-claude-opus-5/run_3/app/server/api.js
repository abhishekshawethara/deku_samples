import { q, pool } from './db.js';
import { hashPassword, verifyPassword, issueToken, readToken, reference, saveToken } from './auth.js';
import { mailEnquiry, mailAccessRequest, mailApplication } from './mail.js';

const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMPERATURE_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];

const SOLUTION_COLS = `slug, industry, title, summary, output_kind, temperature_band, deployment, module_count`;

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

function requireFields(body, fields) {
	const out = {};
	for (const f of fields) {
		const v = str(body?.[f]);
		if (!v) throw bad(`${f} is required`);
		out[f] = v;
	}
	return out;
}

function oneOf(value, allowed, field) {
	const v = str(value);
	if (!allowed.includes(v)) throw bad(`${field} must be one of: ${allowed.join(', ')}`);
	return v;
}

function isEmail(v) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function accountFromRequest(req) {
	const header = req.headers.authorization || '';
	const m = /^Bearer\s+(.+)$/i.exec(header);
	if (!m) return null;
	const claims = readToken(m[1]);
	if (!claims) throw new HttpError(401, 'Invalid token', 'invalid_token');
	if (claims.expired) throw new HttpError(401, 'Token expired', 'token_expired');
	const r = await q('SELECT id, email, display_name FROM accounts WHERE id = $1', [claims.sub]);
	if (!r.rows.length) throw new HttpError(401, 'Invalid token', 'invalid_token');
	return r.rows[0];
}

async function requireAccount(req) {
	const acct = await accountFromRequest(req);
	if (!acct) throw unauthorized();
	return acct;
}

async function claimSaves(client, token, accountId) {
	if (!token) return 0;
	const moved = await client.query(
		`UPDATE saved_solutions s
		    SET account_id = $2, save_token = NULL
		  WHERE s.save_token = $1
		    AND NOT EXISTS (
		      SELECT 1 FROM saved_solutions o
		       WHERE o.account_id = $2 AND o.solution_id = s.solution_id
		    )
		RETURNING id`,
		[token, accountId]
	);
	await client.query('DELETE FROM saved_solutions WHERE save_token = $1', [token]);
	return moved.rowCount;
}

function calculate(needMw, kind) {
	const perModule = kind === 'electrical' ? 100 : 250;
	const modules = Math.ceil(needMw / perModule);
	const gwh = (modules * perModule * 8000) / 1000;
	return {
		modules_required: modules,
		annual_clean_energy_gwh: gwh,
		annual_co2_avoided_tonnes: gwh * 450,
		per_module_mw: perModule,
		kind
	};
}

export default async function api(app) {
	app.setErrorHandler((err, req, reply) => {
		const status = err.status || err.statusCode || 500;
		if (status >= 500) req.log?.error?.({ event: 'server_error', err: String(err?.stack || err) });
		reply.code(status).send({
			error: err.code || (status >= 500 ? 'server_error' : 'error'),
			message: status >= 500 ? 'Something went wrong on our side.' : err.message
		});
	});

	app.setNotFoundHandler((req, reply) => {
		reply.code(404).send({ error: 'not_found', message: 'Not found' });
	});

	app.get('/health', async () => {
		await q('SELECT 1');
		return { status: 'ok' };
	});

	/* ---------------------------------------------------------------- auth */

	app.post('/auth/signup', async (req, reply) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = typeof body.password === 'string' ? body.password : '';
		const display_name = str(body.display_name);
		if (!email || !isEmail(email)) throw bad('A valid email is required');
		if (password.length < 8) throw bad('Password must be at least 8 characters');
		if (!display_name) throw bad('display_name is required');

		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const ins = await client.query(
				`INSERT INTO accounts (email, password_hash, display_name)
				 VALUES ($1, $2, $3)
				 ON CONFLICT (email) DO NOTHING
				 RETURNING id, email, display_name`,
				[email, hashPassword(password), display_name]
			);
			if (!ins.rows.length) {
				await client.query('ROLLBACK');
				throw new HttpError(409, 'An account with that email already exists', 'email_taken');
			}
			const account = ins.rows[0];
			await claimSaves(client, str(body.save_token), account.id);
			await client.query('COMMIT');
			reply.code(201);
			return {
				id: Number(account.id),
				email: account.email,
				display_name: account.display_name,
				access_token: issueToken(account.id),
				token_type: 'Bearer'
			};
		} catch (e) {
			try {
				await client.query('ROLLBACK');
			} catch {}
			throw e;
		} finally {
			client.release();
		}
	});

	app.post('/auth/login', async (req) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = typeof body.password === 'string' ? body.password : '';
		if (!email || !password) throw bad('Email and password are required');
		const r = await q(
			'SELECT id, email, display_name, password_hash FROM accounts WHERE email = $1',
			[email]
		);
		const row = r.rows[0];
		if (!row || !verifyPassword(password, row.password_hash))
			throw new HttpError(401, 'Email or password is incorrect', 'invalid_credentials');

		const token = str(body.save_token);
		if (token) {
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				await claimSaves(client, token, row.id);
				await client.query('COMMIT');
			} catch (e) {
				try {
					await client.query('ROLLBACK');
				} catch {}
			} finally {
				client.release();
			}
		}
		return {
			access_token: issueToken(row.id),
			token_type: 'Bearer',
			expires_in: 43200,
			account: { id: Number(row.id), email: row.email, display_name: row.display_name }
		};
	});

	app.get('/accounts/me', async (req) => {
		const a = await requireAccount(req);
		return { id: Number(a.id), email: a.email, display_name: a.display_name };
	});

	/* ----------------------------------------------------------- solutions */

	app.get('/solutions', async (req, reply) => {
		const { industry, output_kind, temperature_band, deployment, q: search } = req.query || {};
		const where = [];
		const params = [];
		const add = (sql, value) => {
			params.push(value);
			where.push(sql.replace('$?', `$${params.length}`));
		};
		if (str(industry)) add('industry = $?', str(industry));
		if (str(output_kind)) add('output_kind = $?', str(output_kind));
		if (str(temperature_band)) add('temperature_band = $?', str(temperature_band));
		if (str(deployment)) add('deployment = $?', str(deployment));
		if (str(search))
			add(
				'(industry ILIKE $? OR title ILIKE $? OR summary ILIKE $? OR detail ILIKE $? OR slug ILIKE $?)'.replaceAll(
					'$?',
					`$${params.length + 1}`
				),
				`%${str(search)}%`
			);
		const sql = `SELECT ${SOLUTION_COLS} FROM solutions ${
			where.length ? `WHERE ${where.join(' AND ')}` : ''
		} ORDER BY sort_order, id`;
		const r = await q(sql, params);
		reply.header('X-Total-Count', String(r.rowCount));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return r.rows;
	});

	app.get('/solutions/:slug', async (req) => {
		const r = await q(`SELECT ${SOLUTION_COLS}, detail FROM solutions WHERE slug = $1`, [
			req.params.slug
		]);
		if (!r.rows.length) throw notFound('No solution with that slug');
		return r.rows[0];
	});

	app.get('/compare', async (req, reply) => {
		const raw = req.query?.slugs;
		const list = (Array.isArray(raw) ? raw.join(',') : str(raw))
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const unique = [...new Set(list)];
		if (unique.length > 4)
			throw bad('The comparison holds at most four solutions; remove one before adding another');
		if (!unique.length) {
			reply.header('X-Total-Count', '0');
			return [];
		}
		const r = await q(
			`SELECT ${SOLUTION_COLS}, detail FROM solutions WHERE slug = ANY($1::text[]) ORDER BY sort_order, id`,
			[unique]
		);
		reply.header('X-Total-Count', String(r.rowCount));
		return r.rows;
	});

	/* --------------------------------------------------------------- saves */

	app.get('/saves', async (req) => {
		const account = await accountFromRequest(req);
		const token = str(req.query?.save_token);
		if (!account && !token) throw unauthorized('Sign in or supply a save_token');
		const r = account
			? await q(
					`SELECT s.id, s.solution_id, sol.slug, sol.title, sol.industry, sol.output_kind,
					        sol.temperature_band, sol.deployment, sol.module_count, sol.summary, s.created_at
					   FROM saved_solutions s JOIN solutions sol ON sol.id = s.solution_id
					  WHERE s.account_id = $1 ORDER BY s.id`,
					[account.id]
				)
			: await q(
					`SELECT s.id, s.solution_id, sol.slug, sol.title, sol.industry, sol.output_kind,
					        sol.temperature_band, sol.deployment, sol.module_count, sol.summary, s.created_at
					   FROM saved_solutions s JOIN solutions sol ON sol.id = s.solution_id
					  WHERE s.save_token = $1 ORDER BY s.id`,
					[token]
				);
		return r.rows.map((row) => ({ ...row, id: Number(row.id), solution_id: Number(row.solution_id) }));
	});

	app.post('/saves', async (req, reply) => {
		const account = await accountFromRequest(req);
		const slug = str(req.body?.solution_slug);
		if (!slug) throw bad('solution_slug is required');
		const sol = await q('SELECT id, slug FROM solutions WHERE slug = $1', [slug]);
		if (!sol.rows.length) throw notFound('No solution with that slug');
		const solutionId = sol.rows[0].id;

		// A repeated save leaves the stored state unchanged rather than adding a
		// second row. Under simultaneous requests the INSERT may conflict with a
		// transaction that has not yet been visible to this statement's snapshot,
		// so the row is read again afterwards rather than assumed.
		const ownerCol = account ? 'account_id' : 'save_token';
		const owner = account
			? account.id
			: str(req.body?.save_token) || str(req.query?.save_token) || saveToken();

		const ins = await q(
			`INSERT INTO saved_solutions (${ownerCol}, solution_id) VALUES ($1, $2)
			 ON CONFLICT (${ownerCol}, solution_id) WHERE ${ownerCol} IS NOT NULL DO NOTHING
			 RETURNING id, solution_id`,
			[owner, solutionId]
		);

		let row = ins.rows[0];
		const created = Boolean(row);
		if (!row) {
			for (let attempt = 0; attempt < 3 && !row; attempt++) {
				const existing = await q(
					`SELECT id, solution_id FROM saved_solutions
					  WHERE ${ownerCol} = $1 AND solution_id = $2`,
					[owner, solutionId]
				);
				row = existing.rows[0];
				if (!row) await new Promise((r) => setTimeout(r, 20));
			}
		}
		if (!row) throw new HttpError(409, 'Could not save that solution; try again', 'conflict');

		reply.code(created ? 201 : 200);
		return {
			id: Number(row.id),
			solution_id: Number(row.solution_id),
			slug,
			save_token: account ? null : owner
		};
	});

	app.delete('/saves/:id', async (req) => {
		const account = await accountFromRequest(req);
		const token = str(req.query?.save_token);
		if (!account && !token) throw unauthorized('Sign in or supply a save_token');
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) throw notFound('No such saved solution');
		const r = account
			? await q('DELETE FROM saved_solutions WHERE id = $1 AND account_id = $2 RETURNING id', [
					id,
					account.id
				])
			: await q('DELETE FROM saved_solutions WHERE id = $1 AND save_token = $2 RETURNING id', [
					id,
					token
				]);
		if (!r.rows.length) throw notFound('No such saved solution');
		return { id, deleted: true };
	});

	/* ------------------------------------------------------------ searches */

	app.get('/searches', async (req) => {
		const account = await requireAccount(req);
		const r = await q(
			`SELECT id, name, query, industry, output_kind, temperature_band, deployment, created_at
			   FROM saved_searches WHERE account_id = $1 ORDER BY id`,
			[account.id]
		);
		return r.rows.map((row) => ({ ...row, id: Number(row.id) }));
	});

	app.post('/searches', async (req) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		const name = str(body.name);
		if (!name) throw bad('name is required');
		const nullable = (v, allowed, field) => {
			const s = str(v);
			if (!s) return null;
			if (allowed) return oneOf(s, allowed, field);
			return s;
		};
		const r = await q(
			`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
			 VALUES ($1,$2,$3,$4,$5,$6,$7)
			 ON CONFLICT (account_id, name) DO UPDATE
			   SET query = EXCLUDED.query, industry = EXCLUDED.industry,
			       output_kind = EXCLUDED.output_kind, temperature_band = EXCLUDED.temperature_band,
			       deployment = EXCLUDED.deployment
			 RETURNING id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
			[
				account.id,
				name,
				nullable(body.query),
				nullable(body.industry),
				nullable(body.output_kind, OUTPUT_KINDS, 'output_kind'),
				nullable(body.temperature_band, TEMPERATURE_BANDS, 'temperature_band'),
				nullable(body.deployment, DEPLOYMENTS, 'deployment')
			]
		);
		return { ...r.rows[0], id: Number(r.rows[0].id) };
	});

	app.delete('/searches/:id', async (req) => {
		const account = await requireAccount(req);
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) throw notFound('No such saved search');
		const r = await q('DELETE FROM saved_searches WHERE id = $1 AND account_id = $2 RETURNING id', [
			id,
			account.id
		]);
		if (!r.rows.length) throw notFound('No such saved search');
		return { id, deleted: true };
	});

	/* ----------------------------------------------------------- enquiries */

	app.post('/enquiries', async (req, reply) => {
		const account = await accountFromRequest(req);
		const body = req.body || {};
		const { name, email, message } = requireFields(body, ['name', 'email', 'message']);
		if (!isEmail(email)) throw bad('A valid email is required');
		const topic = oneOf(body.topic, TOPICS, 'topic');
		if (message.length < 10) throw bad('Please write at least 10 characters so we can help');

		let row = null;
		for (let attempt = 0; attempt < 5 && !row; attempt++) {
			const r = await q(
				`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'received')
				 ON CONFLICT (reference) DO NOTHING
				 RETURNING id, reference, status, topic, name, email, created_at`,
				[
					reference('ENQ'),
					account?.id ?? null,
					name,
					email,
					str(body.phone_country) || null,
					str(body.phone) || null,
					topic,
					message
				]
			);
			row = r.rows[0] || null;
		}
		if (!row) throw new HttpError(500, 'Could not create the enquiry', 'server_error');

		await mailEnquiry(req.log, {
			to: email,
			name,
			reference: row.reference,
			topic
		});
		reply.code(201);
		return { ...row, id: Number(row.id) };
	});

	app.get('/enquiries', async (req) => {
		const account = await requireAccount(req);
		const r = await q(
			`SELECT id, reference, name, email, phone_country, phone, topic, message, status, created_at
			   FROM enquiries WHERE account_id = $1 ORDER BY id DESC`,
			[account.id]
		);
		return r.rows.map((row) => ({ ...row, id: Number(row.id) }));
	});

	app.post('/enquiries/:id/close', async (req) => {
		const account = await requireAccount(req);
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) throw notFound('No such enquiry');
		const r = await q(
			`UPDATE enquiries SET status = 'closed'
			  WHERE id = $1 AND account_id = $2 AND status <> 'closed'
			 RETURNING id, reference, topic, status`,
			[id, account.id]
		);
		if (r.rows.length) return { ...r.rows[0], id: Number(r.rows[0].id) };
		const existing = await q(
			`SELECT id, reference, topic, status FROM enquiries WHERE id = $1 AND account_id = $2`,
			[id, account.id]
		);
		if (!existing.rows.length) throw notFound('No such enquiry');
		return { ...existing.rows[0], id: Number(existing.rows[0].id) };
	});

	/* ------------------------------------------------------ access request */

	app.get('/access-request', async (req) => {
		const account = await requireAccount(req);
		const r = await q(
			`SELECT id, reference, organisation, role_title, status, created_at
			   FROM access_requests WHERE account_id = $1`,
			[account.id]
		);
		if (!r.rows.length) throw notFound('No access request on this account');
		return { ...r.rows[0], id: Number(r.rows[0].id) };
	});

	app.post('/access-request', async (req, reply) => {
		const account = await requireAccount(req);
		const { organisation, role_title } = requireFields(req.body || {}, [
			'organisation',
			'role_title'
		]);
		const r = await q(
			`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
			 VALUES ($1,$2,$3,$4,'pending')
			 ON CONFLICT (account_id) DO UPDATE
			   SET organisation = EXCLUDED.organisation, role_title = EXCLUDED.role_title
			 RETURNING id, reference, organisation, role_title, status, created_at,
			           (xmax = 0) AS created`,
			[reference('IAR'), account.id, organisation, role_title]
		);
		const row = r.rows[0];
		await mailAccessRequest(req.log, {
			to: account.email,
			name: account.display_name,
			reference: row.reference,
			organisation: row.organisation
		});
		reply.code(row.created ? 201 : 200);
		const { created, ...out } = row;
		return { ...out, id: Number(out.id) };
	});

	app.get('/documents', async (req) => {
		const account = await requireAccount(req);
		const ar = await q(`SELECT status FROM access_requests WHERE account_id = $1`, [account.id]);
		if (ar.rows[0]?.status !== 'approved') throw notFound('Not found');
		const r = await q(
			`SELECT slug, title, category, summary, published_at FROM documents ORDER BY published_at DESC, id`
		);
		return r.rows;
	});

	/* ------------------------------------------------------------- stories */

	app.get('/stories', async (req, reply) => {
		const { limit, offset, featured } = req.query || {};
		const where = [];
		const params = [];
		if (featured !== undefined && str(featured) !== '') {
			const f = str(featured).toLowerCase();
			if (!['true', 'false', '1', '0'].includes(f)) throw bad('featured must be true or false');
			params.push(f === 'true' || f === '1');
			where.push(`featured = $${params.length}`);
		}
		const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
		const total = await q(`SELECT count(*)::int AS n FROM stories ${whereSql}`, params);

		let sql = `SELECT slug, title, outlet, published_at, featured FROM stories ${whereSql} ORDER BY published_at DESC, id DESC`;
		const lim = limit === undefined ? null : Number(limit);
		const off = offset === undefined ? null : Number(offset);
		if (lim !== null) {
			if (!Number.isFinite(lim) || lim < 0) throw bad('limit must be a non-negative number');
			params.push(Math.min(lim, 100));
			sql += ` LIMIT $${params.length}`;
		}
		if (off !== null) {
			if (!Number.isFinite(off) || off < 0) throw bad('offset must be a non-negative number');
			params.push(off);
			sql += ` OFFSET $${params.length}`;
		}
		const r = await q(sql, params);
		reply.header('X-Total-Count', String(total.rows[0].n));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return r.rows;
	});

	app.get('/stories/:slug', async (req) => {
		const r = await q(
			`SELECT slug, title, outlet, published_at, featured, body FROM stories WHERE slug = $1`,
			[req.params.slug]
		);
		if (!r.rows.length) throw notFound('No story with that slug');
		return r.rows[0];
	});

	/* ---------------------------------------------------- jobs, applications */

	app.get('/jobs', async () => {
		const r = await q(
			`SELECT slug, title, location, team, description FROM jobs ORDER BY sort_order, id`
		);
		return r.rows;
	});

	app.get('/applications', async (req) => {
		const account = await requireAccount(req);
		const r = await q(
			`SELECT a.id, j.slug AS job_slug, j.title AS job_title, j.location, a.name, a.email,
			        a.note, a.status, a.created_at
			   FROM applications a JOIN jobs j ON j.id = a.job_id
			  WHERE a.account_id = $1 ORDER BY a.id DESC`,
			[account.id]
		);
		return r.rows.map((row) => ({ ...row, id: Number(row.id) }));
	});

	app.post('/applications', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		const { job_slug, name, email, note } = requireFields(body, [
			'job_slug',
			'name',
			'email',
			'note'
		]);
		if (!isEmail(email)) throw bad('A valid email is required');
		if (note.length < 10) throw bad('Please write at least 10 characters in your note');
		const job = await q('SELECT id, slug, title, location FROM jobs WHERE slug = $1', [job_slug]);
		if (!job.rows.length) throw notFound('No job with that slug');

		const r = await q(
			`INSERT INTO applications (account_id, job_id, name, email, note, status)
			 VALUES ($1,$2,$3,$4,$5,'received')
			 ON CONFLICT (account_id, job_id) DO UPDATE
			   SET name = EXCLUDED.name, email = EXCLUDED.email, note = EXCLUDED.note
			 RETURNING id, status, created_at, (xmax = 0) AS created`,
			[account.id, job.rows[0].id, name, email, note]
		);
		const row = r.rows[0];
		await mailApplication(req.log, {
			to: email,
			name,
			jobTitle: job.rows[0].title,
			location: job.rows[0].location
		});
		reply.code(row.created ? 201 : 200);
		return {
			id: Number(row.id),
			job_slug: job.rows[0].slug,
			job_title: job.rows[0].title,
			status: row.status,
			created_at: row.created_at
		};
	});

	/* ---------------------------------------------------------- calculator */

	app.post('/calculator', async (req) => {
		const body = req.body || {};
		const need = Number(body.need_mw);
		if (!Number.isFinite(need) || need <= 0)
			throw bad('need_mw must be a number greater than zero');
		const kind = oneOf(body.kind ?? 'thermal', ['thermal', 'electrical'], 'kind');
		return calculate(need, kind);
	});

	/* ------------------------------------------------- team, offices, faqs */

	app.get('/team', async () => {
		const r = await q(
			`SELECT slug, name, role_title, bio, profile_url FROM team_members ORDER BY sort_order, id`
		);
		return r.rows;
	});

	app.get('/offices', async () => {
		const r = await q(`SELECT city, country, role_label FROM offices ORDER BY id`);
		return r.rows;
	});

	app.get('/faqs', async (req) => {
		const params = [];
		const where = [];
		const category = str(req.query?.category);
		const search = str(req.query?.q);
		if (category) {
			params.push(category);
			where.push(`category = $${params.length}`);
		}
		if (search) {
			params.push(`%${search}%`);
			where.push(`(question ILIKE $${params.length} OR answer ILIKE $${params.length})`);
		}
		const r = await q(
			`SELECT question, answer, category FROM faqs ${
				where.length ? `WHERE ${where.join(' AND ')}` : ''
			} ORDER BY sort_order, id`,
			params
		);
		return r.rows;
	});
}
