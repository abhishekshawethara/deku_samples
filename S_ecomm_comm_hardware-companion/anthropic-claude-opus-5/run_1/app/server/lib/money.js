// Money is an integer count of minor units in usd everywhere inside this app,
// in every layer including the browser. No floating point money exists.

/** 37800 -> "$378.00" */
export function formatMoney(minor) {
  const n = Number(minor);
  const neg = n < 0;
  const abs = Math.abs(Math.trunc(n));
  const major = Math.floor(abs / 100);
  const cents = abs % 100;
  const grouped = String(major).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}$${grouped}.${String(cents).padStart(2, '0')}`;
}

/** 41580 -> "415.80", the decimal string killbill is given. */
export function minorToDecimalString(minor) {
  const n = Math.trunc(Number(minor));
  const neg = n < 0;
  const abs = Math.abs(n);
  return `${neg ? '-' : ''}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/**
 * Tax is ten percent of the line subtotal, computed on integers and truncated
 * toward zero, so a subtotal of 37800 produces a tax of 3780.
 * Shipment protection is excluded from tax.
 */
export function taxFor(taxableSubtotalMinor) {
  return Math.trunc(Math.max(0, Math.trunc(taxableSubtotalMinor)) / 10);
}

/** The shipment-protection rung is derived from the cart subtotal, never stored. */
export const PROTECTION_RUNGS = [
  { sku: 'VELA-PROTECT-1', price_minor: 98, min: 1, max: 9999 },
  { sku: 'VELA-PROTECT-2', price_minor: 298, min: 10000, max: 49999 },
  { sku: 'VELA-PROTECT-3', price_minor: 598, min: 50000, max: 99999 },
  { sku: 'VELA-PROTECT-4', price_minor: 1198, min: 100000, max: Infinity },
];

export function protectionRungFor(subtotalMinor) {
  const s = Math.trunc(Number(subtotalMinor) || 0);
  if (s < 1) return null;
  return PROTECTION_RUNGS.find((r) => s >= r.min && s <= r.max) || null;
}
