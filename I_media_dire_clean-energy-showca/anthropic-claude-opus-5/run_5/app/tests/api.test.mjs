/**
 * Contract tests against a running app. Ownership assertions check the
 * database row after the refused call, because the rows are the fact.
 */
import pg from 'pg';

const BASE = process.env.TEST_BASE || 'http://127.0.0.1:4173';
const PW = 'deku-demo-pw-2026';
const MAILPIT = process.env.MAILPIT_HTTP || 'http://mailpit:8025';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, extra = '') {
	if (cond) {
		pass += 1;
		console.log(`  PASS  ${name}`);
	} else {
		fail += 1;
		failures.push(`${name} ${extra}`);
		console.log(`  FAIL  ${name} ${extra}`);
	}
}

async function call(path, { method = 'GET', body, token } = {}) {
	const headers = {};
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (token) headers['Authorization'] = `Bearer ${token}`;
	const res = await fetch(`${BASE}/api${path}`, {
		method,
		headers,
		...(body !== undefined ? { body: JSON.stringify(body) } : {})
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

async function section(name, fn) {
	console.log(`\n${name}`);
	await fn();
}

const run = async () => {
	const ada = await login('visitor@example.com');
	const ken = await login('visitor2@example.com');

	await section('Auth', async () => {
		ok('login returns access_token', typeof ada === 'string' && ada.length > 10);
		const bad = await call('/auth/login', {
			method: 'POST',
			body: { email: 'visitor@example.com', password: 'wrong' }
		});
		ok('wrong password is refused 401', bad.status === 401, `got ${bad.status}`);
		const me = await call('/accounts/me', { token: ada });
		ok('accounts/me is Ada', me.data?.email === 'visitor@example.com');
		const noTok = await call('/accounts/me');
		ok('no token is denied', noTok.status === 401, `got ${noTok.status}`);
		const hash = await pool.query('SELECT password_hash FROM accounts WHERE email=$1', [
			'visitor@example.com'
		]);
		ok(
			'password is stored hashed, not plain',
			!hash.rows[0].password_hash.includes(PW) && hash.rows[0].password_hash.startsWith('scrypt$')
		);
	});

	await section('Explorer filters and count', async () => {
		const all = await call('/solutions');
		ok('eight solutions seeded', all.data.length === 8, `got ${all.data.length}`);
		ok('X-Total-Count on all', all.headers.get('X-Total-Count') === '8');

		const f = await call('/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C');
		const slugs = f.data.map((s) => s.slug).sort();
		ok(
			'hydrogen + 550 to 750 C leaves exactly transport and steel',
			JSON.stringify(slugs) === JSON.stringify(['steel', 'transport']),
			JSON.stringify(slugs)
		);
		ok('count header is 2', f.headers.get('X-Total-Count') === '2');

		const one = await call('/solutions/steel');
		ok(
			'single solution carries detail',
			typeof one.data.detail === 'string' && one.data.detail.length > 50
		);
		const miss = await call('/solutions/nope');
		ok('unknown slug is 404', miss.status === 404);
	});

	await section('Anonymous save, claim on signup', async () => {
		const s1 = await call('/saves', { method: 'POST', body: { solution_slug: 'steel' } });
		const token = s1.data.save_token;
		ok('anonymous save mints a save_token', typeof token === 'string' && token.length > 8);

		const dup = await call('/saves', {
			method: 'POST',
			body: { solution_slug: 'steel', save_token: token }
		});
		ok('same token + same slug is a no-op', dup.data.id === s1.data.id);
		const cnt = await pool.query('SELECT count(*)::int c FROM saved_solutions WHERE save_token=$1', [
			token
		]);
		ok('only one anonymous row exists', cnt.rows[0].c === 1, `rows=${cnt.rows[0].c}`);

		const email = `claim${Date.now()}@example.com`;
		const su = await call('/auth/signup', {
			method: 'POST',
			body: { email, password: 'a-good-password', display_name: 'Claimer', save_token: token }
		});
		ok('signup created', su.status === 201);
		const newTok = su.data.access_token;
		const saves = await call('/saves', { token: newTok });
		ok('claimed save is waiting on the account', saves.data.some((r) => r.slug === 'steel'));
		const left = await pool.query('SELECT count(*)::int c FROM saved_solutions WHERE save_token=$1', [
			token
		]);
		ok('the anonymous basket is emptied', left.rows[0].c === 0, `rows=${left.rows[0].c}`);

		const a1 = await call('/saves', {
			method: 'POST',
			body: { solution_slug: 'mining' },
			token: newTok
		});
		const a2 = await call('/saves', {
			method: 'POST',
			body: { solution_slug: 'mining' },
			token: newTok
		});
		ok('account save twice returns one row', a1.data.id === a2.data.id);
		const acctRows = await pool.query(
			'SELECT count(*)::int c FROM saved_solutions WHERE account_id=$1 AND solution_id=(SELECT id FROM solutions WHERE slug=$2)',
			[su.data.id, 'mining']
		);
		ok('never a second row for the same pair', acctRows.rows[0].c === 1);

		const results = await Promise.all(
			Array.from({ length: 6 }, () =>
				call('/saves', { method: 'POST', body: { solution_slug: 'chemicals' }, token: newTok })
			)
		);
		const conc = await pool.query(
			'SELECT count(*)::int c FROM saved_solutions WHERE account_id=$1 AND solution_id=(SELECT id FROM solutions WHERE slug=$2)',
			[su.data.id, 'chemicals']
		);
		ok(
			'simultaneous identical saves still leave one row',
			conc.rows[0].c === 1,
			`rows=${conc.rows[0].c} statuses=${results.map((r) => r.status).join(',')}`
		);
	});

	await section('Compare holds at most four', async () => {
		const four = await call('/compare?slugs=steel,mining,chemicals,transport');
		ok('four compare fine', four.status === 200 && four.data.length === 4);
		const five = await call('/compare?slugs=steel,mining,chemicals,transport,communities');
		ok('a fifth is rejected as invalid', five.status === 400, `got ${five.status}`);
		ok('the refusal names the reason', /four/i.test(five.data?.message || ''), five.data?.message);
		const still = await call('/compare?slugs=steel,mining,chemicals,transport');
		ok('four are still compared', still.data.length === 4);
	});

	await section('Saved searches are unique by name', async () => {
		const a = await call('/searches', {
			method: 'POST',
			token: ada,
			body: { name: 'Ownership probe', output_kind: 'hydrogen' }
		});
		const b = await call('/searches', {
			method: 'POST',
			token: ada,
			body: { name: 'Ownership probe', output_kind: 'electricity' }
		});
		ok('same name replaces rather than adds', a.data.id === b.data.id);
		const rows = await pool.query(
			"SELECT count(*)::int c, max(output_kind) k FROM saved_searches WHERE account_id=(SELECT id FROM accounts WHERE email='visitor@example.com') AND name='Ownership probe'"
		);
		ok('one row, filters replaced', rows.rows[0].c === 1 && rows.rows[0].k === 'electricity');
	});

	await section('Enquiry reference and mail', async () => {
		const e = await call('/enquiries', {
			method: 'POST',
			body: {
				name: 'Test Sender',
				email: 'enquiry-probe@example.com',
				phone_country: '+31',
				phone: '600000000',
				topic: 'Solutions',
				message: 'We run a mill and want to talk about the hydrogen route for direct reduction.'
			}
		});
		ok('enquiry created 201', e.status === 201, `got ${e.status}`);
		ok(
			'reference is ENQ- plus 8 uppercase letters and digits',
			/^ENQ-[A-Z0-9]{8}$/.test(e.data.reference || ''),
			e.data.reference
		);
		ok('stored received', e.data.status === 'received');
		const row = await pool.query('SELECT status FROM enquiries WHERE reference=$1', [
			e.data.reference
		]);
		ok('the row is in the database', row.rows[0]?.status === 'received');

		const badTopic = await call('/enquiries', {
			method: 'POST',
			body: { name: 'x', email: 'x@y.com', topic: 'Nope', message: 'hello there' }
		});
		ok('invalid topic is a client error', badTopic.status === 400, `got ${badTopic.status}`);

		let found = null;
		for (let i = 0; i < 20 && !found; i += 1) {
			await new Promise((r) => setTimeout(r, 400));
			try {
				const m = await fetch(`${MAILPIT}/api/v1/messages?limit=60`);
				const j = await m.json();
				found = (j.messages || []).find(
					(x) => x.Subject === `Enquiry received: ${e.data.reference}`
				);
			} catch {
				/* retry */
			}
		}
		ok('a real email arrived over SMTP with the reference in the subject', !!found);
		if (found) {
			ok(
				'addressed to that one address alone, no cc and no bcc',
				found.To?.length === 1 &&
					found.To[0].Address === 'enquiry-probe@example.com' &&
					(found.Cc || []).length === 0 &&
					(found.Bcc || []).length === 0,
				JSON.stringify({ to: found.To, cc: found.Cc, bcc: found.Bcc })
			);
			const full = await (await fetch(`${MAILPIT}/api/v1/message/${found.ID}`)).json();
			const body = full.Text || '';
			ok(
				'body carries the topic and the reference',
				body.includes('Solutions') && body.includes(e.data.reference)
			);
		}
	});

	await section('Closing an enquiry', async () => {
		const mine = await call('/enquiries', { token: ken });
		const target = mine.data.find((r) => r.status !== 'closed');
		const c1 = await call(`/enquiries/${target.id}/close`, { method: 'POST', token: ken });
		ok('owner closes their own enquiry', c1.status === 200 && c1.data.status === 'closed');
		const c2 = await call(`/enquiries/${target.id}/close`, { method: 'POST', token: ken });
		ok('closing a closed one still records one close', c2.data.status === 'closed');
		const rows = await pool.query('SELECT status FROM enquiries WHERE id=$1', [target.id]);
		ok('exactly one row, still closed', rows.rowCount === 1 && rows.rows[0].status === 'closed');
		await pool.query("UPDATE enquiries SET status='received' WHERE id=$1", [target.id]);
	});

	await section('OWNERSHIP: one account never reaches another account row', async () => {
		const adaSaves = await call('/saves', { token: ada });
		const adaSave = adaSaves.data[0];
		const beforeSave = await pool.query('SELECT * FROM saved_solutions WHERE id=$1', [adaSave.id]);
		const delAttempt = await call(`/saves/${adaSave.id}`, { method: 'DELETE', token: ken });
		ok(
			"Ken deleting Ada's save is denied, not served",
			delAttempt.status === 404,
			`got ${delAttempt.status}`
		);
		const afterSave = await pool.query('SELECT * FROM saved_solutions WHERE id=$1', [adaSave.id]);
		ok(
			'that saved_solutions row is unchanged afterwards',
			afterSave.rowCount === 1 &&
				JSON.stringify(afterSave.rows[0]) === JSON.stringify(beforeSave.rows[0])
		);

		const adaSearches = await call('/searches', { token: ada });
		const adaSearch = adaSearches.data[0];
		const beforeSearch = await pool.query('SELECT * FROM saved_searches WHERE id=$1', [
			adaSearch.id
		]);
		const delSearch = await call(`/searches/${adaSearch.id}`, { method: 'DELETE', token: ken });
		ok("Ken deleting Ada's search is denied", delSearch.status === 404, `got ${delSearch.status}`);
		const afterSearch = await pool.query('SELECT * FROM saved_searches WHERE id=$1', [adaSearch.id]);
		ok(
			'that saved_searches row is unchanged afterwards',
			afterSearch.rowCount === 1 &&
				JSON.stringify(afterSearch.rows[0]) === JSON.stringify(beforeSearch.rows[0])
		);

		const adaEnq = await call('/enquiries', { token: ada });
		const target = adaEnq.data[0];
		const beforeEnq = await pool.query('SELECT * FROM enquiries WHERE id=$1', [target.id]);
		const closeAttempt = await call(`/enquiries/${target.id}/close`, { method: 'POST', token: ken });
		ok(
			"Ken closing Ada's enquiry meets the same answer as one that never existed",
			closeAttempt.status === 404,
			`got ${closeAttempt.status}`
		);
		const afterEnq = await pool.query('SELECT * FROM enquiries WHERE id=$1', [target.id]);
		ok(
			'that enquiries row is unchanged afterwards',
			JSON.stringify(afterEnq.rows[0]) === JSON.stringify(beforeEnq.rows[0]),
			`${beforeEnq.rows[0].status} -> ${afterEnq.rows[0].status}`
		);

		const kenSaves = await call('/saves', { token: ken });
		const kenSlugs = kenSaves.data.map((r) => r.slug);
		ok(
			"Ken's saves list carries his rows and nothing else",
			kenSlugs.includes('mining') && !kenSlugs.includes('data-centres'),
			JSON.stringify(kenSlugs)
		);
		const kenEnq = await call('/enquiries', { token: ken });
		ok(
			"Ken's enquiries never include Ada's reference",
			!kenEnq.data.some((r) => r.reference === 'ENQ-7K2M9QD4')
		);
		const kenAr = await call('/access-request', { token: ken });
		ok('Ken sees only his own access request', kenAr.data.reference === 'IAR-9T3V6BLM');

		const ghost = await call('/saves/99999999', { method: 'DELETE', token: ken });
		ok(
			'another account id and a nonexistent id answer alike',
			ghost.status === delAttempt.status,
			`${ghost.status} vs ${delAttempt.status}`
		);
	});

	await section('Access requests, at most one per account', async () => {
		const email = `iar${Date.now()}@example.com`;
		const su = await call('/auth/signup', {
			method: 'POST',
			body: { email, password: 'a-good-password', display_name: 'IAR Probe' }
		});
		const tok = su.data.access_token;

		const none = await call('/access-request', { token: tok });
		ok('no request yet answers not-found', none.status === 404, `got ${none.status}`);

		const r1 = await call('/access-request', {
			method: 'POST',
			token: tok,
			body: { organisation: 'Probe Capital', role_title: 'Analyst' }
		});
		ok('a new one is pending', r1.data.status === 'pending');
		ok(
			'IAR- reference of the same shape',
			/^IAR-[A-Z0-9]{8}$/.test(r1.data.reference || ''),
			r1.data.reference
		);

		const r2 = await call('/access-request', {
			method: 'POST',
			token: tok,
			body: { organisation: 'Probe Capital II', role_title: 'Partner' }
		});
		ok('requesting again updates it', r2.data.reference === r1.data.reference);
		const rows = await pool.query(
			'SELECT count(*)::int c, max(organisation) o FROM access_requests WHERE account_id=$1',
			[su.data.id]
		);
		ok('never a second row', rows.rows[0].c === 1, `rows=${rows.rows[0].c}`);
		ok('the one row was updated', rows.rows[0].o === 'Probe Capital II');

		const email2 = `race${Date.now()}@example.com`;
		const su2 = await call('/auth/signup', {
			method: 'POST',
			body: { email: email2, password: 'a-good-password', display_name: 'Race Probe' }
		});
		const t2 = su2.data.access_token;
		const raced = await Promise.all(
			Array.from({ length: 5 }, (_, i) =>
				call('/access-request', {
					method: 'POST',
					token: t2,
					body: { organisation: `Race ${i}`, role_title: 'Analyst' }
				})
			)
		);
		const raceRows = await pool.query(
			'SELECT count(*)::int c FROM access_requests WHERE account_id=$1',
			[su2.data.id]
		);
		ok(
			'simultaneous requests leave exactly one row',
			raceRows.rows[0].c === 1,
			`rows=${raceRows.rows[0].c} statuses=${raced.map((r) => r.status).join(',')}`
		);

		let msg = null;
		for (let i = 0; i < 20 && !msg; i += 1) {
			await new Promise((r) => setTimeout(r, 400));
			const j = await (await fetch(`${MAILPIT}/api/v1/messages?limit=80`)).json();
			msg = (j.messages || []).find(
				(x) => x.Subject === `Investor access requested: ${r1.data.reference}`
			);
		}
		ok('an access request email was really sent', !!msg);
		if (msg) {
			const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json();
			ok(
				'body carries the organisation and the reference',
				(full.Text || '').includes('Probe Capital') && (full.Text || '').includes(r1.data.reference)
			);
			ok('addressed to that one address alone', msg.To?.length === 1 && msg.To[0].Address === email);
		}
	});

	await section('The document room', async () => {
		const adaDocs = await call('/documents', { token: ada });
		ok(
			'an approved account reads the three documents',
			adaDocs.status === 200 && adaDocs.data.length === 3,
			`${adaDocs.status}/${adaDocs.data?.length}`
		);
		const kenDocs = await call('/documents', { token: ken });
		ok(
			'a pending account meets the answer a room that never existed gives',
			kenDocs.status === 404,
			`got ${kenDocs.status}`
		);
		ok(
			'no document is in that payload',
			!JSON.stringify(kenDocs.data).includes('investor-deck'),
			JSON.stringify(kenDocs.data)
		);
		const anon = await call('/documents');
		ok('no token is denied', anon.status === 401, `got ${anon.status}`);
	});

	await section('Calculator, the four worked rows', async () => {
		const rows = [
			[250, 'thermal', 1, 2000, 900000],
			[251, 'thermal', 2, 4000, 1800000],
			[100, 'electrical', 1, 800, 360000],
			[260, 'electrical', 3, 2400, 1080000]
		];
		for (const [need, kind, m, g, t] of rows) {
			const r = await call('/calculator', { method: 'POST', body: { need_mw: need, kind } });
			ok(
				`${need} MW ${kind} gives ${m}, ${g}, ${t}`,
				r.data.modules_required === m &&
					r.data.annual_clean_energy_gwh === g &&
					r.data.annual_co2_avoided_tonnes === t,
				JSON.stringify(r.data)
			);
		}
		const zero = await call('/calculator', { method: 'POST', body: { need_mw: 0, kind: 'thermal' } });
		ok('a need of zero is invalid', zero.status === 400, `got ${zero.status}`);
		const neg = await call('/calculator', { method: 'POST', body: { need_mw: -5, kind: 'thermal' } });
		ok('a negative need is invalid', neg.status === 400, `got ${neg.status}`);
	});

	await section('Applications, at most one per account per job', async () => {
		const email = `app${Date.now()}@example.com`;
		const su = await call('/auth/signup', {
			method: 'POST',
			body: { email, password: 'a-good-password', display_name: 'App Probe' }
		});
		const tok = su.data.access_token;
		const a1 = await call('/applications', {
			method: 'POST',
			token: tok,
			body: {
				job_slug: 'reactor-systems-engineer',
				name: 'App Probe',
				email,
				note: 'I have taken a thermal hydraulic design through to a built article.'
			}
		});
		ok('application created', a1.status === 201 && a1.data.status === 'received', `${a1.status}`);
		const a2 = await call('/applications', {
			method: 'POST',
			token: tok,
			body: {
				job_slug: 'reactor-systems-engineer',
				name: 'App Probe',
				email,
				note: 'Updated note here.'
			}
		});
		ok('applying again updates it', a2.data.id === a1.data.id);
		const rows = await pool.query(
			'SELECT count(*)::int c, max(note) n FROM applications WHERE account_id=$1',
			[su.data.id]
		);
		ok('never a second row', rows.rows[0].c === 1);
		ok('the note was updated', rows.rows[0].n === 'Updated note here.');

		let msg = null;
		for (let i = 0; i < 20 && !msg; i += 1) {
			await new Promise((r) => setTimeout(r, 400));
			const j = await (await fetch(`${MAILPIT}/api/v1/messages?limit=80`)).json();
			msg = (j.messages || []).find(
				(x) =>
					x.Subject === 'Application received: Reactor Systems Engineer' &&
					x.To?.[0]?.Address === email
			);
		}
		ok('an application email was really sent with the job title in the subject', !!msg);
		if (msg) {
			const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json();
			ok(
				'body carries the job title and the location',
				(full.Text || '').includes('Reactor Systems Engineer') &&
					(full.Text || '').includes('Rotterdam')
			);
		}
		const anon = await call('/applications', {
			method: 'POST',
			body: { job_slug: 'licensing-lead', name: 'x', email: 'x@y.com', note: 'hello there friend' }
		});
		ok('applying without a token is denied', anon.status === 401, `got ${anon.status}`);
	});

	await section('Stories, jobs, team, offices, faqs', async () => {
		const s = await call('/stories');
		ok('seven stories', s.data.length === 7, `got ${s.data.length}`);
		const feat = await call('/stories?featured=true');
		ok('exactly one featured', feat.data.length === 1 && feat.data[0].slug === 'first-module-order');
		const wall = await call('/stories?featured=false&limit=3&offset=0');
		ok('the wall excludes the featured story', wall.data.length === 3);
		ok(
			'X-Total-Count is 6 for the wall',
			wall.headers.get('X-Total-Count') === '6',
			wall.headers.get('X-Total-Count')
		);
		const page2 = await call('/stories?featured=false&limit=3&offset=3');
		ok('exactly two pages of three', page2.data.length === 3);
		ok('newest first', new Date(s.data[0].published_at) >= new Date(s.data[1].published_at));
		const one = await call('/stories/helium-loop-milestone');
		ok('a story carries a body', typeof one.data.body === 'string' && one.data.body.length > 50);

		const jobs = await call('/jobs');
		ok('three jobs', jobs.data.length === 3);
		const team = await call('/team');
		ok('four team members in order', team.data.length === 4 && team.data[0].slug === 'mira-halvorsen');
		const off = await call('/offices');
		ok('three offices', off.data.length === 3 && off.data[0].city === 'Rotterdam');
		const faqs = await call('/faqs');
		ok('six faqs', faqs.data.length === 6, `got ${faqs.data.length}`);
		const tech = await call('/faqs?category=Technology');
		ok('three under Technology', tech.data.length === 3);
		const dep = await call('/faqs?category=Deployment');
		ok('three under Deployment', dep.data.length === 3);
		const search = await call('/faqs?q=helium');
		ok('faq search narrows', search.data.length >= 1 && search.data.length < 6);
	});

	await section('Auth is required where the brief says', async () => {
		for (const path of [
			'/saves',
			'/searches',
			'/enquiries',
			'/access-request',
			'/applications',
			'/documents',
			'/accounts/me'
		]) {
			const r = await call(path);
			ok(`GET ${path} without a token is denied`, r.status === 401, `got ${r.status}`);
		}
		for (const path of [
			'/solutions',
			'/stories',
			'/jobs',
			'/team',
			'/offices',
			'/faqs',
			'/compare'
		]) {
			const r = await call(path);
			ok(`${path} is public`, r.status === 200, `got ${r.status}`);
		}
	});

	await section('Health and unknown endpoints', async () => {
		const h = await call('/health');
		ok('health is 200', h.status === 200);
		const nf = await call('/does-not-exist');
		ok('unknown api endpoint is 404 json', nf.status === 404);
	});

	console.log(`\n${'='.repeat(60)}\nPASS ${pass}   FAIL ${fail}`);
	if (failures.length) {
		console.log('\nFailures:');
		failures.forEach((f) => console.log(`  - ${f}`));
	}
	await pool.end();
	process.exit(fail ? 1 : 0);
};

run().catch(async (err) => {
	console.error('Harness error:', err);
	await pool.end();
	process.exit(1);
});
