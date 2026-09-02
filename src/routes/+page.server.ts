import type { PageServerLoad } from './$types';
import { getCanvasSettings } from '$lib/server/site-settings';

export const load: PageServerLoad = async () => ({
	canvasSettings: await getCanvasSettings()
});
