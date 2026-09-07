import crypto from 'node:crypto';
import { q as query } from './db_gZE7iOnF.mjs';

// Passwords are stored hashed with a modern password hash. scrypt is memory-hard
// and ships in the Node standard library, so the image needs no native build.
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
const TOKEN_TTL_HOURS = Number(process.env.AUTH_TOKEN_TTL_HOURS || 12);

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 256 * 1024 * 1024,
  });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, N, r, p, salt, key] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const expected = Buffer.from(key, 'base64');
    const actual = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length, {
      N: Number(N), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024,
    });
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

async function issueToken(customerId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 3600_000);
  await query('INSERT INTO auth_token (token_hash, customer_id, expires_at) VALUES ($1,$2,$3)', [
    sha256(token), customerId, expiresAt,
  ]);
  return { token, expiresAt };
}

/** A request with an expired or absent token is rejected and mutates nothing. */
async function customerForToken(token) {
  if (!token) return null;
  const { rows } = await query(
    `SELECT c.id, c.email, c.name, c.status
       FROM auth_token t JOIN customer c ON c.id = t.customer_id
      WHERE t.token_hash = $1 AND t.expires_at > now()`,
    [sha256(token)],
  );
  const c = rows[0];
  if (!c || c.status !== 'active') return null;
  return c;
}

async function revokeToken(token) {
  if (token) await query('DELETE FROM auth_token WHERE token_hash = $1', [sha256(token)]);
}

const hashOpaque = sha256;

export { hashPassword as a, customerForToken as c, hashOpaque as h, issueToken as i, revokeToken as r, verifyPassword as v };
