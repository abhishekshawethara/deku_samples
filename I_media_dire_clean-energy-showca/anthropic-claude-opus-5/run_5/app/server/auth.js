import crypto from 'node:crypto';
import { query } from './db.js';

const SECRET =
	process.env.AUTH_SECRET || 'zettajoule-token-secret-' + (process.env.DATABASE_URL || 'local');
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 60 * 60 * 12);

export function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const derived = crypto.scryptSync(password, salt, 64).toString('hex');
	return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password, stored) {
	if (typeof stored !== 'string') return false;
	const parts = stored.split('$');
	if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
	const [, salt, expected] = parts;
	let derived;
	try {
		derived = crypto.scryptSync(password, salt, 64).toString('hex');
	} catch {
		return false;
	}
	const a = Buffer.from(derived, 'hex');
	const b = Buffer.from(expected, 'hex');
	if (a.length !== b.length) return false;
	return crypto.timingSafeEqual(a, b);
}

function b64url(buf) {
	return Buffer.from(buf).toString('base64url');
}

export function issueToken(accountId) {
	const payload = b64url(
		JSON.stringify({ sub: accountId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })
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
	if (!data || typeof data.sub !== 'number') return null;
	if (typeof data.exp !== 'number' || data.exp * 1000 < Date.now()) return { expired: true };
	return { accountId: data.sub };
}

export async function accountFromRequest(req) {
	const header = req.headers['authorization'] || '';
	const m = /^Bearer\s+(.+)$/i.exec(header.trim());
	if (!m) return { account: null, reason: 'missing' };
	const parsed = readToken(m[1]);
	if (!parsed) return { account: null, reason: 'invalid' };
	if (parsed.expired) return { account: null, reason: 'expired' };
	const { rows } = await query(
		'SELECT id, email, display_name FROM accounts WHERE id = $1',
		[parsed.accountId]
	);
	if (!rows.length) return { account: null, reason: 'invalid' };
	return { account: rows[0], reason: null };
}

export function reference(prefix) {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let out = '';
	const bytes = crypto.randomBytes(8);
	for (let i = 0; i < 8; i += 1) out += alphabet[bytes[i] % alphabet.length];
	return `${prefix}-${out}`;
}

export function newSaveToken() {
	return crypto.randomBytes(24).toString('base64url');
}
