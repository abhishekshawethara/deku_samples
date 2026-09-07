import crypto from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEYLEN = 64;

export function hashPassword(password) {
	return new Promise((resolve, reject) => {
		const salt = crypto.randomBytes(16);
		crypto.scrypt(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, derived) => {
			if (err) return reject(err);
			resolve(`scrypt$${SCRYPT_N}$${SCRYPT_r}$${SCRYPT_p}$${salt.toString('base64')}$${derived.toString('base64')}`);
		});
	});
}

export function verifyPassword(password, stored) {
	return new Promise((resolve) => {
		if (typeof stored !== 'string') return resolve(false);
		const parts = stored.split('$');
		if (parts.length !== 6 || parts[0] !== 'scrypt') return resolve(false);
		const [, n, r, p, saltB64, hashB64] = parts;
		const salt = Buffer.from(saltB64, 'base64');
		const expected = Buffer.from(hashB64, 'base64');
		crypto.scrypt(
			password,
			salt,
			expected.length,
			{ N: Number(n), r: Number(r), p: Number(p) },
			(err, derived) => {
				if (err) return resolve(false);
				resolve(crypto.timingSafeEqual(expected, derived));
			}
		);
	});
}

function secret() {
	const base = process.env.AUTH_SECRET || process.env.DATABASE_URL || 'zettajoule-dev-secret';
	return crypto.createHash('sha256').update(`zettajoule::${base}`).digest();
}

const TOKEN_TTL_SECONDS = 60 * 60 * 12;

function b64url(buf) {
	return Buffer.from(buf).toString('base64url');
}

export function issueToken(accountId, ttlSeconds = TOKEN_TTL_SECONDS) {
	const payload = JSON.stringify({
		sub: String(accountId),
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + ttlSeconds
	});
	const body = b64url(payload);
	const sig = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
	return `${body}.${sig}`;
}

export function readToken(token) {
	if (!token || typeof token !== 'string') return null;
	const [body, sig] = token.split('.');
	if (!body || !sig) return null;
	const expected = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
	let payload;
	try {
		payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
	} catch {
		return null;
	}
	if (!payload?.sub || !payload?.exp) return null;
	if (payload.exp * 1000 < Date.now()) return { expired: true, sub: payload.sub };
	return { expired: false, sub: payload.sub };
}

const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function makeReference(prefix) {
	let out = '';
	const bytes = crypto.randomBytes(8);
	for (let i = 0; i < 8; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
	return `${prefix}-${out}`;
}

export function makeSaveToken() {
	return crypto.randomBytes(24).toString('base64url');
}

export const TOKEN_TTL = TOKEN_TTL_SECONDS;
