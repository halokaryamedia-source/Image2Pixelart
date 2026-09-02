import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clearAdminSession, requireAdminSession } from '$lib/server/admin-auth';
import { getCanvasSettings } from '$lib/server/site-settings';

export const load: PageServerLoad = async ({ cookies }) => {
	await requireAdminSession(cookies);
	return { canvas: await getCanvasSettings() };
};

export const actions = {
	logout: async ({ cookies }) => {
		clearAdminSession(cookies);
		redirect(303, '/admin/login');
	}
} satisfies Actions;
