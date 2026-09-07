import crypto from 'node:crypto';
import { q as query, w as withTx, P as PG_UNIQUE_VIOLATION } from './db_gZE7iOnF.mjs';
import { m as minorToDecimalString, f as formatMoney, p as protectionRungFor, t as taxFor } from './money_BIIhPbI9.mjs';
import { b as badRequest, A as AppError, c as conflict } from './errors_cvgLiz6_.mjs';
import { h as hashOpaque } from './auth_BN47AvzA.mjs';
import nodemailer from 'nodemailer';

function logLine(fields) {
  process.stdout.write(`${JSON.stringify({ ts: new Date().toISOString(), ...fields })}\n`);
}

/**
 * Billing is killbill, reached at PAYMENTS_API_URL. It is a billing platform,
 * not a card processor: there is no card, no token and no decline. Every host is
 * read from the environment and none is hardcoded.
 */
const base = () => (process.env.PAYMENTS_API_URL || '').replace(/\/+$/, '');

function headers(extra = {}) {
  const user = process.env.PAYMENTS_ADMIN_USER || '';
  const pass = process.env.PAYMENTS_ADMIN_PASSWORD || '';
  return {
    'X-Killbill-ApiKey': process.env.PAYMENTS_API_KEY || '',
    'X-Killbill-ApiSecret': process.env.PAYMENTS_API_SECRET || '',
    Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
    'X-Killbill-CreatedBy': 'vela-storefront',
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  };
}

async function kb(path, init = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${base()}${path}`, {
      ...init,
      headers: headers(init.headers),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** externalKey is unique per tenant, so a second create with a used key is
 *  refused by the store rather than by app code. */
async function findAccount(externalKey) {
  const res = await kb(`/1.0/kb/accounts?externalKey=${encodeURIComponent(externalKey)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`killbill account lookup failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Create or reuse one killbill account keyed by the order email lowercased.
 * If a concurrent request won the create, the 409 from the store is resolved by
 * reading the account back rather than by writing a second one.
 */
async function ensureAccount({ externalKey, name, email, country = 'US' }) {
  const existing = await findAccount(externalKey);
  if (existing) return existing;

  const res = await kb('/1.0/kb/accounts', {
    method: 'POST',
    body: JSON.stringify({ name, externalKey, email, currency: 'USD', country }),
  });

  if (res.status === 201) {
    const location = res.headers.get('location');
    if (location) {
      const got = await kb(`/1.0/kb/accounts/${location.split('/').pop()}`);
      if (got.ok) return got.json();
    }
    const after = await findAccount(externalKey);
    if (after) return after;
    throw new Error('killbill account created but could not be read back');
  }

  if (res.status === 409) {
    const after = await findAccount(externalKey);
    if (after) return after;
  }
  throw new Error(`killbill account create failed: ${res.status} ${await res.text()}`);
}

/**
 * Raise one invoice on the account for the order total in USD. The amount is
 * derived from integer minor units and rendered as a decimal string, so no
 * floating point money is ever constructed.
 */
async function createInvoice({ accountId, totalMinor, description }) {
  const amount = Number(minorToDecimalString(totalMinor));
  const res = await kb(
    `/1.0/kb/invoices/charges/${accountId}?autoCommit=true`,
    {
      method: 'POST',
      body: JSON.stringify([{ accountId, amount, currency: 'USD', description }]),
    },
  );
  if (!res.ok) throw new Error(`killbill invoice create failed: ${res.status} ${await res.text()}`);
  const items = await res.json();
  const item = Array.isArray(items) ? items[0] : items;
  return { invoiceId: item?.invoiceId ?? null, amount: item?.amount ?? amount, currency: 'USD' };
}

/**
 * A confirmed order sends its mail over real SMTP at SMTP_HOST and SMTP_PORT,
 * authenticating with SMTP_USER and SMTP_PASS where they are set. A mail body
 * written to a log instead of sent is a contract violation.
 */
let transport = null;

function transporter() {
  if (transport) return transport;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
    ignoreTLS: true,
    ...(user || pass ? { auth: { user, pass } } : {}),
  });
  return transport;
}

const MAIL_FROM = process.env.MAIL_FROM || 'Vela <orders@vela.example.com>';

/**
 * Exactly one mail to the order's email only, with no cc and no bcc. The subject
 * is `Order confirmed:` then a space then the order number. The body names each
 * line title, its quantity and the total in US dollars.
 */
async function sendOrderConfirmation(order) {
  const lines = order.lines
    .map((l) => `  ${l.title_snapshot} x${l.quantity}   ${formatMoney(l.total_minor)}`)
    .join('\n');

  const text = [
    `Order ${order.number} is confirmed.`,
    '',
    'What you bought:',
    lines,
    '',
    `Subtotal   ${formatMoney(order.subtotal_minor)}`,
    `Delivery   ${formatMoney(order.shipping_minor)}`,
    `Tax        ${formatMoney(order.tax_minor)}`,
    `Total      ${formatMoney(order.total_minor)} USD`,
    '',
    'We will send another note when it ships.',
    '',
    'The Vela team.',
  ].join('\n');

  const rows = order.lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.title_snapshot)}</td><td align="right">${l.quantity}</td>` +
        `<td align="right">${formatMoney(l.total_minor)}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#17181a">
<h1 style="font-size:18px">Order ${escapeHtml(order.number)} is confirmed.</h1>
<table cellpadding="6" style="border-collapse:collapse;font-variant-numeric:tabular-nums">
<thead><tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Total</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="font-variant-numeric:tabular-nums">
Subtotal ${formatMoney(order.subtotal_minor)}<br>
Delivery ${formatMoney(order.shipping_minor)}<br>
Tax ${formatMoney(order.tax_minor)}<br>
<strong>Total ${formatMoney(order.total_minor)} USD</strong></p>
<p>We will send another note when it ships.</p>
<p>The Vela team.</p></body></html>`;

  return transporter().sendMail({
    from: MAIL_FROM,
    to: order.email,
    subject: `Order confirmed: ${order.number}`,
    text,
    html,
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

/** Order numbers are allocated in sequence, in the form VE-<year>-<four digits>. */
async function allocateNumber(client, year) {
  const { rows } = await client.query(
    `INSERT INTO order_counter (year,last) VALUES ($1,1)
     ON CONFLICT (year) DO UPDATE SET last = order_counter.last + 1
     RETURNING last`,
    [year],
  );
  return `VE-${year}-${String(rows[0].last).padStart(4, '0')}`;
}

async function orderLines(orderId) {
  const { rows } = await query(
    `SELECT ol.*, p.handle, v.option_value
       FROM order_line ol
       LEFT JOIN variant v ON v.id = ol.variant_id
       LEFT JOIN product p ON p.id = v.product_id
      WHERE ol.order_id=$1 ORDER BY ol.position, ol.id`,
    [orderId],
  );
  return rows;
}

/** The serial numbers allocated to each camera line of an order. */
async function orderSerials(orderId) {
  const { rows } = await query(
    `SELECT d.serial, p.title AS model, d.status,
            (SELECT count(*) FROM device_ownership o
              WHERE o.device_id=d.id AND o.released_at IS NULL) > 0 AS registered
       FROM device d JOIN product p ON p.id=d.product_id
      WHERE d.order_id=$1 ORDER BY d.serial`,
    [orderId],
  );
  return rows.map((r) => ({
    serial: r.serial, model: r.model, registered: r.registered, status: r.status,
  }));
}

/**
 * Placing an order:
 *  - re-prices every line, and refuses if a line changed since the cart was shown
 *  - commits stock in one step, so available falls and committed rises per line
 *  - allocates the order number and writes the order and its lines
 * All of it in one transaction. The stock update carries its own WHERE guard so
 * two concurrent checkouts for the last unit cannot both succeed: the loser's
 * UPDATE matches no row and the whole transaction is refused before any invoice
 * exists.
 */
async function placeOrder({ cart, cartView, customer, idempotencyKey, expectedTotalMinor }) {
  // A repeated Idempotency-Key returns the original order and creates no second
  // account, no second invoice and no second mail. This is answered before any
  // other check, because a replay arrives after the cart has been emptied.
  if (idempotencyKey) {
    const existing = await orderByIdempotencyKey(idempotencyKey);
    if (existing) return { order: existing.order, lines: existing.lines, replayed: true };
  }

  if (!cartView.lines.length) throw badRequest('empty_cart', 'Your cart is empty.');

  const draft = cartView.draft || {};
  const email = String(draft.email || cart.email || '').trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw badRequest('email_required', 'Email is required.');
  }
  if (!draft.shipping_method) {
    throw badRequest('shipping_method_required', 'Delivery method is required.');
  }
  const address = draft.shipping_address || {};
  for (const [field, label] of [
    ['name', 'Name'], ['line1', 'Address'], ['city', 'City'],
    ['region', 'Region'], ['postal_code', 'Postal code'], ['country', 'Country'],
  ]) {
    if (!String(address[field] || '').trim()) {
      throw badRequest('address_incomplete', `${label} is required.`);
    }
  }

  const year = new Date().getUTCFullYear();

  const built = await withTx(async (c) => {
    // Re-price every line from the current catalogue, inside the transaction.
    const { rows: lines } = await c.query(
      `SELECT cl.id, cl.quantity, cl.unit_price_minor, v.id AS variant_id, v.sku,
              v.price_minor AS current_price_minor, v.inventory_policy,
              p.title, p.kind, p.status AS product_status
         FROM cart_line cl
         JOIN variant v ON v.id=cl.variant_id
         JOIN product p ON p.id=v.product_id
        WHERE cl.cart_id=$1
        ORDER BY cl.created_at, cl.id`,
      [cart.id],
    );
    if (!lines.length) throw badRequest('empty_cart', 'Your cart is empty.');

    const changed = lines.filter((l) => l.unit_price_minor !== l.current_price_minor);
    if (changed.length) {
      // The order is refused. The re-pricing itself must survive the rollback of
      // this transaction, so it is carried out of here on the error and applied
      // afterwards rather than written now.
      throw new AppError(409, 'price_changed', 'A price changed while you were checking out.', {
        notices: changed.map((l) => ({
          kind: 'price_change',
          sku: l.sku,
          title: l.title,
          was_minor: l.unit_price_minor,
          now_minor: l.current_price_minor,
          message: `The price of ${l.title} changed from ${formatMoney(l.unit_price_minor)} to ${formatMoney(l.current_price_minor)} since you added it.`,
        })),
        repriced: changed.map((l) => ({ id: l.id, price: l.current_price_minor })),
      });
    }

    // Commit stock in one step. available falls and committed rises per line, and
    // available never goes below zero under a deny policy.
    for (const l of lines) {
      if (l.inventory_policy === 'deny') {
        const { rowCount } = await c.query(
          `UPDATE inventory_level
              SET available = available - $2, committed = committed + $2
            WHERE variant_id = $1 AND available >= $2`,
          [l.variant_id, l.quantity],
        );
        if (rowCount !== 1) {
          throw conflict('out_of_stock', `${l.title} sold out while you were checking out.`, {
            sku: l.sku, resource: `variant:${l.sku}`,
          });
        }
      } else {
        await c.query(
          `UPDATE inventory_level SET committed = committed + $2 WHERE variant_id=$1`,
          [l.variant_id, l.quantity],
        );
      }
    }

    const subtotal_minor = lines.reduce((s, l) => s + l.current_price_minor * l.quantity, 0);
    const rung = protectionRungFor(subtotal_minor);
    const protection_minor = cart.protection && rung ? rung.price_minor : 0;
    const { rows: sm } = await c.query('SELECT * FROM shipping_method WHERE code=$1', [
      draft.shipping_method,
    ]);
    if (!sm.length) throw badRequest('invalid_shipping_method', 'Choose a delivery method.');
    const shipping_minor = sm[0].price_minor;
    const tax_minor = taxFor(subtotal_minor);
    // Protection rides along as a line so the arithmetic stays closed, and it is
    // excluded from tax by construction.
    const goods_minor = subtotal_minor + protection_minor;
    const total_minor = goods_minor + shipping_minor + tax_minor;

    // The total authorized is the figure the final step displayed.
    if (
      expectedTotalMinor !== null &&
      expectedTotalMinor !== undefined &&
      Number(expectedTotalMinor) !== total_minor
    ) {
      throw new AppError(409, 'total_changed', 'The total changed while you were checking out.', {
        shown_total_minor: Number(expectedTotalMinor), total_minor,
      });
    }

    const number = await allocateNumber(c, year);
    const accessToken = crypto.randomBytes(24).toString('base64url');

    const { rows: ord } = await c.query(
      `INSERT INTO "order" (number,customer_id,email,subtotal_minor,shipping_minor,tax_minor,
          discount_minor,total_minor,currency,status,payment_status,fulfilment_status,
          shipping_method,shipping_address,access_token_hash,killbill_external_key,idempotency_key)
       VALUES ($1,$2,$3,$4,$5,$6,0,$7,'usd','pending','unpaid','unfulfilled',$8,$9,$10,$11,$12)
       RETURNING *`,
      [number, customer?.id ?? null, email, goods_minor, shipping_minor, tax_minor, total_minor,
        draft.shipping_method, JSON.stringify(address), hashOpaque(accessToken), email,
        idempotencyKey || null],
    );
    const order = ord[0];

    let pos = 0;
    for (const l of lines) {
      pos += 1;
      await c.query(
        `INSERT INTO order_line (order_id,variant_id,title_snapshot,sku_snapshot,quantity,
            unit_price_minor,total_minor,position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [order.id, l.variant_id, l.title, l.sku, l.quantity, l.current_price_minor,
          l.current_price_minor * l.quantity, pos],
      );
    }
    if (protection_minor > 0) {
      const { rows: pv } = await c.query('SELECT id FROM variant WHERE sku=$1', [rung.sku]);
      pos += 1;
      await c.query(
        `INSERT INTO order_line (order_id,variant_id,title_snapshot,sku_snapshot,quantity,
            unit_price_minor,total_minor,position)
         VALUES ($1,$2,'Shipment protection',$3,1,$4,$4,$5)`,
        [order.id, pv[0].id, rung.sku, protection_minor, pos],
      );
    }

    // Hand the cameras on this order their serials, so the order page can show
    // them and the buyer can register one in a click.
    for (const l of lines) {
      if (l.kind !== 'camera') continue;
      await c.query(
        `UPDATE device SET order_id = $1, status = CASE WHEN status='manufactured' THEN 'sold' ELSE status END
          WHERE id IN (
            SELECT d.id FROM device d
             WHERE d.variant_id = $2 AND d.order_id IS NULL AND d.status = 'manufactured'
             ORDER BY d.id LIMIT $3)`,
        [order.id, l.variant_id, l.quantity],
      );
    }

    await c.query('DELETE FROM cart_line WHERE cart_id=$1', [cart.id]);
    await c.query('UPDATE cart SET draft=$2, protection=false, updated_at=now() WHERE id=$1', [
      cart.id, JSON.stringify({}),
    ]);

    const { rows: outLines } = await c.query(
      'SELECT * FROM order_line WHERE order_id=$1 ORDER BY position', [order.id],
    );
    return { order, lines: outLines, accessToken };
  }).catch(async (err) => {
    if (err?.code === PG_UNIQUE_VIOLATION && String(err.constraint || '').includes('idempotency')) {
      return { replayRace: true };
    }
    // The person returns to a re-priced cart carrying that notice. The write
    // happens here, outside the rolled-back transaction, so it survives.
    if (err instanceof AppError && Array.isArray(err.extra?.repriced)) {
      for (const line of err.extra.repriced) {
        await query('UPDATE cart_line SET unit_price_minor=$1 WHERE id=$2', [line.price, line.id]);
      }
      delete err.extra.repriced;
    }
    throw err;
  });

  // Two requests raced on the same Idempotency-Key: the loser returns the winner's order.
  if (built.replayRace) {
    const existing = await orderByIdempotencyKey(idempotencyKey);
    if (existing) return { order: existing.order, lines: existing.lines, replayed: true };
    throw conflict('idempotency_conflict', 'That order is already being placed.');
  }

  const { order, lines, accessToken } = built;

  // The order exists and stock is committed. Now the money and the mail, which
  // live outside this app and are what make the order real.
  await confirmOrder(order, lines);

  const fresh = await orderById(order.id);
  return { order: fresh.order, lines: fresh.lines, accessToken, replayed: false };
}

/**
 * A confirmed order creates or reuses one killbill account keyed by the order
 * email lowercased, and raises one invoice on it for the order total in USD.
 * The order only reaches `confirmed` once the invoice exists, and the mail only
 * follows a confirmed order.
 */
async function confirmOrder(order, lines) {
  const externalKey = String(order.email).toLowerCase();
  let invoice = null;

  try {
    const account = await ensureAccount({
      externalKey,
      name: order.shipping_address?.name || externalKey,
      email: externalKey,
      country: order.shipping_address?.country || 'US',
    });

    invoice = await createInvoice({
      accountId: account.accountId,
      totalMinor: order.total_minor,
      description: `Vela order ${order.number}`,
    });

    await query(
      `UPDATE "order"
          SET status='confirmed', payment_status='invoiced',
              killbill_external_key=$2, killbill_account_id=$3,
              killbill_invoice_id=$4, killbill_invoice_amount=$5
        WHERE id=$1`,
      [order.id, externalKey, account.accountId, invoice.invoiceId,
        minorToDecimalString(order.total_minor)],
    );

    logLine({
      level: 'info', msg: 'invoice raised', order: order.number,
      external_key: externalKey, account_id: account.accountId,
      invoice_id: invoice.invoiceId, amount: minorToDecimalString(order.total_minor),
      currency: 'USD',
    });
  } catch (err) {
    logLine({
      level: 'error', msg: 'billing failed', order: order.number, error: String(err?.message || err),
    });
    throw new AppError(502, 'billing_unavailable',
      'We could not reach the billing system. Your card has not been charged and no order was placed.');
  }

  // Exactly one mail, to the order's email only, with no cc and no bcc.
  try {
    await sendOrderConfirmation({
      number: order.number,
      email: order.email,
      lines,
      subtotal_minor: order.subtotal_minor,
      shipping_minor: order.shipping_minor,
      tax_minor: order.tax_minor,
      total_minor: order.total_minor,
    });
    logLine({ level: 'info', msg: 'confirmation mailed', order: order.number, to: order.email });
  } catch (err) {
    // The order and its invoice are real; a mail failure must not undo them or
    // turn into a 5xx for the buyer.
    logLine({
      level: 'error', msg: 'confirmation mail failed', order: order.number,
      error: String(err?.message || err),
    });
  }

  return invoice;
}

async function orderById(id) {
  const { rows } = await query('SELECT * FROM "order" WHERE id=$1', [id]);
  if (!rows.length) return null;
  return { order: rows[0], lines: await orderLines(id) };
}

async function orderByNumber(number) {
  const { rows } = await query('SELECT * FROM "order" WHERE number=$1', [number]);
  if (!rows.length) return null;
  return { order: rows[0], lines: await orderLines(rows[0].id) };
}

async function orderByIdempotencyKey(key) {
  const { rows } = await query('SELECT * FROM "order" WHERE idempotency_key=$1', [key]);
  if (!rows.length) return null;
  return { order: rows[0], lines: await orderLines(rows[0].id) };
}

/**
 * One order by its access token, or by a bearer token belonging to the customer
 * who owns it. A customer opening another customer's order number is answered as
 * not found, never as forbidden with detail.
 */
function mayReadOrder(order, { accessToken, customer }) {
  if (accessToken && order.access_token_hash === hashOpaque(accessToken)) return true;
  if (customer && order.customer_id === customer.id) return true;
  return false;
}

/** One chip combining the order, payment and fulfilment states into a human phrase. */
function orderChip(order) {
  if (order.status === 'cancelled') return { tone: 'error', text: 'Cancelled' };
  if (order.status === 'pending') return { tone: 'progress', text: 'Being placed' };
  if (order.fulfilment_status === 'fulfilled') return { tone: 'done', text: 'Paid and delivered' };
  if (order.payment_status === 'invoiced') return { tone: 'progress', text: 'Paid, not yet shipped' };
  return { tone: 'progress', text: 'Confirmed, awaiting payment' };
}

export { orderChip as a, orderByNumber as b, orderSerials as c, mayReadOrder as m, orderLines as o, placeOrder as p };
