import { many, one, pool, query } from './db.js';
import {
	checkPassword,
	currentAccount,
	hashPassword,
	makeReference,
	newSaveToken,
	signToken
} from './auth.js';
import { accessRequestMail, applicationMail, enquiryMail, sendMail } from './mail.js';

const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMP_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];
const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];

const SOLUTION_FIELDS =
	'id, slug, industry, title, summary, output_kind, temperature_band, deployment, module_count';

function fail(reply, status, message) {
	return reply.code(status).send({ error: message, message });
}

const notFound = (reply) => fail(reply, 404, 'Not found');
const unauthorized = (reply) => fail(reply, 401, 'Authentication required');

function str(v) {
	return typeof v === 'string' ? v.trim() : '';
}

async function requireAccount(req, reply) {
	const acc = await currentAccount(req);
	if (!acc) {
		unauthorized(reply);
		return null;
	}
	return acc;
}

function parseId(raw) {
	if (!/^\d+$/.test(String(raw))) return null;
	const n = Number(raw);
	return Number.isSafeInteger(n) && n > 0 ? n : null;
}

async function claimSaves(saveToken, accountId) {
	const token = str(saveToken);
	if (!token) return;
	const client = await pool.connect();
	try {
		await client.query('begin');
		await client.query(
			`update saved_solutions s
			   set account_id = $2, save_token = null
			 where s.save_token = $1
			   and not exists (
			     select 1 from saved_solutions t
			      where t.account_id = $2 and t.solution_id = s.solution_id
			   )`,
			[token, accountId]
		);
		await client.query('delete from saved_solutions where save_token = $1', [token]);
		await client.query('commit');
	} catch (err) {
		await client.query('rollback').catch(() => {});
		throw err;
	} finally {
		client.release();
	}
}

export function registerApi(app) {
	app.get('/api/health', async (req, reply) => {
		try {
			await query('select 1');
			return reply.send({ status: 'ok' });
		} catch {
			return fail(reply, 503, 'Database unavailable');
		}
	});

	// ---------- auth ----------
	app.post('/api/auth/signup', async (req, reply) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = typeof body.password === 'string' ? body.password : '';
		const display_name = str(body.display_name);
		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
			return fail(reply, 400, 'A valid email address is required');
		if (password.length < 8) return fail(reply, 400, 'Password must be at least 8 characters');
		if (!display_name) return fail(reply, 400, 'A display name is required');

		const existing = await one('select id from accounts where email=$1', [email]);
		if (existing) return fail(reply, 409, 'An account with that email already exists');

		let account;
		try {
			account = await one(
				`insert into accounts (email, password_hash, display_name) values ($1,$2,$3)
				 returning id, email, display_name`,
				[email, hashPassword(password), display_name]
			);
		} catch (err) {
			if (err?.code === '23505') return fail(reply, 409, 'An account with that email already exists');
			throw err;
		}
		await claimSaves(body.save_token, account.id);
		return reply.code(201).send({ ...account, access_token: signToken(account.id) });
	});

	app.post('/api/auth/login', async (req, reply) => {
		const body = req.body || {};
		const email = str(body.email).toLowerCase();
		const password = typeof body.password === 'string' ? body.password : '';
		if (!email || !password) return fail(reply, 400, 'Email and password are required');
		const account = await one(
			'select id, email, display_name, password_hash from accounts where email=$1',
			[email]
		);
		if (!account || !checkPassword(password, account.password_hash))
			return fail(reply, 401, 'Those credentials do not match an account');
		await claimSaves(body.save_token, account.id);
		return reply.send({
			access_token: signToken(account.id),
			token_type: 'bearer',
			account: { id: account.id, email: account.email, display_name: account.display_name }
		});
	});

	app.get('/api/accounts/me', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		return reply.send({ id: acc.id, email: acc.email, display_name: acc.display_name });
	});

	// ---------- solutions ----------
	app.get('/api/solutions', async (req, reply) => {
		const q = req.query || {};
		const where = [];
		const params = [];
		for (const [col, val] of [
			['industry', str(q.industry)],
			['output_kind', str(q.output_kind)],
			['temperature_band', str(q.temperature_band)],
			['deployment', str(q.deployment)]
		]) {
			if (val) {
				params.push(val);
				where.push(`${col} = $${params.length}`);
			}
		}
		const text = str(q.q);
		if (text) {
			params.push(`%${text.toLowerCase()}%`);
			const i = params.length;
			where.push(
				`(lower(title) like $${i} or lower(industry) like $${i} or lower(summary) like $${i} or lower(detail) like $${i} or lower(slug) like $${i})`
			);
		}
		const clause = where.length ? `where ${where.join(' and ')}` : '';
		const rows = await many(`select ${SOLUTION_FIELDS} from solutions ${clause} order by id`, params);
		reply.header('X-Total-Count', String(rows.length));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return reply.send(rows);
	});

	app.get('/api/solutions/:slug', async (req, reply) => {
		const row = await one(`select ${SOLUTION_FIELDS}, detail from solutions where slug=$1`, [
			req.params.slug
		]);
		if (!row) return notFound(reply);
		return reply.send(row);
	});

	app.get('/api/compare', async (req, reply) => {
		const raw = req.query?.slugs;
		let slugs = [];
		if (Array.isArray(raw)) slugs = raw.flatMap((s) => String(s).split(','));
		else if (typeof raw === 'string') slugs = raw.split(',');
		slugs = slugs.map((s) => s.trim()).filter(Boolean);
		const unique = [...new Set(slugs)];
		if (unique.length > 4)
			return fail(reply, 400, 'The comparison holds at most four solutions');
		if (!unique.length) return reply.send([]);
		const rows = await many(
			`select ${SOLUTION_FIELDS}, detail from solutions where slug = any($1::text[])`,
			[unique]
		);
		const order = new Map(unique.map((s, i) => [s, i]));
		rows.sort((a, b) => order.get(a.slug) - order.get(b.slug));
		return reply.send(rows);
	});

	// ---------- saves ----------
	app.get('/api/saves', async (req, reply) => {
		const acc = await currentAccount(req);
		const token = str(req.query?.save_token);
		if (acc) {
			const rows = await many(
				`select s.id, s.solution_id, sol.slug, sol.title, sol.industry, sol.output_kind,
				        sol.temperature_band, sol.deployment, sol.module_count, sol.summary, s.created_at
				   from saved_solutions s join solutions sol on sol.id = s.solution_id
				  where s.account_id = $1 order by s.id`,
				[acc.id]
			);
			return reply.send(rows);
		}
		if (!token) return unauthorized(reply);
		const rows = await many(
			`select s.id, s.solution_id, sol.slug, sol.title, sol.industry, sol.output_kind,
			        sol.temperature_band, sol.deployment, sol.module_count, sol.summary, s.created_at
			   from saved_solutions s join solutions sol on sol.id = s.solution_id
			  where s.save_token = $1 order by s.id`,
			[token]
		);
		return reply.send(rows);
	});

	app.post('/api/saves', async (req, reply) => {
		const body = req.body || {};
		const slug = str(body.solution_slug);
		if (!slug) return fail(reply, 400, 'solution_slug is required');
		const solution = await one('select id, slug from solutions where slug=$1', [slug]);
		if (!solution) return fail(reply, 404, 'No solution with that slug');

		const acc = await currentAccount(req);
		if (acc) {
			const row = await one(
				`insert into saved_solutions (account_id, solution_id) values ($1,$2)
				 on conflict (account_id, solution_id) where account_id is not null do nothing
				 returning id, account_id, solution_id`,
				[acc.id, solution.id]
			);
			const saved =
				row ||
				(await one(
					'select id, account_id, solution_id from saved_solutions where account_id=$1 and solution_id=$2',
					[acc.id, solution.id]
				));
			return reply
				.code(row ? 201 : 200)
				.send({ id: saved.id, solution_id: saved.solution_id, slug: solution.slug });
		}

		const token = str(body.save_token) || newSaveToken();
		const row = await one(
			`insert into saved_solutions (save_token, solution_id) values ($1,$2)
			 on conflict (save_token, solution_id) where save_token is not null do nothing
			 returning id, solution_id`,
			[token, solution.id]
		);
		const saved =
			row ||
			(await one('select id, solution_id from saved_solutions where save_token=$1 and solution_id=$2', [
				token,
				solution.id
			]));
		return reply
			.code(row ? 201 : 200)
			.send({ id: saved.id, solution_id: saved.solution_id, slug: solution.slug, save_token: token });
	});

	app.delete('/api/saves/:id', async (req, reply) => {
		const id = parseId(req.params.id);
		if (id === null) return notFound(reply);
		const acc = await currentAccount(req);
		const token = str(req.query?.save_token);
		let res;
		if (acc) {
			res = await query('delete from saved_solutions where id=$1 and account_id=$2 returning id', [
				id,
				acc.id
			]);
		} else if (token) {
			res = await query('delete from saved_solutions where id=$1 and save_token=$2 returning id', [
				id,
				token
			]);
		} else {
			return unauthorized(reply);
		}
		if (!res.rowCount) return notFound(reply);
		return reply.send({ id, deleted: true });
	});

	// ---------- searches ----------
	app.get('/api/searches', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const rows = await many(
			`select id, name, query, industry, output_kind, temperature_band, deployment, created_at
			   from saved_searches where account_id=$1 order by id`,
			[acc.id]
		);
		return reply.send(rows);
	});

	app.post('/api/searches', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const b = req.body || {};
		const name = str(b.name);
		if (!name) return fail(reply, 400, 'A name is required for a saved search');
		const output_kind = str(b.output_kind) || null;
		const temperature_band = str(b.temperature_band) || null;
		const deployment = str(b.deployment) || null;
		if (output_kind && !OUTPUT_KINDS.includes(output_kind))
			return fail(reply, 400, 'output_kind is not one of the four known kinds');
		if (temperature_band && !TEMP_BANDS.includes(temperature_band))
			return fail(reply, 400, 'temperature_band is not one of the three known bands');
		if (deployment && !DEPLOYMENTS.includes(deployment))
			return fail(reply, 400, 'deployment is not one of the two known kinds');
		const row = await one(
			`insert into saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
			 values ($1,$2,$3,$4,$5,$6,$7)
			 on conflict (account_id, name) do update set query=excluded.query, industry=excluded.industry,
			   output_kind=excluded.output_kind, temperature_band=excluded.temperature_band,
			   deployment=excluded.deployment
			 returning id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
			[acc.id, name, str(b.query) || null, str(b.industry) || null, output_kind, temperature_band, deployment]
		);
		return reply.code(201).send(row);
	});

	app.delete('/api/searches/:id', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const id = parseId(req.params.id);
		if (id === null) return notFound(reply);
		const res = await query('delete from saved_searches where id=$1 and account_id=$2 returning id', [
			id,
			acc.id
		]);
		if (!res.rowCount) return notFound(reply);
		return reply.send({ id, deleted: true });
	});

	// ---------- enquiries ----------
	app.post('/api/enquiries', async (req, reply) => {
		const b = req.body || {};
		const name = str(b.name);
		const email = str(b.email);
		const topic = str(b.topic);
		const message = str(b.message);
		if (!name) return fail(reply, 400, 'A name is required');
		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
			return fail(reply, 400, 'A valid email address is required');
		if (!TOPICS.includes(topic))
			return fail(reply, 400, `Topic must be one of: ${TOPICS.join(', ')}`);
		if (!message) return fail(reply, 400, 'A message is required');

		const acc = await currentAccount(req);
		let row = null;
		for (let attempt = 0; attempt < 6 && !row; attempt++) {
			try {
				row = await one(
					`insert into enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
					 values ($1,$2,$3,$4,$5,$6,$7,$8,'received')
					 returning id, reference, account_id, name, email, phone_country, phone, topic, message, status, created_at`,
					[
						makeReference('ENQ'),
						acc?.id || null,
						name,
						email,
						str(b.phone_country) || null,
						str(b.phone) || null,
						topic,
						message
					]
				);
			} catch (err) {
				if (err?.code !== '23505') throw err;
			}
		}
		if (!row) return fail(reply, 500, 'Could not mint a unique reference');
		await sendMail(enquiryMail(row), req.log);
		return reply.code(201).send(row);
	});

	app.get('/api/enquiries', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const rows = await many(
			`select id, reference, name, email, phone_country, phone, topic, message, status, created_at
			   from enquiries where account_id=$1 order by id`,
			[acc.id]
		);
		return reply.send(rows);
	});

	app.post('/api/enquiries/:id/close', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const id = parseId(req.params.id);
		if (id === null) return notFound(reply);
		const res = await query(
			`update enquiries set status='closed' where id=$1 and account_id=$2
			 returning id, reference, topic, status, created_at`,
			[id, acc.id]
		);
		if (!res.rowCount) return notFound(reply);
		return reply.send(res.rows[0]);
	});

	// ---------- access requests ----------
	app.get('/api/access-request', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const row = await one(
			`select id, reference, organisation, role_title, status, created_at
			   from access_requests where account_id=$1`,
			[acc.id]
		);
		if (!row) return notFound(reply);
		return reply.send(row);
	});

	app.post('/api/access-request', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const b = req.body || {};
		const organisation = str(b.organisation);
		const role_title = str(b.role_title);
		if (!organisation) return fail(reply, 400, 'An organisation is required');
		if (!role_title) return fail(reply, 400, 'A role title is required');

		const existing = await one('select id from access_requests where account_id=$1', [acc.id]);
		let row = null;
		if (existing) {
			row = await one(
				`update access_requests set organisation=$2, role_title=$3 where account_id=$1
				 returning id, reference, organisation, role_title, status, created_at`,
				[acc.id, organisation, role_title]
			);
			return reply.send(row);
		}
		for (let attempt = 0; attempt < 6 && !row; attempt++) {
			try {
				row = await one(
					`insert into access_requests (reference, account_id, organisation, role_title, status)
					 values ($1,$2,$3,$4,'pending')
					 on conflict (account_id) do nothing
					 returning id, reference, organisation, role_title, status, created_at`,
					[makeReference('IAR'), acc.id, organisation, role_title]
				);
			} catch (err) {
				if (err?.code !== '23505') throw err;
			}
			if (!row) {
				const other = await one(
					`select id, reference, organisation, role_title, status, created_at
					   from access_requests where account_id=$1`,
					[acc.id]
				);
				if (other) {
					const updated = await one(
						`update access_requests set organisation=$2, role_title=$3 where account_id=$1
						 returning id, reference, organisation, role_title, status, created_at`,
						[acc.id, organisation, role_title]
					);
					return reply.send(updated || other);
				}
			}
		}
		if (!row) return fail(reply, 500, 'Could not record the access request');
		await sendMail(accessRequestMail(row, acc), req.log);
		return reply.code(201).send(row);
	});

	app.get('/api/documents', async (req, reply) => {
		const acc = await currentAccount(req);
		if (!acc) return notFound(reply);
		const request = await one('select status from access_requests where account_id=$1', [acc.id]);
		if (!request || request.status !== 'approved') return notFound(reply);
		const rows = await many(
			'select slug, title, category, published_at from documents order by published_at desc, id'
		);
		return reply.send(rows);
	});

	// ---------- stories ----------
	app.get('/api/stories', async (req, reply) => {
		const q = req.query || {};
		const where = [];
		const params = [];
		if (q.featured !== undefined && q.featured !== '') {
			const v = String(q.featured).toLowerCase();
			params.push(v === 'true' || v === '1');
			where.push(`featured = $${params.length}`);
		}
		const clause = where.length ? `where ${where.join(' and ')}` : '';
		const total = await one(`select count(*)::int as n from stories ${clause}`, params);
		let sql = `select slug, title, outlet, published_at, featured from stories ${clause} order by published_at desc, id desc`;
		const limit = Number(q.limit);
		const offset = Number(q.offset);
		if (Number.isFinite(limit) && limit > 0) {
			params.push(Math.floor(limit));
			sql += ` limit $${params.length}`;
		}
		if (Number.isFinite(offset) && offset > 0) {
			params.push(Math.floor(offset));
			sql += ` offset $${params.length}`;
		}
		const rows = await many(sql, params);
		reply.header('X-Total-Count', String(total.n));
		reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
		return reply.send(rows);
	});

	app.get('/api/stories/:slug', async (req, reply) => {
		const row = await one(
			'select slug, title, outlet, published_at, featured, body from stories where slug=$1',
			[req.params.slug]
		);
		if (!row) return notFound(reply);
		return reply.send(row);
	});

	// ---------- jobs and applications ----------
	app.get('/api/jobs', async (req, reply) => {
		return reply.send(
			await many('select slug, title, location, team, description from jobs order by id')
		);
	});

	app.post('/api/applications', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const b = req.body || {};
		const job_slug = str(b.job_slug);
		const name = str(b.name);
		const email = str(b.email);
		const note = str(b.note);
		if (!job_slug) return fail(reply, 400, 'job_slug is required');
		if (!name) return fail(reply, 400, 'A name is required');
		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
			return fail(reply, 400, 'A valid email address is required');
		if (!note) return fail(reply, 400, 'A note is required');
		const job = await one('select id, slug, title, location, team from jobs where slug=$1', [job_slug]);
		if (!job) return fail(reply, 404, 'No job with that slug');

		const before = await one('select id from applications where account_id=$1 and job_id=$2', [
			acc.id,
			job.id
		]);
		const row = await one(
			`insert into applications (account_id, job_id, name, email, note)
			 values ($1,$2,$3,$4,$5)
			 on conflict (account_id, job_id) do update set name=excluded.name, email=excluded.email, note=excluded.note
			 returning id, job_id, name, email, note, status, created_at`,
			[acc.id, job.id, name, email, note]
		);
		await sendMail(applicationMail(row, job), req.log);
		return reply
			.code(before ? 200 : 201)
			.send({ ...row, job_slug: job.slug, job_title: job.title, job_location: job.location });
	});

	app.get('/api/applications', async (req, reply) => {
		const acc = await requireAccount(req, reply);
		if (!acc) return;
		const rows = await many(
			`select a.id, a.job_id, j.slug as job_slug, j.title as job_title, j.location as job_location,
			        a.name, a.email, a.note, a.status, a.created_at
			   from applications a join jobs j on j.id = a.job_id
			  where a.account_id=$1 order by a.id`,
			[acc.id]
		);
		return reply.send(rows);
	});

	// ---------- calculator ----------
	app.post('/api/calculator', async (req, reply) => {
		const b = req.body || {};
		const kind = str(b.kind) || 'thermal';
		if (kind !== 'thermal' && kind !== 'electrical')
			return fail(reply, 400, "kind must be 'thermal' or 'electrical'");
		const need = Number(b.need_mw);
		if (!Number.isFinite(need) || need <= 0)
			return fail(reply, 400, 'need_mw must be a number greater than zero');
		const perModule = kind === 'thermal' ? 250 : 100;
		const modules_required = Math.ceil(need / perModule);
		const annual_clean_energy_gwh = (modules_required * perModule * 8000) / 1000;
		const annual_co2_avoided_tonnes = annual_clean_energy_gwh * 450;
		return reply.send({
			need_mw: need,
			kind,
			modules_required,
			annual_clean_energy_gwh,
			annual_co2_avoided_tonnes
		});
	});

	// ---------- content ----------
	app.get('/api/team', async (req, reply) => {
		return reply.send(
			await many(
				'select slug, name, role_title, bio, profile_url from team_members order by sort_order, id'
			)
		);
	});

	app.get('/api/offices', async (req, reply) => {
		return reply.send(await many('select city, country, role_label from offices order by id'));
	});

	app.get('/api/faqs', async (req, reply) => {
		const q = req.query || {};
		const where = [];
		const params = [];
		const category = str(q.category);
		if (category) {
			params.push(category);
			where.push(`category = $${params.length}`);
		}
		const text = str(q.q);
		if (text) {
			params.push(`%${text.toLowerCase()}%`);
			const i = params.length;
			where.push(`(lower(question) like $${i} or lower(answer) like $${i})`);
		}
		const clause = where.length ? `where ${where.join(' and ')}` : '';
		return reply.send(await many(`select question, answer, category from faqs ${clause} order by id`, params));
	});

	app.all('/api/*', async (req, reply) => notFound(reply));
}
