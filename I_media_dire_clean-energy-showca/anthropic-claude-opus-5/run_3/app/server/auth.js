import crypto from 'node:crypto';

const SECRET =
	process.env.AUTH_SECRET ||
	crypto.createHash('sha256').update(String(process.env.DATABASE_URL || 'zettajoule')).digest('hex');

const TOKEN_TTL_SECONDS = 60 * 60 * 12;

export function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const derived = crypto.scryptSync(password, salt, 64).toString('hex');
	return `scrypt$16384$8$1$${salt}$${derived}`;
}

export function verifyPassword(password, stored) {
	try {
		const parts = String(stored || '').split('$');
		if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
		const salt = parts[4];
		const expected = Buffer.from(parts[5], 'hex');
		const derived = crypto.scryptSync(password, salt, expected.length);
		return crypto.timingSafeEqual(expected, derived);
	} catch {
		return false;
	}
}

function b64u(buf) {
	return Buffer.from(buf).toString('base64url');
}

export function issueToken(accountId, ttl = TOKEN_TTL_SECONDS) {
	const payload = b64u(
		JSON.stringify({ sub: String(accountId), exp: Math.floor(Date.now() / 1000) + ttl })
	);
	const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
	return `${payload}.${sig}`;
}

export function readToken(token) {
	if (!token || typeof token !== 'string') return null;
	const [payload, sig] = token.split('.');
	if (!payload || !sig) return null;
	const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
	let data;
	try {
		data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
	} catch {
		return null;
	}
	if (!data || !data.sub || !data.exp) return null;
	if (data.exp < Math.floor(Date.now() / 1000)) return { expired: true, sub: data.sub };
	return { sub: data.sub, exp: data.exp };
}

const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function reference(prefix) {
	let out = '';
	const bytes = crypto.randomBytes(8);
	for (let i = 0; i < 8; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
	return `${prefix}-${out}`;
}

export function saveToken() {
	return crypto.randomBytes(24).toString('base64url');
}

export const TOKEN_TTL = TOKEN_TTL_SECONDS;
