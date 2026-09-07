import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { one } from './db.js';

const SECRET =
	process.env.AUTH_SECRET ||
	crypto.createHash('sha256').update(String(process.env.DATABASE_URL || 'zettajoule')).digest('hex');

const TTL_SECONDS = 60 * 60 * 24 * 7;

function b64url(buf) {
	return Buffer.from(buf).toString('base64url');
}

export function signToken(accountId) {
	const payload = b64url(JSON.stringify({ sub: accountId, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS }));
	const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
	return `${payload}.${sig}`;
}

export function verifyToken(token) {
	if (!token || typeof token !== 'string') return null;
	const parts = token.split('.');
	if (parts.length !== 2) return null;
	const [payload, sig] = parts;
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
	if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
	return data;
}

export function hashPassword(pw) {
	return bcrypt.hashSync(pw, 10);
}

export function checkPassword(pw, hash) {
	try {
		return bcrypt.compareSync(pw, hash);
	} catch {
		return false;
	}
}

export function bearerFrom(req) {
	const h = req.headers?.authorization || '';
	if (!h.toLowerCase().startsWith('bearer ')) return null;
	return h.slice(7).trim();
}

export async function currentAccount(req) {
	const token = bearerFrom(req);
	const data = verifyToken(token);
	if (!data) return null;
	return await one('select id, email, display_name from accounts where id=$1', [data.sub]);
}

export function newSaveToken() {
	return crypto.randomBytes(24).toString('base64url');
}

const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function makeReference(prefix) {
	let out = '';
	const bytes = crypto.randomBytes(8);
	for (let i = 0; i < 8; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
	return `${prefix}-${out}`;
}

export const TOKEN_TTL_SECONDS = TTL_SECONDS;
