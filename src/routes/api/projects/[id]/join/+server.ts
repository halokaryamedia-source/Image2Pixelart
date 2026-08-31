import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, uuid } from '$lib/server/http';

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		const id = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		const rows = await db().query(
			`INSERT INTO project_participants (project_id, device_id)
			 SELECT id, $2::uuid FROM projects WHERE id = $1::uuid AND deleted_at IS NULL
			 ON CONFLICT DO NOTHING RETURNING project_id`, [id, device.id]
		);
		if (!rows.length) {
			const exists = await db().query('SELECT 1 FROM project_participants WHERE project_id = $1::uuid AND device_id = $2::uuid', [id, device.id]);
			if (!exists.length) throw new ApiError(404, 'Proyek tidak ditemukan.');
		}
		return json({ ok: true });
	} catch (error) { return apiError(error); }
};
