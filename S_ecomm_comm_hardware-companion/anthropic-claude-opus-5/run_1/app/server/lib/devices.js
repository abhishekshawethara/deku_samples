import { query, withTx, PG_UNIQUE_VIOLATION } from './db.js';
import { badRequest, conflict, notFound } from './errors.js';
import { isValidSerial, normaliseSerial } from './serial.js';

/** Firmware versions are dotted numbers; compare them as numbers, not strings. */
export function compareVersions(a, b) {
  const pa = String(a ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

export async function deviceBySerial(serial) {
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
export async function latestGeneralFirmware(productId) {
  const { rows } = await query(
    `SELECT * FROM firmware WHERE product_id=$1 AND channel='general'
      ORDER BY build DESC LIMIT 1`,
    [productId],
  );
  return rows[0] || null;
}

export async function decorateDevice(d) {
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
export async function registerDevice(serial, customerId) {
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
export async function releaseDevice(serial, customerId) {
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

export async function renameDevice(serial, customerId, nickname) {
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
export async function ownedDevice(serial, customerId) {
  const d = await deviceBySerial(serial);
  if (!d || d.owner_id !== customerId) throw notFound('That camera is not on your account.');
  return d;
}

/**
 * A flash session is refused before it starts when the target image belongs to
 * another product, or when its min_firmware is above the version the device
 * reports. A refusal writes no session row and leaves the firmware untouched.
 */
export async function startFlashSession({ serial, targetBuild, optedChannels = [] }) {
  const clean = normaliseSerial(serial);
  if (!isValidSerial(clean)) {
    throw badRequest('invalid_serial', 'We do not recognise that serial number.');
  }
  const device = await deviceBySerial(clean);
  if (!device) throw notFound('We do not recognise that serial number.');
  if (device.status === 'blocked') {
    throw conflict('device_blocked', 'That camera is blocked and cannot be updated.');
  }

  const { rows: fw } = await query('SELECT * FROM firmware WHERE build=$1', [Number(targetBuild)]);
  const image = fw[0];
  if (!image) throw notFound('That firmware image does not exist.');

  // The target image must belong to this product.
  if (image.product_id !== device.product_id) {
    throw badRequest('wrong_product',
      'That firmware is for a different camera. Choose the image for this model.');
  }
  // A manifest entry whose channel is not general is never offered to a device
  // that has not opted into that channel.
  if (image.channel !== 'general' && !optedChannels.includes(image.channel)) {
    throw badRequest('channel_not_available', 'That firmware is not offered for this camera.');
  }
  // min_firmware above the version the device reports.
  if (image.min_firmware && compareVersions(device.firmware_version || '0', image.min_firmware) < 0) {
    throw badRequest('below_min_firmware',
      `This camera is running ${device.firmware_version || 'an unknown version'} and needs at least ${image.min_firmware} before it can take ${image.version}.`);
  }

  try {
    const { rows } = await query(
      `INSERT INTO flash_session (device_id,firmware_id,state) VALUES ($1,$2,'started') RETURNING *`,
      [device.id, image.id],
    );
    return { session: rows[0], device, image };
  } catch (err) {
    if (err?.code === PG_UNIQUE_VIOLATION) {
      throw conflict('flash_in_progress', 'That camera is already being updated.', {
        resource: `device:${device.serial}`,
      });
    }
    throw err;
  }
}

/**
 * Completing a flash session records the version read back from the device,
 * never the version requested.
 */
export async function completeFlashSession(id, reportedVersion) {
  const reported = String(reportedVersion ?? '').trim();
  if (!/^\d+(\.\d+)*$/.test(reported)) {
    throw badRequest('invalid_reported_version', 'The camera did not report a version we understand.');
  }
  return withTx(async (c) => {
    const { rows } = await c.query(
      `UPDATE flash_session SET state='succeeded', reported_version=$2, ended_at=now()
        WHERE id=$1 AND state='started' RETURNING *`,
      [id, reported],
    );
    if (!rows.length) throw conflict('session_not_started', 'That update is not running.');
    const session = rows[0];
    await c.query(
      'UPDATE device SET firmware_version=$2, firmware_reported_at=now() WHERE id=$1',
      [session.device_id, reported],
    );
    const { rows: d } = await c.query(
      `SELECT d.*, p.title AS model FROM device d JOIN product p ON p.id=d.product_id WHERE d.id=$1`,
      [session.device_id],
    );
    return { session, device: d[0] };
  });
}

/** A failed session leaves that version as it was. */
export async function failFlashSession(id, reason) {
  const { rows } = await query(
    `UPDATE flash_session SET state='failed', failure_reason=$2, ended_at=now()
      WHERE id=$1 AND state='started' RETURNING *`,
    [id, String(reason ?? 'unknown').slice(0, 200)],
  );
  if (!rows.length) throw conflict('session_not_started', 'That update is not running.');
  return rows[0];
}
