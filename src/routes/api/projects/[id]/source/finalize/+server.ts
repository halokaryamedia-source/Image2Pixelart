import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, readJson, uuid } from '$lib/server/http';
import { deleteR2Object, headR2Object } from '$lib/server/r2';
import { realtimeInternal } from '$lib/server/realtime';

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		const projectId = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		const body = await readJson<{ assetId?: string; width?: number; height?: number }>(request);
		const assetId = uuid(body.assetId || '', 'Asset ID');
		if (!Number.isSafeInteger(body.width) || !Number.isSafeInteger(body.height) || Number(body.width) < 1 || Number(body.height) < 1 || Number(body.width) * Number(body.height) > 25_000_000) throw new ApiError(400, 'Dimensi gambar tidak valid.');
		const assets = await db().query(
			`SELECT a.r2_key, a.byte_size, a.mime_type, p.active_editor_device_id, p.source_asset_id, p.revision,
			 old.r2_key old_r2_key
			 FROM project_assets a JOIN projects p ON p.id = a.project_id
			 LEFT JOIN project_assets old ON old.id = p.source_asset_id
			 WHERE a.id = $1::uuid AND a.project_id = $2::uuid AND a.status = 'pending' AND p.deleted_at IS NULL`, [assetId, projectId]
		) as Array<{ r2_key: string; byte_size: number; mime_type: string; active_editor_device_id: string | null; source_asset_id: string | null; revision: number; old_r2_key: string | null }>;
		if (!assets.length) throw new ApiError(404, 'Upload pending tidak ditemukan.');
		const asset = assets[0];
		if (asset.active_editor_device_id !== device.id) throw new ApiError(403, 'Hanya editor aktif yang dapat menyelesaikan upload.');
		const head = await headR2Object(asset.r2_key);
		const maxBytes = Number(env.UPLOAD_MAX_BYTES || 20 * 1024 * 1024);
		if (!head.ContentLength || head.ContentLength > maxBytes || head.ContentLength !== Number(asset.byte_size) || head.ContentType !== asset.mime_type) {
			await deleteR2Object(asset.r2_key); await db().query('DELETE FROM project_assets WHERE id = $1::uuid', [assetId]);
			throw new ApiError(400, 'File R2 tidak cocok dengan upload yang diminta.');
		}
		const rows = await db().query(
			`WITH ready AS (
				UPDATE project_assets SET status = 'ready', width = $3, height = $4 WHERE id = $1::uuid RETURNING id
			)
			UPDATE projects SET source_asset_id = (SELECT id FROM ready), revision = revision + 1, updated_at = now()
			WHERE id = $2::uuid RETURNING revision`, [assetId, projectId, body.width, body.height]
		) as Array<{ revision: number }>;
		if (asset.source_asset_id && asset.old_r2_key) {
			await deleteR2Object(asset.old_r2_key).catch(console.error);
			await db().query('DELETE FROM project_assets WHERE id = $1::uuid AND id <> $2::uuid', [asset.source_asset_id, assetId]);
		}
		void realtimeInternal(`/internal/projects/${projectId}/event`, { type: 'project_saved', revision: Number(rows[0].revision), deviceId: device.id }).catch(console.error);
		return json({ assetId, revision: Number(rows[0].revision) });
	} catch (error) { return apiError(error); }
};
