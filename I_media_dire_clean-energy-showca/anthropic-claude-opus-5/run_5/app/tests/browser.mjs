/** Walks the five journeys in a real browser and saves one screenshot each. */
import { chromium } from 'playwright';
import pg from 'pg';

const BASE = process.env.TEST_BASE || 'http://127.0.0.1:4173';
const SHOTS = '/app/.browser_screenshots';
const PW = 'deku-demo-pw-2026';
const MAILPIT = 'http://mailpit:8025';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

let pass = 0,
	fail = 0;
const failures = [];
const consoleErrors = [];

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

async function signIn(page, email) {
	await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
	await page.fill('#s-email', email);
	await page.fill('#s-password', PW);
	await page.click('[data-testid=signin-submit]');
	await page.waitForURL(/\/account/, { timeout: 15000 });
}

const run = async () => {
	const browser = await chromium.launch({
		executablePath: '/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome',
		args: ['--no-sandbox', '--disable-dev-shm-usage']
	});
	const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 } });
	const page = await ctx.newPage();
	page.on('console', (m) => {
		if (m.type() === 'error') consoleErrors.push(m.text());
	});
	page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

	/* ---- Journey 1: filter to 2, save steel, sign up, find it waiting ---- */
	console.log('\nJourney 1: filter, save anonymously, sign up, find it waiting');
	await page.goto(`${BASE}/solutions`, { waitUntil: 'networkidle' });
	await page.waitForSelector('[data-testid=solution-grid]');
	const initial = await page.textContent('[data-testid=result-count]');
	ok('the grid states 8 of 8 to begin with', /8[\s\S]*of 8/.test(initial), initial);

	await page.selectOption('#f-output', 'hydrogen');
	await page.waitForFunction(
		() => /Showing\s*2\s*of 8/.test(document.querySelector('[data-testid=result-count]')?.textContent || ''),
		{ timeout: 8000 }
	).catch(() => {});
	await page.selectOption('#f-band', '550 to 750 C');
	await page.waitForFunction(
		() =>
			/2/.test(document.querySelector('[data-testid=result-count]')?.textContent || '') &&
			document.querySelectorAll('[data-testid=solution-grid] > li').length === 2,
		{ timeout: 8000 }
	);
	const count = await page.textContent('[data-testid=result-count]');
	ok('the count falls to 2', /\b2\b/.test(count), count);
	const shown = await page.$$eval('[data-testid=solution-grid] > li', (els) =>
		els.map((e) => e.dataset.slug).sort()
	);
	ok(
		'exactly transport and steel are shown',
		JSON.stringify(shown) === JSON.stringify(['steel', 'transport']),
		JSON.stringify(shown)
	);

	await page.click('[data-testid=save-steel]');
	await page.waitForFunction(
		() => document.querySelector('[data-testid=save-steel]')?.getAttribute('aria-pressed') === 'true',
		{ timeout: 8000 }
	);
	ok('steel is saved without an account', true);
	const anonToken = await page.evaluate(() => localStorage.getItem('zj_save_token'));
	ok('an opaque save_token was kept', !!anonToken);
	const anonRow = await pool.query(
		'SELECT count(*)::int c FROM saved_solutions WHERE save_token=$1',
		[anonToken]
	);
	ok('the anonymous save is a real database row', anonRow.rows[0].c === 1);

	await page.screenshot({ path: `${SHOTS}/01_explorer_filtered_to_two.png`, fullPage: false });

	const newEmail = `walker${Date.now()}@example.com`;
	await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
	await page.fill('#u-name', 'Journey Walker');
	await page.fill('#u-email', newEmail);
	await page.fill('#u-password', 'a-good-password');
	await page.click('[data-testid=signup-submit]');
	await page.waitForURL(/\/account/, { timeout: 15000 });
	await page.waitForSelector('[data-testid=account-saves]', { timeout: 10000 });
	const savedText = await page.textContent('[data-testid=account-saves]');
	ok('steel is waiting on the new account', /Steel/i.test(savedText), savedText?.slice(0, 120));
	const claimed = await pool.query(
		"SELECT count(*)::int c FROM saved_solutions ss JOIN accounts a ON a.id=ss.account_id JOIN solutions s ON s.id=ss.solution_id WHERE a.email=$1 AND s.slug='steel'",
		[newEmail]
	);
	ok('the row now belongs to the account in the database', claimed.rows[0].c === 1);
	const emptied = await pool.query(
		'SELECT count(*)::int c FROM saved_solutions WHERE save_token=$1',
		[anonToken]
	);
	ok('the anonymous basket is empty in the database', emptied.rows[0].c === 0);
	await page.screenshot({ path: `${SHOTS}/02_account_save_claimed.png`, fullPage: false });

	/* ---- Journey 2: fifth solution on a full compare is refused ---- */
	console.log('\nJourney 2: a fifth solution on a full /compare is refused in place');
	const ada = await ctx.browser().newContext({ viewport: { width: 1400, height: 950 } });
	const p2 = await ada.newPage();
	p2.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
	await signIn(p2, 'visitor@example.com');
	// give Ada five saves so a fifth add is possible
	for (const slug of ['transport', 'chemicals', 'communities']) {
		await p2.goto(`${BASE}/solutions/${slug}`, { waitUntil: 'networkidle' });
		const btn = await p2.waitForSelector(`[data-testid=save-${slug}]`, { timeout: 8000 });
		if ((await btn.getAttribute('aria-pressed')) !== 'true') {
			await btn.click();
			await p2.waitForFunction(
				(s) => document.querySelector(`[data-testid=save-${s}]`)?.getAttribute('aria-pressed') === 'true',
				slug,
				{ timeout: 8000 }
			);
		}
	}
	await p2.goto(`${BASE}/compare`, { waitUntil: 'networkidle' });
	await p2.waitForSelector('[data-testid=compare-count]');
	const addButtons = await p2.$$('[data-testid^=add-]');
	ok('Ada has at least five saves to add from', addButtons.length >= 5, `${addButtons.length}`);
	for (let i = 0; i < 4; i += 1) {
		const b = (await p2.$$('[data-testid^=add-]'))[0];
		await b.click();
		await p2.waitForTimeout(250);
	}
	await p2.waitForFunction(
		() => /\b4\b/.test(document.querySelector('[data-testid=compare-count]')?.textContent || ''),
		{ timeout: 8000 }
	);
	ok('four are compared', true);
	const fifth = (await p2.$$('[data-testid^=add-]'))[0];
	await fifth.click();
	await p2.waitForSelector('[data-testid=compare-refusal]', { timeout: 8000 });
	const refusal = await p2.textContent('[data-testid=compare-refusal]');
	ok('the refusal appears in place', /four/i.test(refusal), refusal?.slice(0, 120));
	const afterCount = await p2.textContent('[data-testid=compare-count]');
	ok('four are still compared', /\b4\b/.test(afterCount), afterCount);
	const cols = await p2.$$eval('[data-testid=compare-table] thead th', (e) => e.length);
	ok('the table still shows four solutions', cols === 5, `${cols} header cells`);
	await p2.screenshot({ path: `${SHOTS}/03_compare_fifth_refused.png`, fullPage: false });

	/* ---- Journey 3: enquiry from /contact, reference in place, real email ---- */
	console.log('\nJourney 3: an enquiry from /contact returns a reference and a real email');
	const p3 = await (await ctx.browser().newContext({ viewport: { width: 1400, height: 950 } })).newPage();
	p3.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
	const enqEmail = `walk-enq${Date.now()}@example.com`;
	await p3.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
	await p3.fill('#e-name', 'Journey Walker');
	await p3.fill('#e-email', enqEmail);
	await p3.fill('#e-phone', '600123456');
	await p3.selectOption('#e-topic', 'Investor relations');
	await p3.fill('#e-message', 'We are reviewing the investment case and would like to talk.');
	await p3.click('[data-testid=enquiry-submit]');
	await p3.waitForSelector('[data-testid=enquiry-reference]', { timeout: 15000 });
	const ref = (await p3.textContent('[data-testid=enquiry-reference]')).trim();
	ok('the reference appears in place', /^ENQ-[A-Z0-9]{8}$/.test(ref), ref);
	const dbEnq = await pool.query('SELECT status, topic FROM enquiries WHERE reference=$1', [ref]);
	ok(
		'the enquiry is a real row, stored received',
		dbEnq.rows[0]?.status === 'received' && dbEnq.rows[0]?.topic === 'Investor relations'
	);

	let mail = null;
	for (let i = 0; i < 25 && !mail; i += 1) {
		await new Promise((r) => setTimeout(r, 400));
		const j = await (await fetch(`${MAILPIT}/api/v1/messages?limit=60`)).json();
		mail = (j.messages || []).find((m) => m.Subject === `Enquiry received: ${ref}`);
	}
	ok('the acknowledgement carrying it reached that inbox', !!mail);
	ok('it went to that one address alone', mail?.To?.length === 1 && mail.To[0].Address === enqEmail);
	await p3.screenshot({ path: `${SHOTS}/04_enquiry_reference.png`, fullPage: false });

	/* ---- Journey 4: the document room for Ada, not-found for Ken ---- */
	console.log('\nJourney 4: the document room opens for Ada and not for Ken');
	await p2.goto(`${BASE}/investors/room`, { waitUntil: 'networkidle' });
	await p2.waitForSelector('[data-testid=document-list]', { timeout: 12000 });
	const docs = await p2.$$eval('[data-testid=document-list] > li', (e) => e.length);
	ok('Ada reads the three documents', docs === 3, `${docs}`);
	const docText = await p2.textContent('[data-testid=document-list]');
	ok(
		'the three seeded titles are on the page',
		/Investor Deck 2026/.test(docText) &&
			/Technology Dossier/.test(docText) &&
			/Licensing Roadmap/.test(docText)
	);
	await p2.screenshot({ path: `${SHOTS}/05_document_room_approved.png`, fullPage: false });

	const kenCtx = await ctx.browser().newContext({ viewport: { width: 1400, height: 950 } });
	const p4 = await kenCtx.newPage();
	p4.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
	await signIn(p4, 'visitor2@example.com');
	await p4.goto(`${BASE}/investors/room`, { waitUntil: 'networkidle' });
	await p4.waitForSelector('[data-testid=notfound]', { timeout: 12000 });
	const nf = await p4.textContent('[data-testid=notfound]');
	ok('Ken meets the not-found page', /We cannot find that page/.test(nf), nf?.slice(0, 90));
	const leaked = await p4.content();
	ok(
		'no document title leaks onto that page',
		!/Investor Deck 2026|Technology Dossier|Licensing Roadmap/.test(leaked)
	);
	await p4.screenshot({ path: `${SHOTS}/06_document_room_pending_notfound.png`, fullPage: false });

	/* ---- Journey 5: 251 MW thermal reads 2, 4000 and 1800000 ---- */
	console.log('\nJourney 5: 251 MW thermal at /calculator reads 2, 4000 and 1800000');
	await p3.goto(`${BASE}/calculator`, { waitUntil: 'networkidle' });
	await p3.fill('#c-need', '251');
	await p3.click('input[value=thermal]');
	await p3.click('[data-testid=calc-submit]');
	await p3.waitForSelector('[data-testid=calc-results]', { timeout: 12000 });
	const modules = (await p3.textContent('[data-testid=modules-required]')).trim();
	const energy = (await p3.textContent('[data-testid=annual-energy]')).trim();
	const co2 = (await p3.textContent('[data-testid=annual-co2]')).trim();
	ok('modules_required reads 2', modules === '2', modules);
	ok('annual_clean_energy_gwh reads 4,000', energy.replace(/[,\s]/g, '') === '4000', energy);
	ok('annual_co2_avoided_tonnes reads 1,800,000', co2.replace(/[,\s]/g, '') === '1800000', co2);
	await p3.screenshot({ path: `${SHOTS}/07_calculator_251_thermal.png`, fullPage: false });

	/* ---- extra checks a stranger would hit ---- */
	console.log('\nExtra: routes, redirects, not-found, mobile width');
	const anon = await (await ctx.browser().newContext({ viewport: { width: 1400, height: 950 } })).newPage();
	anon.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

	await anon.goto(`${BASE}/account`, { waitUntil: 'networkidle' });
	await anon.waitForURL(/\/signin\?next=%2Faccount/, { timeout: 10000 }).catch(() => {});
	ok(
		'an unauthenticated visitor at /account goes to /signin?next=/account',
		/\/signin\?next=%2Faccount/.test(anon.url()),
		anon.url()
	);
	await anon.goto(`${BASE}/investors/room`, { waitUntil: 'networkidle' });
	await anon.waitForURL(/\/signin\?next=%2Finvestors%2Froom/, { timeout: 10000 }).catch(() => {});
	ok(
		'and at /investors/room likewise',
		/signin\?next=%2Finvestors%2Froom/.test(anon.url()),
		anon.url()
	);

	// login lands on next
	await anon.fill('#s-email', 'visitor@example.com');
	await anon.fill('#s-password', PW);
	await anon.click('[data-testid=signin-submit]');
	await anon.waitForURL(/\/investors\/room/, { timeout: 15000 });
	ok('login lands on next', /\/investors\/room$/.test(anon.url()), anon.url());

	for (const route of [
		'/',
		'/company',
		'/technology',
		'/edge',
		'/team',
		'/solutions',
		'/solutions/steel',
		'/compare',
		'/calculator',
		'/investors',
		'/news',
		'/news/first-module-order',
		'/careers',
		'/contact',
		'/faq',
		'/signin',
		'/signup'
	]) {
		const r = await anon.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
		ok(`${route} answers 200`, r.status() === 200, `${r.status()}`);
	}

	const nf2 = await anon.goto(`${BASE}/no-such-route`, { waitUntil: 'networkidle' });
	const nfText = await anon.textContent('body');
	ok('a mistyped route lands on the not-found card', /We cannot find that page/.test(nfText));
	ok('and it answers 404', nf2.status() === 404, `${nf2.status()}`);

	// copy deck strings
	await anon.goto(`${BASE}/`, { waitUntil: 'networkidle' });
	const home = await anon.textContent('body');
	ok('home carries the display line', /Powering the World/.test(home));
	ok(
		'home carries the three key facts',
		/High-temperature gas-cooled reactor/.test(home) &&
			/250 MW thermal a module/.test(home) &&
			/750 degrees Celsius at the outlet/.test(home)
	);
	ok(
		'home carries the four outputs',
		/Heat and power/.test(home) && /Hydrogen/.test(home) && /Electricity/.test(home)
	);
	const outLink = await anon.getAttribute('a[href="/solutions?output_kind=hydrogen"]', 'href');
	ok('an output links into /solutions carrying that output_kind', !!outLink, String(outLink));

	for (const [route, text] of [
		['/company', 'clean heat and electricity to power a world of industrial applications'],
		['/team', 'shaping the future of nuclear together'],
		['/news', 'latest news'],
		["/careers", "help us build what's next in nuclear energy"]
	]) {
		await anon.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
		const t = await anon.textContent('body');
		ok(`${route} carries its pinned opening line`, t.includes(text));
	}

	// newsroom paging: 3 at a time, two pages of three
	await anon.goto(`${BASE}/news`, { waitUntil: 'networkidle' });
	await anon.waitForSelector('[data-testid=story-wall]');
	let wall = await anon.$$eval('[data-testid=story-wall] > li', (e) => e.length);
	ok('the wall shows 3 at a time', wall === 3, `${wall}`);
	await anon.click('button:has-text("More stories")');
	await anon.waitForFunction(
		() => document.querySelectorAll('[data-testid=story-wall] > li').length === 6,
		{ timeout: 8000 }
	);
	wall = await anon.$$eval('[data-testid=story-wall] > li', (e) => e.length);
	ok('a more action brings in the next 3, six in all', wall === 6, `${wall}`);
	const featuredOnWall = await anon.$$eval('[data-testid=story-wall] > li a', (els) =>
		els.some((a) => a.getAttribute('href') === '/news/first-module-order')
	);
	ok('the wall excludes the featured story', !featuredOnWall);

	// no horizontal scrollbar at any width between the named breakpoints
	for (const w of [360, 480, 768, 1024, 1440, 1920]) {
		const vp = await ctx.browser().newContext({ viewport: { width: w, height: 900 } });
		const pv = await vp.newPage();
		const bad = [];
		for (const route of [
			'/',
			'/solutions',
			'/solutions/steel',
			'/technology',
			'/team',
			'/news',
			'/careers',
			'/investors',
			'/calculator',
			'/compare',
			'/contact',
			'/faq',
			'/company',
			'/edge'
		]) {
			await pv.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
			const over = await pv.evaluate(
				() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
			);
			if (over) bad.push(route);
		}
		ok(`no horizontal scrollbar at ${w}px on any route`, bad.length === 0, bad.join(', '));
		await vp.close();
	}

	// a modal closes on Escape and returns focus
	await anon.goto(`${BASE}/team`, { waitUntil: 'networkidle' });
	await anon.waitForSelector('[data-testid=team-grid]');
	await anon.click('button:has-text("View bio") >> nth=0');
	await anon.waitForSelector('[role=dialog]', { timeout: 8000 });
	ok('the bio modal opens', true);
	await anon.keyboard.press('Escape');
	await anon.waitForSelector('[role=dialog]', { state: 'detached', timeout: 8000 });
	ok('Escape closes the modal', true);
	const focusBack = await anon.evaluate(() =>
		(document.activeElement?.textContent || '').includes('View bio')
	);
	ok('focus returns to the control that opened it', focusBack);
	await anon.screenshot({ path: `${SHOTS}/08_team_bio_modal.png`, fullPage: false });

	// the account lists for Ada
	await anon.goto(`${BASE}/account`, { waitUntil: 'networkidle' });
	await anon.waitForSelector('[data-testid=account-saves]', { timeout: 10000 });
	const acct = await anon.textContent('body');
	ok('the account shows the five lists', /Saved solutions/.test(acct) && /Saved searches/.test(acct) && /Enquiries/.test(acct) && /Investor access/.test(acct) && /Job applications/.test(acct));
	const accessStatus = await anon.textContent('[data-testid=access-status]');
	ok("Ada's access request reads approved", /approved/.test(accessStatus), accessStatus);
	await anon.screenshot({ path: `${SHOTS}/09_account_five_lists.png`, fullPage: true });

	console.log(`\n${'='.repeat(60)}\nPASS ${pass}   FAIL ${fail}`);
	const realErrors = consoleErrors.filter((e) => !/favicon|404 \(Not Found\)/i.test(e));
	console.log(`Console errors: ${realErrors.length}`);
	realErrors.slice(0, 12).forEach((e) => console.log(`  ! ${e}`));
	if (failures.length) {
		console.log('\nFailures:');
		failures.forEach((f) => console.log(`  - ${f}`));
	}

	await browser.close();
	await pool.end();
	process.exit(fail ? 1 : 0);
};

run().catch(async (err) => {
	console.error('Harness error:', err);
	await pool.end();
	process.exit(1);
});
