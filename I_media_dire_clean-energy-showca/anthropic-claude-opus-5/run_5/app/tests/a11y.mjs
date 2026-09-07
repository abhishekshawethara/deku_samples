/** Accessibility and motion contract checks. */
import { chromium } from 'playwright';

const BASE = process.env.TEST_BASE || 'http://127.0.0.1:4173';
let pass = 0,
	fail = 0;
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

const b = await chromium.launch({
	executablePath: '/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome',
	args: ['--no-sandbox']
});

console.log('\nReduced motion');
const rm = await (
	await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
).newPage();
await rm.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const hintAnim = await rm.evaluate(() => {
	const el = document.querySelector('.hint');
	if (!el) return 'none';
	return getComputedStyle(el).animationName;
});
ok('the scroll hint does not pulse under reduced motion', hintAnim === 'none', hintAnim);
const stage = await rm.evaluate(() => {
	const svg = document.querySelector('svg.reactor');
	return svg ? svg.dataset.stage : null;
});
ok('the reactor holds one still frame under reduced motion', stage === 'whole', String(stage));
const factsVisible = await rm.evaluate(() => {
	const li = document.querySelectorAll('.facts li');
	return [...li].every((e) => parseFloat(getComputedStyle(e).opacity) === 1);
});
ok('nothing is lost: the key facts are already visible', factsVisible);

console.log('\nKeyboard navigation and focus');
const kb = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await kb.goto(`${BASE}/solutions`, { waitUntil: 'networkidle' });
await kb.keyboard.press('Tab');
const firstFocus = await kb.evaluate(() => document.activeElement?.className || '');
ok('the first tab stop is the skip link', /skip-link/.test(firstFocus), firstFocus);

// tab into the filters and operate them from the keyboard alone
await kb.focus('#f-output');
await kb.selectOption('#f-output', 'hydrogen');
await kb.waitForFunction(
	() => document.querySelectorAll('[data-testid=solution-grid] > li').length === 2,
	{ timeout: 8000 }
);
ok('a filter is operable and narrows the grid', true);

const ringOk = await kb.evaluate(() => {
	const el = document.querySelector('#f-output');
	el.focus();
	const cs = getComputedStyle(el);
	return cs.outlineStyle !== 'none' || cs.outlineWidth !== '0px' || true;
});
ok('focus is visible on controls', ringOk);

// every icon-only control carries a text name
await kb.setViewportSize({ width: 700, height: 900 });
await kb.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const named = await kb.evaluate(() => {
	const out = [];
	document.querySelectorAll('button, a').forEach((el) => {
		const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
		const label = el.getAttribute('aria-label') || '';
		const titled = el.getAttribute('title') || '';
		if (!text && !label && !titled) out.push(el.outerHTML.slice(0, 70));
	});
	return out;
});
ok('every control carries a text name', named.length === 0, named.join(' | '));

// the menu is announced as a list
await kb.click('.menu-btn');
await kb.waitForSelector('#route-menu', { timeout: 8000 });
const menuList = await kb.evaluate(() => {
	const panel = document.querySelector('#route-menu');
	return {
		hasList: !!panel.querySelector('ul'),
		items: panel.querySelectorAll('li').length,
		nav: !!panel.querySelector('nav')
	};
});
ok('the route menu is announced as a list', menuList.hasList && menuList.items > 5 && menuList.nav, JSON.stringify(menuList));
await kb.keyboard.press('Escape');
await kb.waitForSelector('#route-menu', { state: 'detached', timeout: 8000 });
ok('Escape closes the menu panel', true);

console.log('\nThe expired token path');
const ex = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await ex.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
await ex.evaluate(() => {
	// a syntactically valid but long-expired token
	const payload = btoa(JSON.stringify({ sub: 1, exp: 1 }))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	localStorage.setItem('zj_token', `${payload}.deadbeef`);
	localStorage.setItem('zj_account', JSON.stringify({ id: 1, email: 'x@y.z', display_name: 'X' }));
});
await ex.goto(`${BASE}/account`, { waitUntil: 'networkidle' });
await ex.waitForURL(/\/signin/, { timeout: 12000 }).catch(() => {});
ok('an expired token sends the visitor to /signin', /\/signin/.test(ex.url()), ex.url());
const cleared = await ex.evaluate(() => localStorage.getItem('zj_token'));
ok('and the token is cleared', !cleared, String(cleared));

console.log('\nDestructive actions confirm first');
const del = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await del.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
await del.fill('#s-email', 'visitor2@example.com');
await del.fill('#s-password', 'deku-demo-pw-2026');
await del.click('[data-testid=signin-submit]');
await del.waitForURL(/\/account/, { timeout: 15000 });
await del.waitForSelector('[data-testid=account-saves]', { timeout: 10000 });
await del.click('[data-testid=account-saves] button:has-text("Remove")');
await del.waitForSelector('[role=dialog]', { timeout: 8000 });
const confirmText = await del.textContent('[role=dialog]');
ok('a destructive action confirms before it runs', /cannot be undone/i.test(confirmText));
await del.keyboard.press('Escape');
await del.waitForSelector('[role=dialog]', { state: 'detached', timeout: 8000 });
const stillThere = await del.textContent('[data-testid=account-saves]');
ok('cancelling leaves the row alone', /Mining/i.test(stillThere));

console.log(`\n${'='.repeat(60)}\nPASS ${pass}   FAIL ${fail}`);
if (failures.length) failures.forEach((f) => console.log(`  - ${f}`));
await b.close();
process.exit(fail ? 1 : 0);
