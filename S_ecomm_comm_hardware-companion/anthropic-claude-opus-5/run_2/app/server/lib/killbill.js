import { minorToDecimalString } from './money.js';
import { logLine } from './log.js';

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

export async function healthy() {
  try {
    const res = await fetch(`${base()}/1.0/healthcheck`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** externalKey is unique per tenant, so a second create with a used key is
 *  refused by the store rather than by app code. */
export async function findAccount(externalKey) {
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
export async function ensureAccount({ externalKey, name, email, country = 'US' }) {
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
export async function createInvoice({ accountId, totalMinor, description }) {
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

/** Read an invoice back from the provider. The provider is the fact. */
export async function getInvoice(invoiceId) {
  const res = await kb(`/1.0/kb/invoices/${invoiceId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function accountInvoices(accountId) {
  const res = await kb(
    `/1.0/kb/accounts/${accountId}/invoices?withItems=true&includeInvoiceComponents=true`,
  );
  if (!res.ok) return [];
  return res.json();
}

export function logBilling(fields) {
  logLine({ level: 'info', msg: 'billing', ...fields });
}
