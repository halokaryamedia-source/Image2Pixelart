import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdminSession } from '$lib/server/admin-auth';
import { getCanvasSettings, saveCanvasSettings } from '$lib/server/site-settings';
import { cmToMm } from '$lib/utils/grid';

export const load: PageServerLoad = async ({ cookies }) => {
	await requireAdminSession(cookies);
	return { canvas: await getCanvasSettings() };
};

export const actions = {
	default: async ({ cookies, request }) => {
		await requireAdminSession(cookies);
		const data = await request.formData();
		const values = {
			widthCm: Number(data.get('widthCm')),
			heightCm: Number(data.get('heightCm')),
			cellCm: Number(data.get('cellCm'))
		};
		try {
			const settings = await saveCanvasSettings({
				widthMm: cmToMm(values.widthCm),
				heightMm: cmToMm(values.heightCm),
				cellMm: cmToMm(values.cellCm)
			});
			return { success: true, settings, values };
		} catch (caught) {
			const message = caught instanceof Error ? caught.message.replace('Ukuran tile', 'Ukuran sel') : 'Pengaturan Canvas tidak valid.';
			return fail(400, { success: false, message, values });
		}
	}
} satisfies Actions;
