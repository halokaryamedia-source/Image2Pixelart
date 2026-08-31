import { env } from '$env/dynamic/private';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, readJson, uuid } from '$lib/server/http';
import { enforceRateLimit } from '$lib/server/rate-limit';
import { authorizeRealtimeEditor } from '$lib/server/realtime';
import { r2, r2Bucket } from '$lib/server/r2';

const extensions: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		const projectId = uuid(params.id, 'Project ID'); const device = await authenticateDevice(request);
		await enforceRateLimit('source-upload', `${projectId}:${device.id}`, 20, 3600);
		const body = await readJson<{ fileName?: string; mimeType?: string; byteSize?: number }>(request);
		const extension = extensions[body.mimeType || ''];
		const maxBytes = Number(env.UPLOAD_MAX_BYTES || 20 * 1024 * 1024);
		if (!extension || !Number.isSafeInteger(body.byteSize) || Number(body.byteSize) < 1 || Number(body.byteSize) > maxBytes) throw new ApiError(400, 'Gunakan PNG, JPEG, atau WebP maksimal 20 MB.');
		const projectRows = await db().query('SELECT active_editor_device_id, editor_epoch FROM projects WHERE id = $1::uuid AND deleted_at IS NULL', [projectId]) as Array<{ active_editor_device_id: string | null; editor_epoch: number }>;
		if (!projectRows.length) throw new ApiError(404, 'Proyek tidak ditemukan.');
		if (projectRows[0].active_editor_device_id !== device.id) throw new ApiError(403, 'Hanya editor aktif yang dapat mengganti gambar.');
		try { await authorizeRealtimeEditor(projectId, device.id, Number(projectRows[0].editor_epoch)); }
		catch { throw new ApiError(409, 'Hubungkan kembali editor realtime sebelum upload.'); }
		const assetId = crypto.randomUUID(); const key = `projects/${projectId}/source/${assetId}.${extension}`;
		await db().query(
			`INSERT INTO project_assets (id, project_id, r2_key, file_name, mime_type, byte_size)
			 VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)`,
			[assetId, projectId, key, (body.fileName || `source.${extension}`).slice(0, 255), body.mimeType, body.byteSize]
		);
		const uploadUrl = await getSignedUrl(r2(), new PutObjectCommand({ Bucket: r2Bucket(), Key: key, ContentType: body.mimeType }), { expiresIn: Number(env.SIGNED_URL_TTL_SECONDS || 300) });
		return json({ assetId, uploadUrl });
	} catch (error) { return apiError(error); }
};
