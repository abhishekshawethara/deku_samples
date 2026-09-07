// Exercises every rule in the brief against the running app, the real database
// and the real mail server. Run with: node scripts/api-check.mjs
const BASE = process.env.CHECK_BASE || 'http://127.0.0.1:4173';
const MAILPIT = process.env.MAILPIT_URL || 'http://mailpit:8025';
const PW = 'deku-demo-pw-2026';

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail = '') {
	if (cond) {
		pass++;
		console.log(`  ok   ${name}`);
	} else {
		fail++;
		failures.push(`${name} ${detail}`);
		console.log(`  FAIL ${name} ${detail}`);
	}
}

function eq(name, actual, expected) {
	ok(
		name,
		JSON.stringify(actual) === JSON.stringify(expected),
		`got ${JSON.stringify(actual)} want ${JSON.stringify(expected)}`
	);
}

async function call(path, { method = 'GET', body, token, headers = {} } = {}) {
	const init = { method, headers: { ...headers } };
	if (body !== undefined) {
		init.headers['content-type'] = 'application/json';
		init.body = JSON.stringify(body);
	}
	if (token) init.headers.authorization = `Bearer ${token}`;
	const res = await fetch(`${BASE}${path}`, init);
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
	const r = await call('/api/auth/login', { method: 'POST', body: { email, password: PW } });
	if (r.status !== 200)
		throw new Error(`login ${email} failed: ${r.status} ${JSON.stringify(r.data)}`);
	return r.data.access_token;
}

async function mailsFor(address) {
	try {
		const res = await fetch(
			`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}&limit=50`
		);
		if (!res.ok) return [];
		return (await res.json()).messages || [];
	} catch {
		return [];
	}
}

/** Every message to `address` whose subject is exactly `subject`, with bodies. */
async function mailBodies(address, subject) {
	const hits = (await mailsFor(address)).filter((m) => (m.Subject || '') === subject);
	const out = [];
	for (const hit of hits) {
		const full = await fetch(`${MAILPIT}/api/v1/message/${hit.ID}`);
		out.push(full.ok ? await full.json() : hit);
	}
	return out;
}

/** The one message to `address` whose subject is exactly `subject`. */
async function mailFor(address, subject) {
	const all = await mailBodies(address, subject);
	if (!all.length) return null;
	return { ...all[0], matchCount: all.length };
}

function section(t) {
	console.log(`\n== ${t}`);
}

const run = async () => {
	section('health and readiness');
	eq('GET /api/health is 200', (await call('/api/health')).status, 200);

	section('auth');
	const ada = await login('visitor@example.com');
	const ken = await login('visitor2@example.com');
	ok('seeded accounts log in with the literal password', !!ada && !!ken);
	eq('accounts/me returns Ada', (await call('/api/accounts/me', { token: ada })).data.display_name, 'Ada Moreau');
	eq('accounts/me without a token is denied', (await call('/api/accounts/me')).status, 401);
	eq(
		'login with a wrong password is denied',
		(await call('/api/auth/login', { method: 'POST', body: { email: 'visitor@example.com', password: 'nope' } })).status,
		401
	);

	section('the explorer');
	const all = await call('/api/solutions');
	eq('eight solutions seeded', all.data.length, 8);
	eq('X-Total-Count carries the count', all.headers.get('x-total-count'), '8');
	const h = await call('/api/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C');
	eq('hydrogen + 550 to 750 C leaves exactly two', h.data.length, 2);
	eq('and they are transport and steel', h.data.map((s) => s.slug).sort(), ['steel', 'transport']);
	eq('the count header narrows too', h.headers.get('x-total-count'), '2');
	eq('each filter narrows the last', (await call('/api/solutions?output_kind=hydrogen')).data.length, 2);
	eq('deployment filter works', (await call('/api/solutions?deployment=single-module')).data.length, 4);
	eq(
		'an impossible combination is empty',
		(await call('/api/solutions?output_kind=hydrogen&temperature_band=up%20to%20250%20C')).data.length,
		0
	);
	const one = await call('/api/solutions/steel');
	ok('one solution carries detail', typeof one.data.detail === 'string' && one.data.detail.length > 50);
	eq('an unknown slug is not found', (await call('/api/solutions/nope')).status, 404);

	section('anonymous saving and the claim');
	const anon1 = await call('/api/saves', { method: 'POST', body: { solution_slug: 'steel' } });
	eq('an unauthenticated save is created', anon1.status, 201);
	const saveToken = anon1.data.save_token;
	ok('and returns an opaque save_token', typeof saveToken === 'string' && saveToken.length > 20);
	const anon2 = await call('/api/saves', { method: 'POST', body: { solution_slug: 'steel', save_token: saveToken } });
	eq('saving the same one twice is a no-op', anon2.data.id, anon1.data.id);
	eq('the token holds exactly one row', (await call(`/api/saves?save_token=${saveToken}`)).data.length, 1);
	eq('an anonymous GET with no token is denied', (await call('/api/saves')).status, 401);

	const email = `walker.${Date.now()}@example.com`;
	const signup = await call('/api/auth/signup', {
		method: 'POST',
		body: { email, password: 'walker-pw-2026', display_name: 'Walker', save_token: saveToken }
	});
	eq('signup creates a visitor', signup.status, 201);
	const walker = signup.data.access_token;
	eq('the anonymous save moved onto the account', (await call('/api/saves', { token: walker })).data.map((s) => s.slug), ['steel']);
	eq('and the save token is emptied', (await call(`/api/saves?save_token=${saveToken}`)).data.length, 0);

	section('saving on an account');
	const dup1 = await call('/api/saves', { method: 'POST', body: { solution_slug: 'mining' }, token: walker });
	const dup2 = await call('/api/saves', { method: 'POST', body: { solution_slug: 'mining' }, token: walker });
	eq('saving one solution twice for an account never adds a second row', dup1.data.id, dup2.data.id);
	eq('the account now holds two saves', (await call('/api/saves', { token: walker })).data.length, 2);

	const burst = await Promise.all(
		Array.from({ length: 8 }, () =>
			call('/api/saves', { method: 'POST', body: { solution_slug: 'chemicals' }, token: walker })
		)
	);
	ok('eight simultaneous saves all answer without a server error', burst.every((r) => r.status < 500), burst.map((r) => r.status).join(','));
	eq(
		'and leave exactly one row for chemicals',
		(await call('/api/saves', { token: walker })).data.filter((s) => s.slug === 'chemicals').length,
		1
	);

	section('the comparison');
	eq('four slugs compare', (await call('/api/compare?slugs=steel,mining,chemicals,transport')).data.length, 4);
	const five = await call('/api/compare?slugs=steel,mining,chemicals,transport,communities');
	eq('a fifth is rejected as invalid', five.status, 400);
	ok('and the refusal names the reason', /four/i.test(five.data.message || ''), five.data.message);
	eq('four are still compared afterwards', (await call('/api/compare?slugs=steel,mining,chemicals,transport')).data.length, 4);

	section('saved searches');
	const s1 = await call('/api/searches', { method: 'POST', token: walker, body: { name: 'Hot sites', output_kind: 'hydrogen' } });
	eq('a search saves', s1.status, 201);
	const s2 = await call('/api/searches', { method: 'POST', token: walker, body: { name: 'Hot sites', output_kind: 'heat' } });
	eq('the same name replaces its filters', s2.data.id, s1.data.id);
	eq('and never adds a row', (await call('/api/searches', { token: walker })).data.length, 1);
	eq('the replaced filters are stored', (await call('/api/searches', { token: walker })).data[0].output_kind, 'heat');
	eq('searches need a token', (await call('/api/searches')).status, 401);

	section('enquiries and mail');
	const enqEmail = `enq.${Date.now()}@example.com`;
	const enq = await call('/api/enquiries', {
		method: 'POST',
		body: {
			name: 'Enquirer',
			email: enqEmail,
			phone_country: '+31',
			phone: '610000009',
			topic: 'Technology',
			message: 'How hot does the outlet run in practice?'
		}
	});
	eq('an enquiry is created', enq.status, 201);
	ok('the reference is ENQ- plus 8 uppercase letters and digits', /^ENQ-[A-Z0-9]{8}$/.test(enq.data.reference), enq.data.reference);
	eq('and it is stored received', enq.data.status, 'received');
	const enq2 = await call('/api/enquiries', { method: 'POST', body: { name: 'B', email: enqEmail, topic: 'Careers', message: 'Second enquiry here.' } });
	ok('references are unique app-wide', enq.data.reference !== enq2.data.reference);
	eq(
		'an invalid topic is a client error',
		(await call('/api/enquiries', { method: 'POST', body: { name: 'X', email: enqEmail, topic: 'Nope', message: 'hello there' } })).status,
		400
	);
	eq(
		'a missing message is a client error',
		(await call('/api/enquiries', { method: 'POST', body: { name: 'X', email: enqEmail, topic: 'Careers' } })).status,
		400
	);

	await new Promise((r) => setTimeout(r, 1200));
	const mail = await mailFor(enqEmail, `Enquiry received: ${enq.data.reference}`);
	ok('an acknowledgement carrying the reference reached that inbox', !!mail);
	if (mail) {
		eq('the enquiry sent exactly one message', mail.matchCount, 1);
		const body = mail.Text || '';
		ok('the body carries the reference', body.includes(enq.data.reference), body.slice(0, 200));
		ok('the body carries the topic', body.includes('Technology'), body.slice(0, 200));
		eq('addressed to the one person it concerns', (mail.To || []).map((t) => t.Address), [enqEmail]);
		eq('with no cc', (mail.Cc || []).length, 0);
		eq('and no bcc', (mail.Bcc || []).length, 0);
	}

	section('closing an enquiry');
	const mine = await call('/api/enquiries', { method: 'POST', token: walker, body: { name: 'Walker', email, topic: 'Solutions', message: 'A question about steel.' } });
	eq('the owner closes their own enquiry', (await call(`/api/enquiries/${mine.data.id}/close`, { method: 'POST', token: walker })).data.status, 'closed');
	eq('closing a closed one records one close, not two', (await call(`/api/enquiries/${mine.data.id}/close`, { method: 'POST', token: walker })).data.status, 'closed');
	eq(
		'and there is still exactly one row',
		(await call('/api/enquiries', { token: walker })).data.filter((e) => e.id === mine.data.id).length,
		1
	);

	section('access requests');
	const adaReq = await call('/api/access-request', { token: ada });
	eq('Ada holds IAR-4H7N2PQ8', adaReq.data.reference, 'IAR-4H7N2PQ8');
	eq('approved', adaReq.data.status, 'approved');
	const kenReq = await call('/api/access-request', { token: ken });
	eq('Ken holds IAR-9T3V6BLM', kenReq.data.reference, 'IAR-9T3V6BLM');
	eq('pending', kenReq.data.status, 'pending');
	eq('an account with none gets the not-found answer', (await call('/api/access-request', { token: walker })).status, 404);

	const req1 = await call('/api/access-request', { method: 'POST', token: walker, body: { organisation: 'Walker Capital', role_title: 'Analyst' } });
	eq('a new request is created', req1.status, 201);
	ok('with an IAR- reference of the same shape', /^IAR-[A-Z0-9]{8}$/.test(req1.data.reference), req1.data.reference);
	eq('and it is pending', req1.data.status, 'pending');
	const req2 = await call('/api/access-request', { method: 'POST', token: walker, body: { organisation: 'Walker Industrial', role_title: 'Partner' } });
	eq('requesting again updates rather than adding', req2.data.id, req1.data.id);
	eq('the organisation was updated', (await call('/api/access-request', { token: walker })).data.organisation, 'Walker Industrial');

	const email2 = `race.${Date.now()}@example.com`;
	const racer = (await call('/api/auth/signup', { method: 'POST', body: { email: email2, password: 'racer-pw-2026', display_name: 'Racer' } })).data.access_token;
	const race = await Promise.all([
		call('/api/access-request', { method: 'POST', token: racer, body: { organisation: 'A', role_title: 'X' } }),
		call('/api/access-request', { method: 'POST', token: racer, body: { organisation: 'B', role_title: 'Y' } }),
		call('/api/access-request', { method: 'POST', token: racer, body: { organisation: 'C', role_title: 'Z' } })
	]);
	ok('simultaneous requests never 500', race.every((r) => r.status < 500), race.map((r) => r.status).join(','));
	eq('exactly one row exists afterwards', new Set(race.filter((r) => r.data?.id).map((r) => r.data.id)).size, 1);

	await new Promise((r) => setTimeout(r, 900));
	// The reference is kept when a request is updated, so both acknowledgements
	// carry the same pinned subject. Read them all and check each in turn.
	const iarSubject = `Investor access requested: ${req1.data.reference}`;
	const iarMails = await mailBodies(email, iarSubject);
	ok('the access request sent a message with the pinned subject', iarMails.length >= 1, `found ${iarMails.length}`);
	ok(
		'one acknowledgement carries the organisation given at the time',
		iarMails.some((m) => (m.Text || '').includes('Walker Capital')),
		iarMails.map((m) => (m.Text || '').slice(0, 80)).join(' | ')
	);
	ok('every one carries the reference', iarMails.length > 0 && iarMails.every((m) => (m.Text || '').includes(req1.data.reference)));
	ok('and each goes to that one address alone', iarMails.every((m) => (m.To || []).length === 1 && m.To[0].Address === email && (m.Cc || []).length === 0 && (m.Bcc || []).length === 0));

	section('the document room');
	const docsAda = await call('/api/documents', { token: ada });
	eq('an approved account reads the three documents', docsAda.data.length, 3);
	eq('newest first', docsAda.data.map((d) => d.slug), ['investor-deck-2026', 'technology-dossier', 'licensing-roadmap']);
	const docsKen = await call('/api/documents', { token: ken });
	eq('a pending account meets the not-found answer', docsKen.status, 404);
	ok('with no document in the payload', !Array.isArray(docsKen.data), JSON.stringify(docsKen.data));
	eq('an account with no request meets it too', (await call('/api/documents', { token: racer })).status, 404);
	eq('and so does a caller with no token', (await call('/api/documents')).status, 401);

	section('OWNERSHIP: one account never reaches another account row');
	const adaSaves = (await call('/api/saves', { token: ada })).data;
	const adaSearches = (await call('/api/searches', { token: ada })).data;
	const adaEnquiries = (await call('/api/enquiries', { token: ada })).data;
	ok('Ada has a save, a search and an enquiry to protect', adaSaves.length > 0 && adaSearches.length > 0 && adaEnquiries.length > 0);

	const targetSave = adaSaves[0];
	const targetSearch = adaSearches[0];
	const targetEnq = adaEnquiries.find((e) => e.reference === 'ENQ-7K2M9QD4');

	eq("Ken deleting Ada's save is denied", (await call(`/api/saves/${targetSave.id}`, { method: 'DELETE', token: ken })).status, 404);
	ok('and the row is unchanged in the database', (await call('/api/saves', { token: ada })).data.some((s) => s.id === targetSave.id));

	eq("Ken deleting Ada's search is denied", (await call(`/api/searches/${targetSearch.id}`, { method: 'DELETE', token: ken })).status, 404);
	ok('and that row is unchanged too', (await call('/api/searches', { token: ada })).data.some((s) => s.id === targetSearch.id));

	eq("Ken closing Ada's enquiry is denied", (await call(`/api/enquiries/${targetEnq.id}/close`, { method: 'POST', token: ken })).status, 404);
	eq('and the stored status is untouched', (await call('/api/enquiries', { token: ada })).data.find((e) => e.id === targetEnq.id).status, 'answered');

	eq('an id that never existed answers the same', (await call('/api/saves/99999999', { method: 'DELETE', token: ken })).status, 404);
	eq('for searches too', (await call('/api/searches/99999999', { method: 'DELETE', token: ken })).status, 404);
	eq('and for closing', (await call('/api/enquiries/99999999/close', { method: 'POST', token: ken })).status, 404);

	eq("Ken's saved list is his own", (await call('/api/saves', { token: ken })).data.map((s) => s.slug), ['mining']);
	ok("Ken's enquiries are his own", (await call('/api/enquiries', { token: ken })).data.every((e) => e.reference !== 'ENQ-7K2M9QD4'));
	ok("and Ada's are hers", adaEnquiries.every((e) => e.reference !== 'ENQ-5R8X1CJ2'));
	eq("Ken's access request is his own", (await call('/api/access-request', { token: ken })).data.reference, 'IAR-9T3V6BLM');

	for (const p of ['/api/saves', '/api/searches', '/api/enquiries', '/api/access-request', '/api/applications']) {
		eq(`${p} without a token is denied`, (await call(p)).status, 401);
	}
	eq(
		'a made-up save_token cannot delete an account row',
		(await call(`/api/saves/${targetSave.id}?save_token=made-up-token`, { method: 'DELETE' })).status,
		404
	);
	ok('and it is still there', (await call('/api/saves', { token: ada })).data.some((s) => s.id === targetSave.id));

	section('the calculator');
	for (const [need, kind, m, g, c] of [
		[250, 'thermal', 1, 2000, 900000],
		[251, 'thermal', 2, 4000, 1800000],
		[100, 'electrical', 1, 800, 360000],
		[260, 'electrical', 3, 2400, 1080000]
	]) {
		eq(`${need} MW ${kind}`, (await call('/api/calculator', { method: 'POST', body: { need_mw: need, kind } })).data, {
			modules_required: m,
			annual_clean_energy_gwh: g,
			annual_co2_avoided_tonnes: c
		});
	}
	eq('a need of zero is invalid', (await call('/api/calculator', { method: 'POST', body: { need_mw: 0, kind: 'thermal' } })).status, 400);
	eq('a negative need is invalid', (await call('/api/calculator', { method: 'POST', body: { need_mw: -5, kind: 'thermal' } })).status, 400);
	eq('an unknown kind is invalid', (await call('/api/calculator', { method: 'POST', body: { need_mw: 100, kind: 'magic' } })).status, 400);

	section('stories');
	const stories = await call('/api/stories');
	eq('seven stories', stories.data.length, 7);
	eq('X-Total-Count on stories', stories.headers.get('x-total-count'), '7');
	eq('newest first', stories.data[0].slug, 'first-module-order');
	const featured = await call('/api/stories?featured=true');
	eq('exactly one is featured', featured.data.length, 1);
	eq('and it is the first module order', featured.data[0].slug, 'first-module-order');
	const wall1 = await call('/api/stories?featured=false&limit=3&offset=0');
	eq('the wall shows three at a time', wall1.data.length, 3);
	eq('with six on the wall in total', wall1.headers.get('x-total-count'), '6');
	eq('and a second page of three', (await call('/api/stories?featured=false&limit=3&offset=3')).data.length, 3);
	eq('leaving no third page', (await call('/api/stories?featured=false&limit=3&offset=6')).data.length, 0);
	ok('one story carries a body', (await call('/api/stories/steel-partnership')).data.body.length > 100);
	eq('an unknown story is not found', (await call('/api/stories/nope')).status, 404);

	section('jobs and applications');
	eq('three jobs', (await call('/api/jobs')).data.length, 3);
	const app1 = await call('/api/applications', {
		method: 'POST',
		token: walker,
		body: { job_slug: 'licensing-lead', name: 'Walker', email, note: 'I have carried a licensing case before.' }
	});
	eq('an application is created', app1.status, 201);
	eq('and is received', app1.data.status, 'received');
	const app2 = await call('/api/applications', {
		method: 'POST',
		token: walker,
		body: { job_slug: 'licensing-lead', name: 'Walker', email, note: 'An updated note goes here.' }
	});
	eq('applying again updates rather than adding', app2.data.id, app1.data.id);
	const apps = (await call('/api/applications', { token: walker })).data.filter((a) => a.job_slug === 'licensing-lead');
	eq('one application per job per account', apps.length, 1);
	eq('the note was updated', apps[0].note, 'An updated note goes here.');
	eq(
		'applying needs a token',
		(await call('/api/applications', { method: 'POST', body: { job_slug: 'licensing-lead', name: 'X', email: 'x@example.com', note: 'hello there' } })).status,
		401
	);
	eq(
		'an unknown job is a client error',
		(await call('/api/applications', { method: 'POST', token: walker, body: { job_slug: 'nope', name: 'X', email, note: 'hello there' } })).status,
		400
	);
	eq("Ken sees none of Walker's applications", (await call('/api/applications', { token: ken })).data.length, 0);

	await new Promise((r) => setTimeout(r, 900));
	const appMail = await mailFor(email, 'Application received: Licensing Lead');
	ok('the application sent a message with the pinned subject', !!appMail);
	if (appMail) {
		ok('carrying the job title', (appMail.Text || '').includes('Licensing Lead'));
		ok('and the location', (appMail.Text || '').includes('Chicago'));
		eq('to that one address alone', (appMail.To || []).map((t) => t.Address), [email]);
	}

	section('reference content');
	eq(
		'four team members in order',
		(await call('/api/team')).data.map((t) => t.slug),
		['mira-halvorsen', 'tobias-ruiz', 'anneke-vos', 'daniel-okoye']
	);
	eq('three offices', (await call('/api/offices')).data.length, 3);
	eq('six faqs', (await call('/api/faqs')).data.length, 6);
	eq('three under Technology', (await call('/api/faqs?category=Technology')).data.length, 3);
	eq('three under Deployment', (await call('/api/faqs?category=Deployment')).data.length, 3);
	ok('faqs are searchable', (await call('/api/faqs?q=helium')).data.length >= 1);

	section('no other action sends mail');
	const quietAddr = `quiet.${Date.now()}@example.com`;
	const quiet = (await call('/api/auth/signup', { method: 'POST', body: { email: quietAddr, password: 'quiet-pw-2026', display_name: 'Quiet' } })).data.access_token;
	await call('/api/saves', { method: 'POST', token: quiet, body: { solution_slug: 'steel' } });
	await call('/api/searches', { method: 'POST', token: quiet, body: { name: 'Quiet search', output_kind: 'heat' } });
	await call('/api/calculator', { method: 'POST', body: { need_mw: 250, kind: 'thermal' } });
	await new Promise((r) => setTimeout(r, 800));
	let quietCount = 0;
	try {
		const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${quietAddr}`)}&limit=20`);
		if (res.ok) quietCount = ((await res.json()).messages || []).length;
	} catch {
		/* mailpit http not reachable */
	}
	eq('signup, saving, searching and calculating send no mail', quietCount, 0);

	section('error shapes');
	eq('an unknown api endpoint is 404', (await call('/api/nope')).status, 404);
	const badBody = await call('/api/enquiries', { method: 'POST', body: { name: '', email: 'not-an-email', topic: 'Careers', message: 'hi' } });
	eq('a business-rule violation is a client error', badBody.status, 400);
	ok('and names the reason', typeof badBody.data.message === 'string' && badBody.data.message.length > 0, JSON.stringify(badBody.data));
	eq('a bad token is denied', (await call('/api/accounts/me', { token: 'not-a-real-token' })).status, 401);

	console.log(`\n${pass} passed, ${fail} failed`);
	if (fail) {
		console.log('\nFailures:');
		for (const f of failures) console.log(`  - ${f}`);
		process.exit(1);
	}
};

run().catch((err) => {
	console.error('check crashed:', err);
	process.exit(1);
});
