import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pool, withTx } from '../server/lib/db.js';
import { hashPassword, hashOpaque } from '../server/lib/auth.js';
import { logLine } from '../server/lib/log.js';

const here = path.dirname(fileURLToPath(import.meta.url));

// Benchmark fixture data, not a secret. The exact literal must work at login.
export const SEED_PASSWORD = 'deku-demo-pw-2026';

const digest = (s) => crypto.createHash('sha256').update(s).digest('hex');

const PRODUCTS = [
  {
    handle: 'flagship', title: 'Vela A1', kind: 'camera', status: 'active',
    subtitle: 'The full frame body, built to be repaired.',
    support_until: '2032-06-01', position: 1,
    variants: [
      { sku: 'VELA-A1-GRAPHITE', option_value: 'Graphite', price_minor: 89900, available: 4 },
      { sku: 'VELA-A1-SAND', option_value: 'Sand', price_minor: 89900, available: 6 },
      { sku: 'VELA-A1-YELLOW', option_value: 'Yellow', price_minor: 89900, available: 1 },
    ],
    blocks: [
      { kind: 'lede', payload: { text: 'The A1 is the camera we make when nobody is watching the clock. A full frame sensor, a shutter rated past the life of the body around it, and a back panel held on by four screws you can turn yourself. Every part inside it has a number and we will sell you that part.' } },
      { kind: 'spec_group', payload: { title: 'Sensor', rows: [['Type', '35 mm full frame CMOS'], ['Resolution', '42.1 MP'], ['Pixel pitch', '5.94 um'], ['Readout', '14 bit, 12 fps']] } },
      { kind: 'spec_group', payload: { title: 'Body', rows: [['Weight', '612 g with battery'], ['Dimensions', '134 x 91 x 68 mm'], ['Sealing', 'IP53'], ['Mount', 'Vela V mount']] } },
      { kind: 'spec_group', payload: { title: 'Power', rows: [['Battery', 'VB-2 lithium ion'], ['Frames per charge', '740'], ['Charging', 'USB-C PD, 30 W']] } },
      { kind: 'in_the_box', payload: { items: ['Vela A1 body', 'VB-2 battery', 'USB-C cable, 1 m', 'Strap', 'Printed service manual'] } },
      { kind: 'compatibility', payload: { min_os: 'macOS 13.0', min_app: '2.0.0', text: 'Arranger 2.0.0 or later on macOS 13.0 or later.' } },
    ],
  },
  {
    handle: 'compact', title: 'Vela Cricket', kind: 'camera', status: 'active',
    subtitle: 'Small enough to forget you brought it.',
    support_until: null, position: 2,
    variants: [
      { sku: 'VELA-CRICKET-GRAPHITE', option_value: 'Graphite', price_minor: 29900, available: 12 },
      { sku: 'VELA-CRICKET-YELLOW', option_value: 'Yellow', price_minor: 29900, available: 0 },
    ],
    blocks: [
      { kind: 'lede', payload: { text: 'The Cricket is the camera that goes in the pocket of a coat and stays there. One dial, one button, a fixed 28 mm lens. It does fewer things than the A1 on purpose, and the things it does it does without a menu.' } },
      { kind: 'spec_group', payload: { title: 'Sensor', rows: [['Type', 'APS-C CMOS'], ['Resolution', '26.0 MP'], ['Pixel pitch', '3.76 um'], ['Readout', '12 bit, 8 fps']] } },
      { kind: 'spec_group', payload: { title: 'Body', rows: [['Weight', '298 g with battery'], ['Dimensions', '112 x 64 x 38 mm'], ['Sealing', 'None'], ['Lens', 'Fixed 28 mm f/2.8']] } },
      { kind: 'spec_group', payload: { title: 'Power', rows: [['Battery', 'VB-1 lithium ion'], ['Frames per charge', '410'], ['Charging', 'USB-C, 15 W']] } },
      { kind: 'in_the_box', payload: { items: ['Vela Cricket body', 'VB-1 battery', 'USB-C cable, 1 m', 'Wrist strap'] } },
      { kind: 'compatibility', payload: { min_os: 'macOS 13.0', min_app: '1.4.0', text: 'Arranger 1.4.0 or later on macOS 13.0 or later.' } },
    ],
  },
  {
    handle: 'mount', title: 'Monitor Mount', kind: 'accessory', status: 'discontinued',
    subtitle: 'Holds a reference monitor above the body.',
    support_until: '2029-09-01', position: 3,
    variants: [
      { sku: 'VELA-MOUNT-CLAMP', option_value: 'Clamp', price_minor: 4900, available: 0 },
      { sku: 'VELA-MOUNT-VESA', option_value: 'VESA', price_minor: 4900, available: 0 },
    ],
    blocks: [
      { kind: 'lede', payload: { text: 'An aluminium arm that puts a monitor where your eyes already are. We stopped making it because the tooling wore out and the volume never justified new tooling.' } },
      { kind: 'spec_group', payload: { title: 'Mechanical', rows: [['Material', '6061 aluminium'], ['Load', '1.8 kg'], ['Thread', '1/4-20 and 3/8-16'], ['Weight', '244 g']] } },
      { kind: 'in_the_box', payload: { items: ['Mount arm', 'Clamp or VESA plate', 'Hex key'] } },
      { kind: 'support_note', payload: { text: 'We no longer sell this. We will support it until September 1, 2029.' } },
    ],
  },
  {
    handle: 'case', title: 'Travel Case', kind: 'accessory', status: 'active',
    subtitle: 'A hard shell sized for a body and two lenses.',
    support_until: null, position: 4,
    variants: [{ sku: 'VELA-CASE-STD', option_value: 'Standard', price_minor: 7900, available: 15 }],
    blocks: [
      { kind: 'lede', payload: { text: 'A moulded shell with a foam insert cut for a body, two lenses and a handful of cards. It is the case we carry ourselves, which is the only reason we sell it.' } },
      { kind: 'spec_group', payload: { title: 'Mechanical', rows: [['Outside', '320 x 240 x 110 mm'], ['Inside', '300 x 220 x 95 mm'], ['Weight', '780 g'], ['Rating', 'IP67 closed']] } },
      { kind: 'in_the_box', payload: { items: ['Travel Case', 'Cut foam insert', 'Shoulder strap'] } },
    ],
  },
  {
    handle: 'cable', title: 'Replacement Cable', kind: 'spare', status: 'active',
    subtitle: 'The USB-C cable that ships in the box.',
    support_until: null, position: 5,
    variants: [
      { sku: 'VELA-CABLE-1M', option_value: '1 m', price_minor: 1900, available: 30 },
      { sku: 'VELA-CABLE-2M', option_value: '2 m', price_minor: 2400, available: 30 },
    ],
    blocks: [
      { kind: 'lede', payload: { text: 'The same cable that comes in the box, sold on its own because cables are lost and a camera without one is a paperweight until the post arrives.' } },
      { kind: 'spec_group', payload: { title: 'Electrical', rows: [['Standard', 'USB 3.2 Gen 2'], ['Data', '10 Gbit/s'], ['Power', '60 W'], ['Shielding', 'Braided']] } },
      { kind: 'in_the_box', payload: { items: ['One USB-C cable', 'Cable tie'] } },
    ],
  },
  {
    // Never listed in the catalogue and never taxed.
    handle: 'protection', title: 'Shipment protection', kind: 'protection', status: 'active',
    subtitle: 'Covers loss, theft and damage in transit.',
    support_until: null, position: 99,
    variants: [
      { sku: 'VELA-PROTECT-1', option_value: 'Rung 1', price_minor: 98, available: 1000000 },
      { sku: 'VELA-PROTECT-2', option_value: 'Rung 2', price_minor: 298, available: 1000000 },
      { sku: 'VELA-PROTECT-3', option_value: 'Rung 3', price_minor: 598, available: 1000000 },
      { sku: 'VELA-PROTECT-4', option_value: 'Rung 4', price_minor: 1198, available: 1000000 },
    ],
    blocks: [],
  },
];

const RELEASES = [
  {
    version: '2.0.0', build: 2000, released_on: '2024-12-11',
    artifact_name: 'arranger-2.0.0.dmg', size_bytes: 154876459,
    sha256: '9f2a41c0d83bb6f9127ae5c40d92b8e31f6a7c05d4e8931b2f4d0e6a1c8b39f2',
    description: 'A new library that keeps every frame where you put it.',
    notes: {
      'Newly Added': [
        'A library that reads a folder in place and never moves a file you did not ask it to move.',
        'Tethered capture for the Vela A1 over USB-C.',
        'Per-camera colour profiles, stored beside the images rather than in a database.',
      ],
      Improvements: [
        'Import is about four times faster on a folder of ten thousand frames.',
        'The window remembers its size and position for each display.',
        'Firmware updates now report the version read back from the camera.',
      ],
      'Bug Fixes': [
        'Fixed a hang when a card was removed during import.',
        'Fixed the frame counter drifting after a failed write.',
        'Fixed a crash on machines with no colour profile set.',
      ],
      'Known Issues': [
        'Tethered capture is not yet available for the Cricket.',
        'Very large libraries take a moment to open the first time.',
      ],
    },
  },
  {
    version: '1.4.4', build: 1440, released_on: '2024-06-26',
    artifact_name: 'arranger-1.4.4.dmg', size_bytes: 160301059,
    sha256: digest('arranger-1.4.4'),
    description: 'A maintenance release before the 2.0 work landed.',
    notes: {
      Improvements: ['Import handles cards formatted on a Cricket running 7.0.', 'Reduced memory use while writing firmware.'],
      'Bug Fixes': ['Fixed the progress figure sticking at 99 percent.', 'Fixed a rare failure to detect a camera after sleep.'],
    },
  },
  {
    version: '1.4.3', build: 1430, released_on: '2024-05-20',
    artifact_name: 'arranger-1.4.3.dmg', size_bytes: 158220144,
    sha256: digest('arranger-1.4.3'),
    description: 'Firmware 7.0 support for the Cricket.',
    notes: {
      'Newly Added': ['Support for Cricket firmware 7.0.'],
      Improvements: ['The firmware step now names the minimum version a camera needs.'],
      'Bug Fixes': ['Fixed a stall when two cameras were plugged in at once.'],
      'Known Issues': ['A camera below 6.11 must be updated with the web installer first.'],
    },
  },
  {
    version: '1.4.2', build: 1420, released_on: '2024-05-20',
    artifact_name: 'arranger-1.4.2.dmg', size_bytes: 157903622,
    sha256: digest('arranger-1.4.2'),
    description: 'A small fix for import ordering.',
    notes: {
      'Bug Fixes': ['Frames now import in the order the camera recorded them.', 'Fixed the date column reading a day early west of UTC.'],
    },
  },
];

const FIRMWARE = [
  { handle: 'compact', version: '7.2', build: 720, channel: 'general', min_firmware: '6.11', min_app_version: '1.4.0', size_bytes: 24117248, released_on: '2024-11-04' },
  { handle: 'compact', version: '7.0', build: 700, channel: 'general', min_firmware: '6.11', min_app_version: '1.4.0', size_bytes: 23068672, released_on: '2024-05-02' },
  { handle: 'compact', version: '6.11', build: 611, channel: 'general', min_firmware: null, min_app_version: '1.0.0', size_bytes: 22020096, released_on: '2023-11-20' },
  { handle: 'flagship', version: '2.4', build: 240, channel: 'general', min_firmware: '2.0', min_app_version: '2.0.0', size_bytes: 41943040, released_on: '2024-12-11' },
];

const DEVICES = [
  { serial: 'VC2609PVDA7Q', handle: 'compact', sku: 'VELA-CRICKET-GRAPHITE', status: 'registered', owner: 'customer@example.com', firmware: '7.0', order_number: 'VE-2026-0001', warranty_until: '2028-01-14' },
  { serial: 'VA2609NRWB2Z', handle: 'flagship', sku: 'VELA-A1-SAND', status: 'registered', owner: 'customer2@example.com', firmware: '2.4', warranty_until: '2027-03-02' },
  { serial: 'VA2609KTMHX4', handle: 'flagship', sku: 'VELA-A1-GRAPHITE', status: 'sold', owner: null, firmware: null, warranty_until: '2028-08-19' },
  { serial: 'VC2609WJ3DKT', handle: 'compact', sku: 'VELA-CRICKET-YELLOW', status: 'blocked', owner: null, firmware: null, blocked_reason: 'reported_stolen', warranty_until: null },
];

export async function migrate() {
  const sql = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8');
  await pool.query(sql);
  logLine({ level: 'info', msg: 'schema applied' });
}

export async function seed() {
  await withTx(async (c) => {
    // Customers. Seeding is idempotent: restarting must not duplicate rows.
    for (const [email, name] of [
      ['customer@example.com', 'Iris Vantaa'],
      ['customer2@example.com', 'Rune Halden'],
    ]) {
      const { rows } = await c.query('SELECT id FROM customer WHERE lower(email)=lower($1)', [email]);
      if (!rows.length) {
        await c.query(
          'INSERT INTO customer (email, name, password_hash, status) VALUES ($1,$2,$3,$4)',
          [email, name, hashPassword(SEED_PASSWORD), 'active'],
        );
      }
    }

    for (const p of PRODUCTS) {
      const { rows: pr } = await c.query(
        `INSERT INTO product (handle,title,subtitle,kind,status,support_until,position)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (handle) DO UPDATE SET
           title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, kind=EXCLUDED.kind,
           status=EXCLUDED.status, support_until=EXCLUDED.support_until, position=EXCLUDED.position
         RETURNING id`,
        [p.handle, p.title, p.subtitle, p.kind, p.status, p.support_until, p.position],
      );
      const productId = pr[0].id;

      let vpos = 0;
      for (const v of p.variants) {
        vpos += 1;
        const { rows: vr } = await c.query(
          `INSERT INTO variant (product_id,sku,title,option_value,price_minor,currency,position,inventory_policy)
           VALUES ($1,$2,$3,$4,$5,'usd',$6,'deny')
           ON CONFLICT (sku) DO UPDATE SET
             product_id=EXCLUDED.product_id, title=EXCLUDED.title,
             option_value=EXCLUDED.option_value, price_minor=EXCLUDED.price_minor,
             position=EXCLUDED.position
           RETURNING id`,
          [productId, v.sku, v.option_value, v.option_value, v.price_minor, vpos],
        );
        const variantId = vr[0].id;
        // Stock levels are only set when the row is new, so a restart never
        // rewinds inventory that real orders have already committed.
        await c.query(
          `INSERT INTO inventory_level (variant_id, available, committed)
           VALUES ($1,$2,0) ON CONFLICT (variant_id) DO NOTHING`,
          [variantId, v.available],
        );
      }

      await c.query('DELETE FROM product_block WHERE product_id=$1', [productId]);
      let bpos = 0;
      for (const b of p.blocks) {
        bpos += 1;
        await c.query(
          'INSERT INTO product_block (product_id,kind,position,payload) VALUES ($1,$2,$3,$4)',
          [productId, b.kind, bpos, JSON.stringify(b.payload)],
        );
      }
    }

    for (const [code, label, price, win, pos] of [
      ['standard', 'Standard', 0, 'Arrives in 5 to 7 days', 1],
      ['express', 'Express', 2500, 'Arrives in 2 days', 2],
    ]) {
      await c.query(
        `INSERT INTO shipping_method (code,zone,country,label,price_minor,window_text,position)
         VALUES ($1,'us-domestic','US',$2,$3,$4,$5)
         ON CONFLICT (code) DO UPDATE SET label=EXCLUDED.label,
           price_minor=EXCLUDED.price_minor, window_text=EXCLUDED.window_text`,
        [code, label, price, win, pos],
      );
    }

    for (const r of RELEASES) {
      await c.query(
        `INSERT INTO app_release (version,build,released_on,channel,artifact_name,size_bytes,sha256,description,notes)
         VALUES ($1,$2,$3,'general',$4,$5,$6,$7,$8)
         ON CONFLICT (version) DO UPDATE SET
           build=EXCLUDED.build, released_on=EXCLUDED.released_on,
           artifact_name=EXCLUDED.artifact_name, size_bytes=EXCLUDED.size_bytes,
           sha256=EXCLUDED.sha256, description=EXCLUDED.description, notes=EXCLUDED.notes`,
        [r.version, r.build, r.released_on, r.artifact_name, r.size_bytes, r.sha256, r.description, JSON.stringify(r.notes)],
      );
    }

    for (const f of FIRMWARE) {
      const { rows } = await c.query('SELECT id FROM product WHERE handle=$1', [f.handle]);
      await c.query(
        `INSERT INTO firmware (product_id,version,build,min_firmware,min_app_version,channel,size_bytes,sha256,released_on)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (product_id,build) DO UPDATE SET
           version=EXCLUDED.version, min_firmware=EXCLUDED.min_firmware,
           min_app_version=EXCLUDED.min_app_version, channel=EXCLUDED.channel,
           size_bytes=EXCLUDED.size_bytes, sha256=EXCLUDED.sha256`,
        [rows[0].id, f.version, f.build, f.min_firmware, f.min_app_version, f.channel,
          f.size_bytes, digest(`fw-${f.handle}-${f.version}`), f.released_on],
      );
    }

    // The seeded order VE-2026-0001, and the counter that makes the next guest
    // order VE-2026-0002.
    const { rows: seededOrder } = await c.query('SELECT id FROM "order" WHERE number=$1', ['VE-2026-0001']);
    let orderId = seededOrder[0]?.id;
    if (!orderId) {
      const { rows: cust } = await c.query('SELECT id FROM customer WHERE lower(email)=lower($1)', ['customer@example.com']);
      const { rows: variant } = await c.query('SELECT id,sku FROM variant WHERE sku=$1', ['VELA-CRICKET-GRAPHITE']);
      const address = {
        name: 'Iris Vantaa', line1: '44 Harbour Road', line2: '', city: 'Portland',
        region: 'OR', postal_code: '97204', country: 'US', phone: '',
      };
      const { rows: ins } = await c.query(
        `INSERT INTO "order" (number,customer_id,email,subtotal_minor,shipping_minor,tax_minor,
            discount_minor,total_minor,currency,status,payment_status,fulfilment_status,
            shipping_method,shipping_address,access_token_hash,killbill_external_key,placed_at)
         VALUES ($1,$2,$3,29900,0,2990,0,32890,'usd','confirmed','invoiced','fulfilled',
            'standard',$4,$5,$6,timestamptz '2026-01-14 15:04:00+00')
         RETURNING id`,
        ['VE-2026-0001', cust[0].id, 'customer@example.com', JSON.stringify(address),
          hashOpaque('seed-order-1-token'), 'customer@example.com'],
      );
      orderId = ins[0].id;
      await c.query(
        `INSERT INTO order_line (order_id,variant_id,title_snapshot,sku_snapshot,quantity,unit_price_minor,total_minor,position)
         VALUES ($1,$2,'Vela Cricket',$3,1,29900,29900,1)`,
        [orderId, variant[0].id, 'VELA-CRICKET-GRAPHITE'],
      );
    }
    await c.query(
      `INSERT INTO order_counter (year,last) VALUES (2026,1)
       ON CONFLICT (year) DO UPDATE SET last = GREATEST(order_counter.last, 1)`,
    );

    for (const d of DEVICES) {
      const { rows: pr } = await c.query('SELECT id FROM product WHERE handle=$1', [d.handle]);
      const { rows: vr } = await c.query('SELECT id FROM variant WHERE sku=$1', [d.sku]);
      const { rows: dev } = await c.query(
        `INSERT INTO device (serial,product_id,variant_id,status,blocked_reason,firmware_version,
             firmware_reported_at,order_id,warranty_until)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (upper(serial)) DO UPDATE SET status=device.status
         RETURNING id, (xmax = 0) AS inserted`,
        [d.serial, pr[0].id, vr[0].id, d.status, d.blocked_reason || null, d.firmware || null,
          d.firmware ? new Date('2026-01-20T09:12:00Z') : null,
          d.order_number ? orderId : null, d.warranty_until],
      );
      const deviceId = dev[0].id;
      if (d.owner) {
        const { rows: own } = await c.query('SELECT id FROM customer WHERE lower(email)=lower($1)', [d.owner]);
        const { rows: live } = await c.query(
          'SELECT id FROM device_ownership WHERE device_id=$1 AND released_at IS NULL', [deviceId],
        );
        if (!live.length) {
          await c.query(
            `INSERT INTO device_ownership (device_id,customer_id,order_id,method)
             VALUES ($1,$2,$3,$4)`,
            [deviceId, own[0].id, d.order_number ? orderId : null, d.order_number ? 'order' : 'manual'],
          );
        }
      }
    }
  });
  logLine({ level: 'info', msg: 'seed complete' });
}

export async function migrateAndSeed() {
  await migrate();
  await seed();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAndSeed()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
