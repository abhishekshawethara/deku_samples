import { query, one, many, withClient } from './db.js';
import { hashPassword, verifyPassword, issueToken, readToken, makeReference, makeSaveToken } from './auth.js';
import { sendMail, enquiryMail, accessRequestMail, applicationMail } from './mail.js';

const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];
const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMPERATURE_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];

const SOLUTION_FIELDS =
	'slug, industry, title, summary, output_kind, temperature_band, deployment, module_count';

class HttpError extends Error {
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

const badRequest = (m) => new HttpError(400, m, 'invalid_request');
const unauthorized = (m = 'Authentication is required. Sign in and try again.') =>
	new HttpError(401, m, 'unauthorized');
const notFound = (m = 'Not found.') => new HttpError(404, m, 'not_found');

function str(v) {
	return typeof v === 'string' ? v.trim() : '';
}

function requireFields(body, fields) {
	const missing = fields.filter((f) => !str(body?.[f]));
	if (missing.length) throw badRequest(`Missing required ${missing.length > 1 ? 'fields' : 'field'}: ${missing.join(', ')}.`);
}

function validEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function accountFromRequest(req) {
	const header = req.headers.authorization || '';
	const m = /^Bearer\s+(.+)$/i.exec(header);
	if (!m) return { account: null, expired: false };
	const parsed = readToken(m[1]);
	if (!parsed) return { account: null, expired: false };
	if (parsed.expired) return { account: null, expired: true };
	const account = await one('SELECT id, email, display_name FROM accounts WHERE id = $1', [parsed.sub]);
	return { account, expired: false };
}

async function requireAccount(req) {
	const { account, expired } = await accountFromRequest(req);
	if (expired) throw new HttpError(401, 'Your session has expired. Sign in again to continue.', 'token_expired');
	if (!account) throw unauthorized();
	return account;
}

function publicAccount(a) {
	return { id: Number(a.id), email: a.email, display_name: a.display_name };
}

async function claimSaves(client, saveToken, accountId) {
	if (!saveToken) return;
	// Move anonymous saves onto the account, dropping any that duplicate an existing save.
	await client.query(
		`DELETE FROM saved_solutions a
		 WHERE a.save_token = $1
		   AND EXISTS (SELECT 1 FROM saved_solutions b WHERE b.account_id = $2 AND b.solution_id = a.solution_id)`,
		[saveToken, accountId]
	);
	await client.query(
		`UPDATE saved_solutions SET account_id = $2, save_token = NULL WHERE save_token = $1`,
		[saveToken, accountId]
	);
}

function calculate(needMw, kind) {
	const perModule = kind === 'electrical' ? 100 : 250;
	const modules = Math.ceil(needMw / perModule);
	const gwh = (modules * perModule * 8000) / 1000;
	return {
		modules_required: modules,
		annual_clean_energy_gwh: gwh,
		annual_co2_avoided_tonnes: gwh * 450
	};
}

export default async function apiRoutes(app) {
	app.setErrorHandler((err, req, reply) => {
		if (err instanceof HttpError) {
			return reply.code(err.status).send({ error: err.code, message: err.message });
		}
		if (err.statusCode === 400 || err.validation) {
			return reply.code(400).send({ error: 'invalid_request', message: err.message });
		}
		req.log.error({ err: err.message, stack: err.stack }, 'unhandled error');
		return reply.code(500).send({ error: 'server_error', message: 'Something went wrong on our side.' });
	});

	app.setNotFoundHandler((req, reply) => {
		reply.code(404).send({ error: 'not_found', message: 'Not found.' });
	});

	app.get('/health', async (req, reply) => {
		try {
			await query('SELECT 1');
			return { status: 'ok' };
		} catch {
			return reply.code(503).send({ status: 'unavailable' });
		}
	});

	/* ---------------------------------------------------------------- auth */

	app.post('/auth/signup', async (req, reply) => {
		const body = req.body || {};
		requireFields(body, ['email', 'password', 'display_name']);
		const email = str(body.email).toLowerCase();
		const password = String(body.password);
		const displayName = str(body.display_name);
		if (!validEmail(email)) throw badRequest('Enter a valid email address.');
		if (password.length < 8) throw badRequest('Password must be at least 8 characters.');

		const existing = await one('SELECT id FROM accounts WHERE email = $1', [email]);
		if (existing) throw new HttpError(409, 'An account with that email already exists. Sign in instead.', 'email_taken');

		const passwordHash = await hashPassword(password);
		const saveToken = str(body.save_token) || null;

		const account = await withClient(async (client) => {
			try {
				await client.query('BEGIN');
				const res = await client.query(
					'INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id, email, display_name',
					[email, passwordHash, displayName]
				);
				const acc = res.rows[0];
				await claimSaves(client, saveToken, acc.id);
				await client.query('COMMIT');
				return acc;
			} catch (e) {
				await client.query('ROLLBACK');
				if (e.code === '23505') throw new HttpError(409, 'An account with that email already exists. Sign in instead.', 'email_taken');
				throw e;
			}
		});

		return reply.code(201).send({
			...publicAccount(account),
			access_token: issueToken(account.id),
			token_type: 'Bearer'
		});
	});

	app.post('/auth/login', async (req) => {
		const body = req.body || {};
		requireFields(body, ['email', 'password']);
		const email = str(body.email).toLowerCase();
		const account = await one('SELECT id, email, display_name, password_hash FROM accounts WHERE email = $1', [email]);
		const ok = account ? await verifyPassword(String(body.password), account.password_hash) : false;
		if (!ok) throw new HttpError(401, 'That email and password do not match an account.', 'invalid_credentials');

		const saveToken = str(body.save_token) || null;
		if (saveToken) {
			await withClient(async (client) => {
				await client.query('BEGIN');
				try {
					await claimSaves(client, saveToken, account.id);
					await client.query('COMMIT');
				} catch (e) {
					await client.query('ROLLBACK');
					throw e;
				}
			});
		}

		return {
			access_token: issueToken(account.id),
			token_type: 'Bearer',
			account: publicAccount(account)
		};
	});

	app.get('/accounts/me', async (req) => {
		const account = await requireAccount(req);
		return publicAccount(account);
	});

	/* ----------------------------------------------------------- solutions */

	app.get('/solutions', async (req, reply) => {
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
				`(lower(industry) LIKE $${i} OR lower(title) LIKE $${i} OR lower(summary) LIKE $${i} OR lower(detail) LIKE $${i} OR lower(slug) LIKE $${i})`
			);
		}
		const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
		const rows = await many(`SELECT ${SOLUTION_FIELDS} FROM solutions ${where} ORDER BY id`, params);
		reply.header('X-Total-Count', String(rows.length));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return rows;
	});

	app.get('/solutions/:slug', async (req) => {
		const row = await one(`SELECT ${SOLUTION_FIELDS}, detail FROM solutions WHERE slug = $1`, [req.params.slug]);
		if (!row) throw notFound('No solution with that slug.');
		return row;
	});

	app.get('/compare', async (req) => {
		const raw = req.query?.slugs;
		const list = (Array.isArray(raw) ? raw.join(',') : str(raw))
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (list.length > 4) throw badRequest('You can compare at most four saved solutions. Remove one and try again.');
		if (!list.length) return [];
		const rows = await many(
			`SELECT ${SOLUTION_FIELDS}, detail FROM solutions WHERE slug = ANY($1::text[]) ORDER BY id`,
			[list]
		);
		return rows;
	});

	/* --------------------------------------------------------------- saves */

	async function saveOwner(req) {
		const { account, expired } = await accountFromRequest(req);
		if (expired) throw new HttpError(401, 'Your session has expired. Sign in again to continue.', 'token_expired');
		return account;
	}

	app.get('/saves', async (req) => {
		const account = await saveOwner(req);
		const saveToken = str(req.query?.save_token) || null;
		if (!account && !saveToken) throw unauthorized('Sign in or supply a save token to read saved solutions.');
		const rows = account
			? await many(
					`SELECT ss.id, ss.solution_id, s.slug, s.industry, s.title, s.summary, s.output_kind,
					        s.temperature_band, s.deployment, s.module_count, ss.created_at
					 FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
					 WHERE ss.account_id = $1 ORDER BY ss.id`,
					[account.id]
			  )
			: await many(
					`SELECT ss.id, ss.solution_id, s.slug, s.industry, s.title, s.summary, s.output_kind,
					        s.temperature_band, s.deployment, s.module_count, ss.created_at
					 FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
					 WHERE ss.save_token = $1 ORDER BY ss.id`,
					[saveToken]
			  );
		return rows.map((r) => ({ ...r, id: Number(r.id), solution_id: Number(r.solution_id) }));
	});

	app.post('/saves', async (req, reply) => {
		const account = await saveOwner(req);
		const body = req.body || {};
		const slug = str(body.solution_slug);
		if (!slug) throw badRequest('Missing required field: solution_slug.');
		const solution = await one('SELECT id, slug FROM solutions WHERE slug = $1', [slug]);
		if (!solution) throw badRequest('No solution with that slug.');

		let saveToken = str(body.save_token) || null;
		if (!account && !saveToken) saveToken = makeSaveToken();

		const sql = account
			? `INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
			   ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING
			   RETURNING id`
			: `INSERT INTO saved_solutions (save_token, solution_id) VALUES ($1,$2)
			   ON CONFLICT (save_token, solution_id) WHERE save_token IS NOT NULL DO NOTHING
			   RETURNING id`;
		const owner = account ? account.id : saveToken;
		const res = await query(sql, [owner, solution.id]);

		let row = res.rows[0];
		if (!row) {
			row = await one(
				account
					? 'SELECT id FROM saved_solutions WHERE account_id = $1 AND solution_id = $2'
					: 'SELECT id FROM saved_solutions WHERE save_token = $1 AND solution_id = $2',
				[owner, solution.id]
			);
		}

		const payload = {
			id: Number(row.id),
			solution_id: Number(solution.id),
			slug: solution.slug
		};
		if (!account) payload.save_token = saveToken;
		return reply.code(201).send(payload);
	});

	app.delete('/saves/:id', async (req, reply) => {
		const account = await saveOwner(req);
		const saveToken = str(req.query?.save_token) || null;
		if (!account && !saveToken) throw unauthorized('Sign in or supply a save token to remove a saved solution.');
		const id = Number(req.params.id);
		if (!Number.isInteger(id)) throw notFound('No saved solution with that id.');
		const res = account
			? await query('DELETE FROM saved_solutions WHERE id = $1 AND account_id = $2 RETURNING id', [id, account.id])
			: await query('DELETE FROM saved_solutions WHERE id = $1 AND save_token = $2 RETURNING id', [id, saveToken]);
		if (!res.rowCount) throw notFound('No saved solution with that id.');
		return reply.code(204).send();
	});

	/* ------------------------------------------------------------ searches */

	app.get('/searches', async (req) => {
		const account = await requireAccount(req);
		const rows = await many(
			`SELECT id, name, query, industry, output_kind, temperature_band, deployment, created_at
			 FROM saved_searches WHERE account_id = $1 ORDER BY id`,
			[account.id]
		);
		return rows.map((r) => ({ ...r, id: Number(r.id) }));
	});

	app.post('/searches', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		const name = str(body.name);
		if (!name) throw badRequest('Missing required field: name.');
		const fields = {
			query: str(body.query) || null,
			industry: str(body.industry) || null,
			output_kind: str(body.output_kind) || null,
			temperature_band: str(body.temperature_band) || null,
			deployment: str(body.deployment) || null
		};
		if (fields.output_kind && !OUTPUT_KINDS.includes(fields.output_kind))
			throw badRequest('output_kind must be one of heat, heat-and-power, hydrogen, electricity.');
		if (fields.temperature_band && !TEMPERATURE_BANDS.includes(fields.temperature_band))
			throw badRequest('temperature_band is not one of the three bands.');
		if (fields.deployment && !DEPLOYMENTS.includes(fields.deployment))
			throw badRequest('deployment must be single-module or multi-module.');

		const row = await one(
			`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
			 VALUES ($1,$2,$3,$4,$5,$6,$7)
			 ON CONFLICT (account_id, name) DO UPDATE SET
			   query = EXCLUDED.query, industry = EXCLUDED.industry, output_kind = EXCLUDED.output_kind,
			   temperature_band = EXCLUDED.temperature_band, deployment = EXCLUDED.deployment
			 RETURNING id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
			[account.id, name, fields.query, fields.industry, fields.output_kind, fields.temperature_band, fields.deployment]
		);
		return reply.code(201).send({ ...row, id: Number(row.id) });
	});

	app.delete('/searches/:id', async (req, reply) => {
		const account = await requireAccount(req);
		const id = Number(req.params.id);
		if (!Number.isInteger(id)) throw notFound('No saved search with that id.');
		const res = await query('DELETE FROM saved_searches WHERE id = $1 AND account_id = $2 RETURNING id', [
			id,
			account.id
		]);
		if (!res.rowCount) throw notFound('No saved search with that id.');
		return reply.code(204).send();
	});

	/* ----------------------------------------------------------- enquiries */

	app.post('/enquiries', async (req, reply) => {
		const body = req.body || {};
		requireFields(body, ['name', 'email', 'topic', 'message']);
		const email = str(body.email);
		if (!validEmail(email)) throw badRequest('Enter a valid email address.');
		const topic = str(body.topic);
		if (!TOPICS.includes(topic)) throw badRequest(`topic must be one of ${TOPICS.join(', ')}.`);

		const { account } = await accountFromRequest(req);

		let row = null;
		for (let attempt = 0; attempt < 5 && !row; attempt++) {
			try {
				row = await one(
					`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
					 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'received')
					 RETURNING id, reference, status, topic, name, email, created_at`,
					[
						makeReference('ENQ'),
						account?.id || null,
						str(body.name),
						email,
						str(body.phone_country) || null,
						str(body.phone) || null,
						topic,
						str(body.message)
					]
				);
			} catch (e) {
				if (e.code !== '23505') throw e;
			}
		}
		if (!row) throw new HttpError(500, 'Could not allocate an enquiry reference.', 'server_error');

		try {
			await sendMail(enquiryMail(row));
		} catch (e) {
			req.log.error({ err: e.message, reference: row.reference }, 'enquiry mail failed');
		}

		return reply.code(201).send({ ...row, id: Number(row.id) });
	});

	app.get('/enquiries', async (req) => {
		const account = await requireAccount(req);
		const rows = await many(
			`SELECT id, reference, name, email, phone_country, phone, topic, message, status, created_at
			 FROM enquiries WHERE account_id = $1 ORDER BY id DESC`,
			[account.id]
		);
		return rows.map((r) => ({ ...r, id: Number(r.id) }));
	});

	app.post('/enquiries/:id/close', async (req) => {
		const account = await requireAccount(req);
		const id = Number(req.params.id);
		if (!Number.isInteger(id)) throw notFound('No enquiry with that id.');
		const row = await one(
			`UPDATE enquiries SET status = 'closed'
			 WHERE id = $1 AND account_id = $2
			 RETURNING id, reference, topic, status, created_at`,
			[id, account.id]
		);
		if (!row) throw notFound('No enquiry with that id.');
		return { ...row, id: Number(row.id) };
	});

	/* ------------------------------------------------------ access request */

	app.get('/access-request', async (req) => {
		const account = await requireAccount(req);
		const row = await one(
			'SELECT id, reference, organisation, role_title, status, created_at FROM access_requests WHERE account_id = $1',
			[account.id]
		);
		if (!row) throw notFound('You have not requested investor access yet.');
		return { ...row, id: Number(row.id) };
	});

	app.post('/access-request', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		requireFields(body, ['organisation', 'role_title']);
		const organisation = str(body.organisation);
		const roleTitle = str(body.role_title);

		let row = null;
		let created = false;
		for (let attempt = 0; attempt < 5 && !row; attempt++) {
			const reference = makeReference('IAR');
			try {
				const res = await query(
					`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
					 VALUES ($1,$2,$3,$4,'pending')
					 ON CONFLICT (account_id) DO UPDATE SET
					   organisation = EXCLUDED.organisation, role_title = EXCLUDED.role_title
					 RETURNING id, reference, organisation, role_title, status, created_at,
					           (xmax = 0) AS inserted`,
					[reference, account.id, organisation, roleTitle]
				);
				row = res.rows[0];
				created = row?.inserted === true;
			} catch (e) {
				if (e.code !== '23505') throw e;
				// reference collided; retry with a new one
			}
		}
		if (!row) throw new HttpError(500, 'Could not allocate an access request reference.', 'server_error');
		delete row.inserted;

		if (created) {
			try {
				await sendMail(accessRequestMail(row, account));
			} catch (e) {
				req.log.error({ err: e.message, reference: row.reference }, 'access request mail failed');
			}
		}

		return reply.code(created ? 201 : 200).send({ ...row, id: Number(row.id) });
	});

	app.get('/documents', async (req) => {
		const account = await requireAccount(req);
		const request = await one('SELECT status FROM access_requests WHERE account_id = $1', [account.id]);
		if (!request || request.status !== 'approved') throw notFound('Not found.');
		return many('SELECT slug, title, category, published_at FROM documents ORDER BY published_at DESC, id');
	});

	/* ------------------------------------------------------------- stories */

	app.get('/stories', async (req, reply) => {
		const q = req.query || {};
		const clauses = [];
		const params = [];
		if (str(q.featured) !== '') {
			const featured = ['true', '1', 'yes'].includes(str(q.featured).toLowerCase());
			params.push(featured);
			clauses.push(`featured = $${params.length}`);
		}
		const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
		const total = await one(`SELECT count(*)::int AS n FROM stories ${where}`, params);

		let sql = `SELECT slug, title, outlet, published_at, featured FROM stories ${where} ORDER BY published_at DESC, id DESC`;
		const limit = Number(q.limit);
		const offset = Number(q.offset);
		if (Number.isFinite(limit) && limit > 0) {
			params.push(Math.min(limit, 100));
			sql += ` LIMIT $${params.length}`;
		}
		if (Number.isFinite(offset) && offset > 0) {
			params.push(offset);
			sql += ` OFFSET $${params.length}`;
		}
		const rows = await many(sql, params);
		reply.header('X-Total-Count', String(total.n));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return rows;
	});

	app.get('/stories/:slug', async (req) => {
		const row = await one(
			'SELECT slug, title, outlet, published_at, featured, body FROM stories WHERE slug = $1',
			[req.params.slug]
		);
		if (!row) throw notFound('No story with that slug.');
		return row;
	});

	/* ---------------------------------------------------- jobs, applications */

	app.get('/jobs', async () => many('SELECT slug, title, location, team, description FROM jobs ORDER BY id'));

	app.get('/applications', async (req) => {
		const account = await requireAccount(req);
		const rows = await many(
			`SELECT a.id, j.slug AS job_slug, j.title AS job_title, j.location, a.name, a.email, a.note, a.status, a.created_at
			 FROM applications a JOIN jobs j ON j.id = a.job_id
			 WHERE a.account_id = $1 ORDER BY a.id DESC`,
			[account.id]
		);
		return rows.map((r) => ({ ...r, id: Number(r.id) }));
	});

	app.post('/applications', async (req, reply) => {
		const account = await requireAccount(req);
		const body = req.body || {};
		requireFields(body, ['job_slug', 'name', 'email', 'note']);
		const email = str(body.email);
		if (!validEmail(email)) throw badRequest('Enter a valid email address.');
		const job = await one('SELECT id, slug, title, location, team FROM jobs WHERE slug = $1', [str(body.job_slug)]);
		if (!job) throw badRequest('No job with that slug.');

		const res = await query(
			`INSERT INTO applications (account_id, job_id, name, email, note, status)
			 VALUES ($1,$2,$3,$4,$5,'received')
			 ON CONFLICT (account_id, job_id) DO UPDATE SET
			   name = EXCLUDED.name, email = EXCLUDED.email, note = EXCLUDED.note
			 RETURNING id, status, name, email, note, created_at, (xmax = 0) AS inserted`,
			[account.id, job.id, str(body.name), email, str(body.note)]
		);
		const row = res.rows[0];
		const created = row.inserted === true;
		delete row.inserted;

		if (created) {
			try {
				await sendMail(applicationMail({ name: row.name, email: row.email }, job));
			} catch (e) {
				req.log.error({ err: e.message, job: job.slug }, 'application mail failed');
			}
		}

		return reply.code(created ? 201 : 200).send({
			...row,
			id: Number(row.id),
			job_slug: job.slug,
			job_title: job.title,
			location: job.location
		});
	});

	/* ---------------------------------------------------------- calculator */

	app.post('/calculator', async (req) => {
		const body = req.body || {};
		const need = Number(body.need_mw);
		const kind = str(body.kind) || 'thermal';
		if (!Number.isFinite(need) || need <= 0)
			throw badRequest('need_mw must be a number greater than zero.');
		if (!['thermal', 'electrical'].includes(kind))
			throw badRequest('kind must be thermal or electrical.');
		return calculate(need, kind);
	});

	/* ---------------------------------------------------- content endpoints */

	app.get('/team', async () =>
		many('SELECT slug, name, role_title, bio, profile_url FROM team_members ORDER BY sort_order, id')
	);

	app.get('/offices', async () => many('SELECT city, country, role_label FROM offices ORDER BY id'));

	app.get('/faqs', async (req) => {
		const q = req.query || {};
		const clauses = [];
		const params = [];
		if (str(q.category)) {
			params.push(str(q.category));
			clauses.push(`category = $${params.length}`);
		}
		if (str(q.q)) {
			params.push(`%${str(q.q).toLowerCase()}%`);
			const i = params.length;
			clauses.push(`(lower(question) LIKE $${i} OR lower(answer) LIKE $${i})`);
		}
		const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
		return many(`SELECT question, answer, category FROM faqs ${where} ORDER BY id`, params);
	});
}

export { calculate };
