import { db } from '$lib/server/db';
import type { CanvasSettings, CanvasSettingsInput } from '$lib/site-settings';
import { validateGridMm } from '$lib/utils/grid';

const CANVAS_SETTINGS_KEY = 'canvas';
const DEFAULT_CANVAS_INPUT: CanvasSettingsInput = { widthMm: 2400, heightMm: 1200, cellMm: 50 };

type SettingRow = { value: unknown };

function normalizeStoredValue(value: unknown): CanvasSettingsInput | null {
	let parsed = value;
	if (typeof parsed === 'string') {
		try { parsed = JSON.parse(parsed); }
		catch { return null; }
	}
	if (!parsed || typeof parsed !== 'object') return null;
	const candidate = parsed as Partial<CanvasSettingsInput>;
	if (![candidate.widthMm, candidate.heightMm, candidate.cellMm].every((item) => Number.isSafeInteger(item) && Number(item) > 0)) return null;
	return { widthMm: candidate.widthMm!, heightMm: candidate.heightMm!, cellMm: candidate.cellMm! };
}

export function resolveCanvasSettings(input: CanvasSettingsInput): CanvasSettings {
	const validation = validateGridMm(input.widthMm, input.heightMm, input.cellMm);
	if (!validation.valid) throw new Error(validation.reason);
	return {
		...input,
		columns: validation.columns,
		rows: validation.rows,
		total: validation.total
	};
}

export async function getCanvasSettings(): Promise<CanvasSettings> {
	const rows = await db().query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', [CANVAS_SETTINGS_KEY]) as SettingRow[];
	const stored = rows.length ? normalizeStoredValue(rows[0].value) : null;
	return resolveCanvasSettings(stored ?? DEFAULT_CANVAS_INPUT);
}

export async function saveCanvasSettings(input: CanvasSettingsInput): Promise<CanvasSettings> {
	const settings = resolveCanvasSettings(input);
	await db().query(
		`INSERT INTO site_settings (key, value, updated_at)
		 VALUES ($1, $2::jsonb, now())
		 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
		[CANVAS_SETTINGS_KEY, JSON.stringify({ widthMm: settings.widthMm, heightMm: settings.heightMm, cellMm: settings.cellMm })]
	);
	return settings;
}
