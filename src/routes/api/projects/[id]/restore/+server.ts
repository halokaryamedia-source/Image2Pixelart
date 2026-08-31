import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, uuid } from '$lib/server/http';

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		const id = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		const rows = await db().query(
			`UPDATE projects SET deleted_at = NULL, purge_after = NULL, updated_at = now()
			 WHERE id = $1::uuid AND owner_device_id = $2::uuid AND deleted_at IS NOT NULL AND purge_after > now() RETURNING id`, [id, device.id]
		);
		if (!rows.length) throw new ApiError(403, 'Proyek tidak dapat dipulihkan oleh perangkat ini.');
		return json({ ok: true });
	} catch (error) { return apiError(error); }
};
