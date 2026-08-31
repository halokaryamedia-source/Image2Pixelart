import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, uuid } from '$lib/server/http';
import { createRealtimeToken } from '$lib/server/realtime';

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		const id = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		const rows = await db().query(
			`SELECT p.owner_device_id, p.active_editor_device_id, p.editor_epoch
			 FROM projects p JOIN project_participants pp ON pp.project_id = p.id
			 WHERE p.id = $1::uuid AND pp.device_id = $2::uuid AND p.deleted_at IS NULL`, [id, device.id]
		) as Array<{ owner_device_id: string; active_editor_device_id: string | null; editor_epoch: number }>;
		if (!rows.length) throw new ApiError(403, 'Buka dan ikuti proyek sebelum menyambungkan realtime.');
		const state = rows[0];
		const token = await createRealtimeToken({ projectId: id, deviceId: device.id, displayName: device.displayName, isOwner: state.owner_device_id === device.id, activeEditorDeviceId: state.active_editor_device_id, editorEpoch: Number(state.editor_epoch) });
		const base = (env.REALTIME_HTTP_URL || 'http://localhost:8787').replace(/^http/, 'ws').replace(/\/$/, '');
		return json({ token, wsUrl: `${base}/projects/${id}/connect` });
	} catch (error) { return apiError(error); }
};
