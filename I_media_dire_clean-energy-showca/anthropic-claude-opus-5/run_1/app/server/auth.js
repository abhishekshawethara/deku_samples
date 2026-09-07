import crypto from 'node:crypto';

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password) {
	const salt = crypto.randomBytes(16);
	const derived = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keylen, {
		N: SCRYPT_PARAMS.N,
		r: SCRYPT_PARAMS.r,
		p: SCRYPT_PARAMS.p
	});
	return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password, stored) {
	try {
		const [scheme, N, r, p, saltHex, hashHex] = String(stored).split('$');
		if (scheme !== 'scrypt') return false;
		const salt = Buffer.from(saltHex, 'hex');
		const expected = Buffer.from(hashHex, 'hex');
		const derived = crypto.scryptSync(password, salt, expected.length, {
			N: Number(N),
			r: Number(r),
			p: Number(p)
		});
		return crypto.timingSafeEqual(derived, expected);
	} catch {
		return false;
	}
}

export function newToken() {
	return crypto.randomBytes(32).toString('hex');
}

const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function reference(prefix) {
	let out = '';
	const bytes = crypto.randomBytes(8);
	for (let i = 0; i < 8; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
	return `${prefix}-${out}`;
}
