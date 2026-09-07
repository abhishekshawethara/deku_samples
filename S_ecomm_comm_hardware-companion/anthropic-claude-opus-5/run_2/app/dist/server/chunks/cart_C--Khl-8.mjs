import crypto from 'node:crypto';
import { q as query } from './db_gZE7iOnF.mjs';
import { f as formatMoney, p as protectionRungFor, t as taxFor } from './money_BIIhPbI9.mjs';
import { b as badRequest, n as notFound } from './errors_cvgLiz6_.mjs';

const CART_COOKIE = 'vela_cart';

async function createCart(customerId = null) {
  const token = crypto.randomBytes(24).toString('base64url');
  const { rows } = await query(
    'INSERT INTO cart (token, customer_id) VALUES ($1,$2) RETURNING *',
    [token, customerId],
  );
  return rows[0];
}

async function cartByToken(token) {
  if (!token) return null;
  const { rows } = await query('SELECT * FROM cart WHERE token=$1 AND expires_at > now()', [token]);
  return rows[0] || null;
}

/** A visitor never reads another visitor's cart: the opaque token is the only handle. */
async function ensureCart(token, customerId = null) {
  const found = await cartByToken(token);
  if (found) return found;
  return createCart(customerId);
}

async function linesFor(cartId) {
  const { rows } = await query(
    `SELECT cl.id, cl.quantity, cl.unit_price_minor, cl.created_at,
            v.id AS variant_id, v.sku, v.option_value, v.price_minor AS current_price_minor,
            p.handle, p.title, p.kind, p.status AS product_status,
            COALESCE(i.available,0) AS available
       FROM cart_line cl
       JOIN variant v ON v.id = cl.variant_id
       JOIN product p ON p.id = v.product_id
       LEFT JOIN inventory_level i ON i.variant_id = v.id
      WHERE cl.cart_id = $1
      ORDER BY cl.created_at, cl.id`,
    [cartId],
  );
  return rows;
}

/**
 * Every cart read compares the snapshotted unit price against the current price,
 * and a difference renders as a notice naming the item, the old price and the new.
 */
async function readCart(cart) {
  const rows = await linesFor(cart.id);
  const notices = [];
  const lines = rows.map((r) => {
    const changed = r.unit_price_minor !== r.current_price_minor;
    if (changed) {
      notices.push({
        kind: 'price_change',
        sku: r.sku,
        title: r.title,
        was_minor: r.unit_price_minor,
        now_minor: r.current_price_minor,
        message: `The price of ${r.title} changed from ${formatMoney(r.unit_price_minor)} to ${formatMoney(r.current_price_minor)} since you added it.`,
      });
    }
    if (r.available < r.quantity && r.product_status !== 'discontinued') {
      notices.push({
        kind: 'availability_change',
        sku: r.sku,
        title: r.title,
        available: r.available,
        message:
          r.available === 0
            ? `${r.title} sold out since you added it.`
            : `Only ${r.available} of ${r.title} remain, and you have ${r.quantity} in the cart.`,
      });
    }
    return {
      id: r.id,
      variant_id: r.variant_id,
      sku: r.sku,
      handle: r.handle,
      title: r.title,
      option_value: r.option_value,
      kind: r.kind,
      quantity: r.quantity,
      unit_price_minor: r.unit_price_minor,
      current_price_minor: r.current_price_minor,
      price_changed: changed,
      total_minor: r.unit_price_minor * r.quantity,
      available: r.available,
    };
  });

  const subtotal_minor = lines.reduce((s, l) => s + l.total_minor, 0);
  const rung = protectionRungFor(subtotal_minor);
  const protection_minor = cart.protection && rung ? rung.price_minor : 0;
  const draft = cart.draft || {};
  const method = draft.shipping_method
    ? await shippingMethod(draft.shipping_method)
    : null;
  const shipping_minor = method ? method.price_minor : 0;
  // Shipment protection is excluded from tax.
  const tax_minor = taxFor(subtotal_minor);
  const total_minor = subtotal_minor + protection_minor + shipping_minor + tax_minor;

  return {
    token: cart.token,
    email: cart.email,
    draft,
    lines,
    notices,
    protection_enabled: !!cart.protection,
    protection_rung: rung
      ? { ...rung, max: rung.max === Infinity ? null : rung.max, enabled: !!cart.protection }
      : null,
    protection_minor,
    subtotal_minor,
    shipping_minor,
    shipping_method: draft.shipping_method || null,
    tax_minor,
    total_minor,
    item_count: lines.reduce((s, l) => s + l.quantity, 0),
    currency: 'usd',
  };
}

async function shippingMethod(code) {
  const { rows } = await query('SELECT * FROM shipping_method WHERE code=$1', [code]);
  return rows[0] || null;
}

async function shippingMethods() {
  const { rows } = await query('SELECT * FROM shipping_method ORDER BY position');
  return rows;
}

function parseQuantity(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    throw badRequest('invalid_quantity', 'Quantity is a whole number from 1 to 10.');
  }
  return n;
}

async function variantBySku(sku) {
  const { rows } = await query(
    `SELECT v.*, p.handle, p.title, p.status AS product_status, p.kind,
            COALESCE(i.available,0) AS available, COALESCE(i.committed,0) AS committed
       FROM variant v JOIN product p ON p.id=v.product_id
       LEFT JOIN inventory_level i ON i.variant_id=v.id
      WHERE v.sku=$1`,
    [sku],
  );
  const v = rows[0];
  if (!v) throw notFound('That item does not exist.');
  return v;
}

export { CART_COOKIE as C, shippingMethod as a, cartByToken as c, ensureCart as e, parseQuantity as p, readCart as r, shippingMethods as s, variantBySku as v };
