import { env } from '$env/dynamic/private';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { ApiError, uuid } from './http';

export type AuthenticatedDevice = { id: string; displayName: string };

export function deviceSecretHash(secret: string): string {
	if (!env.DEVICE_TOKEN_PEPPER) throw new Error('DEVICE_TOKEN_PEPPER belum dikonfigurasi.');
	return createHmac('sha256', env.DEVICE_TOKEN_PEPPER).update(secret).digest('hex');
}

function credentials(request: Request): { id: string; secret: string } {
	const id = uuid(request.headers.get('x-device-id') || '', 'Device ID');
	const authorization = request.headers.get('authorization') || '';
	if (!authorization.startsWith('Bearer ') || authorization.length < 40) throw new ApiError(401, 'Kredensial perangkat tidak tersedia.');
	return { id, secret: authorization.slice(7) };
}

export async function authenticateDevice(request: Request): Promise<AuthenticatedDevice> {
	const { id, secret } = credentials(request);
	const rows = await db().query('SELECT id, display_name, secret_hash FROM devices WHERE id = $1::uuid', [id]) as Array<{ id: string; display_name: string; secret_hash: string }>;
	if (!rows.length) throw new ApiError(401, 'Perangkat belum terdaftar.');
	const actual = Buffer.from(rows[0].secret_hash, 'hex');
	const supplied = Buffer.from(deviceSecretHash(secret), 'hex');
	if (actual.length !== supplied.length || !timingSafeEqual(actual, supplied)) throw new ApiError(401, 'Kredensial perangkat tidak valid.');
	return { id: rows[0].id, displayName: rows[0].display_name };
}

export function rawDeviceCredentials(request: Request): { id: string; secret: string } { return credentials(request); }
