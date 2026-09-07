import { q as query, w as withTx, P as PG_UNIQUE_VIOLATION } from './db_gZE7iOnF.mjs';
import { n as notFound, b as badRequest, c as conflict } from './errors_cvgLiz6_.mjs';

/**
 * A serial is exactly twelve characters: two uppercase letters of model code,
 * two digits of year, two digits of production week, then six characters drawn
 * from an alphabet that omits I, O, 0 and 1 because those are misread off an
 * engraved underside. A serial that does not match that shape is refused before
 * any lookup happens.
 */

const SERIAL_RE = /^(VA|VC)(\d{2})(\d{2})([23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6})$/;

function normaliseSerial(raw) {
  return String(raw ?? '').toUpperCase().replace(/[\s-]/g, '');
}

function isValidSerial(raw) {
  return SERIAL_RE.test(normaliseSerial(raw));
}

/** Firmware versions are dotted numbers; compare them as numbers, not strings. */
function compareVersions(a, b) {
  const pa = String(a ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

async function deviceBySerial(serial) {
  const { rows } = await query(
    `SELECT d.*, p.title AS model, p.handle, v.option_value,
            o.customer_id AS owner_id
       FROM device d
       JOIN product p ON p.id=d.product_id
       JOIN variant v ON v.id=d.variant_id
       LEFT JOIN device_ownership o ON o.device_id=d.id AND o.released_at IS NULL
      WHERE upper(d.serial)=upper($1)`,
    [normaliseSerial(serial)],
  );
  return rows[0] || null;
}

/** Whether a device has newer firmware available is derived, never stored. */
async function latestGeneralFirmware(productId) {
  const { rows } = await query(
    `SELECT * FROM firmware WHERE product_id=$1 AND channel='general'
      ORDER BY build DESC LIMIT 1`,
    [productId],
  );
  return rows[0] || null;
}

async function decorateDevice(d) {
  const latest = await latestGeneralFirmware(d.product_id);
  const update_available =
    !!(latest && d.firmware_version && compareVersions(d.firmware_version, latest.version) < 0);
  return {
    serial: d.serial,
    model: d.model,
    handle: d.handle,
    option_value: d.option_value,
    nickname: d.nickname,
    status: d.status,
    firmware_version: d.firmware_version,
    firmware_reported_at: d.firmware_reported_at,
    latest_firmware: latest ? latest.version : null,
    update_available,
    // A camera never heard from reads "Not yet connected".
    firmware_state: !d.firmware_version ? 'unknown' : update_available ? 'behind' : 'current',
    warranty_until: d.warranty_until,
    warranty_expired: !!(d.warranty_until && new Date(d.warranty_until) < new Date()),
  };
}

/**
 * A serial registers only when the device exists with no live owner.
 * The unique index on (device_id) where released_at is null is what makes two
 * simultaneous registrations resolve to exactly one winner; the read below is a
 * courtesy that produces a good message, not the guarantee.
 */
async function registerDevice(serial, customerId) {
  const clean = normaliseSerial(serial);
  // A serial that does not match the shape is refused before any lookup happens.
  if (!isValidSerial(clean)) {
    throw badRequest('invalid_serial', 'We do not recognise that serial number.');
  }

  return withTx(async (c) => {
    const { rows } = await c.query(
      `SELECT d.*, p.title AS model FROM device d JOIN product p ON p.id=d.product_id
        WHERE upper(d.serial)=upper($1)`,
      [clean],
    );
    const device = rows[0];
    if (!device) throw notFound('We do not recognise that serial number.');
    if (device.status === 'blocked') {
      throw conflict('device_blocked', 'That camera is blocked and cannot be registered.');
    }

    const { rows: live } = await c.query(
      'SELECT customer_id FROM device_ownership WHERE device_id=$1 AND released_at IS NULL',
      [device.id],
    );
    if (live.length) {
      if (live[0].customer_id === customerId) {
        throw conflict('already_yours', 'That camera is already on your account.');
      }
      // Never the other person's identity.
      throw conflict('owned_by_other', 'That camera is registered to someone else.');
    }

    try {
      await c.query(
        `INSERT INTO device_ownership (device_id,customer_id,method) VALUES ($1,$2,'manual')`,
        [device.id, customerId],
      );
    } catch (err) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        // A concurrent request won the row. Exactly one wins, the other is rejected.
        throw conflict('owned_by_other', 'That camera is registered to someone else.', {
          resource: `device:${device.serial}`,
        });
      }
      throw err;
    }

    await c.query(`UPDATE device SET status='registered' WHERE id=$1`, [device.id]);
    return device.id;
  });
}

/** Releasing ownership ends the link, granting it to nobody. */
async function releaseDevice(serial, customerId) {
  const { rowCount } = await query(
    `UPDATE device_ownership SET released_at=now()
      WHERE released_at IS NULL AND customer_id=$2
        AND device_id = (SELECT id FROM device WHERE upper(serial)=upper($1))`,
    [normaliseSerial(serial), customerId],
  );
  if (!rowCount) throw notFound('That camera is not on your account.');
  await query(
    `UPDATE device SET status='sold', nickname=NULL
      WHERE upper(serial)=upper($1) AND status='registered'`,
    [normaliseSerial(serial)],
  );
}

async function renameDevice(serial, customerId, nickname) {
  const { rowCount } = await query(
    `UPDATE device SET nickname=$3
      WHERE upper(serial)=upper($1)
        AND id IN (SELECT device_id FROM device_ownership
                    WHERE customer_id=$2 AND released_at IS NULL)`,
    [normaliseSerial(serial), customerId, nickname ? String(nickname).slice(0, 60) : null],
  );
  if (!rowCount) throw notFound('That camera is not on your account.');
}

/** A customer never reads a camera owned by another customer. */
async function ownedDevice(serial, customerId) {
  const d = await deviceBySerial(serial);
  if (!d || d.owner_id !== customerId) throw notFound('That camera is not on your account.');
  return d;
}

export { releaseDevice as a, registerDevice as b, decorateDevice as d, ownedDevice as o, renameDevice as r };
