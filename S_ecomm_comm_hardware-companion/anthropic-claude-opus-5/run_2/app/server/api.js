import { Hono } from 'hono';
import { query } from './lib/db.js';
import { AppError, badRequest, conflict, notFound, unauthorized } from './lib/errors.js';
import { newRequestId, logRequest, logLine } from './lib/log.js';
import {
  hashPassword, verifyPassword, issueToken, revokeToken, bearerFrom,
  requireCustomer, optionalCustomer,
} from './lib/auth.js';
import { pageSizeFrom, decodeCursor, paginate } from './lib/pagination.js';
import { formatMoney, protectionRungFor } from './lib/money.js';
import {
  ensureCart, cartByToken, readCart, parseQuantity, variantBySku,
  shippingMethods, shippingMethod, CART_COOKIE, createCart,
} from './lib/cart.js';
import {
  placeOrder, orderByNumber, orderByIdempotencyKey, orderLines, orderSerials,
  serialiseOrder, requireReadableOrder, orderChip,
} from './lib/orders.js';
import {
  deviceBySerial, decorateDevice, registerDevice, releaseDevice, renameDevice,
  ownedDevice, startFlashSession, completeFlashSession, failFlashSession,
  latestGeneralFirmware,
} from './lib/devices.js';
import { isValidSerial, normaliseSerial } from './lib/serial.js';
import { healthy as billingHealthy } from './lib/killbill.js';

export const api = new Hono().basePath('/api');

/* ---------------------------------------------------------------- plumbing */

api.use('*', async (c, next) => {
  const requestId = c.req.header('x-request-id') || newRequestId();
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);
  const started = performance.now();
  try {
    await next();
  } finally {
    logRequest({
      method: c.req.method,
      route: new URL(c.req.url).pathname,
      status: c.res?.status ?? 500,
      ms: performance.now() - started,
      requestId,
    });
  }
});

api.onError((err, c) => {
  const requestId = c.get('requestId') || newRequestId();
  if (err instanceof AppError) {
    return c.json(
      { code: err.code, message: err.message, request_id: requestId, ...err.extra },
      err.status,
    );
  }
  logLine({
    level: 'error', msg: 'unhandled', request_id: requestId,
    route: new URL(c.req.url).pathname, error: String(err?.stack || err),
  });
  return c.json(
    {
      code: 'internal_error',
      message: `Something went wrong at our end. Reference ${requestId}.`,
      request_id: requestId,
    },
    500,
  );
});

api.notFound((c) =>
  c.json(
    { code: 'not_found', message: 'That page does not exist.', request_id: c.get('requestId') },
    404,
  ));

const cartCookie = (token) =>
  `${CART_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly`;

function cartTokenFrom(c) {
  const header = c.req.header('x-cart-token');
  if (header) return header;
  const cookie = c.req.header('cookie') || '';
  const m = new RegExp(`(?:^|;\\s*)${CART_COOKIE}=([^;]+)`).exec(cookie);
  return m ? decodeURIComponent(m[1]) : null;
}

async function jsonBody(c) {
  try {
    return await c.req.json();
  } catch {
    throw badRequest('invalid_body', 'That did not work.');
  }
}

/* ------------------------------------------------------------------ health */

api.get('/health', async (c) => {
  await query('SELECT 1');
  return c.json({ status: 'ok' });
});

api.get('/health/deep', async (c) => {
  const [{ rows }, billing] = await Promise.all([query('SELECT 1 AS ok'), billingHealthy()]);
  return c.json({ status: 'ok', database: rows[0].ok === 1, billing });
});

/* -------------------------------------------------------------------- auth */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const publicCustomer = (c) => ({ email: c.email, name: c.name });

api.post('/auth/signup', async (c) => {
  const body = await jsonBody(c);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const name = String(body.name ?? '').trim();
  if (!EMAIL_RE.test(email)) throw badRequest('email_required', 'Email is required.');
  if (password.length < 8) {
    throw badRequest('password_too_short', 'Password must be at least 8 characters.');
  }
  if (!name) throw badRequest('name_required', 'Name is required.');

  const { rows: existing } = await query('SELECT id FROM customer WHERE lower(email)=lower($1)', [email]);
  // Signup refuses an address already registered.
  if (existing.length) {
    throw conflict('email_taken', 'That address already has an account. Sign in instead.');
  }

  const { rows } = await query(
    'INSERT INTO customer (email,name,password_hash,status) VALUES ($1,$2,$3,$4) RETURNING *',
    [email, name, hashPassword(password), 'active'],
  );
  const { token } = await issueToken(rows[0].id);
  return c.json({ access_token: token, customer: publicCustomer(rows[0]) }, 201);
});

api.post('/auth/login', async (c) => {
  const body = await jsonBody(c);
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  // Email is compared case-insensitively.
  const { rows } = await query('SELECT * FROM customer WHERE lower(email)=lower($1)', [email]);
  const customer = rows[0];
  if (!customer || customer.status !== 'active' || !verifyPassword(password, customer.password_hash)) {
    throw unauthorized('That email and password do not match an account.');
  }
  const { token } = await issueToken(customer.id);
  return c.json({ access_token: token, customer: publicCustomer(customer) });
});

api.get('/auth/me', async (c) => {
  const customer = await requireCustomer(c);
  return c.json({ customer: publicCustomer(customer) });
});

api.post('/auth/logout', async (c) => {
  await revokeToken(bearerFrom(c));
  return c.json({ ok: true });
});

/* --------------------------------------------------------------- catalogue */

function availabilityFor(product, variants) {
  if (product.status === 'discontinued') return { state: 'discontinued', label: 'Discontinued' };
  const total = variants.reduce((s, v) => s + v.available, 0);
  if (total <= 0) return { state: 'sold_out', label: 'Sold out' };
  if (total <= 10) return { state: 'low', label: `Only ${total} left` };
  return { state: 'available', label: 'Available' };
}

async function productRows({ handles = null } = {}) {
  const { rows } = await query(
    `SELECT p.id, p.handle, p.title, p.subtitle, p.kind, p.status, p.support_until, p.position,
            v.id AS variant_id, v.sku, v.option_value, v.price_minor, v.position AS variant_position,
            COALESCE(i.available,0) AS available, COALESCE(i.committed,0) AS committed
       FROM product p
       JOIN variant v ON v.product_id=p.id
       LEFT JOIN inventory_level i ON i.variant_id=v.id
      WHERE p.kind <> 'protection' ${handles ? 'AND p.handle = ANY($1)' : ''}
      ORDER BY p.position, p.id, v.position, v.id`,
    handles ? [handles] : [],
  );
  const byId = new Map();
  for (const r of rows) {
    if (!byId.has(r.id)) {
      byId.set(r.id, {
        id: r.id, handle: r.handle, title: r.title, subtitle: r.subtitle, kind: r.kind,
        status: r.status, support_until: r.support_until, position: r.position, variants: [],
      });
    }
    byId.get(r.id).variants.push({
      sku: r.sku, option_value: r.option_value, title: r.option_value,
      price_minor: r.price_minor, available: r.available, committed: r.committed,
    });
  }
  return [...byId.values()].map((p) => {
    const prices = p.variants.map((v) => v.price_minor);
    const min = Math.min(...prices);
    return {
      ...p,
      price_minor: min,
      price_from: new Set(prices).size > 1,
      price_display: `${new Set(prices).size > 1 ? 'From ' : ''}${formatMoney(min)}`,
      availability: availabilityFor(p, p.variants),
    };
  });
}

api.get('/products', async (c) => {
  const pageSize = pageSizeFrom(c);
  const cursor = decodeCursor(c.req.query('cursor'));
  const all = await productRows();
  // Ordered by the editorial position and never by price or name.
  const start = cursor ? all.findIndex((p) => p.position > cursor.k) : 0;
  const window = start < 0 ? [] : all.slice(start, start + pageSize + 1);
  const page = paginate(window, pageSize, (p) => p.position);
  return c.json({
    ...page,
    data: page.data.map(({ id, ...p }) => p),
  });
});

api.get('/products/:handle', async (c) => {
  const [product] = await productRows({ handles: [c.req.param('handle')] });
  if (!product) throw notFound('That product does not exist.');
  const { rows: blocks } = await query(
    'SELECT kind, position, payload FROM product_block WHERE product_id=$1 ORDER BY position',
    [product.id],
  );
  // A parameter naming a variant that does not exist renders the default and
  // drops the parameter without comment.
  const asked = c.req.query('variant');
  const selected =
    product.variants.find((v) => v.sku === asked) ?? product.variants[0];
  const { id, ...rest } = product;
  return c.json({ ...rest, blocks, selected_sku: selected?.sku ?? null });
});

/* -------------------------------------------------------------------- cart */

async function respondCart(c, cart, status = 200) {
  const view = await readCart(cart);
  c.header('set-cookie', cartCookie(cart.token));
  return c.json(view, status);
}

api.get('/cart', async (c) => {
  const customer = await optionalCustomer(c);
  const cart = await ensureCart(cartTokenFrom(c), customer?.id ?? null);
  return respondCart(c, cart);
});

api.post('/cart/lines', async (c) => {
  const body = await jsonBody(c);
  const customer = await optionalCustomer(c);
  const cart = await ensureCart(cartTokenFrom(c), customer?.id ?? null);
  const quantity = parseQuantity(body.quantity ?? 1);
  const variant = await variantBySku(String(body.sku ?? ''));
  if (variant.kind === 'protection') {
    throw badRequest('not_purchasable', 'That is not sold on its own.');
  }
  if (variant.product_status === 'discontinued') {
    throw badRequest('discontinued', 'We no longer sell this.');
  }
  if (variant.inventory_policy === 'deny' && variant.available < quantity) {
    throw conflict('out_of_stock',
      variant.available === 0 ? 'That is sold out.' : `Only ${variant.available} left.`);
  }
  // One line per cart and variant. The unit price is snapshotted at add time.
  await query(
    `INSERT INTO cart_line (cart_id,variant_id,quantity,unit_price_minor)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (cart_id,variant_id) DO UPDATE
       SET quantity = LEAST(10, cart_line.quantity + EXCLUDED.quantity)`,
    [cart.id, variant.id, quantity, variant.price_minor],
  );
  await query('UPDATE cart SET updated_at=now() WHERE id=$1', [cart.id]);
  return respondCart(c, cart, 201);
});

api.patch('/cart/lines/:id', async (c) => {
  const body = await jsonBody(c);
  const cart = await cartByToken(cartTokenFrom(c));
  if (!cart) throw notFound('Your cart is empty.');
  const quantity = parseQuantity(body.quantity);
  const { rows } = await query(
    `SELECT cl.*, v.inventory_policy, COALESCE(i.available,0) AS available, p.title
       FROM cart_line cl JOIN variant v ON v.id=cl.variant_id
       JOIN product p ON p.id=v.product_id
       LEFT JOIN inventory_level i ON i.variant_id=v.id
      WHERE cl.id=$1 AND cl.cart_id=$2`,
    [c.req.param('id'), cart.id],
  );
  const line = rows[0];
  if (!line) throw notFound('That line is not in your cart.');
  if (line.inventory_policy === 'deny' && line.available < quantity) {
    throw conflict('out_of_stock', `Only ${line.available} of ${line.title} left.`);
  }
  await query('UPDATE cart_line SET quantity=$2 WHERE id=$1', [line.id, quantity]);
  await query('UPDATE cart SET updated_at=now() WHERE id=$1', [cart.id]);
  return respondCart(c, cart);
});

api.delete('/cart/lines/:id', async (c) => {
  const cart = await cartByToken(cartTokenFrom(c));
  if (!cart) throw notFound('Your cart is empty.');
  await query('DELETE FROM cart_line WHERE id=$1 AND cart_id=$2', [c.req.param('id'), cart.id]);
  await query('UPDATE cart SET updated_at=now() WHERE id=$1', [cart.id]);
  return respondCart(c, cart);
});

api.post('/cart/protection', async (c) => {
  const body = await jsonBody(c);
  const cart = await ensureCart(cartTokenFrom(c));
  await query('UPDATE cart SET protection=$2, updated_at=now() WHERE id=$1', [
    cart.id, !!body.enabled,
  ]);
  const fresh = await cartByToken(cart.token);
  return respondCart(c, fresh);
});

api.get('/shipping-methods', async (c) => {
  const rows = await shippingMethods();
  return c.json({
    data: rows.map((r) => ({
      code: r.code, label: r.label, price_minor: r.price_minor,
      price_display: formatMoney(r.price_minor), window: r.window_text,
    })),
    next_cursor: null,
    has_more: false,
  });
});

/** Every entered value survives a back navigation and a reload. */
api.post('/cart/delivery', async (c) => {
  const body = await jsonBody(c);
  const cart = await ensureCart(cartTokenFrom(c));
  const draft = { ...(cart.draft || {}) };

  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (email && !EMAIL_RE.test(email)) throw badRequest('invalid_email', 'Email is required.');
    draft.email = email;
  }
  if (body.marketing_consent !== undefined) draft.marketing_consent = !!body.marketing_consent;
  if (body.shipping_address !== undefined) {
    const a = body.shipping_address || {};
    draft.shipping_address = {
      name: String(a.name ?? '').trim(),
      line1: String(a.line1 ?? '').trim(),
      line2: String(a.line2 ?? '').trim(),
      city: String(a.city ?? '').trim(),
      region: String(a.region ?? '').trim(),
      postal_code: String(a.postal_code ?? '').trim(),
      country: String(a.country ?? 'US').trim().toUpperCase(),
      phone: String(a.phone ?? '').trim(),
    };
  }
  if (body.shipping_method !== undefined) {
    const code = String(body.shipping_method || '');
    if (code) {
      const m = await shippingMethod(code);
      if (!m) throw badRequest('invalid_shipping_method', 'Choose a delivery method.');
    }
    draft.shipping_method = code || null;
  }

  await query('UPDATE cart SET draft=$2, email=$3, updated_at=now() WHERE id=$1', [
    cart.id, JSON.stringify(draft), draft.email ?? cart.email,
  ]);
  const fresh = await cartByToken(cart.token);
  return respondCart(c, fresh);
});

/* ------------------------------------------------------------------ orders */

api.post('/orders', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const customer = await optionalCustomer(c);
  const cart = await cartByToken(cartTokenFrom(c));
  const idempotencyKey =
    c.req.header('idempotency-key') || c.req.header('Idempotency-Key') || body.idempotency_key || null;

  // A replay after the cart was cleared, or from a browser that lost the cart
  // cookie, still returns the original order rather than a new one.
  if (idempotencyKey) {
    const existing = await orderByIdempotencyKey(idempotencyKey);
    if (existing) {
      return c.json({ ...serialiseOrder(existing.order, existing.lines), replayed: true });
    }
  }

  if (!cart) throw badRequest('empty_cart', 'Your cart is empty.');

  const cartView = await readCart(cart);
  const result = await placeOrder({
    cart,
    cartView,
    customer,
    idempotencyKey,
    expectedTotalMinor: body.expected_total_minor ?? null,
  });

  return c.json(
    {
      ...serialiseOrder(result.order, result.lines),
      ...(result.accessToken ? { access_token: result.accessToken } : {}),
      replayed: !!result.replayed,
    },
    result.replayed ? 200 : 201,
  );
});

api.get('/orders/:number', async (c) => {
  const customer = await optionalCustomer(c);
  const accessToken = c.req.query('access_token') || c.req.header('x-order-token') || null;
  const found = await orderByNumber(c.req.param('number'));
  const { order, lines } = requireReadableOrder(found, { accessToken, customer });
  return c.json({
    ...serialiseOrder(order, lines, { chip: orderChip(order) }),
    serials: await orderSerials(order.id),
  });
});

/* --------------------------------------------------------- account: orders */

api.get('/account/orders', async (c) => {
  const customer = await requireCustomer(c);
  const pageSize = pageSizeFrom(c);
  const cursor = decodeCursor(c.req.query('cursor'));
  // Keyset over the order id, which is stable and monotonic.
  const { rows } = await query(
    `SELECT * FROM "order"
      WHERE customer_id=$1 ${cursor ? 'AND id < $3' : ''}
      ORDER BY id DESC LIMIT $2`,
    cursor ? [customer.id, pageSize + 1, cursor.k] : [customer.id, pageSize + 1],
  );
  const page = paginate(rows, pageSize, (r) => r.id);
  const data = await Promise.all(
    page.data.map(async (o) => {
      const lines = await orderLines(o.id);
      return {
        ...serialiseOrder(o, lines, { chip: orderChip(o) }),
        summary_line:
          lines.length > 1
            ? `${lines[0].title_snapshot} and ${lines.length - 1} more`
            : (lines[0]?.title_snapshot ?? ''),
      };
    }),
  );
  return c.json({ data, next_cursor: page.next_cursor, has_more: page.has_more });
});

api.get('/account/orders/:number', async (c) => {
  const customer = await requireCustomer(c);
  const found = await orderByNumber(c.req.param('number'));
  const { order, lines } = requireReadableOrder(found, { customer });
  return c.json({
    ...serialiseOrder(order, lines, { chip: orderChip(order) }),
    serials: await orderSerials(order.id),
  });
});

/* -------------------------------------------------------- account: devices */

api.get('/account/devices', async (c) => {
  const customer = await requireCustomer(c);
  const pageSize = pageSizeFrom(c);
  const cursor = decodeCursor(c.req.query('cursor'));
  const { rows } = await query(
    `SELECT d.*, p.title AS model, p.handle, v.option_value
       FROM device_ownership o
       JOIN device d ON d.id=o.device_id
       JOIN product p ON p.id=d.product_id
       JOIN variant v ON v.id=d.variant_id
      WHERE o.customer_id=$1 AND o.released_at IS NULL ${cursor ? 'AND d.id > $3' : ''}
      ORDER BY d.id ASC LIMIT $2`,
    cursor ? [customer.id, pageSize + 1, cursor.k] : [customer.id, pageSize + 1],
  );
  const page = paginate(rows, pageSize, (r) => r.id);
  const data = await Promise.all(page.data.map(decorateDevice));
  return c.json({ data, next_cursor: page.next_cursor, has_more: page.has_more });
});

api.post('/account/devices', async (c) => {
  const customer = await requireCustomer(c);
  const body = await jsonBody(c);
  await registerDevice(body.serial, customer.id);
  const device = await deviceBySerial(body.serial);
  return c.json(await decorateDevice(device), 201);
});

api.get('/account/devices/:serial', async (c) => {
  const customer = await requireCustomer(c);
  const device = await ownedDevice(c.req.param('serial'), customer.id);
  return c.json(await decorateDevice(device));
});

api.patch('/account/devices/:serial', async (c) => {
  const customer = await requireCustomer(c);
  const body = await jsonBody(c);
  await renameDevice(c.req.param('serial'), customer.id, body.nickname);
  const device = await ownedDevice(c.req.param('serial'), customer.id);
  return c.json(await decorateDevice(device));
});

api.delete('/account/devices/:serial', async (c) => {
  const customer = await requireCustomer(c);
  const device = await ownedDevice(c.req.param('serial'), customer.id);
  await releaseDevice(c.req.param('serial'), customer.id);
  const after = await deviceBySerial(device.serial);
  return c.json({ ...(await decorateDevice(after)), released: true });
});

/* ---------------------------------------------------------------- releases */

const serialiseRelease = (r) => ({
  version: r.version, build: r.build, released_on: r.released_on,
  channel: r.channel, artifact_name: r.artifact_name, size_bytes: Number(r.size_bytes),
  sha256: r.sha256, description: r.description, notes: r.notes,
});

api.get('/releases', async (c) => {
  const pageSize = pageSizeFrom(c);
  const cursor = decodeCursor(c.req.query('cursor'));
  // Sort by build descending; released_on is not a sort key, so 1.4.3 and 1.4.2
  // sharing a date still order deterministically.
  const { rows } = await query(
    `SELECT * FROM app_release ${cursor ? 'WHERE build < $2' : ''}
      ORDER BY build DESC LIMIT $1`,
    cursor ? [pageSize + 1, cursor.k] : [pageSize + 1],
  );
  const page = paginate(rows, pageSize, (r) => r.build);
  return c.json({
    data: page.data.map(serialiseRelease),
    next_cursor: page.next_cursor,
    has_more: page.has_more,
  });
});

api.get('/releases/:version', async (c) => {
  const { rows } = await query('SELECT * FROM app_release WHERE version=$1', [c.req.param('version')]);
  if (!rows.length) throw notFound('That release does not exist.');
  return c.json(serialiseRelease(rows[0]));
});

/* ---------------------------------------------------------------- firmware */

/** The manifest is served for one product at a time. */
api.get('/firmware/manifest', async (c) => {
  const model = c.req.query('model') || 'compact';
  const { rows: pr } = await query(
    `SELECT * FROM product WHERE handle=$1 OR lower(title)=lower($1)`, [model],
  );
  const product = pr[0];
  if (!product) throw notFound('We do not make that model.');

  const opted = String(c.req.query('channels') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const channels = ['general', ...opted];

  const { rows } = await query(
    `SELECT * FROM firmware WHERE product_id=$1 AND channel = ANY($2)
      ORDER BY build DESC`,
    [product.id, channels],
  );
  return c.json({
    product: { handle: product.handle, title: product.title },
    generated_at: new Date().toISOString(),
    entries: rows.map((f) => ({
      version: f.version, build: f.build, channel: f.channel,
      min_firmware: f.min_firmware, min_app_version: f.min_app_version,
      size_bytes: Number(f.size_bytes), sha256: f.sha256, released_on: f.released_on,
    })),
  });
});

/** The installer looks a camera up before it offers an image. */
api.get('/devices/:serial/firmware', async (c) => {
  const serial = c.req.param('serial');
  if (!isValidSerial(serial)) {
    throw badRequest('invalid_serial', 'We do not recognise that serial number.');
  }
  const device = await deviceBySerial(serial);
  if (!device) throw notFound('We do not recognise that serial number.');
  const latest = await latestGeneralFirmware(device.product_id);
  const { rows } = await query(
    `SELECT * FROM firmware WHERE product_id=$1 AND channel='general' ORDER BY build DESC`,
    [device.product_id],
  );
  return c.json({
    // Ownership and warranty are not conditions of repair.
    serial: device.serial,
    model: device.model,
    firmware_version: device.firmware_version,
    status: device.status,
    recommended: latest ? { version: latest.version, build: latest.build } : null,
    entries: rows.map((f) => ({
      version: f.version, build: f.build, channel: f.channel,
      min_firmware: f.min_firmware, min_app_version: f.min_app_version,
      size_bytes: Number(f.size_bytes), sha256: f.sha256,
      eligible: !f.min_firmware
        || (!!device.firmware_version
            && compareVersionsSafe(device.firmware_version, f.min_firmware) >= 0),
    })),
  });
});

function compareVersionsSafe(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/* --------------------------------------------------------- flash  sessions */

api.post('/flash-sessions', async (c) => {
  const body = await jsonBody(c);
  const { session, device, image } = await startFlashSession({
    serial: body.serial,
    targetBuild: body.target_build,
    optedChannels: Array.isArray(body.channels) ? body.channels : [],
  });
  return c.json({
    id: session.id,
    state: session.state,
    serial: device.serial,
    model: device.model,
    target_version: image.version,
    target_build: image.build,
    size_bytes: Number(image.size_bytes),
    started_at: session.started_at,
  }, 201);
});

api.post('/flash-sessions/:id/complete', async (c) => {
  const body = await jsonBody(c);
  // Records the version read back from the device, never the version requested.
  const { session, device } = await completeFlashSession(c.req.param('id'), body.reported_version);
  return c.json({
    id: session.id,
    state: session.state,
    reported_version: session.reported_version,
    serial: device.serial,
    firmware_version: device.firmware_version,
    ended_at: session.ended_at,
  });
});

api.post('/flash-sessions/:id/fail', async (c) => {
  const body = await jsonBody(c);
  const session = await failFlashSession(c.req.param('id'), body.reason);
  return c.json({
    id: session.id,
    state: session.state,
    failure_reason: session.failure_reason,
    ended_at: session.ended_at,
  });
});

export default api;
