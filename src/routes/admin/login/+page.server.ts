import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasAdminSession, setAdminSession, verifyAdminPassword } from '$lib/server/admin-auth';
import { enforceRateLimit } from '$lib/server/rate-limit';

export const load: PageServerLoad = async ({ cookies }) => {
	if (await hasAdminSession(cookies)) redirect(303, '/admin');
	return {};
};

export const actions = {
	default: async (event) => {
		await enforceRateLimit('admin-login', event.getClientAddress(), 10, 15 * 60);
		const data = await event.request.formData();
		const password = String(data.get('password') ?? '');
		if (!verifyAdminPassword(password)) return fail(400, { invalid: true });
		await setAdminSession(event.cookies);
		redirect(303, '/admin');
	}
} satisfies Actions;
