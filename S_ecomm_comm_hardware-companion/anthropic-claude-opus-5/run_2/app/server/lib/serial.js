/**
 * A serial is exactly twelve characters: two uppercase letters of model code,
 * two digits of year, two digits of production week, then six characters drawn
 * from an alphabet that omits I, O, 0 and 1 because those are misread off an
 * engraved underside. A serial that does not match that shape is refused before
 * any lookup happens.
 */
export const SERIAL_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const MODEL_CODES = { VA: 'Vela A1', VC: 'Vela Cricket' };

const SERIAL_RE = /^(VA|VC)(\d{2})(\d{2})([23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6})$/;

export function normaliseSerial(raw) {
  return String(raw ?? '').toUpperCase().replace(/[\s-]/g, '');
}

export function isValidSerial(raw) {
  return SERIAL_RE.test(normaliseSerial(raw));
}

/** Grouped as it is typed and stored unformatted. */
export function groupSerial(raw) {
  const s = normaliseSerial(raw);
  return s.replace(/(.{4})(?=.)/g, '$1-');
}

export function modelCodeFor(serial) {
  const m = SERIAL_RE.exec(normaliseSerial(serial));
  return m ? m[1] : null;
}
