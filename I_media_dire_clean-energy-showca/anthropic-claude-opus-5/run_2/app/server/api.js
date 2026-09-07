import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool, many, one, tx } from './db.js';
import { sendMail, enquiryMail, accessRequestMail, applicationMail } from './mail.js';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMPERATURE_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];
const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];

function reference(prefix) {
  let s = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) s += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return `${prefix}-${s}`;
}

async function uniqueReference(client, prefix, table) {
  for (let i = 0; i < 12; i++) {
    const ref = reference(prefix);
    const r = await client.query(`select 1 from ${table} where reference = $1`, [ref]);
    if (r.rowCount === 0) return ref;
  }
  throw new Error('could not mint a unique reference');
}

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.statusCode = status;
    this.code = code;
  }
}

const badRequest = (m) => new HttpError(400, m, 'invalid_request');
const notFound = (m = 'Not found') => new HttpError(404, m, 'not_found');
const unauthorized = (m = 'Authentication required') => new HttpError(401, m, 'unauthorized');
const conflict = (m) => new HttpError(409, m, 'conflict');

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function requireFields(body, fields) {
  const out = {};
  for (const f of fields) {
    const v = str(body?.[f]);
    if (!v) throw badRequest(`${f} is required`);
    out[f] = v;
  }
  return out;
}

const SOLUTION_COLUMNS =
  'id, slug, industry, title, summary, output_kind, temperature_band, deployment, module_count';

async function accountFromRequest(req) {
  const header = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) return null;
  const token = m[1].trim();
  const row = await one(
    `select a.id, a.email, a.display_name, t.expires_at
       from auth_tokens t join accounts a on a.id = t.account_id
      where t.token = $1`,
    [token]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await pool.query('delete from auth_tokens where token = $1', [token]).catch(() => {});
    return null;
  }
  return { id: row.id, email: row.email, display_name: row.display_name };
}

function requireAccount(req) {
  if (!req.account) throw unauthorized();
  return req.account;
}

async function claimSaves(client, accountId, saveToken) {
  const token = str(saveToken);
  if (!token) return 0;
  const rows = (
    await client.query('select solution_id from saved_solutions where save_token = $1', [token])
  ).rows;
  let moved = 0;
  for (const r of rows) {
    const res = await client.query(
      `insert into saved_solutions (account_id, solution_id) values ($1, $2)
       on conflict do nothing`,
      [accountId, r.solution_id]
    );
    moved += res.rowCount;
  }
  await client.query('delete from saved_solutions where save_token = $1', [token]);
  return moved;
}

async function issueToken(client, accountId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  await client.query('insert into auth_tokens (token, account_id, expires_at) values ($1,$2,$3)', [
    token,
    accountId,
    expires
  ]);
  return { token, expires };
}

function calculate(need_mw, kind) {
  const need = Number(need_mw);
  if (!Number.isFinite(need) || need <= 0) throw badRequest('need_mw must be a number greater than zero');
  const k = str(kind) || 'thermal';
  if (!['thermal', 'electrical'].includes(k)) throw badRequest('kind must be thermal or electrical');
  const perModule = k === 'thermal' ? 250 : 100;
  const modules_required = Math.ceil(need / perModule);
  const annual_clean_energy_gwh = (modules_required * perModule * 8000) / 1000;
  const annual_co2_avoided_tonnes = annual_clean_energy_gwh * 450;
  return { modules_required, annual_clean_energy_gwh, annual_co2_avoided_tonnes };
}

export function registerApi(app) {
  app.decorateRequest('account', null);

  app.addHook('preHandler', async (req) => {
    if (!req.url.startsWith('/api/')) return;
    req.account = await accountFromRequest(req);
  });

  app.setErrorHandler((err, req, reply) => {
    const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
    if (status >= 500) req.log.error({ event: 'error', err: String(err && err.stack) });
    reply.code(status).send({
      error: err.code || (status === 404 ? 'not_found' : 'error'),
      message: status >= 500 ? 'Something went wrong on our side.' : err.message
    });
  });

  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) {
      reply.code(404).send({ error: 'not_found', message: 'Not found' });
      return;
    }
    reply.callNotFound?.();
  });

  // ---------- health ----------
  app.get('/api/health', async (req, reply) => {
    try {
      await pool.query('select 1');
      return { status: 'ok' };
    } catch {
      reply.code(503);
      return { status: 'unavailable' };
    }
  });

  // ---------- auth ----------
  app.post('/api/auth/signup', async (req, reply) => {
    const body = req.body || {};
    const email = str(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const display_name = str(body.display_name);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw badRequest('A valid email is required');
    if (password.length < 8) throw badRequest('Password must be at least 8 characters');
    if (!display_name) throw badRequest('display_name is required');

    const existing = await one('select id from accounts where lower(email) = $1', [email]);
    if (existing) throw conflict('An account with that email already exists');

    const hash = bcrypt.hashSync(password, 10);
    const result = await tx(async (client) => {
      let account;
      try {
        account = (
          await client.query(
            'insert into accounts (email, password_hash, display_name) values ($1,$2,$3) returning id, email, display_name',
            [email, hash, display_name]
          )
        ).rows[0];
      } catch (e) {
        if (e.code === '23505') throw conflict('An account with that email already exists');
        throw e;
      }
      await claimSaves(client, account.id, body.save_token);
      const { token } = await issueToken(client, account.id);
      return { account, token };
    });
    reply.code(201);
    return {
      id: result.account.id,
      email: result.account.email,
      display_name: result.account.display_name,
      access_token: result.token,
      token_type: 'bearer'
    };
  });

  app.post('/api/auth/login', async (req) => {
    const body = req.body || {};
    const email = str(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) throw badRequest('Email and password are required');
    const account = await one(
      'select id, email, display_name, password_hash from accounts where lower(email) = $1',
      [email]
    );
    if (!account || !bcrypt.compareSync(password, account.password_hash))
      throw unauthorized('Email or password is not correct');

    const token = await tx(async (client) => {
      await claimSaves(client, account.id, body.save_token);
      const { token } = await issueToken(client, account.id);
      return token;
    });
    return {
      access_token: token,
      token_type: 'bearer',
      account: { id: account.id, email: account.email, display_name: account.display_name }
    };
  });

  app.post('/api/auth/logout', async (req) => {
    const header = req.headers.authorization || '';
    const m = /^Bearer\s+(.+)$/i.exec(header);
    if (m) await pool.query('delete from auth_tokens where token = $1', [m[1].trim()]);
    return { ok: true };
  });

  app.get('/api/accounts/me', async (req) => {
    const acc = requireAccount(req);
    return { id: acc.id, email: acc.email, display_name: acc.display_name };
  });

  // ---------- solutions ----------
  app.get('/api/solutions', async (req, reply) => {
    const q = req.query || {};
    const where = [];
    const params = [];
    const add = (col, val, list) => {
      const v = str(val);
      if (!v) return;
      if (list && !list.includes(v)) throw badRequest(`${col} is not a recognised value`);
      params.push(v);
      where.push(`${col} = $${params.length}`);
    };
    add('industry', q.industry);
    add('output_kind', q.output_kind, OUTPUT_KINDS);
    add('temperature_band', q.temperature_band, TEMPERATURE_BANDS);
    add('deployment', q.deployment, DEPLOYMENTS);
    const text = str(q.q);
    if (text) {
      params.push(`%${text.toLowerCase()}%`);
      const p = `$${params.length}`;
      where.push(
        `(lower(industry) like ${p} or lower(title) like ${p} or lower(summary) like ${p} or lower(detail) like ${p} or lower(slug) like ${p})`
      );
    }
    const sql = `select ${SOLUTION_COLUMNS} from solutions ${
      where.length ? 'where ' + where.join(' and ') : ''
    } order by id`;
    const rows = await many(sql, params);
    reply.header('X-Total-Count', String(rows.length));
    reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
    return rows;
  });

  app.get('/api/solutions/:slug', async (req) => {
    const row = await one(`select ${SOLUTION_COLUMNS}, detail from solutions where slug = $1`, [
      req.params.slug
    ]);
    if (!row) throw notFound('No solution with that slug');
    return row;
  });

  app.get('/api/compare', async (req, reply) => {
    const raw = req.query?.slugs;
    const list = (Array.isArray(raw) ? raw.join(',') : str(raw))
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = [...new Set(list)];
    if (unique.length > 4) throw badRequest('The comparison holds at most four solutions');
    if (unique.length === 0) {
      reply.header('X-Total-Count', '0');
      return [];
    }
    const rows = await many(
      `select ${SOLUTION_COLUMNS}, detail from solutions where slug = any($1::text[]) order by id`,
      [unique]
    );
    reply.header('X-Total-Count', String(rows.length));
    return rows;
  });

  // ---------- saves ----------
  app.get('/api/saves', async (req) => {
    const acc = req.account;
    const token = str(req.query?.save_token);
    if (!acc && !token) throw unauthorized('Sign in or supply a save_token');
    if (acc) {
      return many(
        `select s.id, s.solution_id, so.slug, so.title, so.industry, so.output_kind,
                so.temperature_band, so.deployment, so.module_count, s.created_at
           from saved_solutions s join solutions so on so.id = s.solution_id
          where s.account_id = $1 order by s.id`,
        [acc.id]
      );
    }
    return many(
      `select s.id, s.solution_id, so.slug, so.title, so.industry, so.output_kind,
              so.temperature_band, so.deployment, so.module_count, s.created_at
         from saved_solutions s join solutions so on so.id = s.solution_id
        where s.save_token = $1 order by s.id`,
      [token]
    );
  });

  app.post('/api/saves', async (req, reply) => {
    const body = req.body || {};
    const slug = str(body.solution_slug) || str(body.slug);
    if (!slug) throw badRequest('solution_slug is required');
    const solution = await one('select id, slug from solutions where slug = $1', [slug]);
    if (!solution) throw notFound('No solution with that slug');

    const acc = req.account;
    if (acc) {
      const row = await one(
        `insert into saved_solutions (account_id, solution_id) values ($1,$2)
         on conflict (account_id, solution_id) where account_id is not null do nothing
         returning id, account_id, solution_id`,
        [acc.id, solution.id]
      );
      const saved =
        row ||
        (await one('select id, account_id, solution_id from saved_solutions where account_id=$1 and solution_id=$2', [
          acc.id,
          solution.id
        ]));
      reply.code(row ? 201 : 200);
      return { id: saved.id, solution_id: saved.solution_id, slug: solution.slug, save_token: null };
    }

    const token = str(body.save_token) || crypto.randomBytes(18).toString('hex');
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
    reply.code(row ? 201 : 200);
    return { id: saved.id, solution_id: saved.solution_id, slug: solution.slug, save_token: token };
  });

  app.delete('/api/saves/:id', async (req) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw notFound('No such saved solution');
    const acc = req.account;
    const token = str(req.query?.save_token);
    let res;
    if (acc) {
      res = await pool.query('delete from saved_solutions where id = $1 and account_id = $2', [id, acc.id]);
    } else if (token) {
      res = await pool.query('delete from saved_solutions where id = $1 and save_token = $2', [id, token]);
    } else {
      throw unauthorized('Sign in or supply a save_token');
    }
    if (res.rowCount === 0) throw notFound('No such saved solution');
    return { ok: true, id };
  });

  // ---------- saved searches ----------
  app.get('/api/searches', async (req) => {
    const acc = requireAccount(req);
    return many(
      `select id, name, query, industry, output_kind, temperature_band, deployment, created_at
         from saved_searches where account_id = $1 order by id`,
      [acc.id]
    );
  });

  app.post('/api/searches', async (req, reply) => {
    const acc = requireAccount(req);
    const body = req.body || {};
    const name = str(body.name);
    if (!name) throw badRequest('name is required');
    const check = (col, val, list) => {
      const v = str(val);
      if (!v) return null;
      if (list && !list.includes(v)) throw badRequest(`${col} is not a recognised value`);
      return v;
    };
    const values = [
      acc.id,
      name,
      str(body.query) || null,
      check('industry', body.industry),
      check('output_kind', body.output_kind, OUTPUT_KINDS),
      check('temperature_band', body.temperature_band, TEMPERATURE_BANDS),
      check('deployment', body.deployment, DEPLOYMENTS)
    ];
    const row = await one(
      `insert into saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (account_id, name) do update set query = excluded.query, industry = excluded.industry,
         output_kind = excluded.output_kind, temperature_band = excluded.temperature_band,
         deployment = excluded.deployment
       returning id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
      values
    );
    reply.code(201);
    return row;
  });

  app.delete('/api/searches/:id', async (req) => {
    const acc = requireAccount(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw notFound('No such saved search');
    const res = await pool.query('delete from saved_searches where id = $1 and account_id = $2', [id, acc.id]);
    if (res.rowCount === 0) throw notFound('No such saved search');
    return { ok: true, id };
  });

  // ---------- enquiries ----------
  app.post('/api/enquiries', async (req, reply) => {
    const body = req.body || {};
    const { name, email, message } = requireFields(body, ['name', 'email', 'message']);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw badRequest('A valid email is required');
    const topic = str(body.topic);
    if (!TOPICS.includes(topic)) throw badRequest(`topic must be one of ${TOPICS.join(', ')}`);
    const phone_country = str(body.phone_country) || null;
    const phone = str(body.phone) || null;
    const accountId = req.account ? req.account.id : null;

    const row = await tx(async (client) => {
      const ref = await uniqueReference(client, 'ENQ', 'enquiries');
      return (
        await client.query(
          `insert into enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
           values ($1,$2,$3,$4,$5,$6,$7,$8,'received')
           returning id, reference, account_id, name, email, phone_country, phone, topic, message, status, created_at`,
          [ref, accountId, name, email, phone_country, phone, topic, message]
        )
      ).rows[0];
    });

    await sendMail(req.log, enquiryMail(row));
    reply.code(201);
    return row;
  });

  app.get('/api/enquiries', async (req) => {
    const acc = requireAccount(req);
    return many(
      `select id, reference, name, email, phone_country, phone, topic, message, status, created_at
         from enquiries where account_id = $1 order by id desc`,
      [acc.id]
    );
  });

  app.post('/api/enquiries/:id/close', async (req) => {
    const acc = requireAccount(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw notFound('No such enquiry');
    const owned = await one('select id, status from enquiries where id = $1 and account_id = $2', [id, acc.id]);
    if (!owned) throw notFound('No such enquiry');
    const row = await one(
      `update enquiries set status = 'closed' where id = $1 and account_id = $2
       returning id, reference, topic, status, created_at`,
      [id, acc.id]
    );
    return row;
  });

  // ---------- access request ----------
  app.get('/api/access-request', async (req) => {
    const acc = requireAccount(req);
    const row = await one(
      `select id, reference, organisation, role_title, status, created_at
         from access_requests where account_id = $1`,
      [acc.id]
    );
    if (!row) throw notFound('You have not requested investor access');
    return row;
  });

  app.post('/api/access-request', async (req, reply) => {
    const acc = requireAccount(req);
    const { organisation, role_title } = requireFields(req.body || {}, ['organisation', 'role_title']);

    const { row, created } = await tx(async (client) => {
      // serialise per account so two simultaneous requests cannot both insert
      await client.query('select pg_advisory_xact_lock($1, $2)', [77001, acc.id]);
      const existing = (
        await client.query('select id, reference, status from access_requests where account_id = $1', [acc.id])
      ).rows[0];
      if (existing) {
        const updated = (
          await client.query(
            `update access_requests set organisation = $2, role_title = $3 where account_id = $1
             returning id, reference, organisation, role_title, status, created_at`,
            [acc.id, organisation, role_title]
          )
        ).rows[0];
        return { row: updated, created: false };
      }
      const ref = await uniqueReference(client, 'IAR', 'access_requests');
      const inserted = (
        await client.query(
          `insert into access_requests (reference, account_id, organisation, role_title, status)
           values ($1,$2,$3,$4,'pending')
           returning id, reference, organisation, role_title, status, created_at`,
          [ref, acc.id, organisation, role_title]
        )
      ).rows[0];
      return { row: inserted, created: true };
    });

    if (created) await sendMail(req.log, accessRequestMail(acc, row));
    reply.code(created ? 201 : 200);
    return row;
  });

  // ---------- documents ----------
  app.get('/api/documents', async (req) => {
    const acc = requireAccount(req);
    const request = await one('select status from access_requests where account_id = $1', [acc.id]);
    if (!request || request.status !== 'approved') throw notFound('Not found');
    return many('select slug, title, category, published_at from documents order by published_at desc, id');
  });

  // ---------- stories ----------
  app.get('/api/stories', async (req, reply) => {
    const q = req.query || {};
    const where = [];
    const params = [];
    if (q.featured !== undefined && str(q.featured) !== '') {
      const f = str(q.featured).toLowerCase();
      params.push(f === 'true' || f === '1');
      where.push(`featured = $${params.length}`);
    }
    const whereSql = where.length ? 'where ' + where.join(' and ') : '';
    const total = (await one(`select count(*)::int as c from stories ${whereSql}`, params)).c;
    let sql = `select slug, title, outlet, published_at, featured from stories ${whereSql} order by published_at desc, id desc`;
    const limit = q.limit !== undefined && str(q.limit) !== '' ? Number(q.limit) : null;
    const offset = q.offset !== undefined && str(q.offset) !== '' ? Number(q.offset) : null;
    if (limit !== null) {
      if (!Number.isFinite(limit) || limit < 0) throw badRequest('limit must be a non-negative number');
      params.push(Math.floor(limit));
      sql += ` limit $${params.length}`;
    }
    if (offset !== null) {
      if (!Number.isFinite(offset) || offset < 0) throw badRequest('offset must be a non-negative number');
      params.push(Math.floor(offset));
      sql += ` offset $${params.length}`;
    }
    const rows = await many(sql, params);
    reply.header('X-Total-Count', String(total));
    return rows;
  });

  app.get('/api/stories/:slug', async (req) => {
    const row = await one(
      'select slug, title, outlet, published_at, featured, body from stories where slug = $1',
      [req.params.slug]
    );
    if (!row) throw notFound('No story with that slug');
    return row;
  });

  // ---------- jobs and applications ----------
  app.get('/api/jobs', async () =>
    many('select slug, title, location, team, description from jobs order by id')
  );

  app.get('/api/applications', async (req) => {
    const acc = requireAccount(req);
    return many(
      `select a.id, a.job_id, j.slug as job_slug, j.title as job_title, j.location, a.name, a.email,
              a.note, a.status, a.created_at
         from applications a join jobs j on j.id = a.job_id
        where a.account_id = $1 order by a.id desc`,
      [acc.id]
    );
  });

  app.post('/api/applications', async (req, reply) => {
    const acc = requireAccount(req);
    const body = req.body || {};
    const { job_slug, name, email, note } = requireFields(body, ['job_slug', 'name', 'email', 'note']);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw badRequest('A valid email is required');
    const job = await one('select id, slug, title, location, team from jobs where slug = $1', [job_slug]);
    if (!job) throw notFound('No job with that slug');

    const row = await one(
      `insert into applications (account_id, job_id, name, email, note, status)
       values ($1,$2,$3,$4,$5,'received')
       on conflict (account_id, job_id) do update set name = excluded.name, email = excluded.email,
         note = excluded.note
       returning id, account_id, job_id, name, email, note, status, created_at`,
      [acc.id, job.id, name, email, note]
    );

    await sendMail(req.log, applicationMail(row, job));
    reply.code(201);
    return {
      id: row.id,
      job_slug: job.slug,
      job_title: job.title,
      name: row.name,
      email: row.email,
      note: row.note,
      status: row.status,
      created_at: row.created_at
    };
  });

  // ---------- calculator ----------
  app.post('/api/calculator', async (req) => {
    const body = req.body || {};
    return calculate(body.need_mw, body.kind);
  });

  // ---------- content ----------
  app.get('/api/team', async () =>
    many('select slug, name, role_title, bio, profile_url from team_members order by sort_order, id')
  );

  app.get('/api/offices', async () => many('select city, country, role_label from offices order by id'));

  app.get('/api/faqs', async (req) => {
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
      const p = `$${params.length}`;
      where.push(`(lower(question) like ${p} or lower(answer) like ${p})`);
    }
    return many(
      `select question, answer, category from faqs ${where.length ? 'where ' + where.join(' and ') : ''} order by id`,
      params
    );
  });
}

export { calculate };
