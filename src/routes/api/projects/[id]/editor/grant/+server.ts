import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, readJson, uuid } from '$lib/server/http';
import { authorizeRealtimeEditor, realtimeInternal } from '$lib/server/realtime';
import { canGrantEditor } from '$lib/cloud/permissions';

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		const id = uuid(params.id, 'Project ID'); const caller = await authenticateDevice(request);
		const body = await readJson<{ targetDeviceId?: string; revision?: number }>(request);
		const target = uuid(body.targetDeviceId || '', 'Target device ID');
		if (!Number.isSafeInteger(body.revision) || Number(body.revision) < 1) throw new ApiError(400, 'Revision wajib tersedia sebelum handoff.');
		const projectRows = await db().query('SELECT owner_device_id, active_editor_device_id, editor_epoch, revision FROM projects WHERE id = $1::uuid AND deleted_at IS NULL', [id]) as Array<{ owner_device_id: string; active_editor_device_id: string | null; editor_epoch: number; revision: number }>;
		if (!projectRows.length) throw new ApiError(404, 'Proyek tidak ditemukan.');
		const project = projectRows[0];
		if (Number(project.revision) !== Number(body.revision)) throw new ApiError(409, 'Simpan revision terbaru sebelum menyerahkan editor.', { revision: Number(project.revision) });
		if (!canGrantEditor({ ownerDeviceId: project.owner_device_id, activeEditorDeviceId: project.active_editor_device_id }, caller.id)) throw new ApiError(403, 'Hanya pemilik atau editor aktif yang dapat menyerahkan kontrol.');
		if (caller.id === project.active_editor_device_id && caller.id !== project.owner_device_id) {
			try { await authorizeRealtimeEditor(id, caller.id, Number(project.editor_epoch)); }
			catch { throw new ApiError(403, 'Editor harus terhubung realtime untuk menyerahkan kontrol.'); }
		}
		const participant = await db().query('SELECT 1 FROM project_participants WHERE project_id = $1::uuid AND device_id = $2::uuid', [id, target]);
		if (!participant.length) throw new ApiError(404, 'Pengguna tujuan belum membuka proyek ini.');
		const rows = await db().query(
			`UPDATE projects SET active_editor_device_id = $2::uuid, editor_epoch = editor_epoch + 1, updated_at = now()
			 WHERE id = $1::uuid RETURNING active_editor_device_id, editor_epoch`, [id, target]
		) as Array<{ active_editor_device_id: string; editor_epoch: number }>;
		await realtimeInternal(`/internal/projects/${id}/sync`, { activeEditorDeviceId: target, editorEpoch: Number(rows[0].editor_epoch) });
		return json({ activeEditorDeviceId: target, editorEpoch: Number(rows[0].editor_epoch) });
	} catch (error) { return apiError(error); }
};
