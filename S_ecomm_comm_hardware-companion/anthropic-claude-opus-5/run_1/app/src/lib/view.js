/**
 * Server-rendered pages read the same data the API serves, by calling the same
 * library the API calls rather than by looping back over HTTP. The provider and
 * the database stay the single source of fact either way.
 */
export { formatMoney, minorToDecimalString, protectionRungFor } from '../../server/lib/money.js';
export { query } from '../../server/lib/db.js';

/** 154876459 -> "154,876,459 bytes", so byte sizes stack in a column. */
export function formatBytes(n) {
  return `${Number(n).toLocaleString('en-US')} bytes`;
}

/** "2024-12-11" -> "December 11, 2024" */
export function formatDate(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

/** The four ordered groups a release's notes may carry, and no others. */
export const NOTE_GROUPS = ['Newly Added', 'Improvements', 'Bug Fixes', 'Known Issues'];
