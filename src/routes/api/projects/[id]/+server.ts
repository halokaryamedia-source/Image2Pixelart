import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, readJson, uuid } from '$lib/server/http';
import { rowToPayload, validateCloudPayload, type ProjectRow } from '$lib/server/project-data';
import { enforceRateLimit } from '$lib/server/rate-limit';
import { authorizeRealtimeEditor, realtimeInternal } from '$lib/server/realtime';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2, r2Bucket } from '$lib/server/r2';
import { env } from '$env/dynamic/private';
import type { CloudProjectDocument } from '$lib/cloud/types';

const projectQuery = `SELECT p.*, a.file_name source_file_name, a.mime_type source_mime_type,
	a.width source_width, a.height source_height, a.r2_key source_r2_key
	FROM projects p LEFT JOIN project_assets a ON a.id = p.source_asset_id AND a.status = 'ready' WHERE p.id = $1::uuid`;

function structureChanged(current: CloudProjectDocument, next: CloudProjectDocument): boolean {
	return current.widthMm !== next.widthMm
		|| current.heightMm !== next.heightMm
		|| current.cellMm !== next.cellMm
		|| current.columns !== next.columns
		|| current.rows !== next.rows;
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = uuid(params.id, 'Project ID');
		const rows = await db().query(projectQuery, [id]) as Array<ProjectRow & { source_r2_key?: string }>;
		if (!rows.length) throw new ApiError(404, 'Proyek tidak ditemukan.');
		const row = rows[0];
		if (row.deleted_at) throw new ApiError(410, 'Proyek berada di tempat sampah.', { deletedAt: row.deleted_at, purgeAfter: row.purge_after, ownerDeviceId: row.owner_device_id });
		let sourceUrl: string | undefined;
		if (row.source_r2_key) sourceUrl = await getSignedUrl(r2(), new GetObjectCommand({ Bucket: r2Bucket(), Key: row.source_r2_key }), { expiresIn: Number(env.SIGNED_URL_TTL_SECONDS || 300) });
		return json({ project: rowToPayload(row), revision: Number(row.revision), ownerDeviceId: row.owner_device_id, activeEditorDeviceId: row.active_editor_device_id, editorEpoch: Number(row.editor_epoch), deletedAt: null, purgeAfter: null, sourceUrl });
	} catch (error) { return apiError(error); }
};

export const PUT: RequestHandler = async ({ request, params }) => {
	try {
		const id = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		await enforceRateLimit('project-save', `${id}:${device.id}`, 60, 60);
		const expectedRevision = Number(request.headers.get('if-match'));
		if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) throw new ApiError(428, 'Versi proyek tidak valid. Muat ulang proyek lalu coba lagi.');
		const input = await readJson<unknown>(request);
		const { project, document, cellBytes } = validateCloudPayload(input, id);
		const current = await db().query(
			'SELECT owner_device_id, active_editor_device_id, editor_epoch, document FROM projects WHERE id = $1::uuid AND deleted_at IS NULL',
			[id]
		) as Array<{ owner_device_id: string; active_editor_device_id: string | null; editor_epoch: number; document: CloudProjectDocument }>;
		if (!current.length) throw new ApiError(404, 'Proyek tidak ditemukan.');
		if (current[0].active_editor_device_id !== device.id) throw new ApiError(403, 'Kamu sedang tidak memiliki akses edit untuk proyek ini.');
		if (current[0].owner_device_id !== device.id && structureChanged(current[0].document, document)) {
			throw new ApiError(403, 'Ukuran canvas, tile, dan grid hanya dapat diubah oleh Admin proyek.');
		}
		try { await authorizeRealtimeEditor(id, device.id, Number(current[0].editor_epoch)); }
		catch { throw new ApiError(409, 'Akses edit sedang berubah. Tunggu sebentar lalu coba lagi.'); }
		const rows = await db().query(
			`UPDATE projects SET name = $4, document = $5::jsonb, cells = $6, revision = revision + 1, updated_at = now()
			 WHERE id = $1::uuid AND active_editor_device_id = $2::uuid AND revision = $3 AND deleted_at IS NULL
			 RETURNING revision, updated_at`,
			[id, device.id, expectedRevision, project.name, JSON.stringify({ ...document, sourceImage: undefined }), cellBytes]
		) as Array<{ revision: number; updated_at: string }>;
		if (!rows.length) {
			throw new ApiError(409, 'Proyek berubah di tempat lain. Muat ulang untuk mendapatkan versi terbaru.');
		}
		void realtimeInternal(`/internal/projects/${id}/event`, { type: 'project_saved', revision: Number(rows[0].revision), deviceId: device.id }).catch(console.error);
		return json({ revision: Number(rows[0].revision), updatedAt: rows[0].updated_at });
	} catch (error) { return apiError(error); }
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	try {
		const id = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		const rows = await db().query(
			`UPDATE projects SET deleted_at = now(), purge_after = now() + interval '7 days', updated_at = now()
			 WHERE id = $1::uuid AND owner_device_id = $2::uuid AND deleted_at IS NULL RETURNING purge_after`, [id, device.id]
		) as Array<{ purge_after: string }>;
		if (!rows.length) throw new ApiError(403, 'Hanya Admin proyek yang dapat menghapus proyek.');
		void realtimeInternal(`/internal/projects/${id}/event`, { type: 'project_deleted', purgeAfter: rows[0].purge_after }).catch(console.error);
		return json({ purgeAfter: rows[0].purge_after });
	} catch (error) { return apiError(error); }
};