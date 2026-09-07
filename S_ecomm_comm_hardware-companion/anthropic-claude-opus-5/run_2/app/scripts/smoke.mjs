/**
 * Walks the seeded journey against a running server and checks the facts that
 * live outside the app: the invoice in killbill and the mail in Mailpit.
 * Run with: node scripts/smoke.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://127.0.0.1:4173';
const KB = process.env.PAYMENTS_API_URL;
const MAILPIT = process.env.MAILPIT_URL || 'http://mailpit:8025';

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!ok) failures += 1;
};

const kbHeaders = {
  'X-Killbill-ApiKey': process.env.PAYMENTS_API_KEY,
  'X-Killbill-ApiSecret': process.env.PAYMENTS_API_SECRET,
  Authorization: `Basic ${Buffer.from(`${process.env.PAYMENTS_ADMIN_USER}:${process.env.PAYMENTS_ADMIN_PASSWORD}`).toString('base64')}`,
  Accept: 'application/json',
};

let cartCookie = '';
async function call(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(cartCookie ? { cookie: cartCookie } : {}),
      ...(init.headers || {}),
    },
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const m = /vela_cart=([^;]+)/.exec(setCookie);
    if (m) cartCookie = `vela_cart=${m[1]}`;
  }
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

async function main() {
  console.log('--- health');
  check('health 200', (await call('/api/health')).status === 200);

  console.log('\n--- catalogue');
  const products = await call('/api/products');
  check('products listed', products.body.data?.length === 5, `got ${products.body.data?.length}`);
  check('catalogue order is editorial',
    products.body.data?.map((p) => p.handle).join(',') === 'flagship,compact,mount,case,cable',
    products.body.data?.map((p) => p.handle).join(','));
  check('list carries next_cursor and has_more',
    'next_cursor' in products.body && 'has_more' in products.body);

  const capped = await call('/api/products?page_size=500');
  check('page size above cap refused with cap named',
    capped.status === 400 && /100/.test(capped.body.message), capped.body.message);

  console.log('\n--- cart');
  await call('/api/cart');
  const add1 = await call('/api/cart/lines', {
    method: 'POST',
    body: JSON.stringify({ sku: 'VELA-CRICKET-GRAPHITE', quantity: 1 }),
  });
  check('cricket added', add1.status === 201, JSON.stringify(add1.body).slice(0, 120));
  const add2 = await call('/api/cart/lines', {
    method: 'POST',
    body: JSON.stringify({ sku: 'VELA-CASE-STD', quantity: 1 }),
  });
  check('case added', add2.status === 201);
  check('subtotal is 37800', add2.body.subtotal_minor === 37800, String(add2.body.subtotal_minor));
  check('protection unticked by default', add2.body.protection_enabled === false);
  check('protection rung is 2 at 298',
    add2.body.protection_rung?.sku === 'VELA-PROTECT-2' && add2.body.protection_rung?.price_minor === 298);

  const soldOut = await call('/api/cart/lines', {
    method: 'POST',
    body: JSON.stringify({ sku: 'VELA-CRICKET-YELLOW', quantity: 1 }),
  });
  check('sold out refused', soldOut.status === 409, String(soldOut.status));

  console.log('\n--- delivery');
  const delivery = await call('/api/cart/delivery', {
    method: 'POST',
    body: JSON.stringify({
      email: 'customer@example.com',
      shipping_address: {
        name: 'Iris Vantaa', line1: '44 Harbour Road', city: 'Portland',
        region: 'OR', postal_code: '97204', country: 'US',
      },
      shipping_method: 'standard',
    }),
  });
  check('tax is 3780', delivery.body.tax_minor === 3780, String(delivery.body.tax_minor));
  check('shipping is 0 for standard', delivery.body.shipping_minor === 0);
  check('total is 41580', delivery.body.total_minor === 41580, String(delivery.body.total_minor));

  // Count what killbill and the mail server already hold, so the checks below
  // measure what this run created rather than what earlier runs left behind.
  async function invoiceCount() {
    const r = await fetch(
      `${KB}/1.0/kb/accounts?externalKey=${encodeURIComponent('customer@example.com')}`,
      { headers: kbHeaders },
    );
    if (r.status !== 200) return 0;
    const a = await r.json();
    const inv = await fetch(
      `${KB}/1.0/kb/accounts/${a.accountId}/invoices?withItems=true&includeInvoiceComponents=true`,
      { headers: kbHeaders },
    );
    return (await inv.json()).length;
  }
  const invoicesBefore = await invoiceCount();
  const mailBefore = (await (await fetch(`${MAILPIT}/api/v1/messages?limit=1`)).json()).messages_count;

  console.log('\n--- place order (twice, one key)');
  const key = `smoke-${Date.now()}`;
  const placed = await call('/api/orders', {
    method: 'POST',
    headers: { 'idempotency-key': key },
    body: JSON.stringify({ expected_total_minor: 41580 }),
  });
  check('order created', placed.status === 201, JSON.stringify(placed.body).slice(0, 200));
  const number = placed.body.number;
  check('order number allocated in sequence', /^VE-\d{4}-\d{4}$/.test(number || ''), number);
  check('order total is 41580', placed.body.total_minor === 41580);
  check('total equals lines + shipping + tax',
    placed.body.total_minor ===
      placed.body.lines.reduce((s, l) => s + l.total_minor, 0) +
      placed.body.shipping_minor + placed.body.tax_minor - placed.body.discount_minor);

  const replay = await call('/api/orders', {
    method: 'POST',
    headers: { 'idempotency-key': key },
    body: JSON.stringify({ expected_total_minor: 41580 }),
  });
  check('replay returns the same order', replay.body.number === number, replay.body.number);

  console.log('\n--- killbill holds the money');
  const acct = await fetch(
    `${KB}/1.0/kb/accounts?externalKey=${encodeURIComponent('customer@example.com')}`,
    { headers: kbHeaders },
  );
  check('account exists on the order email', acct.status === 200);
  const account = await acct.json();
  const invRes = await fetch(
    `${KB}/1.0/kb/accounts/${account.accountId}/invoices?withItems=true&includeInvoiceComponents=true`,
    { headers: kbHeaders },
  );
  const invoices = await invRes.json();
  // The order placed twice must have raised exactly one invoice.
  check('placing twice raised exactly one new invoice',
    invoices.length === invoicesBefore + 1,
    `account held ${invoicesBefore}, now holds ${invoices.length}`);
  const match = invoices.filter(
    (i) => i.items?.some((it) => it.description === `Vela order ${number}`),
  );
  check('an invoice exists for this order number', match.length >= 1,
    `found ${match.length}`);
  check('invoice amount is 415.80 USD',
    match[0] && Number(match[0].amount) === 415.8 && match[0].currency === 'USD',
    match[0] ? `${match[0].amount} ${match[0].currency}` : 'none');

  console.log('\n--- the mail server holds the confirmation');
  await new Promise((r) => setTimeout(r, 900));
  const mailAfter = (await (await fetch(`${MAILPIT}/api/v1/messages?limit=1`)).json()).messages_count;
  check('placing twice sent exactly one mail', mailAfter === mailBefore + 1,
    `mailbox held ${mailBefore}, now holds ${mailAfter}`);
  const mailRes = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(number)}`);
  const mail = await mailRes.json();
  const msg = mail.messages?.[0];
  if (msg) {
    check('subject names the order', msg.Subject === `Order confirmed: ${number}`, msg.Subject);
    check('one recipient only', msg.To?.length === 1, JSON.stringify(msg.To));
    check('addressed to the order email', msg.To?.[0]?.Address === 'customer@example.com');
    check('no cc', !msg.Cc || msg.Cc.length === 0);
    check('no bcc', !msg.Bcc || msg.Bcc.length === 0);
  }

  console.log('\n--- the order reads back');
  const token = placed.body.access_token;
  const read = await call(`/api/orders/${number}?access_token=${encodeURIComponent(token)}`);
  check('order readable by access token', read.status === 200);
  const noToken = await call(`/api/orders/${number}`);
  check('order not readable without a token', noToken.status === 404, String(noToken.status));

  console.log('\n--- auth and the ownership boundary');
  const login = await call('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@example.com', password: 'deku-demo-pw-2026' }),
  });
  check('seeded password works', login.status === 200, JSON.stringify(login.body).slice(0, 120));
  const auth = { authorization: `Bearer ${login.body.access_token}` };

  const upper = await call('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'CUSTOMER@EXAMPLE.COM', password: 'deku-demo-pw-2026' }),
  });
  check('email compared case-insensitively', upper.status === 200);

  const wrongPw = await call('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@example.com', password: 'nope' }),
  });
  check('wrong password rejected', wrongPw.status === 401);

  const dupe = await call('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@example.com', password: 'whatever-123', name: 'X' }),
  });
  check('signup refuses an address already registered', dupe.status === 409, String(dupe.status));

  const login2 = await call('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer2@example.com', password: 'deku-demo-pw-2026' }),
  });
  const auth2 = { authorization: `Bearer ${login2.body.access_token}` };

  const anon = await call('/api/account/devices');
  check('visitor cannot list cameras', anon.status === 401, String(anon.status));
  const anonReg = await call('/api/account/devices', {
    method: 'POST', body: JSON.stringify({ serial: 'VA2609KTMHX4' }),
  });
  check('visitor cannot register a serial', anonReg.status === 401, String(anonReg.status));
  const anonOrders = await call('/api/account/orders');
  check('visitor cannot list orders', anonOrders.status === 401, String(anonOrders.status));

  const badToken = await call('/api/account/devices', {
    headers: { authorization: 'Bearer not-a-real-token' },
  });
  check('an absent or bad token is rejected', badToken.status === 401);

  const mine = await call('/api/account/devices', { headers: auth });
  check('customer lists own cameras', mine.status === 200 && Array.isArray(mine.body.data));

  const theirs = await call('/api/account/devices/VA2609NRWB2Z', { headers: auth });
  check("other customer's camera reads as not found", theirs.status === 404, String(theirs.status));

  const theirOrder = await call('/api/account/orders/VE-2026-0001', { headers: auth2 });
  check("other customer's order reads as not found", theirOrder.status === 404, String(theirOrder.status));

  const takeTheirs = await call('/api/account/devices', {
    method: 'POST', headers: auth, body: JSON.stringify({ serial: 'VA2609NRWB2Z' }),
  });
  check('registering an owned camera is refused with the exact copy',
    takeTheirs.status === 409 && takeTheirs.body.message === 'That camera is registered to someone else.',
    takeTheirs.body.message);

  const unknown = await call('/api/account/devices', {
    method: 'POST', headers: auth, body: JSON.stringify({ serial: 'VC2609ZZZZZZ' }),
  });
  check('unknown serial refused with the exact copy',
    unknown.body.message === 'We do not recognise that serial number.', unknown.body.message);

  const malformed = await call('/api/account/devices', {
    method: 'POST', headers: auth, body: JSON.stringify({ serial: 'NOPE' }),
  });
  check('malformed serial refused before lookup', malformed.status === 400, String(malformed.status));

  const blocked = await call('/api/account/devices', {
    method: 'POST', headers: auth, body: JSON.stringify({ serial: 'VC2609WJ3DKT' }),
  });
  check('blocked serial refused as blocked',
    blocked.status === 409 && /blocked/i.test(blocked.body.message), blocked.body.message);

  console.log('\n--- concurrency: one serial, two registrations');
  // Start from an unowned device whichever account happens to hold it, so the
  // race measures the single-winner rule rather than leftover state.
  await call('/api/account/devices/VA2609KTMHX4', { method: 'DELETE', headers: auth });
  await call('/api/account/devices/VA2609KTMHX4', { method: 'DELETE', headers: auth2 });
  const [r1, r2] = await Promise.all([
    call('/api/account/devices', { method: 'POST', headers: auth, body: JSON.stringify({ serial: 'VA2609KTMHX4' }) }),
    call('/api/account/devices', { method: 'POST', headers: auth2, body: JSON.stringify({ serial: 'VA2609KTMHX4' }) }),
  ]);
  const wins = [r1, r2].filter((r) => r.status === 201).length;
  const losses = [r1, r2].filter((r) => r.status === 409).length;
  check('exactly one registration wins', wins === 1, `${wins} won, ${losses} refused`);
  check('the loser gets a 409', losses === 1);

  console.log('\n--- concurrency: two checkouts for the last VELA-A1-YELLOW');
  // Two independent carts, each holding the single remaining yellow A1.
  async function loadedCart() {
    const jar = {};
    const own = async (path, init = {}) => {
      const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(jar.cookie ? { cookie: jar.cookie } : {}),
          ...(init.headers || {}),
        },
      });
      const sc = res.headers.get('set-cookie');
      if (sc) {
        const m = /vela_cart=([^;]+)/.exec(sc);
        if (m) jar.cookie = `vela_cart=${m[1]}`;
      }
      const t = await res.text();
      let b; try { b = JSON.parse(t); } catch { b = t; }
      return { status: res.status, body: b };
    };
    await own('/api/cart');
    await own('/api/cart/lines', {
      method: 'POST', body: JSON.stringify({ sku: 'VELA-A1-YELLOW', quantity: 1 }),
    });
    await own('/api/cart/delivery', {
      method: 'POST',
      body: JSON.stringify({
        email: 'race@example.com',
        shipping_address: {
          name: 'Race Tester', line1: '1 Test Way', city: 'Portland',
          region: 'OR', postal_code: '97204', country: 'US',
        },
        shipping_method: 'standard',
      }),
    });
    return own;
  }
  const before = await call('/api/products/flagship');
  const stockNow = before.body.variants?.find((v) => v.sku === 'VELA-A1-YELLOW')?.available ?? 0;

  if (stockNow !== 1) {
    console.log(`SKIP  last-unit race needs exactly 1 in stock, found ${stockNow}. ` +
      'Reset the database to run it.');
  } else {
    const cartA = await loadedCart();
    const cartB = await loadedCart();
    const [oa, ob] = await Promise.all([
      cartA('/api/orders', { method: 'POST', headers: { 'idempotency-key': `race-a-${Date.now()}` }, body: '{}' }),
      cartB('/api/orders', { method: 'POST', headers: { 'idempotency-key': `race-b-${Date.now()}` }, body: '{}' }),
    ]);
    const won = [oa, ob].filter((r) => r.status === 201).length;
    const refused = [oa, ob].filter((r) => r.status === 409).length;
    check('exactly one checkout wins the last unit', won === 1 && refused === 1,
      `${won} placed, ${refused} refused (${oa.status}/${ob.status})`);
    const stock = await call('/api/products/flagship');
    const yellow = stock.body.variants?.find((v) => v.sku === 'VELA-A1-YELLOW');
    check('available never goes below zero', yellow && yellow.available === 0,
      `available=${yellow?.available}`);
  }

  console.log('\n--- firmware');
  const manifest = await call('/api/firmware/manifest?model=compact');
  check('manifest entries newest build first',
    manifest.body.entries?.map((e) => e.build).join(',') === '720,700,611',
    manifest.body.entries?.map((e) => e.build).join(','));
  check('manifest carries every named field',
    manifest.body.entries?.every((e) =>
      e.version && e.build && e.channel && 'min_firmware' in e && e.min_app_version &&
      e.size_bytes && /^[0-9a-f]{64}$/.test(e.sha256)));

  console.log('\n--- flash session');
  const wrongProduct = await call('/api/flash-sessions', {
    method: 'POST', body: JSON.stringify({ serial: 'VC2609PVDA7Q', target_build: 240 }),
  });
  check('image for another product refused before it starts',
    wrongProduct.status === 400, `${wrongProduct.status} ${wrongProduct.body.message}`);

  const start = await call('/api/flash-sessions', {
    method: 'POST', body: JSON.stringify({ serial: 'VC2609PVDA7Q', target_build: 720 }),
  });
  check('session starts', start.status === 201 && start.body.state === 'started');
  const complete = await call(`/api/flash-sessions/${start.body.id}/complete`, {
    method: 'POST', body: JSON.stringify({ reported_version: '7.2' }),
  });
  check('completion records the version read back from the device',
    complete.body.reported_version === '7.2' && complete.body.firmware_version === '7.2',
    JSON.stringify(complete.body).slice(0, 160));

  console.log('\n--- releases');
  const releases = await call('/api/releases');
  check('archive orders by build descending, never by date',
    releases.body.data?.map((r) => r.version).join(',') === '2.0.0,1.4.4,1.4.3,1.4.2',
    releases.body.data?.map((r) => r.version).join(','));

  const paged = await call('/api/releases?page_size=2');
  check('first page holds two', paged.body.data?.length === 2 && paged.body.has_more === true);
  const next = await call(`/api/releases?page_size=2&cursor=${encodeURIComponent(paged.body.next_cursor)}`);
  check('keyset cursor returns the next page without repeating',
    next.body.data?.map((r) => r.version).join(',') === '1.4.3,1.4.2',
    next.body.data?.map((r) => r.version).join(','));

  console.log('\n--- errors carry a request id');
  const missing = await call('/api/products/nope');
  check('404 carries a request_id', !!missing.body.request_id, missing.body.request_id);
  check('404 carries a machine-readable code', missing.body.code === 'not_found');

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('smoke run threw:', err);
  process.exit(1);
});
