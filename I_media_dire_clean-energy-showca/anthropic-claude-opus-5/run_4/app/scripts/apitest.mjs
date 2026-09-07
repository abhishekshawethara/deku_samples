/* Contract sweep. Asserts the graded rules against the running app and, where
   the rule is about stored state, against the database rows themselves. */
import pg from 'pg';

const BASE = process.env.TEST_BASE || 'http://localhost:4173';
const PW = 'deku-demo-pw-2026';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond, detail = '') {
	if (cond) {
		pass++;
		console.log(`  ok   ${name}`);
	} else {
		fail++;
		failures.push(`${name} ${detail}`);
		console.log(`  FAIL ${name} ${detail}`);
	}
}

async function call(path, { method = 'GET', body, token, headers = {} } = {}) {
	const opts = { method, headers: { ...headers } };
	if (token) opts.headers.Authorization = `Bearer ${token}`;
	if (body !== undefined) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(body);
	}
	const res = await fetch(`${BASE}${path}`, opts);
	const text = await res.text();
	let json = null;
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		/* not json */
	}
	return { status: res.status, json, headers: res.headers };
}

async function login(email) {
	const res = await call('/api/auth/login', { method: 'POST', body: { email, password: PW } });
	if (!res.json?.access_token) throw new Error(`login failed for ${email}: ${res.status}`);
	return res.json.access_token;
}

async function main() {
	console.log('\n== health and auth ==');
	check('health 200', (await call('/api/health')).status === 200);

	const ada = await login('visitor@example.com');
	const ken = await login('visitor2@example.com');
	check('seeded password works for both accounts', !!ada && !!ken);
	check('bad password refused', (await call('/api/auth/login', { method: 'POST', body: { email: 'visitor@example.com', password: 'wrong' } })).status === 401);

	const me = await call('/api/accounts/me', { token: ada });
	check('accounts/me returns the caller', me.json?.email === 'visitor@example.com' && me.json?.display_name === 'Ada Moreau');
	check('accounts/me without token is denied', (await call('/api/accounts/me')).status === 401);

	console.log('\n== the explorer ==');
	const all = await call('/api/solutions');
	check('eight solutions', all.json?.length === 8, `got ${all.json?.length}`);
	check('X-Total-Count on list', all.headers.get('x-total-count') === '8');
	const hy = await call('/api/solutions?output_kind=hydrogen&temperature_band=' + encodeURIComponent('550 to 750 C'));
	const slugs = (hy.json || []).map((s) => s.slug).sort();
	check('hydrogen + 550 to 750 C leaves exactly transport and steel', JSON.stringify(slugs) === JSON.stringify(['steel', 'transport']), JSON.stringify(slugs));
	check('filtered count header is 2', hy.headers.get('x-total-count') === '2');
	const combined = await call('/api/solutions?output_kind=hydrogen&temperature_band=' + encodeURIComponent('550 to 750 C') + '&deployment=multi-module&industry=Steel');
	check('four filters combine, each narrowing the last', combined.json?.length === 1 && combined.json[0].slug === 'steel');
	const detail = await call('/api/solutions/steel');
	check('one solution carries detail', !!detail.json?.detail && detail.json.slug === 'steel');
	check('unknown slug is not found', (await call('/api/solutions/nope')).status === 404);

	console.log('\n== anonymous save, then claim ==');
	const anon = await call('/api/saves', { method: 'POST', body: { solution_slug: 'steel' } });
	const saveToken = anon.json?.save_token;
	check('anonymous save mints an opaque save_token', typeof saveToken === 'string' && saveToken.length > 10);
	const anonList = await call(`/api/saves?save_token=${encodeURIComponent(saveToken)}`);
	check('anonymous list reads back the save', anonList.json?.length === 1 && anonList.json[0].slug === 'steel');
	check('anonymous save with no token is denied', (await call('/api/saves')).status === 401);

	await call('/api/saves', { method: 'POST', body: { solution_slug: 'steel', save_token: saveToken } });
	const anonRows = await pool.query('SELECT count(*)::int n FROM saved_solutions WHERE save_token = $1 AND solution_id = (SELECT id FROM solutions WHERE slug=$2)', [saveToken, 'steel']);
	check('repeated anonymous save adds no second row', anonRows.rows[0].n === 1, `rows=${anonRows.rows[0].n}`);

	const email = `claim-${Date.now()}@example.com`;
	const signup = await call('/api/auth/signup', { method: 'POST', body: { email, password: 'claim-pw-2026', display_name: 'Claim Tester', save_token: saveToken } });
	check('signup returns id, email and display_name', !!signup.json?.id && signup.json.email === email && signup.json.display_name === 'Claim Tester');
	const newToken = signup.json.access_token;
	const claimed = await call('/api/saves', { token: newToken });
	check('signing in with the save_token moves the saves onto the account', claimed.json?.length === 1 && claimed.json[0].slug === 'steel');
	const emptied = await pool.query('SELECT count(*)::int n FROM saved_solutions WHERE save_token = $1', [saveToken]);
	check('the anonymous bucket is emptied', emptied.rows[0].n === 0, `rows=${emptied.rows[0].n}`);

	console.log('\n== saving twice for the same owner ==');
	await call('/api/saves', { method: 'POST', body: { solution_slug: 'mining' }, token: newToken });
	await call('/api/saves', { method: 'POST', body: { solution_slug: 'mining' }, token: newToken });
	const acctId = signup.json.id;
	const dupRows = await pool.query('SELECT count(*)::int n FROM saved_solutions WHERE account_id=$1 AND solution_id=(SELECT id FROM solutions WHERE slug=$2)', [acctId, 'mining']);
	check('saving one solution twice never makes a second row', dupRows.rows[0].n === 1, `rows=${dupRows.rows[0].n}`);

	await Promise.all([...Array(8)].map(() => call('/api/saves', { method: 'POST', body: { solution_slug: 'chemicals' }, token: newToken })));
	const conc = await pool.query('SELECT count(*)::int n FROM saved_solutions WHERE account_id=$1 AND solution_id=(SELECT id FROM solutions WHERE slug=$2)', [acctId, 'chemicals']);
	check('simultaneous identical saves still leave one row', conc.rows[0].n === 1, `rows=${conc.rows[0].n}`);

	console.log('\n== compare ==');
	const cmp4 = await call('/api/compare?slugs=steel,mining,chemicals,transport');
	check('four slugs compare', cmp4.status === 200 && cmp4.json?.length === 4);
	const cmp5 = await call('/api/compare?slugs=steel,mining,chemicals,transport,communities');
	check('a fifth slug is rejected as a client error', cmp5.status === 400, `status=${cmp5.status}`);
	check('the refusal names the reason', typeof cmp5.json?.message === 'string' && cmp5.json.message.length > 0);
	const cmpAfter = await call('/api/compare?slugs=steel,mining,chemicals,transport');
	check('four are still compared after the refusal', cmpAfter.json?.length === 4);

	console.log('\n== saved searches ==');
	const s1 = await call('/api/searches', { method: 'POST', body: { name: 'Bench search', output_kind: 'hydrogen' }, token: newToken });
	check('saved search returns id and name', !!s1.json?.id && s1.json.name === 'Bench search');
	await call('/api/searches', { method: 'POST', body: { name: 'Bench search', output_kind: 'heat' }, token: newToken });
	const searchRows = await pool.query('SELECT count(*)::int n, min(output_kind) k FROM saved_searches WHERE account_id=$1 AND name=$2', [acctId, 'Bench search']);
	check('the same name replaces its filters, never adds a row', searchRows.rows[0].n === 1 && searchRows.rows[0].k === 'heat', JSON.stringify(searchRows.rows[0]));

	console.log('\n== enquiries ==');
	const enq = await call('/api/enquiries', { method: 'POST', body: { name: 'Bench Tester', email: 'bench@example.com', phone_country: '+31', phone: '600000000', topic: 'Technology', message: 'A bench enquiry about the helium circuit and outlet temperature.' } });
	check('enquiry returns id, reference and status', !!enq.json?.id && !!enq.json?.reference && enq.json.status === 'received');
	check('reference is ENQ- plus 8 uppercase letters and digits', /^ENQ-[A-Z0-9]{8}$/.test(enq.json?.reference || ''), enq.json?.reference);
	const stored = await pool.query('SELECT status FROM enquiries WHERE reference=$1', [enq.json.reference]);
	check('it is stored received', stored.rows[0]?.status === 'received');
	const badTopic = await call('/api/enquiries', { method: 'POST', body: { name: 'x', email: 'x@example.com', topic: 'Nonsense', message: 'hello there friend' } });
	check('an invalid topic is a client error, not a server error', badTopic.status === 400, `status=${badTopic.status}`);

	const adaEnq = await call('/api/enquiries', { token: ada });
	const target = adaEnq.json.find((e) => e.reference === 'ENQ-7K2M9QD4');
	await call(`/api/enquiries/${target.id}/close`, { method: 'POST', token: ada });
	await call(`/api/enquiries/${target.id}/close`, { method: 'POST', token: ada });
	const closed = await pool.query('SELECT status FROM enquiries WHERE id=$1', [target.id]);
	check('closing a closed enquiry records one close, not two', closed.rows[0].status === 'closed');
	await pool.query(`UPDATE enquiries SET status='answered' WHERE reference='ENQ-7K2M9QD4'`);

	console.log('\n== OWNERSHIP: one account never reaches another ==');
	const kenEnqRow = await pool.query(`SELECT id, status FROM enquiries WHERE reference='ENQ-5R8X1CJ2'`);
	const kenEnqId = kenEnqRow.rows[0].id;
	const steal1 = await call(`/api/enquiries/${kenEnqId}/close`, { method: 'POST', token: ada });
	check("closing another account's enquiry is denied", steal1.status === 404, `status=${steal1.status}`);
	const afterSteal = await pool.query('SELECT status FROM enquiries WHERE id=$1', [kenEnqId]);
	check('that enquiry row is unchanged in the database', afterSteal.rows[0].status === kenEnqRow.rows[0].status, afterSteal.rows[0].status);

	const kenSave = await pool.query(`SELECT s.id FROM saved_solutions s JOIN accounts a ON a.id=s.account_id WHERE a.email='visitor2@example.com' LIMIT 1`);
	const kenSaveId = kenSave.rows[0].id;
	const steal2 = await call(`/api/saves/${kenSaveId}`, { method: 'DELETE', token: ada });
	check("deleting another account's save is denied", steal2.status === 404, `status=${steal2.status}`);
	const saveStill = await pool.query('SELECT count(*)::int n FROM saved_solutions WHERE id=$1', [kenSaveId]);
	check('that saved row still exists in the database', saveStill.rows[0].n === 1);

	const adaSearch = await pool.query(`SELECT ss.id FROM saved_searches ss JOIN accounts a ON a.id=ss.account_id WHERE a.email='visitor@example.com' AND ss.name='Hydrogen sites'`);
	const adaSearchId = adaSearch.rows[0].id;
	const steal3 = await call(`/api/searches/${adaSearchId}`, { method: 'DELETE', token: ken });
	check("deleting another account's saved search is denied", steal3.status === 404, `status=${steal3.status}`);
	const searchStill = await pool.query('SELECT count(*)::int n FROM saved_searches WHERE id=$1', [adaSearchId]);
	check('that saved search row still exists', searchStill.rows[0].n === 1);

	const adaSaves = await call('/api/saves', { token: ada });
	const adaSaveSlugs = adaSaves.json.map((r) => r.slug).sort();
	check("Ada's saves are hers alone", JSON.stringify(adaSaveSlugs) === JSON.stringify(['data-centres', 'steel']), JSON.stringify(adaSaveSlugs));
	const kenSaves = await call('/api/saves', { token: ken });
	check("Ken's saves are his alone", kenSaves.json.length === 1 && kenSaves.json[0].slug === 'mining');
	const kenEnquiries = await call('/api/enquiries', { token: ken });
	check("Ken's enquiry list holds only his rows", kenEnquiries.json.every((e) => e.reference === 'ENQ-5R8X1CJ2'));

	console.log('\n== access requests and the document room ==');
	const adaReq = await call('/api/access-request', { token: ada });
	check("Ada's request is hers, approved", adaReq.json?.reference === 'IAR-4H7N2PQ8' && adaReq.json?.status === 'approved');
	const kenReq = await call('/api/access-request', { token: ken });
	check("Ken's request is his, pending", kenReq.json?.reference === 'IAR-9T3V6BLM' && kenReq.json?.status === 'pending');

	const adaDocs = await call('/api/documents', { token: ada });
	check('the room answers an approved caller with three documents', adaDocs.status === 200 && adaDocs.json?.length === 3);
	const kenDocs = await call('/api/documents', { token: ken });
	check('a pending caller meets the answer a room that never existed gives', kenDocs.status === 404, `status=${kenDocs.status}`);
	check('and there is no document in that payload', !Array.isArray(kenDocs.json) && !kenDocs.json?.slug && !kenDocs.json?.title);
	check('an anonymous caller is denied the room', (await call('/api/documents')).status === 401);

	const concEmail = `iar-${Date.now()}@example.com`;
	const concSignup = await call('/api/auth/signup', { method: 'POST', body: { email: concEmail, password: 'conc-pw-2026', display_name: 'Conc Tester' } });
	const concTok = concSignup.json.access_token;
	const results = await Promise.all([...Array(6)].map((_, i) => call('/api/access-request', { method: 'POST', body: { organisation: `Org ${i}`, role_title: 'Analyst' }, token: concTok })));
	const concRows = await pool.query('SELECT count(*)::int n FROM access_requests WHERE account_id=$1', [concSignup.json.id]);
	check('two simultaneous requests from one account leave exactly one row', concRows.rows[0].n === 1, `rows=${concRows.rows[0].n}`);
	check('none of the concurrent requests was a server error', results.every((r) => r.status < 500), results.map((r) => r.status).join(','));
	const firstReq = await call('/api/access-request', { token: concTok });
	check('a new request is pending with an IAR- reference of the same shape', firstReq.json?.status === 'pending' && /^IAR-[A-Z0-9]{8}$/.test(firstReq.json?.reference), firstReq.json?.reference);
	await call('/api/access-request', { method: 'POST', body: { organisation: 'Updated Org', role_title: 'Partner' }, token: concTok });
	const updated = await pool.query('SELECT count(*)::int n, min(organisation) o FROM access_requests WHERE account_id=$1', [concSignup.json.id]);
	check('requesting again updates it, never adds a second', updated.rows[0].n === 1 && updated.rows[0].o === 'Updated Org', JSON.stringify(updated.rows[0]));

	console.log('\n== calculator ==');
	const cases = [
		[250, 'thermal', 1, 2000, 900000],
		[251, 'thermal', 2, 4000, 1800000],
		[100, 'electrical', 1, 800, 360000],
		[260, 'electrical', 3, 2400, 1080000]
	];
	for (const [need, kind, m, g, c] of cases) {
		const r = await call('/api/calculator', { method: 'POST', body: { need_mw: need, kind } });
		check(`${need} MW ${kind} gives ${m}, ${g}, ${c}`, r.json?.modules_required === m && r.json?.annual_clean_energy_gwh === g && r.json?.annual_co2_avoided_tonnes === c, JSON.stringify(r.json));
	}
	check('a need of zero is invalid', (await call('/api/calculator', { method: 'POST', body: { need_mw: 0, kind: 'thermal' } })).status === 400);
	check('a negative need is invalid', (await call('/api/calculator', { method: 'POST', body: { need_mw: -5, kind: 'thermal' } })).status === 400);

	console.log('\n== jobs and applications ==');
	const jobs = await call('/api/jobs');
	check('three jobs', jobs.json?.length === 3);
	const app1 = await call('/api/applications', { method: 'POST', body: { job_slug: 'licensing-lead', name: 'Bench Tester', email: 'bench@example.com', note: 'A bench application note that is comfortably long enough.' }, token: newToken });
	check('application returns id, job_slug and status', !!app1.json?.id && app1.json.job_slug === 'licensing-lead' && app1.json.status === 'received');
	await call('/api/applications', { method: 'POST', body: { job_slug: 'licensing-lead', name: 'Bench Tester 2', email: 'bench@example.com', note: 'An updated bench application note, still long enough.' }, token: newToken });
	const appRows = await pool.query('SELECT count(*)::int n, min(name) nm FROM applications WHERE account_id=$1 AND job_id=(SELECT id FROM jobs WHERE slug=$2)', [acctId, 'licensing-lead']);
	check('applying again updates it, never adds a second', appRows.rows[0].n === 1 && appRows.rows[0].nm === 'Bench Tester 2', JSON.stringify(appRows.rows[0]));
	check('applications require a token', (await call('/api/applications', { method: 'POST', body: { job_slug: 'licensing-lead', name: 'x', email: 'x@example.com', note: 'hello there this is a note' } })).status === 401);

	console.log('\n== stories, team, offices, faqs ==');
	const stories = await call('/api/stories');
	check('seven stories with X-Total-Count', stories.json?.length === 7 && stories.headers.get('x-total-count') === '7');
	check('stories are newest first', stories.json[0].slug === 'first-module-order');
	const feat = await call('/api/stories?featured=true');
	check('exactly one featured story', feat.json?.length === 1 && feat.json[0].slug === 'first-module-order');
	const paged = await call('/api/stories?limit=3&offset=0');
	check('limit and offset page the wall', paged.json?.length === 3);
	check('one story carries body', !!(await call('/api/stories/steel-partnership')).json?.body);
	check('four team members in order', (await call('/api/team')).json?.[0]?.slug === 'mira-halvorsen');
	check('three offices', (await call('/api/offices')).json?.length === 3);
	check('six faqs', (await call('/api/faqs')).json?.length === 6);
	check('faqs filter by category', (await call('/api/faqs?category=Technology')).json?.length === 3);
	check('faqs search by q', (await call('/api/faqs?q=helium')).json?.length >= 1);

	console.log('\n== auth required where the brief says so ==');
	for (const path of ['/api/saves', '/api/searches', '/api/enquiries', '/api/access-request', '/api/applications', '/api/documents', '/api/accounts/me']) {
		const r = await call(path);
		check(`${path} without a token is denied`, r.status === 401, `status=${r.status}`);
	}
	check('a forged token is denied', (await call('/api/saves', { token: 'not.a.real.token' })).status === 401);

	console.log(`\n==== ${pass} passed, ${fail} failed ====`);
	if (failures.length) {
		console.log('\nFailures:');
		for (const f of failures) console.log(` - ${f}`);
	}
	await pool.end();
	process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
	console.error('sweep crashed:', e);
	await pool.end();
	process.exit(1);
});
