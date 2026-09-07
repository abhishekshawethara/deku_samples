/* Walks the five journeys in a real browser, judging each step against the page
   and watching the console. Screenshots land in /app/.browser_screenshots/. */
import { createRequire } from 'node:module';
const require_ = createRequire('/opt/devtools/');
const { chromium } = require_('playwright');

const BASE = process.env.TEST_BASE || 'http://localhost:4173';
const SHOTS = '/app/.browser_screenshots';
const PW = 'deku-demo-pw-2026';

let pass = 0;
let fail = 0;
const problems = [];
const consoleErrors = [];

function check(name, cond, detail = '') {
	if (cond) {
		pass++;
		console.log(`  ok   ${name}`);
	} else {
		fail++;
		problems.push(`${name} ${detail}`);
		console.log(`  FAIL ${name} ${detail}`);
	}
}

async function newPage(browser) {
	const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
	const page = await ctx.newPage();
	page.on('console', (m) => {
		if (m.type() === 'error') consoleErrors.push(`${page.url()} :: ${m.text()}`);
	});
	page.on('pageerror', (e) => consoleErrors.push(`${page.url()} :: pageerror ${e.message}`));
	return { ctx, page };
}

async function signIn(page, email) {
	await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
	await page.fill('[data-testid=signin-email]', email);
	await page.fill('[data-testid=signin-password]', PW);
	await page.click('[data-testid=signin-submit]');
	await page.waitForURL(/\/account/, { timeout: 15000 });
}

async function main() {
	const browser = await chromium.launch({
		args: ['--no-sandbox', '--disable-dev-shm-usage'],
		executablePath: process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome'
	});

	/* ---- Journey 1: filter, save steel anonymously, sign up, find it waiting ---- */
	console.log('\n== Journey 1: narrow, save, sign up, find it waiting ==');
	{
		const { ctx, page } = await newPage(browser);
		await page.goto(`${BASE}/solutions`, { waitUntil: 'networkidle' });
		check('explorer starts at 8 of 8', (await page.textContent('[data-testid=count-shown]')).trim() === '8');

		await page.selectOption('#f-output', 'hydrogen');
		await page.waitForFunction(() => document.querySelector('[data-testid=count-shown]')?.textContent.trim() === '2', null, { timeout: 10000 }).catch(() => {});
		await page.selectOption('#f-band', '550 to 750 C');
		await page.waitForTimeout(700);

		const count = (await page.textContent('[data-testid=count-shown]')).trim();
		check('count falls to 2 with hydrogen + 550 to 750 C', count === '2', `count=${count}`);
		const cards = await page.$$eval('[data-slug]', (els) => els.map((e) => e.getAttribute('data-slug')).sort());
		check('the two cards are transport and steel', JSON.stringify(cards) === JSON.stringify(['steel', 'transport']), JSON.stringify(cards));

		await page.click('[data-testid=save-steel]');
		await page.waitForTimeout(900);
		const pressed = await page.getAttribute('[data-testid=save-steel]', 'aria-pressed');
		check('steel saves without an account', pressed === 'true', `aria-pressed=${pressed}`);
		const tok = await page.evaluate(() => localStorage.getItem('zj_save_token'));
		check('an opaque save_token is kept in the browser', !!tok && tok.length > 10);

		await page.screenshot({ path: `${SHOTS}/01_explorer_filtered_saved.png`, fullPage: false });

		const email = `journey-${Date.now()}@example.com`;
		await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
		check('the signup page says saves are waiting', await page.isVisible('[data-testid=pending-saves]'));
		await page.fill('[data-testid=signup-name]', 'Journey Walker');
		await page.fill('[data-testid=signup-email]', email);
		await page.fill('[data-testid=signup-password]', 'journey-pw-2026');
		await page.click('[data-testid=signup-submit]');
		await page.waitForURL(/\/account/, { timeout: 15000 });
		await page.waitForTimeout(1200);

		const savedText = await page.textContent('[data-testid=account-saves]');
		check('steel is waiting on the new account', /steel/i.test(savedText), savedText?.slice(0, 120));
		const leftover = await page.evaluate(() => localStorage.getItem('zj_save_token'));
		check('the anonymous save token is spent', !leftover);
		await page.screenshot({ path: `${SHOTS}/02_signup_steel_waiting.png`, fullPage: false });
		await ctx.close();
	}

	/* ---- Journey 2: a fifth save on a full compare is refused in place ---- */
	console.log('\n== Journey 2: the fifth is refused, four still compared ==');
	{
		const { ctx, page } = await newPage(browser);
		await signIn(page, 'visitor@example.com');

		// Ada holds two saves; add three more so a fifth can be attempted.
		for (const slug of ['transport', 'chemicals', 'mining']) {
			await page.goto(`${BASE}/solutions/${slug}`, { waitUntil: 'networkidle' });
			const state = await page.getAttribute(`[data-testid=save-${slug}]`, 'aria-pressed');
			if (state !== 'true') {
				await page.click(`[data-testid=save-${slug}]`);
				await page.waitForTimeout(600);
			}
		}

		await page.goto(`${BASE}/compare`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1200);
		const chosen = (await page.textContent('[data-testid=compare-count]')).trim();
		check('the comparison fills to four', chosen === '4', `chosen=${chosen}`);

		const offSlug = await page.$$eval('[data-testid^=compare-toggle-]', (els) => {
			const off = els.find((e) => e.getAttribute('aria-pressed') === 'false');
			return off ? off.getAttribute('data-testid').replace('compare-toggle-', '') : null;
		});
		check('a fifth save exists to try to add', !!offSlug, `off=${offSlug}`);

		if (offSlug) {
			await page.click(`[data-testid=compare-toggle-${offSlug}]`);
			await page.waitForTimeout(900);
			check('the refusal appears in place', await page.isVisible('[data-testid=compare-banner]'));
			const msg = await page.textContent('[data-testid=compare-banner]');
			check('the refusal says what happened and what to do next', /four/i.test(msg) && /remove/i.test(msg), msg?.slice(0, 140));
			const still = (await page.textContent('[data-testid=compare-count]')).trim();
			check('four are still compared', still === '4', `count=${still}`);
			const cols = await page.$$eval('[data-testid=compare-table] thead th', (e) => e.length);
			check('the table still shows four solutions', cols === 5, `cols=${cols}`);
		}
		await page.screenshot({ path: `${SHOTS}/03_compare_fifth_refused.png`, fullPage: false });

		// Put Ada back as the seed left her, so the walk can be repeated and so it
		// does not disturb anything checked elsewhere.
		for (const slug of ['transport', 'chemicals', 'mining']) {
			await page.goto(`${BASE}/solutions/${slug}`, { waitUntil: 'networkidle' });
			await page.waitForTimeout(400);
			if ((await page.getAttribute(`[data-testid=save-${slug}]`, 'aria-pressed')) === 'true') {
				await page.click(`[data-testid=save-${slug}]`);
				await page.waitForTimeout(600);
			}
		}
		const restored = await page.evaluate(async () => {
			const res = await fetch('/api/saves', {
				headers: { Authorization: `Bearer ${localStorage.getItem('zj_token')}` }
			});
			return (await res.json()).map((r) => r.slug).sort();
		});
		check('Ada is left exactly as the seed had her', JSON.stringify(restored) === JSON.stringify(['data-centres', 'steel']), JSON.stringify(restored));
		await ctx.close();
	}

	/* ---- Journey 3: enquiry from /contact, reference in place + real email ---- */
	console.log('\n== Journey 3: enquiry returns a reference and a real email carries it ==');
	{
		const { ctx, page } = await newPage(browser);
		const addr = `enquirer-${Date.now()}@example.com`;
		await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
		await page.fill('#enq-name', 'Journey Enquirer');
		await page.fill('#enq-email', addr);
		await page.fill('#enq-phone', '600123456');
		await page.selectOption('#enq-topic', 'Investor relations');
		await page.fill('#enq-message', 'Please send the investor material and the licensing timeline for review.');
		await page.click('[data-testid=enquiry-submit]');
		await page.waitForSelector('[data-testid=enquiry-reference]', { timeout: 15000 });

		const refText = await page.textContent('[data-testid=enquiry-reference]');
		const ref = (refText.match(/ENQ-[A-Z0-9]{8}/) || [])[0];
		check('the reference appears in place', !!ref, refText?.trim());
		check('the reference has the pinned shape', /^ENQ-[A-Z0-9]{8}$/.test(ref || ''), ref);
		await page.screenshot({ path: `${SHOTS}/04_enquiry_reference.png`, fullPage: false });

		// the acknowledgement must actually reach that inbox
		let found = null;
		for (let i = 0; i < 15 && !found; i++) {
			const res = await fetch(`http://mailpit:8025/api/v1/search?query=${encodeURIComponent(addr)}`);
			const data = await res.json();
			found = (data.messages || []).find((m) => m.Subject.includes(ref));
			if (!found) await new Promise((r) => setTimeout(r, 700));
		}
		check('an acknowledgement reaches that inbox', !!found, `looked for ${ref}`);
		if (found) {
			check('its subject begins "Enquiry received:" then the reference', found.Subject === `Enquiry received: ${ref}`, found.Subject);
			check('it goes to that one address alone, no cc or bcc', found.To.length === 1 && found.To[0].Address === addr && !(found.Cc || []).length && !(found.Bcc || []).length);
			const full = await (await fetch(`http://mailpit:8025/api/v1/message/${found.ID}`)).json();
			check('the body carries the topic and the reference', full.Text.includes(ref) && full.Text.includes('Investor relations'));
		}
		await ctx.close();
	}

	/* ---- Journey 4: the document room opens for Ada, is not-found for Ken ---- */
	console.log('\n== Journey 4: the room opens only on an approved request ==');
	{
		const { ctx, page } = await newPage(browser);
		await signIn(page, 'visitor@example.com');
		await page.goto(`${BASE}/investors/room`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1200);
		check('Ada reaches the document room', await page.isVisible('[data-testid=document-list]'));
		const docs = await page.$$eval('[data-testid=document-list] li', (e) => e.length);
		check('three documents are listed', docs === 3, `docs=${docs}`);
		const roomText = await page.textContent('[data-testid=document-list]');
		check('the seeded documents are the ones shown', /Investor Deck 2026/.test(roomText) && /Technology Dossier/.test(roomText) && /Licensing Roadmap/.test(roomText));
		await page.screenshot({ path: `${SHOTS}/05_document_room_approved.png`, fullPage: false });
		await ctx.close();

		const { ctx: ctx2, page: page2 } = await newPage(browser);
		await signIn(page2, 'visitor2@example.com');
		await page2.goto(`${BASE}/investors/room`, { waitUntil: 'networkidle' });
		await page2.waitForTimeout(1200);
		check('Ken meets the not-found page', await page2.isVisible('[data-testid=room-notfound]'));
		const kenText = await page2.textContent('body');
		check('it reads "We cannot find that page"', kenText.includes('We cannot find that page'));
		check('no document appears anywhere on it', !/Investor Deck 2026|Technology Dossier|Licensing Roadmap/.test(kenText));
		await page2.screenshot({ path: `${SHOTS}/06_room_notfound_pending.png`, fullPage: false });
		await ctx2.close();
	}

	/* ---- Journey 5: 251 MW thermal reads 2, 4000, 1800000 ---- */
	console.log('\n== Journey 5: the calculator ==');
	{
		const { ctx, page } = await newPage(browser);
		await page.goto(`${BASE}/calculator`, { waitUntil: 'networkidle' });
		await page.fill('[data-testid=calc-need]', '251');
		await page.check('input[value=thermal]');
		await page.click('[data-testid=calc-submit]');
		await page.waitForSelector('[data-testid=calc-result]', { timeout: 15000 });

		const m = (await page.textContent('[data-testid=modules-required]')).trim();
		const g = (await page.textContent('[data-testid=annual-gwh]')).replace(/[^\d]/g, '');
		const c = (await page.textContent('[data-testid=annual-co2]')).replace(/[^\d]/g, '');
		check('251 MW thermal reads 2 modules', m === '2', m);
		check('and 4000 GWh', g === '4000', g);
		check('and 1800000 tonnes', c === '1800000', c);
		await page.screenshot({ path: `${SHOTS}/07_calculator_251.png`, fullPage: false });

		await page.fill('[data-testid=calc-need]', '0');
		await page.click('[data-testid=calc-submit]');
		await page.waitForTimeout(600);
		check('a need of zero is refused without taking the app down', await page.isVisible('[data-testid=calc-banner]'));
		await ctx.close();
	}

	/* ---- extra: redirects, keyboard, responsive, not-found ---- */
	console.log('\n== entry, redirects and chrome ==');
	{
		const { ctx, page } = await newPage(browser);
		await page.goto(`${BASE}/account`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1000);
		check('an unauthenticated visitor at /account goes to /signin?next=/account', page.url().includes('/signin?next=%2Faccount'), page.url());

		await page.goto(`${BASE}/investors/room`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1000);
		check('and at /investors/room to /signin?next=/investors/room', page.url().includes('next=%2Finvestors%2Froom'), page.url());

		// login lands on next
		await page.fill('[data-testid=signin-email]', 'visitor@example.com');
		await page.fill('[data-testid=signin-password]', PW);
		await page.click('[data-testid=signin-submit]');
		await page.waitForTimeout(2500);
		check('login lands on next', page.url().includes('/investors/room'), page.url());

		// logout returns to /
		await page.goto(`${BASE}/account`, { waitUntil: 'networkidle' });
		await page.click('button:has-text("Sign out")');
		await page.waitForTimeout(1500);
		check('logout returns to /', new URL(page.url()).pathname === '/', page.url());

		await page.goto(`${BASE}/no-such-route`, { waitUntil: 'networkidle' });
		const nf = await page.textContent('body');
		check('a mistyped address lands on the not-found card', nf.includes('We cannot find that page'));

		// keyboard: focus ring reachable
		await page.goto(`${BASE}/solutions`, { waitUntil: 'networkidle' });
		await page.keyboard.press('Tab');
		const focused = await page.evaluate(() => document.activeElement?.tagName);
		check('keyboard focus reaches the page', !!focused && focused !== 'BODY', focused);

		// modal: Escape closes and focus returns
		await page.goto(`${BASE}/team`, { waitUntil: 'networkidle' });
		await page.click('button:has-text("View bio")');
		await page.waitForTimeout(500);
		check('the bio modal opens', await page.isVisible('[role=dialog]'));
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);
		check('Escape closes the modal', !(await page.isVisible('[role=dialog]')));

		await ctx.close();
	}

	console.log('\n== responsive widths ==');
	{
		for (const [w, h, label] of [[375, 780, 'phone'], [768, 900, 'tablet'], [1440, 900, 'desktop']]) {
			const ctx = await browser.newContext({ viewport: { width: w, height: h } });
			const page = await ctx.newPage();
			await page.goto(`${BASE}/solutions`, { waitUntil: 'networkidle' });
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
			check(`no horizontal scrollbar at ${label} (${w}px)`, overflow <= 1, `overflow=${overflow}`);
			if (w === 375) await page.screenshot({ path: `${SHOTS}/08_phone_explorer.png` });
			await ctx.close();
		}
	}

	await browser.close();

	console.log('\n== console ==');
	// The 400 on /compare is the server refusing a fifth slug in Journey 2: that
	// refusal is the behaviour under test, and the page reports it in place.
	const expected = /\/compare .*status of 400|favicon|404 \(Not Found\)/i;
	const noisy = consoleErrors.filter((e) => !expected.test(e));
	check('no unexpected console errors during the walk', noisy.length === 0, noisy.slice(0, 5).join(' ;; '));
	check('the only console noise is the deliberate refusal of a fifth slug', consoleErrors.every((e) => expected.test(e)), consoleErrors.slice(0, 3).join(' ;; '));

	console.log(`\n==== ${pass} passed, ${fail} failed ====`);
	if (problems.length) {
		console.log('\nProblems:');
		for (const p of problems) console.log(` - ${p}`);
	}
	process.exit(fail ? 1 : 0);
}

main().catch((e) => {
	console.error('walk crashed:', e);
	process.exit(1);
});
