import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deviceSecretHash, rawDeviceCredentials } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, readJson } from '$lib/server/http';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { id, secret } = rawDeviceCredentials(request);
		const body = await readJson<{ displayName?: string }>(request);
		const displayName = body.displayName?.trim().slice(0, 80);
		if (!displayName) throw new ApiError(400, 'Nama tampilan wajib diisi.');
		const rows = await db().query(
			`INSERT INTO devices (id, secret_hash, display_name) VALUES ($1::uuid, $2, $3)
			 ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now()
			 WHERE devices.secret_hash = EXCLUDED.secret_hash RETURNING id`,
			[id, deviceSecretHash(secret), displayName]
		);
		if (!rows.length) throw new ApiError(401, 'Device ID sudah digunakan dengan secret berbeda.');
		return json({ ok: true });
	} catch (error) { return apiError(error); }
};
