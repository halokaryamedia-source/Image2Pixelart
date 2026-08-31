import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { apiError, ApiError } from '$lib/server/http';
import { deleteR2Object } from '$lib/server/r2';

export const GET: RequestHandler = async ({ request }) => {
	try {
		if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) throw new ApiError(401, 'Cron secret tidak valid.');
		const projects = await db().query('SELECT id FROM projects WHERE purge_after IS NOT NULL AND purge_after <= now() ORDER BY purge_after LIMIT 100') as Array<{ id: string }>;
		let purged = 0;
		for (const project of projects) {
			const assets = await db().query('SELECT r2_key FROM project_assets WHERE project_id = $1::uuid', [project.id]) as Array<{ r2_key: string }>;
			for (const asset of assets) await deleteR2Object(asset.r2_key);
			await db().query('DELETE FROM projects WHERE id = $1::uuid AND purge_after <= now()', [project.id]);
			purged += 1;
		}
		await db().query('DELETE FROM rate_limit_buckets WHERE expires_at <= now()');
		return json({ purged });
	} catch (error) { return apiError(error); }
};
