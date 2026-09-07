/** Drops every app table so the next start rebuilds the schema and seed from
 *  scratch, exactly as grading will. Development helper only. */
import { pool } from '../server/lib/db.js';

const tables = [
  'flash_session', 'device_ownership', 'device', 'order_line', 'order_counter',
  '"order"', 'cart_line', 'cart', 'auth_token', 'inventory_level', 'product_block',
  'variant', 'product', 'customer', 'app_release', 'firmware', 'shipping_method',
];

await pool.query(`DROP TABLE IF EXISTS ${tables.join(', ')} CASCADE`);
console.log('dropped');
await pool.end();
