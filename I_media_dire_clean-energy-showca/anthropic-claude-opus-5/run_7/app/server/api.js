import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { query, pool } from './db.js';
import { sendMail, enquiryMail, accessRequestMail, applicationMail } from './mail.js';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const OUTPUT_KINDS = ['heat', 'heat-and-power', 'hydrogen', 'electricity'];
const TEMPERATURE_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
const DEPLOYMENTS = ['single-module', 'multi-module'];
const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];

function refCode(prefix) {
  let out = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return `${prefix}-${out}`;
}

function fail(reply, status, message, code) {
  return reply.code(status).send({ error: message, message, code: code || undefined });
}

const notFound = (reply, what = 'Not found') => fail(reply, 404, what, 'not_found');

function trimStr(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function authenticate(request) {
  const header = request.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) return { state: 'none' };
  const token = m[1].trim();
  const r = await query(
    `SELECT t.token, t.expires_at, a.id, a.email, a.display_name
       FROM auth_tokens t JOIN accounts a ON a.id = t.account_id
      WHERE t.token = $1`,
    [token]
  );
  if (!r.rowCount) return { state: 'invalid' };
  const row = r.rows[0];
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await query('DELETE FROM auth_tokens WHERE token = $1', [token]);
    return { state: 'expired' };
  }
  return {
    state: 'ok',
    account: { id: row.id, email: row.email, display_name: row.display_name }
  };
}

function solutionOut(row, withDetail = false) {
  const base = {
    id: row.id,
    slug: row.slug,
    industry: row.industry,
    title: row.title,
    summary: row.summary,
    output_kind: row.output_kind,
    temperature_band: row.temperature_band,
    deployment: row.deployment,
    module_count: row.module_count
  };
  if (withDetail) base.detail = row.detail;
  return base;
}

async function issueToken(accountId) {
  const token = crypto.randomBytes(32).toString('hex');
  await query('INSERT INTO auth_tokens (token, account_id, expires_at) VALUES ($1,$2,$3)', [
    token,
    accountId,
    new Date(Date.now() + TOKEN_TTL_MS)
  ]);
  return token;
}

async function claimSaves(saveToken, accountId) {
  const t = trimStr(saveToken);
  if (!t) return 0;
  const rows = await query('SELECT id, solution_id FROM saved_solutions WHERE save_token = $1', [t]);
  let moved = 0;
  for (const row of rows.rows) {
    const res = await query(
      `UPDATE saved_solutions SET account_id = $1, save_token = NULL
         WHERE id = $2
           AND NOT EXISTS (
             SELECT 1 FROM saved_solutions s2
              WHERE s2.account_id = $1 AND s2.solution_id = $3
           )`,
      [accountId, row.id, row.solution_id]
    );
    if (res.rowCount) moved += 1;
    else await query('DELETE FROM saved_solutions WHERE id = $1', [row.id]);
  }
  await query('DELETE FROM saved_solutions WHERE save_token = $1', [t]);
  return moved;
}

export default async function api(fastify) {
  // ---- auth helpers as decorators -------------------------------------
  const requireAuth = async (request, reply) => {
    const auth = await authenticate(request);
    if (auth.state === 'ok') {
      request.account = auth.account;
      return;
    }
    if (auth.state === 'expired')
      return fail(reply, 401, 'Your session has expired. Sign in again.', 'token_expired');
    return fail(reply, 401, 'Authentication is required for this action.', 'unauthenticated');
  };

  const optionalAuth = async (request, reply) => {
    const auth = await authenticate(request);
    if (auth.state === 'ok') request.account = auth.account;
    else if (auth.state === 'expired')
      return fail(reply, 401, 'Your session has expired. Sign in again.', 'token_expired');
    else request.account = null;
  };

  // ---- health ----------------------------------------------------------
  fastify.get('/health', async (request, reply) => {
    try {
      await query('SELECT 1');
      return reply.code(200).send({ status: 'ok' });
    } catch {
      return reply.code(503).send({ status: 'unavailable' });
    }
  });

  // ---- auth ------------------------------------------------------------
  fastify.post('/auth/signup', async (request, reply) => {
    const body = request.body || {};
    const email = trimStr(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const display_name = trimStr(body.display_name);
    if (!isEmail(email)) return fail(reply, 400, 'A valid email address is required.', 'bad_email');
    if (password.length < 8)
      return fail(reply, 400, 'The password must be at least 8 characters.', 'bad_password');
    if (!display_name) return fail(reply, 400, 'A display name is required.', 'bad_name');

    const hash = await bcrypt.hash(password, 10);
    let account;
    try {
      const r = await query(
        `INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3)
         RETURNING id, email, display_name`,
        [email, hash, display_name]
      );
      account = r.rows[0];
    } catch (err) {
      if (err && err.code === '23505')
        return fail(reply, 409, 'An account with that email already exists.', 'email_taken');
      throw err;
    }
    const claimed = await claimSaves(body.save_token, account.id);
    const access_token = await issueToken(account.id);
    return reply.code(201).send({
      id: account.id,
      email: account.email,
      display_name: account.display_name,
      access_token,
      token_type: 'Bearer',
      claimed_saves: claimed
    });
  });

  fastify.post('/auth/login', async (request, reply) => {
    const body = request.body || {};
    const email = trimStr(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const r = await query(
      'SELECT id, email, display_name, password_hash FROM accounts WHERE email = $1',
      [email]
    );
    const row = r.rows[0];
    const ok = row ? await bcrypt.compare(password, row.password_hash) : false;
    if (!ok) return fail(reply, 401, 'That email and password do not match.', 'bad_credentials');
    const claimed = await claimSaves(body.save_token, row.id);
    const access_token = await issueToken(row.id);
    return reply.send({
      access_token,
      token_type: 'Bearer',
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      claimed_saves: claimed
    });
  });

  fastify.post('/auth/logout', { preHandler: requireAuth }, async (request, reply) => {
    const token = (request.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    await query('DELETE FROM auth_tokens WHERE token = $1', [token]);
    return reply.send({ ok: true });
  });

  fastify.get('/accounts/me', { preHandler: requireAuth }, async (request, reply) =>
    reply.send({
      id: request.account.id,
      email: request.account.email,
      display_name: request.account.display_name
    })
  );

  // ---- solutions -------------------------------------------------------
  fastify.get('/solutions', async (request, reply) => {
    const q = request.query || {};
    const where = [];
    const params = [];
    const add = (sql, value) => {
      params.push(value);
      where.push(sql.replace('?', `$${params.length}`));
    };
    if (trimStr(q.industry)) add('industry = ?', trimStr(q.industry));
    if (trimStr(q.output_kind)) add('output_kind = ?', trimStr(q.output_kind));
    if (trimStr(q.temperature_band)) add('temperature_band = ?', trimStr(q.temperature_band));
    if (trimStr(q.deployment)) add('deployment = ?', trimStr(q.deployment));
    if (trimStr(q.q)) {
      params.push(`%${trimStr(q.q).toLowerCase()}%`);
      const p = `$${params.length}`;
      where.push(
        `(lower(industry) LIKE ${p} OR lower(title) LIKE ${p} OR lower(summary) LIKE ${p} OR lower(detail) LIKE ${p} OR lower(slug) LIKE ${p})`
      );
    }
    const sql = `SELECT * FROM solutions ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY sort_order, id`;
    const r = await query(sql, params);
    reply.header('X-Total-Count', String(r.rowCount));
    reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
    return reply.send(r.rows.map((row) => solutionOut(row)));
  });

  fastify.get('/solutions/:slug', async (request, reply) => {
    const r = await query('SELECT * FROM solutions WHERE slug = $1', [request.params.slug]);
    if (!r.rowCount) return notFound(reply, 'No solution with that slug.');
    return reply.send(solutionOut(r.rows[0], true));
  });

  fastify.get('/compare', async (request, reply) => {
    const raw = request.query?.slugs;
    const slugs = (Array.isArray(raw) ? raw.join(',') : trimStr(raw))
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = [...new Set(slugs)];
    if (unique.length > 4)
      return fail(
        reply,
        400,
        'The comparison holds at most four solutions. Remove one and try again.',
        'compare_limit'
      );
    if (!unique.length) return reply.send([]);
    const r = await query('SELECT * FROM solutions WHERE slug = ANY($1) ORDER BY sort_order, id', [
      unique
    ]);
    return reply.send(r.rows.map((row) => solutionOut(row, true)));
  });

  // ---- saves -----------------------------------------------------------
  fastify.get('/saves', { preHandler: optionalAuth }, async (request, reply) => {
    const saveToken = trimStr(request.query?.save_token);
    if (request.account) {
      const r = await query(
        `SELECT ss.id, ss.solution_id, s.slug, s.title, s.industry, s.output_kind,
                s.temperature_band, s.deployment, s.module_count, s.summary, ss.created_at
           FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
          WHERE ss.account_id = $1 ORDER BY ss.id`,
        [request.account.id]
      );
      return reply.send(r.rows);
    }
    if (!saveToken)
      return fail(
        reply,
        401,
        'Sign in or supply a save token to read saved solutions.',
        'unauthenticated'
      );
    const r = await query(
      `SELECT ss.id, ss.solution_id, s.slug, s.title, s.industry, s.output_kind,
              s.temperature_band, s.deployment, s.module_count, s.summary, ss.created_at
         FROM saved_solutions ss JOIN solutions s ON s.id = ss.solution_id
        WHERE ss.save_token = $1 ORDER BY ss.id`,
      [saveToken]
    );
    return reply.send(r.rows);
  });

  fastify.post('/saves', { preHandler: optionalAuth }, async (request, reply) => {
    const body = request.body || {};
    const slug = trimStr(body.solution_slug || body.slug);
    if (!slug) return fail(reply, 400, 'A solution slug is required.', 'bad_request');
    const sol = await query('SELECT id, slug FROM solutions WHERE slug = $1', [slug]);
    if (!sol.rowCount) return notFound(reply, 'No solution with that slug.');
    const solutionId = sol.rows[0].id;

    if (request.account) {
      const ins = await query(
        `INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
         ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING
         RETURNING id`,
        [request.account.id, solutionId]
      );
      let id = ins.rows[0]?.id;
      if (!id) {
        const existing = await query(
          'SELECT id FROM saved_solutions WHERE account_id = $1 AND solution_id = $2',
          [request.account.id, solutionId]
        );
        id = existing.rows[0].id;
      }
      return reply
        .code(ins.rowCount ? 201 : 200)
        .send({ id, solution_id: solutionId, slug, save_token: null, already_saved: !ins.rowCount });
    }

    const saveToken = trimStr(body.save_token) || crypto.randomBytes(18).toString('hex');
    const ins = await query(
      `INSERT INTO saved_solutions (save_token, solution_id) VALUES ($1,$2)
       ON CONFLICT (save_token, solution_id) WHERE save_token IS NOT NULL DO NOTHING
       RETURNING id`,
      [saveToken, solutionId]
    );
    let id = ins.rows[0]?.id;
    if (!id) {
      const existing = await query(
        'SELECT id FROM saved_solutions WHERE save_token = $1 AND solution_id = $2',
        [saveToken, solutionId]
      );
      id = existing.rows[0].id;
    }
    return reply.code(ins.rowCount ? 201 : 200).send({
      id,
      solution_id: solutionId,
      slug,
      save_token: saveToken,
      already_saved: !ins.rowCount
    });
  });

  fastify.delete('/saves/:id', { preHandler: optionalAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return notFound(reply, 'No saved solution with that id.');
    const saveToken = trimStr(request.query?.save_token);
    let r;
    if (request.account) {
      r = await query('DELETE FROM saved_solutions WHERE id = $1 AND account_id = $2 RETURNING id', [
        id,
        request.account.id
      ]);
    } else if (saveToken) {
      r = await query('DELETE FROM saved_solutions WHERE id = $1 AND save_token = $2 RETURNING id', [
        id,
        saveToken
      ]);
    } else {
      return fail(reply, 401, 'Authentication is required for this action.', 'unauthenticated');
    }
    if (!r.rowCount) return notFound(reply, 'No saved solution with that id.');
    return reply.send({ ok: true, id });
  });

  // ---- saved searches ---------------------------------------------------
  fastify.get('/searches', { preHandler: requireAuth }, async (request, reply) => {
    const r = await query(
      `SELECT id, name, query, industry, output_kind, temperature_band, deployment, created_at
         FROM saved_searches WHERE account_id = $1 ORDER BY id`,
      [request.account.id]
    );
    return reply.send(r.rows);
  });

  fastify.post('/searches', { preHandler: requireAuth }, async (request, reply) => {
    const b = request.body || {};
    const name = trimStr(b.name);
    if (!name) return fail(reply, 400, 'A name for the saved search is required.', 'bad_request');
    const norm = (v, allowed) => {
      const s = trimStr(v);
      if (!s) return null;
      if (allowed && !allowed.includes(s)) return undefined;
      return s;
    };
    const output_kind = norm(b.output_kind, OUTPUT_KINDS);
    const temperature_band = norm(b.temperature_band, TEMPERATURE_BANDS);
    const deployment = norm(b.deployment, DEPLOYMENTS);
    if (output_kind === undefined || temperature_band === undefined || deployment === undefined)
      return fail(reply, 400, 'One of the filters is not a value this explorer uses.', 'bad_filter');
    const r = await query(
      `INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (account_id, name) DO UPDATE SET
         query = EXCLUDED.query, industry = EXCLUDED.industry, output_kind = EXCLUDED.output_kind,
         temperature_band = EXCLUDED.temperature_band, deployment = EXCLUDED.deployment
       RETURNING id, name, query, industry, output_kind, temperature_band, deployment, created_at`,
      [
        request.account.id,
        name,
        trimStr(b.query) || null,
        norm(b.industry) || null,
        output_kind,
        temperature_band,
        deployment
      ]
    );
    return reply.code(201).send(r.rows[0]);
  });

  fastify.delete('/searches/:id', { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return notFound(reply, 'No saved search with that id.');
    const r = await query(
      'DELETE FROM saved_searches WHERE id = $1 AND account_id = $2 RETURNING id',
      [id, request.account.id]
    );
    if (!r.rowCount) return notFound(reply, 'No saved search with that id.');
    return reply.send({ ok: true, id });
  });

  // ---- enquiries --------------------------------------------------------
  fastify.post('/enquiries', { preHandler: optionalAuth }, async (request, reply) => {
    const b = request.body || {};
    const name = trimStr(b.name);
    const email = trimStr(b.email).toLowerCase();
    const topic = trimStr(b.topic);
    const message = trimStr(b.message);
    if (!name) return fail(reply, 400, 'Your name is required.', 'bad_request');
    if (!isEmail(email)) return fail(reply, 400, 'A valid email address is required.', 'bad_email');
    if (!TOPICS.includes(topic))
      return fail(reply, 400, `The topic must be one of: ${TOPICS.join(', ')}.`, 'bad_topic');
    if (!message) return fail(reply, 400, 'A message is required.', 'bad_request');

    let row = null;
    for (let attempt = 0; attempt < 6 && !row; attempt++) {
      try {
        const r = await query(
          `INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'received')
           RETURNING id, reference, status, topic, name, email, created_at`,
          [
            refCode('ENQ'),
            request.account?.id || null,
            name,
            email,
            trimStr(b.phone_country) || null,
            trimStr(b.phone) || null,
            topic,
            message
          ]
        );
        row = r.rows[0];
      } catch (err) {
        if (!(err && err.code === '23505')) throw err;
      }
    }
    if (!row) return fail(reply, 500, 'Could not mint a reference. Try again.', 'reference_failed');
    await sendMail(request.log, enquiryMail(row));
    return reply.code(201).send(row);
  });

  fastify.get('/enquiries', { preHandler: requireAuth }, async (request, reply) => {
    const r = await query(
      `SELECT id, reference, name, email, phone_country, phone, topic, message, status, created_at
         FROM enquiries WHERE account_id = $1 ORDER BY id DESC`,
      [request.account.id]
    );
    return reply.send(r.rows);
  });

  fastify.post('/enquiries/:id/close', { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return notFound(reply, 'No enquiry with that id.');
    const r = await query(
      `UPDATE enquiries SET status = 'closed'
        WHERE id = $1 AND account_id = $2
        RETURNING id, reference, topic, status, created_at`,
      [id, request.account.id]
    );
    if (!r.rowCount) return notFound(reply, 'No enquiry with that id.');
    return reply.send(r.rows[0]);
  });

  // ---- access requests ---------------------------------------------------
  fastify.get('/access-request', { preHandler: requireAuth }, async (request, reply) => {
    const r = await query(
      `SELECT id, reference, organisation, role_title, status, created_at
         FROM access_requests WHERE account_id = $1`,
      [request.account.id]
    );
    if (!r.rowCount) return notFound(reply, 'You have not requested investor access yet.');
    return reply.send(r.rows[0]);
  });

  fastify.post('/access-request', { preHandler: requireAuth }, async (request, reply) => {
    const b = request.body || {};
    const organisation = trimStr(b.organisation);
    const role_title = trimStr(b.role_title);
    if (!organisation) return fail(reply, 400, 'An organisation is required.', 'bad_request');
    if (!role_title) return fail(reply, 400, 'A role title is required.', 'bad_request');

    let row = null;
    for (let attempt = 0; attempt < 6 && !row; attempt++) {
      try {
        const r = await query(
          `INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
           VALUES ($1,$2,$3,$4,'pending')
           ON CONFLICT (account_id) DO UPDATE SET
             organisation = EXCLUDED.organisation, role_title = EXCLUDED.role_title
           RETURNING id, reference, organisation, role_title, status, created_at`,
          [refCode('IAR'), request.account.id, organisation, role_title]
        );
        row = r.rows[0];
      } catch (err) {
        if (!(err && err.code === '23505')) throw err;
      }
    }
    if (!row) return fail(reply, 500, 'Could not mint a reference. Try again.', 'reference_failed');
    await sendMail(
      request.log,
      accessRequestMail(row, request.account.email, request.account.display_name)
    );
    return reply.code(201).send(row);
  });

  // ---- documents ---------------------------------------------------------
  fastify.get('/documents', { preHandler: requireAuth }, async (request, reply) => {
    const r = await query('SELECT status FROM access_requests WHERE account_id = $1', [
      request.account.id
    ]);
    if (!r.rowCount || r.rows[0].status !== 'approved')
      return notFound(reply, 'No such room.');
    const docs = await query(
      'SELECT id, slug, title, category, summary, published_at FROM documents ORDER BY published_at DESC, id'
    );
    return reply.send(docs.rows);
  });

  // ---- stories -----------------------------------------------------------
  fastify.get('/stories', async (request, reply) => {
    const q = request.query || {};
    const where = [];
    const params = [];
    if (q.featured !== undefined && trimStr(q.featured) !== '') {
      const val = String(q.featured).toLowerCase();
      params.push(val === 'true' || val === '1');
      where.push(`featured = $${params.length}`);
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const total = await query(`SELECT COUNT(*)::int AS c FROM stories ${whereSql}`, params);
    const limit = Math.min(Math.max(parseInt(q.limit ?? '50', 10) || 50, 1), 100);
    const offset = Math.max(parseInt(q.offset ?? '0', 10) || 0, 0);
    params.push(limit, offset);
    const r = await query(
      `SELECT id, slug, title, outlet, published_at, featured FROM stories ${whereSql}
        ORDER BY published_at DESC, id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    reply.header('X-Total-Count', String(total.rows[0].c));
    reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
    return reply.send(r.rows);
  });

  fastify.get('/stories/:slug', async (request, reply) => {
    const r = await query(
      'SELECT id, slug, title, outlet, published_at, featured, body FROM stories WHERE slug = $1',
      [request.params.slug]
    );
    if (!r.rowCount) return notFound(reply, 'No story with that slug.');
    return reply.send(r.rows[0]);
  });

  // ---- jobs and applications ----------------------------------------------
  fastify.get('/jobs', async (request, reply) => {
    const r = await query('SELECT id, slug, title, location, team, description FROM jobs ORDER BY id');
    return reply.send(r.rows);
  });

  fastify.get('/applications', { preHandler: requireAuth }, async (request, reply) => {
    const r = await query(
      `SELECT a.id, a.job_id, j.slug AS job_slug, j.title AS job_title, j.location,
              a.name, a.email, a.note, a.status, a.created_at
         FROM applications a JOIN jobs j ON j.id = a.job_id
        WHERE a.account_id = $1 ORDER BY a.id`,
      [request.account.id]
    );
    return reply.send(r.rows);
  });

  fastify.post('/applications', { preHandler: requireAuth }, async (request, reply) => {
    const b = request.body || {};
    const jobSlug = trimStr(b.job_slug);
    const name = trimStr(b.name);
    const email = trimStr(b.email).toLowerCase();
    const note = trimStr(b.note);
    if (!jobSlug) return fail(reply, 400, 'A job slug is required.', 'bad_request');
    if (!name) return fail(reply, 400, 'Your name is required.', 'bad_request');
    if (!isEmail(email)) return fail(reply, 400, 'A valid email address is required.', 'bad_email');
    if (!note) return fail(reply, 400, 'A note is required.', 'bad_request');
    const job = await query('SELECT id, slug, title, location, team FROM jobs WHERE slug = $1', [
      jobSlug
    ]);
    if (!job.rowCount) return notFound(reply, 'No job with that slug.');
    const j = job.rows[0];
    const r = await query(
      `INSERT INTO applications (account_id, job_id, name, email, note, status)
       VALUES ($1,$2,$3,$4,$5,'received')
       ON CONFLICT (account_id, job_id) DO UPDATE SET
         name = EXCLUDED.name, email = EXCLUDED.email, note = EXCLUDED.note
       RETURNING id, job_id, name, email, note, status, created_at`,
      [request.account.id, j.id, name, email, note]
    );
    const row = { ...r.rows[0], job_slug: j.slug, job_title: j.title, location: j.location };
    await sendMail(request.log, applicationMail(row, j));
    return reply.code(201).send(row);
  });

  // ---- calculator ---------------------------------------------------------
  fastify.post('/calculator', async (request, reply) => {
    const b = request.body || {};
    const need = Number(b.need_mw);
    const kind = trimStr(b.kind) || 'thermal';
    if (!Number.isFinite(need) || need <= 0)
      return fail(reply, 400, 'The need in megawatts must be greater than zero.', 'bad_need');
    if (kind !== 'thermal' && kind !== 'electrical')
      return fail(reply, 400, "The kind must be 'thermal' or 'electrical'.", 'bad_kind');
    const perModule = kind === 'thermal' ? 250 : 100;
    const modules_required = Math.ceil(need / perModule);
    const annual_clean_energy_gwh = (modules_required * perModule * 8000) / 1000;
    const annual_co2_avoided_tonnes = annual_clean_energy_gwh * 450;
    return reply.send({
      modules_required,
      annual_clean_energy_gwh,
      annual_co2_avoided_tonnes,
      kind,
      need_mw: need,
      per_module_mw: perModule
    });
  });

  // ---- content ------------------------------------------------------------
  fastify.get('/team', async (request, reply) => {
    const r = await query(
      'SELECT id, slug, name, role_title, bio, profile_url FROM team_members ORDER BY sort_order, id'
    );
    return reply.send(r.rows);
  });

  fastify.get('/offices', async (request, reply) => {
    const r = await query('SELECT id, city, country, role_label FROM offices ORDER BY id');
    return reply.send(r.rows);
  });

  fastify.get('/faqs', async (request, reply) => {
    const q = request.query || {};
    const where = [];
    const params = [];
    if (trimStr(q.category)) {
      params.push(trimStr(q.category));
      where.push(`category = $${params.length}`);
    }
    if (trimStr(q.q)) {
      params.push(`%${trimStr(q.q).toLowerCase()}%`);
      where.push(`(lower(question) LIKE $${params.length} OR lower(answer) LIKE $${params.length})`);
    }
    const r = await query(
      `SELECT id, question, answer, category FROM faqs
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY category DESC, sort_order, id`,
      params
    );
    return reply.send(r.rows);
  });

  fastify.setNotFoundHandler((request, reply) =>
    fail(reply, 404, 'No such endpoint.', 'not_found')
  );

  fastify.addHook('onClose', async () => {
    await pool.end().catch(() => {});
  });
}
