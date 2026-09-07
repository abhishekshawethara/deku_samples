// Contract tests against the running API. Not shipped in the image.
const BASE = process.env.TEST_BASE || 'http://127.0.0.1:4173';
const PW = 'deku-demo-pw-2026';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond, extra) {
	if (cond) {
		pass++;
		console.log(`  ok  ${name}`);
	} else {
		fail++;
		failures.push(name + (extra ? ` :: ${JSON.stringify(extra)}` : ''));
		console.log(`FAIL  ${name}`, extra !== undefined ? JSON.stringify(extra) : '');
	}
}

async function req(path, { method = 'GET', body, token, headers = {} } = {}) {
	const h = { ...headers };
	if (body !== undefined) h['Content-Type'] = 'application/json';
	if (token) h.Authorization = `Bearer ${token}`;
	const res = await fetch(BASE + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
	const text = await res.text();
	let json = null;
	try { json = text ? JSON.parse(text) : null; } catch { json = text; }
	return { status: res.status, body: json, headers: res.headers };
}

async function mailpit(path) {
	const host = process.env.MAILPIT_HTTP || 'http://mailpit:8025';
	const res = await fetch(host + path);
	return res.json();
}

async function main() {
	// health
	check('health returns 200', (await req('/api/health')).status === 200);

	// login both seeded accounts
	const l1 = await req('/api/auth/login', { method: 'POST', body: { email: 'visitor@example.com', password: PW } });
	check('ada logs in', l1.status === 200 && typeof l1.body.access_token === 'string', l1.body);
	const ada = l1.body.access_token;
	const l2 = await req('/api/auth/login', { method: 'POST', body: { email: 'visitor2@example.com', password: PW } });
	check('ken logs in', l2.status === 200, l2.body);
	const ken = l2.body.access_token;
	check('bad password denied', (await req('/api/auth/login', { method: 'POST', body: { email: 'visitor@example.com', password: 'nope' } })).status === 401);

	// ---- explorer ----
	const all = await req('/api/solutions');
	check('eight solutions', Array.isArray(all.body) && all.body.length === 8, all.body?.length);
	check('X-Total-Count on solutions', all.headers.get('x-total-count') === '8');
	const hy = await req('/api/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C');
	const slugs = hy.body.map((s) => s.slug).sort();
	check('hydrogen + 550 to 750 C leaves transport and steel', JSON.stringify(slugs) === JSON.stringify(['steel', 'transport']), slugs);
	check('filtered X-Total-Count is 2', hy.headers.get('x-total-count') === '2');
	const one = await req('/api/solutions/steel');
	check('one solution carries detail', one.status === 200 && typeof one.body.detail === 'string');
	check('unknown slug 404s', (await req('/api/solutions/nope')).status === 404);
	const q = await req('/api/solutions?q=hydrogen');
	check('text search works', q.body.length >= 2, q.body.length);

	// ---- compare ----
	const c4 = await req('/api/compare?slugs=steel,transport,mining,chemicals');
	check('compare four ok', c4.status === 200 && c4.body.length === 4);
	const c5 = await req('/api/compare?slugs=steel,transport,mining,chemicals,communities');
	check('compare fifth rejected as client error', c5.status === 400, c5.status);

	// ---- anonymous save then claim on signup ----
	const s1 = await req('/api/saves', { method: 'POST', body: { solution_slug: 'steel' } });
	check('anonymous save mints a save_token', s1.status === 201 && typeof s1.body.save_token === 'string', s1.body);
	const stok = s1.body.save_token;
	const s1b = await req('/api/saves', { method: 'POST', body: { solution_slug: 'steel', save_token: stok } });
	check('repeat anonymous save is a no-op', s1b.body.id === s1.body.id, [s1.body.id, s1b.body.id]);
	const anonList = await req(`/api/saves?save_token=${stok}`);
	check('anonymous list has exactly one row', anonList.body.length === 1, anonList.body);
	check('anonymous saves list without token is denied', (await req('/api/saves')).status === 401);

	const email = `walker${Date.now()}@example.com`;
	const su = await req('/api/auth/signup', { method: 'POST', body: { email, password: 'walker-pw-2026', display_name: 'Walker', save_token: stok } });
	check('signup creates account', su.status === 201 && su.body.email === email, su.body);
	const walker = su.body.access_token;
	const wsaves = await req('/api/saves', { token: walker });
	check('claimed save is waiting on the new account', wsaves.body.length === 1 && wsaves.body[0].slug === 'steel', wsaves.body);
	const emptied = await req(`/api/saves?save_token=${stok}`);
	check('the save_token bucket is emptied', emptied.body.length === 0, emptied.body);

	// duplicate save for an account is a no-op, including simultaneously
	const dup = await Promise.all([
		req('/api/saves', { method: 'POST', token: walker, body: { solution_slug: 'mining' } }),
		req('/api/saves', { method: 'POST', token: walker, body: { solution_slug: 'mining' } }),
		req('/api/saves', { method: 'POST', token: walker, body: { solution_slug: 'mining' } })
	]);
	const wsaves2 = await req('/api/saves', { token: walker });
	const miningRows = wsaves2.body.filter((r) => r.slug === 'mining');
	check('three simultaneous saves leave exactly one row', miningRows.length === 1, wsaves2.body);
	check('no simultaneous save returned a server error', dup.every((d) => d.status < 500), dup.map((d) => d.status));

	// ---- ownership on saves ----
	const adaSaves = await req('/api/saves', { token: ada });
	check('ada has her seeded saves', adaSaves.body.length >= 2, adaSaves.body.length);
	const adaSaveId = adaSaves.body[0].id;
	const cross = await req(`/api/saves/${adaSaveId}`, { method: 'DELETE', token: ken });
	check("ken deleting ada's save is refused as not found", cross.status === 404, cross);
	const adaSavesAfter = await req('/api/saves', { token: ada });
	check("ada's save row is unchanged afterwards", adaSavesAfter.body.some((r) => r.id === adaSaveId), adaSavesAfter.body);
	check('save delete with no token denied', (await req(`/api/saves/${adaSaveId}`, { method: 'DELETE' })).status === 401);

	// ---- saved searches ----
	const se1 = await req('/api/searches', { method: 'POST', token: walker, body: { name: 'Hot sites', output_kind: 'hydrogen' } });
	check('search saved', se1.status === 201 && se1.body.name === 'Hot sites', se1.body);
	const se2 = await req('/api/searches', { method: 'POST', token: walker, body: { name: 'Hot sites', output_kind: 'heat' } });
	check('same name replaces filters, same id', se2.body.id === se1.body.id, [se1.body.id, se2.body.id]);
	const seList = await req('/api/searches', { token: walker });
	check('one row for that name', seList.body.filter((r) => r.name === 'Hot sites').length === 1, seList.body);
	check('search filters were replaced', seList.body.find((r) => r.id === se1.body.id).output_kind === 'heat');
	const adaSearches = await req('/api/searches', { token: ada });
	const adaSearchId = adaSearches.body[0].id;
	const seCross = await req(`/api/searches/${adaSearchId}`, { method: 'DELETE', token: ken });
	check("ken deleting ada's search is refused", seCross.status === 404, seCross);
	check("ada's search unchanged", (await req('/api/searches', { token: ada })).body.some((r) => r.id === adaSearchId));
	check('searches require a token', (await req('/api/searches')).status === 401);

	// ---- enquiries ----
	const enqEmail = `enq${Date.now()}@example.com`;
	const enq = await req('/api/enquiries', { method: 'POST', body: { name: 'Anon Visitor', email: enqEmail, phone_country: '+31', phone: '600000000', topic: 'Solutions', message: 'How many modules for a 400 MW thermal site?' } });
	check('enquiry created', enq.status === 201, enq.body);
	check('reference shape ENQ- plus 8 uppercase letters and digits', /^ENQ-[A-Z0-9]{8}$/.test(enq.body.reference), enq.body.reference);
	check('enquiry stored received', enq.body.status === 'received');
	check('bad topic rejected as client error', (await req('/api/enquiries', { method: 'POST', body: { name: 'x', email: 'a@b.co', topic: 'Nonsense', message: 'hello there' } })).status === 400);

	const adaEnq = await req('/api/enquiries', { token: ada });
	check('ada sees only her own enquiries', adaEnq.body.every((e) => e.reference.startsWith('ENQ-')) && adaEnq.body.some((e) => e.reference === 'ENQ-7K2M9QD4'), adaEnq.body);
	check('ada does not see ken enquiry', !adaEnq.body.some((e) => e.reference === 'ENQ-5R8X1CJ2'));
	// a fresh enquiry owned by ken, so the test is repeatable
	const kenFresh = await req('/api/enquiries', { method: 'POST', token: ken, body: { name: 'Ken Adeyemi', email: 'visitor2@example.com', phone_country: '+1', phone: '3125550188', topic: 'Careers', message: 'A second question about the Academy intake.' } });
	check('ken enquiry created and owned', kenFresh.status === 201 && kenFresh.body.status === 'received', kenFresh.body);
	const kenEnqId = kenFresh.body.id;
	const closeCross = await req(`/api/enquiries/${kenEnqId}/close`, { method: 'POST', token: ada });
	check("ada closing ken's enquiry is refused as not found", closeCross.status === 404, closeCross);
	const kenEnqAfter = await req('/api/enquiries', { token: ken });
	check("ken's enquiry row is unchanged", kenEnqAfter.body.find((e) => e.id === kenEnqId).status === 'received', kenEnqAfter.body);
	const own1 = await req(`/api/enquiries/${kenEnqId}/close`, { method: 'POST', token: ken });
	check('owner closes their own enquiry', own1.status === 200 && own1.body.status === 'closed', own1.body);
	const own2 = await req(`/api/enquiries/${kenEnqId}/close`, { method: 'POST', token: ken });
	check('closing a closed one records one close, not two', own2.status === 200 && own2.body.status === 'closed', own2.body);
	const kenEnqCount = (await req('/api/enquiries', { token: ken })).body.filter((e) => e.id === kenEnqId).length;
	check('still exactly one enquiry row', kenEnqCount === 1);

	// ---- access requests ----
	const ar = await req('/api/access-request', { token: walker });
	check('no access request yet gives the not-found response', ar.status === 404, ar.status);
	const arMade = await req('/api/access-request', { method: 'POST', token: walker, body: { organisation: 'Walker Energy', role_title: 'Analyst' } });
	check('access request created pending', arMade.status === 201 && arMade.body.status === 'pending', arMade.body);
	check('IAR reference shape', /^IAR-[A-Z0-9]{8}$/.test(arMade.body.reference), arMade.body.reference);
	const arAgain = await req('/api/access-request', { method: 'POST', token: walker, body: { organisation: 'Walker Energy Two', role_title: 'Partner' } });
	check('requesting again updates, same reference', arAgain.body.reference === arMade.body.reference, [arMade.body.reference, arAgain.body.reference]);
	check('the update took', (await req('/api/access-request', { token: walker })).body.organisation === 'Walker Energy Two');

	// simultaneous requests from one fresh account must not both create a row
	const raceEmail = `race${Date.now()}@example.com`;
	const raceAcc = (await req('/api/auth/signup', { method: 'POST', body: { email: raceEmail, password: 'race-pw-2026', display_name: 'Racer' } })).body.access_token;
	const race = await Promise.all([
		req('/api/access-request', { method: 'POST', token: raceAcc, body: { organisation: 'A', role_title: 'One' } }),
		req('/api/access-request', { method: 'POST', token: raceAcc, body: { organisation: 'B', role_title: 'Two' } }),
		req('/api/access-request', { method: 'POST', token: raceAcc, body: { organisation: 'C', role_title: 'Three' } })
	]);
	check('no simultaneous access request 500s', race.every((r) => r.status < 500), race.map((r) => r.status));
	const raceRefs = new Set(race.filter((r) => r.status < 400).map((r) => r.body.reference));
	check('exactly one access request row exists after the race', raceRefs.size === 1, [...raceRefs]);

	// ---- documents ----
	const docsAda = await req('/api/documents', { token: ada });
	check('approved account reads three documents', docsAda.status === 200 && docsAda.body.length === 3, docsAda.body);
	const docsKen = await req('/api/documents', { token: ken });
	check('pending account meets the not-found answer', docsKen.status === 404, docsKen.status);
	check('no document in the denied payload', !JSON.stringify(docsKen.body).includes('investor-deck'), docsKen.body);
	check('anonymous document room denied', (await req('/api/documents')).status === 401);

	// ---- stories ----
	const st = await req('/api/stories');
	check('seven stories', st.body.length === 7, st.body.length);
	check('stories X-Total-Count', st.headers.get('x-total-count') === '7');
	check('newest first', st.body[0].slug === 'first-module-order', st.body[0]);
	const feat = await req('/api/stories?featured=true');
	check('exactly one featured', feat.body.length === 1 && feat.body[0].slug === 'first-module-order', feat.body);
	const page2 = await req('/api/stories?limit=3&offset=3');
	check('limit and offset paginate', page2.body.length === 3, page2.body.length);
	check('one story carries a body', typeof (await req('/api/stories/steel-partnership')).body.body === 'string');

	// ---- jobs and applications ----
	const jobs = await req('/api/jobs');
	check('three jobs', jobs.body.length === 3, jobs.body.length);
	const ap1 = await req('/api/applications', { method: 'POST', token: walker, body: { job_slug: 'licensing-lead', name: 'Walker', email, note: 'I have carried three design assessments through regulators.' } });
	check('application created', ap1.status === 201 && ap1.body.job_slug === 'licensing-lead', ap1.body);
	const ap2 = await req('/api/applications', { method: 'POST', token: walker, body: { job_slug: 'licensing-lead', name: 'Walker', email, note: 'Updated note about my licensing work history.' } });
	check('applying again updates, same id', ap2.body.id === ap1.body.id, [ap1.body.id, ap2.body.id]);
	const apList = await req('/api/applications', { token: walker });
	check('one application row for that job', apList.body.filter((a) => a.job_slug === 'licensing-lead').length === 1, apList.body);
	check('applications require a token', (await req('/api/applications')).status === 401);
	check("ken sees none of walker's applications", (await req('/api/applications', { token: ken })).body.length === 0);

	// ---- calculator ----
	const rows = [
		[250, 'thermal', 1, 2000, 900000],
		[251, 'thermal', 2, 4000, 1800000],
		[100, 'electrical', 1, 800, 360000],
		[260, 'electrical', 3, 2400, 1080000]
	];
	for (const [need, kind, m, g, t] of rows) {
		const r = await req('/api/calculator', { method: 'POST', body: { need_mw: need, kind } });
		check(`calculator ${need} ${kind}`, r.body.modules_required === m && r.body.annual_clean_energy_gwh === g && r.body.annual_co2_avoided_tonnes === t, r.body);
	}
	check('zero need is invalid', (await req('/api/calculator', { method: 'POST', body: { need_mw: 0, kind: 'thermal' } })).status === 400);
	check('negative need is invalid', (await req('/api/calculator', { method: 'POST', body: { need_mw: -5, kind: 'thermal' } })).status === 400);

	// ---- content ----
	check('four team members in order', (await req('/api/team')).body.map((t) => t.slug).join(',') === 'mira-halvorsen,tobias-ruiz,anneke-vos,daniel-okoye');
	check('three offices', (await req('/api/offices')).body.length === 3);
	const faqs = await req('/api/faqs');
	check('six faqs', faqs.body.length === 6, faqs.body.length);
	check('three under Technology', (await req('/api/faqs?category=Technology')).body.length === 3);
	check('faq search narrows', (await req('/api/faqs?q=helium')).body.length >= 1);
	const me = await req('/api/accounts/me', { token: ada });
	check('accounts/me carries the caller', me.body.email === 'visitor@example.com', me.body);
	check('accounts/me without token denied', (await req('/api/accounts/me')).status === 401);
	check('expired or bogus token denied', (await req('/api/accounts/me', { token: 'not-a-real-token' })).status === 401);

	// ---- mail over real SMTP ----
	await new Promise((r) => setTimeout(r, 800));
	try {
		const msgs = await mailpit('/api/v1/messages?limit=200');
		const items = msgs.messages || [];
		const enqMsg = items.find((m) => m.Subject === `Enquiry received: ${enq.body.reference}`);
		check('enquiry acknowledgement reached Mailpit with the reference in the subject', Boolean(enqMsg), items.slice(0, 5).map((m) => m.Subject));
		if (enqMsg) {
			check('addressed to that one inbox alone', enqMsg.To.length === 1 && enqMsg.To[0].Address === enqEmail, enqMsg.To);
			check('no cc and no bcc', (enqMsg.Cc || []).length === 0 && (enqMsg.Bcc || []).length === 0, [enqMsg.Cc, enqMsg.Bcc]);
			const full = await mailpit(`/api/v1/message/${enqMsg.ID}`);
			check('body carries the reference and the topic', full.Text.includes(enq.body.reference) && full.Text.includes('Solutions'), full.Text?.slice(0, 200));
		}
		const arMsg = items.find((m) => m.Subject === `Investor access requested: ${arMade.body.reference}`);
		check('access request mail sent with the reference', Boolean(arMsg), items.slice(0, 5).map((m) => m.Subject));
		if (arMsg) {
			const full = await mailpit(`/api/v1/message/${arMsg.ID}`);
			check('access mail body carries the organisation and reference', full.Text.includes('Walker Energy') && full.Text.includes(arMade.body.reference));
		}
		const apMsg = items.find((m) => m.Subject === 'Application received: Licensing Lead');
		check('application mail sent with the job title in the subject', Boolean(apMsg), items.slice(0, 5).map((m) => m.Subject));
		if (apMsg) {
			const full = await mailpit(`/api/v1/message/${apMsg.ID}`);
			check('application body carries the job title and the location', full.Text.includes('Licensing Lead') && full.Text.includes('Chicago'));
		}
	} catch (err) {
		check('mailpit reachable', false, String(err.message));
	}

	// ---- SSR pages answer ----
	for (const p of ['/', '/company', '/technology', '/edge', '/team', '/solutions', '/solutions/steel', '/compare', '/calculator', '/investors', '/news', '/news/first-module-order', '/careers', '/contact', '/faq', '/account', '/signin', '/signup', '/investors/room']) {
		const res = await fetch(BASE + p);
		check(`page ${p} renders`, res.status === 200, res.status);
	}
	const nf = await fetch(BASE + '/nowhere-at-all');
	const nfText = await nf.text();
	check('unknown route lands on the not-found card', nf.status === 404 && nfText.includes('We cannot find that page'), nf.status);

	console.log(`\n${pass} passed, ${fail} failed`);
	if (fail) {
		console.log('failures:');
		for (const f of failures) console.log(' - ' + f);
		process.exit(1);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
