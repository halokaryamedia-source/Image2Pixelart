import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { redirect, type Cookies } from '@sveltejs/kit';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_COOKIE = 'mivubi_admin_session';
const ADMIN_SESSION_SECONDS = 60 * 60 * 8;
const ADMIN_ISSUER = 'mivubi-admin';

function sessionSecret(): Uint8Array {
	const secret = env.ADMIN_SESSION_SECRET;
	if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET belum dikonfigurasi dengan benar.');
	return new TextEncoder().encode(secret);
}

export function verifyAdminPassword(password: string): boolean {
	if (!password || password.length > 1024) return false;
	const encoded = env.ADMIN_PASSWORD_HASH;
	if (!encoded) throw new Error('ADMIN_PASSWORD_HASH belum dikonfigurasi.');
	const [algorithm, saltText, expectedText] = encoded.split('$');
	if (algorithm !== 'scrypt' || !saltText || !expectedText) throw new Error('Format ADMIN_PASSWORD_HASH tidak valid.');
	const salt = Buffer.from(saltText, 'base64url');
	const expected = Buffer.from(expectedText, 'base64url');
	if (!salt.length || expected.length < 32) throw new Error('Format ADMIN_PASSWORD_HASH tidak valid.');
	const actual = scryptSync(password, salt, expected.length);
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function createAdminToken(): Promise<string> {
	return new SignJWT({ scope: 'website-admin' })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuer(ADMIN_ISSUER)
		.setIssuedAt()
		.setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
		.sign(sessionSecret());
}

async function verifyAdminToken(token: string): Promise<boolean> {
	try {
		const { payload } = await jwtVerify(token, sessionSecret(), { issuer: ADMIN_ISSUER, algorithms: ['HS256'] });
		return payload.scope === 'website-admin';
	} catch {
		return false;
	}
}

export async function hasAdminSession(cookies: Cookies): Promise<boolean> {
	const token = cookies.get(ADMIN_COOKIE);
	return token ? verifyAdminToken(token) : false;
}

export async function requireAdminSession(cookies: Cookies): Promise<void> {
	if (!(await hasAdminSession(cookies))) redirect(303, '/admin/login');
}

export async function setAdminSession(cookies: Cookies): Promise<void> {
	cookies.set(ADMIN_COOKIE, await createAdminToken(), {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'strict',
		maxAge: ADMIN_SESSION_SECONDS
	});
}

export function clearAdminSession(cookies: Cookies): void {
	cookies.delete(ADMIN_COOKIE, { path: '/' });
}
