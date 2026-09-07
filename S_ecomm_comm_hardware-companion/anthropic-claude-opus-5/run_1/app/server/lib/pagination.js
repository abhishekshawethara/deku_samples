import { badRequest } from './errors.js';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Every list endpoint accepts a page_size, defaults it to 20 and caps it at 100.
 * A request naming a page above that cap is refused with the cap named in the
 * message rather than served with a page quietly cut down to fit.
 */
export function pageSizeFrom(c) {
  const raw =
    c.req.query('page_size') ?? c.req.query('pageSize') ?? c.req.query('limit') ?? null;
  if (raw === null || raw === '') return DEFAULT_PAGE_SIZE;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    throw badRequest('invalid_page_size', `page_size must be a whole number between 1 and ${MAX_PAGE_SIZE}.`);
  }
  if (n > MAX_PAGE_SIZE) {
    throw badRequest(
      'page_size_too_large',
      `page_size may not be above ${MAX_PAGE_SIZE}. You asked for ${n}.`,
      { max_page_size: MAX_PAGE_SIZE, requested: n },
    );
  }
  return n;
}

/**
 * The cursor is a keyset cursor over a stable ordering key rather than an offset
 * cursor, so a list that receives new rows between two reads never repeats a row
 * and never skips one.
 */
export function encodeCursor(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

export function decodeCursor(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(raw), 'base64url').toString('utf8'));
    if (parsed && typeof parsed === 'object' && 'k' in parsed) return parsed;
    throw new Error('shape');
  } catch {
    throw badRequest('invalid_cursor', 'That cursor is not one we issued. Ask for the first page again.');
  }
}

/** Fetch pageSize+1 rows, then split off the extra to decide has_more. */
export function paginate(rows, pageSize, keyOf) {
  const hasMore = rows.length > pageSize;
  const data = hasMore ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasMore && data.length ? encodeCursor({ k: keyOf(data[data.length - 1]) }) : null;
  return { data, next_cursor: nextCursor, has_more: hasMore };
}
