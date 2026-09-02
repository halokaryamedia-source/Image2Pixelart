import type { PageServerLoad } from './$types';
import { requireAdminSession } from '$lib/server/admin-auth';
import { getCanvasSettings } from '$lib/server/site-settings';

export const load: PageServerLoad = async ({ cookies }) => {
	await requireAdminSession(cookies);
	return { canvas: await getCanvasSettings() };
};
