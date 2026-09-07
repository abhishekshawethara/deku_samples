/**
 * Contract walk against a running instance. Checks the graded rules end to end,
 * including reading the database rows back after a denied cross-account request.
 */
import pg from 'pg';

const BASE = process.env.BASE || 'http://localhost:4173';
const MAILPIT = process.env.MAILPIT_API || 'http://mailpit:8025';
const PW = 'deku-demo-pw-2026';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(`${name} ${extra}`);
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

async function call(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

async function login(email) {
  const { data } = await call('/auth/login', { method: 'POST', body: { email, password: PW } });
  return data.access_token;
}

async function main() {
  console.log('\n== health and readiness ==');
  {
    const { status } = await call('/health');
    ok('GET /api/health is 200', status === 200);
  }

  console.log('\n== auth ==');
  const adaToken = await login('visitor@example.com');
  const kenToken = await login('visitor2@example.com');
  ok('ada logs in with the literal password', !!adaToken);
  ok('ken logs in with the literal password', !!kenToken);
  {
    const { status } = await call('/auth/login', {
      method: 'POST',
      body: { email: 'visitor@example.com', password: 'wrong' }
    });
    ok('a wrong password is denied', status === 401, `got ${status}`);
  }
  {
    const { data } = await call('/accounts/me', { token: adaToken });
    ok(
      'accounts/me is Ada',
      data.email === 'visitor@example.com' && data.display_name === 'Ada Moreau'
    );
  }
  {
    const { status } = await call('/accounts/me');
    ok('accounts/me without a token is denied', status === 401, `got ${status}`);
  }
  {
    const { status } = await call('/accounts/me', { token: 'nonsense-token' });
    ok('accounts/me with a bogus token is denied', status === 401, `got ${status}`);
  }

  console.log('\n== explorer, filters and count ==');
  {
    const { data, headers } = await call('/solutions');
    ok('eight solutions seeded', data.length === 8, `got ${data.length}`);
    ok('X-Total-Count is 8', headers.get('x-total-count') === '8');
  }
  {
    const { data, headers } = await call(
      '/solutions?output_kind=hydrogen&temperature_band=' + encodeURIComponent('550 to 750 C')
    );
    const slugs = data.map((s) => s.slug).sort();
    ok(
      'hydrogen + 550 to 750 C leaves exactly transport and steel',
      JSON.stringify(slugs) === JSON.stringify(['steel', 'transport']),
      JSON.stringify(slugs)
    );
    ok('X-Total-Count is 2 for that pair', headers.get('x-total-count') === '2');
  }
  {
    const { data } = await call('/solutions?industry=Steel&deployment=single-module');
    ok('contradictory filters return an empty array', Array.isArray(data) && data.length === 0);
  }
  {
    const { data } = await call('/solutions?q=desalination');
    ok('plain language search finds desalination', data.some((s) => s.slug === 'desalination'));
  }
  {
    const { data, status } = await call('/solutions/steel');
    ok(
      'one solution carries detail',
      status === 200 && typeof data.detail === 'string' && data.detail.length > 50
    );
  }
  {
    const { status } = await call('/solutions/not-a-slug');
    ok('an unknown slug is not found', status === 404, `got ${status}`);
  }

  console.log('\n== anonymous save, claim on signup ==');
  let anonToken = null;
  {
    const { status, data } = await call('/saves', {
      method: 'POST',
      body: { solution_slug: 'steel' }
    });
    anonToken = data.save_token;
    ok('anonymous save returns an opaque save_token', status === 201 && !!anonToken);
  }
  {
    const { data } = await call('/saves', {
      method: 'POST',
      body: { solution_slug: 'steel', save_token: anonToken }
    });
    ok('a repeated anonymous save is a no-op', data.already_saved === true);
    const rows = await pool.query(
      'SELECT count(*)::int c FROM saved_solutions WHERE save_token = $1',
      [anonToken]
    );
    ok('only one anonymous row in the database', rows.rows[0].c === 1, `got ${rows.rows[0].c}`);
  }
  {
    const { data } = await call(`/saves?save_token=${encodeURIComponent(anonToken)}`);
    ok('anonymous saves read back by token', data.length === 1 && data[0].slug === 'steel');
  }
  {
    const { status } = await call('/saves');
    ok('GET /saves with neither token nor session is denied', status === 401, `got ${status}`);
  }
  const newEmail = `walker-${Date.now()}@example.com`;
  let newToken = null;
  let newId = null;
  {
    const { status, data } = await call('/auth/signup', {
      method: 'POST',
      body: {
        email: newEmail,
        password: 'walker-pass-2026',
        display_name: 'Walker',
        save_token: anonToken
      }
    });
    newToken = data.access_token;
    newId = data.id;
    ok('signup creates an account', status === 201 && !!data.id);
  }
  {
    const { data } = await call('/saves', { token: newToken });
    ok('signing up with a save_token claims steel', data.length === 1 && data[0].slug === 'steel');
    const orphan = await pool.query(
      'SELECT count(*)::int c FROM saved_solutions WHERE save_token = $1',
      [anonToken]
    );
    ok('the anonymous bucket is emptied', orphan.rows[0].c === 0, `got ${orphan.rows[0].c}`);
  }

  console.log('\n== save idempotence for an account ==');
  {
    const q =
      "SELECT count(*)::int c FROM saved_solutions s JOIN solutions so ON so.id=s.solution_id JOIN accounts a ON a.id=s.account_id WHERE a.email='visitor@example.com' AND so.slug='steel'";
    const before = await pool.query(q);
    await call('/saves', { method: 'POST', body: { solution_slug: 'steel' }, token: adaToken });
    await call('/saves', { method: 'POST', body: { solution_slug: 'steel' }, token: adaToken });
    const after = await pool.query(q);
    ok(
      'saving twice never makes a second row',
      before.rows[0].c === 1 && after.rows[0].c === 1,
      `${before.rows[0].c} -> ${after.rows[0].c}`
    );
  }
  {
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        call('/saves', { method: 'POST', body: { solution_slug: 'mining' }, token: adaToken })
      )
    );
    const rows = await pool.query(
      "SELECT count(*)::int c FROM saved_solutions s JOIN solutions so ON so.id=s.solution_id JOIN accounts a ON a.id=s.account_id WHERE a.email='visitor@example.com' AND so.slug='mining'"
    );
    ok('eight simultaneous saves leave exactly one row', rows.rows[0].c === 1, `got ${rows.rows[0].c}`);
    ok('no simultaneous save returned a server error', results.every((r) => r.status < 500));
    await pool.query(
      "DELETE FROM saved_solutions s USING solutions so, accounts a WHERE so.id=s.solution_id AND a.id=s.account_id AND a.email='visitor@example.com' AND so.slug='mining'"
    );
  }

  console.log('\n== compare limit ==');
  {
    const { status, data } = await call('/compare?slugs=steel,mining,chemicals,transport');
    ok('four slugs compare', status === 200 && data.length === 4);
  }
  {
    const { status } = await call('/compare?slugs=steel,mining,chemicals,transport,desalination');
    ok('a fifth slug is rejected as a client error', status === 400, `got ${status}`);
    const { data } = await call('/compare?slugs=steel,mining,chemicals,transport');
    ok('four are still compared afterwards', data.length === 4);
  }

  console.log('\n== saved searches ==');
  let adaSearchId = null;
  {
    const { data } = await call('/searches', { token: adaToken });
    adaSearchId = data.find((s) => s.name === 'Hydrogen sites')?.id;
    ok('Ada holds the seeded Hydrogen sites search', !!adaSearchId);
  }
  {
    const before = await pool.query('SELECT count(*)::int c FROM saved_searches');
    await call('/searches', {
      method: 'POST',
      token: adaToken,
      body: { name: 'Hydrogen sites', output_kind: 'electricity' }
    });
    const after = await pool.query('SELECT count(*)::int c FROM saved_searches');
    const row = await pool.query('SELECT output_kind FROM saved_searches WHERE id = $1', [
      adaSearchId
    ]);
    ok(
      'the same name replaces its filters, never adding a row',
      before.rows[0].c === after.rows[0].c,
      `${before.rows[0].c} -> ${after.rows[0].c}`
    );
    ok('the filters were actually replaced', row.rows[0].output_kind === 'electricity');
    await call('/searches', {
      method: 'POST',
      token: adaToken,
      body: { name: 'Hydrogen sites', output_kind: 'hydrogen' }
    });
  }
  {
    const { status } = await call('/searches', { method: 'POST', body: { name: 'anon' } });
    ok('an unauthenticated search save is denied', status === 401, `got ${status}`);
  }

  console.log('\n== OWNERSHIP: cross-account reads and writes ==');
  {
    const { data } = await call('/saves', { token: kenToken });
    ok(
      "Ken's saves are only his own",
      data.length === 1 && data[0].slug === 'mining',
      JSON.stringify(data.map((r) => r.slug))
    );
  }
  const adaSaveRow = (
    await pool.query(
      "SELECT s.id FROM saved_solutions s JOIN accounts a ON a.id=s.account_id WHERE a.email='visitor@example.com' ORDER BY s.id LIMIT 1"
    )
  ).rows[0];
  {
    const { status } = await call(`/saves/${adaSaveRow.id}`, { method: 'DELETE', token: kenToken });
    const still = await pool.query('SELECT count(*)::int c FROM saved_solutions WHERE id = $1', [
      adaSaveRow.id
    ]);
    ok("Ken deleting Ada's save is refused as not found", status === 404, `got ${status}`);
    ok("Ada's saved row is unchanged in the database", still.rows[0].c === 1);
  }
  {
    const { status } = await call(`/saves/${adaSaveRow.id}`, { method: 'DELETE' });
    const still = await pool.query('SELECT count(*)::int c FROM saved_solutions WHERE id = $1', [
      adaSaveRow.id
    ]);
    ok("an anonymous delete of Ada's save is denied", status === 401 || status === 404, `got ${status}`);
    ok("Ada's row survives the anonymous delete", still.rows[0].c === 1);
  }
  {
    const { status } = await call(`/searches/${adaSearchId}`, {
      method: 'DELETE',
      token: kenToken
    });
    const still = await pool.query('SELECT count(*)::int c FROM saved_searches WHERE id = $1', [
      adaSearchId
    ]);
    ok("Ken deleting Ada's search is refused as not found", status === 404, `got ${status}`);
    ok("Ada's saved search row is unchanged", still.rows[0].c === 1);
  }
  const adaEnq = (
    await pool.query("SELECT id, status FROM enquiries WHERE reference = 'ENQ-7K2M9QD4'")
  ).rows[0];
  {
    const { status } = await call(`/enquiries/${adaEnq.id}/close`, {
      method: 'POST',
      token: kenToken
    });
    const row = (await pool.query('SELECT status FROM enquiries WHERE id = $1', [adaEnq.id])).rows[0];
    ok("Ken closing Ada's enquiry is refused as not found", status === 404, `got ${status}`);
    ok("Ada's enquiry status is unchanged", row.status === adaEnq.status, `${adaEnq.status} -> ${row.status}`);
  }
  {
    const { status } = await call(`/enquiries/${adaEnq.id}/close`, { method: 'POST' });
    const row = (await pool.query('SELECT status FROM enquiries WHERE id = $1', [adaEnq.id])).rows[0];
    ok('an unauthenticated close is denied', status === 401, `got ${status}`);
    ok("Ada's enquiry survives the anonymous close", row.status === adaEnq.status);
  }
  {
    const { data } = await call('/enquiries', { token: kenToken });
    ok(
      "Ken's enquiry list carries only his own",
      data.every((r) => r.reference !== 'ENQ-7K2M9QD4') && data.some((r) => r.reference === 'ENQ-5R8X1CJ2'),
      JSON.stringify(data.map((r) => r.reference))
    );
  }
  {
    const { data } = await call('/access-request', { token: kenToken });
    ok(
      "Ken's access request is his own IAR-9T3V6BLM, pending",
      data.reference === 'IAR-9T3V6BLM' && data.status === 'pending'
    );
  }
  {
    const { data } = await call('/access-request', { token: adaToken });
    ok(
      "Ada's access request is IAR-4H7N2PQ8, approved",
      data.reference === 'IAR-4H7N2PQ8' && data.status === 'approved'
    );
  }
  {
    const { data } = await call('/applications', { token: kenToken });
    ok('Ken holds no applications', Array.isArray(data) && data.length === 0);
  }

  console.log('\n== enquiries and mail ==');
  const enquiryEmail = `enq-${Date.now()}@example.com`;
  let enqRef = null;
  let enqId = null;
  {
    const { status, data } = await call('/enquiries', {
      method: 'POST',
      body: {
        name: 'Walker Test',
        email: enquiryEmail,
        phone_country: '+31',
        phone: '105550000',
        topic: 'Investor relations',
        message: 'A contract walk enquiry.'
      }
    });
    enqRef = data.reference;
    enqId = data.id;
    ok('an anonymous enquiry is created', status === 201);
    ok(
      'the reference matches ENQ- plus 8 uppercase letters and digits',
      /^ENQ-[A-Z0-9]{8}$/.test(enqRef || ''),
      enqRef
    );
    ok('it is stored received', data.status === 'received');
    const row = (
      await pool.query('SELECT status, account_id FROM enquiries WHERE id = $1', [enqId])
    ).rows[0];
    ok('the row is in the database as received with no account', row.status === 'received' && row.account_id === null);
  }
  {
    const { status } = await call('/enquiries', {
      method: 'POST',
      body: { name: 'x', email: 'x@example.com', topic: 'Nonsense', message: 'y' }
    });
    ok('a topic outside the five is a client error', status === 400, `got ${status}`);
  }
  {
    const { status } = await call('/enquiries', {
      method: 'POST',
      body: { name: 'x', email: 'not-an-email', topic: 'Careers', message: 'y' }
    });
    ok('a bad email is a client error', status === 400, `got ${status}`);
  }
  {
    const refs = new Set();
    for (let i = 0; i < 5; i++) {
      const { data } = await call('/enquiries', {
        method: 'POST',
        body: {
          name: 'Batch',
          email: `batch-${i}-${Date.now()}@example.com`,
          topic: 'Technology',
          message: 'batch'
        }
      });
      refs.add(data.reference);
    }
    ok('five enquiries mint five distinct references', refs.size === 5);
  }
  {
    const { data: created } = await call('/enquiries', {
      method: 'POST',
      token: kenToken,
      body: {
        name: 'Ken Adeyemi',
        email: 'visitor2@example.com',
        topic: 'Careers',
        message: 'close me'
      }
    });
    const r1 = await call(`/enquiries/${created.id}/close`, { method: 'POST', token: kenToken });
    const r2 = await call(`/enquiries/${created.id}/close`, { method: 'POST', token: kenToken });
    const row = (await pool.query('SELECT status FROM enquiries WHERE id = $1', [created.id])).rows[0];
    const count = (await pool.query('SELECT count(*)::int c FROM enquiries WHERE id = $1', [created.id])).rows[0];
    ok('the owner closes their own enquiry', r1.status === 200 && r1.data.status === 'closed');
    ok(
      'closing a closed one records one close, not two',
      r2.status === 200 && row.status === 'closed' && count.c === 1
    );
  }

  console.log('\n== access request, at most one per account ==');
  {
    const before = await pool.query('SELECT count(*)::int c FROM access_requests WHERE account_id = $1', [newId]);
    const { status, data } = await call('/access-request', {
      method: 'POST',
      token: newToken,
      body: { organisation: 'Walker Capital', role_title: 'Analyst' }
    });
    ok('a new access request is created pending', status === 201 && data.status === 'pending');
    ok(
      'the reference matches IAR- plus 8 uppercase letters and digits',
      /^IAR-[A-Z0-9]{8}$/.test(data.reference || ''),
      data.reference
    );
    const after = await pool.query('SELECT count(*)::int c FROM access_requests WHERE account_id = $1', [newId]);
    ok('exactly one row afterwards', before.rows[0].c === 0 && after.rows[0].c === 1);
  }
  {
    const { status } = await call('/access-request', {
      method: 'POST',
      token: newToken,
      body: { organisation: 'Walker Capital Two', role_title: 'Partner' }
    });
    const rows = await pool.query(
      'SELECT count(*)::int c, max(organisation) o FROM access_requests WHERE account_id = $1',
      [newId]
    );
    ok('requesting again updates rather than adding', status === 201 && rows.rows[0].c === 1, `count ${rows.rows[0].c}`);
    ok('the update took effect', rows.rows[0].o === 'Walker Capital Two');
  }
  {
    const email2 = `race-${Date.now()}@example.com`;
    const { data: acct } = await call('/auth/signup', {
      method: 'POST',
      body: { email: email2, password: 'race-pass-2026', display_name: 'Race' }
    });
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, i) =>
        call('/access-request', {
          method: 'POST',
          token: acct.access_token,
          body: { organisation: `Race ${i}`, role_title: 'Principal' }
        })
      )
    );
    const rows = await pool.query('SELECT count(*)::int c FROM access_requests WHERE account_id = $1', [acct.id]);
    ok('six simultaneous requests leave exactly one row', rows.rows[0].c === 1, `got ${rows.rows[0].c}`);
    ok(
      'no simultaneous request left a server error',
      results.every((r) => r.status < 500),
      JSON.stringify(results.map((r) => r.status))
    );
  }

  console.log('\n== the document room ==');
  {
    const { status, data } = await call('/documents', { token: adaToken });
    ok('Ada, approved, reads three documents', status === 200 && data.length === 3, `${status} ${data?.length}`);
    ok(
      'the documents carry slug, title, category and published_at',
      data.every((d) => d.slug && d.title && d.category && d.published_at)
    );
  }
  {
    const { status, data } = await call('/documents', { token: kenToken });
    ok('Ken, pending, meets the answer a room that never existed gives', status === 404, `got ${status}`);
    const payload = JSON.stringify(data ?? {});
    ok(
      'no document appears in that payload',
      !payload.includes('investor-deck-2026') && !payload.includes('Technology Dossier'),
      payload.slice(0, 120)
    );
  }
  {
    const { status, data } = await call('/documents', { token: newToken });
    ok('a pending brand new account meets the same not-found', status === 404, `got ${status}`);
    ok('and gets no document', !JSON.stringify(data ?? {}).includes('licensing-roadmap'));
  }
  {
    const { status } = await call('/documents');
    ok('an anonymous caller is denied the room', status === 401, `got ${status}`);
  }

  console.log('\n== calculator ==');
  const calcRows = [
    [250, 'thermal', 1, 2000, 900000],
    [251, 'thermal', 2, 4000, 1800000],
    [100, 'electrical', 1, 800, 360000],
    [260, 'electrical', 3, 2400, 1080000]
  ];
  for (const [need, kind, m, g, t] of calcRows) {
    const { data } = await call('/calculator', { method: 'POST', body: { need_mw: need, kind } });
    ok(
      `${need} MW ${kind} gives ${m}, ${g}, ${t}`,
      data.modules_required === m &&
        data.annual_clean_energy_gwh === g &&
        data.annual_co2_avoided_tonnes === t,
      JSON.stringify(data)
    );
  }
  for (const bad of [0, -5]) {
    const { status } = await call('/calculator', { method: 'POST', body: { need_mw: bad, kind: 'thermal' } });
    ok(`a need of ${bad} is invalid`, status === 400, `got ${status}`);
  }
  {
    const { status } = await call('/calculator', { method: 'POST', body: { need_mw: 100, kind: 'magic' } });
    ok('an unknown kind is invalid', status === 400, `got ${status}`);
  }

  console.log('\n== jobs and applications ==');
  {
    const { data } = await call('/jobs');
    ok('three jobs seeded', data.length === 3);
  }
  {
    const before = await pool.query('SELECT count(*)::int c FROM applications WHERE account_id = $1', [newId]);
    const r1 = await call('/applications', {
      method: 'POST',
      token: newToken,
      body: { job_slug: 'licensing-lead', name: 'Walker', email: newEmail, note: 'First note.' }
    });
    const r2 = await call('/applications', {
      method: 'POST',
      token: newToken,
      body: {
        job_slug: 'licensing-lead',
        name: 'Walker',
        email: newEmail,
        note: 'Second note replaces the first.'
      }
    });
    const after = await pool.query(
      'SELECT count(*)::int c, max(note) n FROM applications WHERE account_id = $1',
      [newId]
    );
    ok('an application is created', r1.status === 201 && r1.data.status === 'received');
    ok('applying again updates, never adding a second', before.rows[0].c === 0 && after.rows[0].c === 1, `count ${after.rows[0].c}`);
    ok('the note was replaced', after.rows[0].n === 'Second note replaces the first.');
    ok('the second call is not a server error', r2.status < 500);
  }
  {
    const { status } = await call('/applications', {
      method: 'POST',
      body: { job_slug: 'licensing-lead', name: 'x', email: 'x@example.com', note: 'y' }
    });
    ok('an unauthenticated application is denied', status === 401, `got ${status}`);
  }
  {
    const { status } = await call('/applications', {
      method: 'POST',
      token: newToken,
      body: { job_slug: 'no-such-job', name: 'x', email: 'x@example.com', note: 'y' }
    });
    ok('an unknown job slug is not found', status === 404, `got ${status}`);
  }

  console.log('\n== stories, team, offices, faqs ==');
  {
    const { data, headers } = await call('/stories');
    ok('seven stories seeded', data.length === 7, `got ${data.length}`);
    ok('X-Total-Count on stories', headers.get('x-total-count') === '7');
    ok('newest first', data[0].slug === 'first-module-order');
  }
  {
    const { data } = await call('/stories?featured=true');
    ok('exactly one featured story', data.length === 1 && data[0].slug === 'first-module-order');
  }
  {
    const { data } = await call('/stories?limit=3&offset=0');
    ok('limit and offset page the wall', data.length === 3);
  }
  {
    const { data } = await call('/stories/steel-partnership');
    ok('one story carries a body', typeof data.body === 'string' && data.body.length > 80);
  }
  {
    const { data } = await call('/team');
    ok(
      'four team members in order',
      data.length === 4 && data[0].slug === 'mira-halvorsen' && data[3].slug === 'daniel-okoye'
    );
    ok('each carries a bio and a profile_url', data.every((m) => m.bio && m.profile_url));
  }
  {
    const { data } = await call('/offices');
    ok(
      'three offices',
      data.length === 3 && data.some((o) => o.city === 'Rotterdam' && o.role_label === 'Headquarters')
    );
  }
  {
    const { data } = await call('/faqs');
    ok('six faqs seeded', data.length === 6, `got ${data.length}`);
    const tech = data.filter((f) => f.category === 'Technology').length;
    const dep = data.filter((f) => f.category === 'Deployment').length;
    ok('three under Technology and three under Deployment', tech === 3 && dep === 3, `${tech}/${dep}`);
  }
  {
    const { data } = await call('/faqs?q=helium');
    ok('faq search narrows', data.length >= 1 && data.length < 6, `got ${data.length}`);
  }

  console.log('\n== mail actually left over SMTP ==');
  {
    await new Promise((r) => setTimeout(r, 1200));
    const box = await (await fetch(`${MAILPIT}/api/v1/messages?limit=300`)).json();
    const msgs = box.messages || [];
    const enqMsg = msgs.find((m) => m.Subject === `Enquiry received: ${enqRef}`);
    ok(
      'the enquiry acknowledgement reached Mailpit',
      !!enqMsg,
      `subjects: ${msgs.slice(0, 3).map((m) => m.Subject).join(' | ')}`
    );
    if (enqMsg) {
      ok(
        'addressed to the one person it concerns',
        enqMsg.To?.length === 1 && enqMsg.To[0].Address === enquiryEmail,
        JSON.stringify(enqMsg.To)
      );
      ok('no cc and no bcc', (enqMsg.Cc || []).length === 0 && (enqMsg.Bcc || []).length === 0);
      const full = await (await fetch(`${MAILPIT}/api/v1/message/${enqMsg.ID}`)).json();
      const text = full.Text || '';
      ok('the body carries the topic and the reference', text.includes('Investor relations') && text.includes(enqRef));
    }
    const iarMsg = msgs.find((m) => /^Investor access requested: IAR-[A-Z0-9]{8}$/.test(m.Subject));
    ok('an access request acknowledgement reached Mailpit', !!iarMsg);
    if (iarMsg) {
      const full = await (await fetch(`${MAILPIT}/api/v1/message/${iarMsg.ID}`)).json();
      const text = full.Text || '';
      const ref = iarMsg.Subject.split(' ').pop();
      ok('its body carries the organisation and the reference', /Organisation:/.test(text) && text.includes(ref));
    }
    const appMsg = msgs.find((m) => m.Subject === 'Application received: Licensing Lead');
    ok('the application acknowledgement carries the job title in the subject', !!appMsg);
    if (appMsg) {
      const full = await (await fetch(`${MAILPIT}/api/v1/message/${appMsg.ID}`)).json();
      const text = full.Text || '';
      ok('its body carries the job title and the location', text.includes('Licensing Lead') && text.includes('Chicago'));
    }
    const countBefore = msgs.length;
    await call('/saves', { method: 'POST', body: { solution_slug: 'chemicals' }, token: newToken });
    await call('/searches', { method: 'POST', token: newToken, body: { name: 'Quiet', output_kind: 'heat' } });
    await call('/calculator', { method: 'POST', body: { need_mw: 100, kind: 'thermal' } });
    await new Promise((r) => setTimeout(r, 900));
    const after = await (await fetch(`${MAILPIT}/api/v1/messages?limit=300`)).json();
    ok(
      'no other action sends mail',
      (after.messages || []).length === countBefore,
      `${countBefore} -> ${(after.messages || []).length}`
    );
  }

  console.log('\n== seed counts ==');
  {
    const counts = {};
    for (const t of ['solutions', 'documents', 'jobs', 'stories', 'team_members', 'offices', 'faqs']) {
      counts[t] = (await pool.query(`SELECT count(*)::int c FROM ${t}`)).rows[0].c;
    }
    ok('solutions stayed at 8', counts.solutions === 8, JSON.stringify(counts));
    ok(
      'documents 3, jobs 3, stories 7, team 4, offices 3, faqs 6',
      counts.documents === 3 &&
        counts.jobs === 3 &&
        counts.stories === 7 &&
        counts.team_members === 4 &&
        counts.offices === 3 &&
        counts.faqs === 6,
      JSON.stringify(counts)
    );
  }

  console.log('\n== page rendering, server-rendered HTML ==');
  const pages = [
    ['/', 'Powering the World'],
    ['/company', 'clean heat and electricity to power a world of industrial applications'],
    ['/technology', '750 degrees Celsius at the outlet'],
    ['/edge', 'Our Edge'],
    ['/team', 'shaping the future of nuclear together'],
    ['/solutions', 'What can this power?'],
    ['/solutions/steel', 'Steel'],
    ['/compare', 'Four saves, side by side'],
    ['/calculator', 'How many modules does your site need?'],
    ['/investors', 'The private document room'],
    ['/news', 'latest news'],
    ['/news/first-module-order', 'First module order signed'],
    ['/careers', 'help us build what'],
    ['/contact', 'Get in Touch'],
    ['/faq', 'Common questions'],
    ['/signin', 'Sign in'],
    ['/signup', 'Create an account']
  ];
  for (const [path, needle] of pages) {
    const res = await fetch(`${BASE}${path}`);
    const html = await res.text();
    ok(`${path} renders complete HTML carrying its copy`, res.status === 200 && html.includes(needle), `status ${res.status}`);
  }
  {
    const res = await fetch(`${BASE}/no-such-route`);
    const html = await res.text();
    ok(
      'a mistyped route lands on the not-found card',
      res.status === 404 && html.includes('We cannot find that page'),
      `status ${res.status}`
    );
  }
  {
    const res = await fetch(`${BASE}/api/no-such-endpoint`);
    ok('an unknown API endpoint is 404 JSON', res.status === 404);
  }

  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  if (fail) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error('walk crashed:', e);
  await pool.end();
  process.exit(2);
});
