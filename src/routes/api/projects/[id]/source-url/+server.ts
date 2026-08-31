import { env } from '$env/dynamic/private';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { ApiError, apiError, uuid } from '$lib/server/http';
import { r2, r2Bucket } from '$lib/server/r2';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = uuid(params.id, 'Project ID');
		const rows = await db().query(
			`SELECT a.r2_key FROM projects p JOIN project_assets a ON a.id = p.source_asset_id
			 WHERE p.id = $1::uuid AND p.deleted_at IS NULL AND a.status = 'ready'`, [id]
		) as Array<{ r2_key: string }>;
		if (!rows.length) throw new ApiError(404, 'Gambar sumber tidak ditemukan.');
		const url = await getSignedUrl(r2(), new GetObjectCommand({ Bucket: r2Bucket(), Key: rows[0].r2_key }), { expiresIn: Number(env.SIGNED_URL_TTL_SECONDS || 300) });
		return json({ url });
	} catch (error) { return apiError(error); }
};
