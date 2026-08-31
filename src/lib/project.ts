import type { CropRect, ImportSettings, ProjectPaletteEntry, ProjectV2, SerializedProjectV2, SourceImage } from '$lib/types';
import { EMPTY_CELL } from '$lib/types';
import { normalizeHex } from '$lib/utils/color';
import { decodeRle, encodeRle } from '$lib/utils/rle';
import { validateGridMm } from '$lib/utils/grid';

const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_SOURCE_IMAGE_PIXELS = 25_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} file proyek tidak valid.`);
	return value.trim();
}

function finiteInteger(value: unknown, label: string): number {
	if (!Number.isInteger(value) || Number(value) < 0) throw new Error(`${label} file proyek tidak valid.`);
	return Number(value);
}

function parseCrop(value: unknown): CropRect | null {
	if (value === null || value === undefined) return null;
	if (!isRecord(value)) throw new Error('Area crop file proyek tidak valid.');
	const crop = { x: Number(value.x), y: Number(value.y), width: Number(value.width), height: Number(value.height) };
	if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite)
		|| crop.width <= 0 || crop.height <= 0 || crop.width > 2.000001 || crop.height > 2.000001
		|| crop.x >= 1 || crop.y >= 1 || crop.x + crop.width <= 0 || crop.y + crop.height <= 0) {
		throw new Error('Area crop file proyek tidak valid.');
	}
	return crop;
}

function parsePaletteV2(value: unknown): ProjectPaletteEntry[] {
	if (!Array.isArray(value) || value.length > 32) throw new Error('Palette file proyek harus berisi 0–32 warna.');
	const ids = new Set<string>();
	return value.map((item, index) => {
		if (!isRecord(item) || item.slot !== index) throw new Error('Urutan slot palette file proyek tidak valid.');
		const id = requiredString(item.id, 'ID warna');
		if (ids.has(id)) throw new Error('Palette file proyek memiliki ID warna duplikat.');
		ids.add(id);
		const hex = typeof item.hex === 'string' ? normalizeHex(item.hex) : null;
		if (!hex) throw new Error('HEX palette file proyek tidak valid.');
		return { id, slot: index, hex, locked: false };
	});
}

function parsePaletteV3(value: unknown): ProjectPaletteEntry[] {
	if (!Array.isArray(value) || value.length > 32) throw new Error('Palette file proyek harus berisi 0–32 warna.');
	const ids = new Set<string>();
	return value.map((item, index) => {
		if (!isRecord(item) || item.slot !== index) throw new Error('Urutan slot palette file proyek tidak valid.');
		const id = requiredString(item.id, 'ID warna');
		if (ids.has(id)) throw new Error('Palette file proyek memiliki ID warna duplikat.');
		ids.add(id);
		const hex = typeof item.hex === 'string' ? normalizeHex(item.hex) : null;
		if (!hex) throw new Error('HEX palette file proyek tidak valid.');
		if (item.name !== undefined && typeof item.name !== 'string') throw new Error('Nama warna file proyek tidak valid.');
		if (item.locked !== undefined && typeof item.locked !== 'boolean') throw new Error('Status lock warna file proyek tidak valid.');
		const name = typeof item.name === 'string' ? item.name.trim().slice(0, 80) || undefined : undefined;
		return { id, slot: index, hex, name, locked: item.locked === true };
	});
}

function parsePaletteV1(value: unknown): ProjectPaletteEntry[] {
	if (!Array.isArray(value) || value.length < 1 || value.length > 32) throw new Error('Palette proyek lama tidak valid.');
	return value.map((item, index) => {
		if (!isRecord(item)) throw new Error('Palette proyek lama tidak valid.');
		const hex = typeof item.hex === 'string' ? normalizeHex(item.hex) : null;
		if (!hex) throw new Error('HEX palette proyek lama tidak valid.');
		const legacyId = typeof item.catalogId === 'string' && item.catalogId.trim() ? item.catalogId.trim() : `${hex.slice(1)}-${index}`;
		return { id: `legacy-${legacyId}`, slot: index, hex, locked: false };
	});
}

function defaultSettings(): ImportSettings {
	return { placement: 'crop', crop: null, renderMode: 'contour', suggestionCount: 8 };
}

function parseImportSettingsV2(value: unknown): ImportSettings {
	if (value === undefined) return defaultSettings();
	if (!isRecord(value)) throw new Error('Pengaturan impor file proyek tidak valid.');
	const placement = value.placement === 'fit' ? 'fit' : value.placement === 'crop' ? 'crop' : null;
	const renderMode = value.renderMode === 'photo' ? 'photo' : value.renderMode === 'contour' ? 'contour' : null;
	const suggestionCount = Number(value.suggestionCount);
	if (!placement || !renderMode || !Number.isInteger(suggestionCount) || suggestionCount < 2 || suggestionCount > 32) {
		throw new Error('Pengaturan impor file proyek tidak valid.');
	}
	return { placement, crop: parseCrop(value.crop), renderMode, suggestionCount };
}

function migrateImportSettingsV1(value: unknown): ImportSettings {
	if (!isRecord(value)) return defaultSettings();
	const maxColors = Number(value.maxColors);
	return {
		placement: value.fit === 'contain' ? 'fit' : 'crop',
		crop: null,
		renderMode: 'contour',
		suggestionCount: Number.isInteger(maxColors) ? Math.max(2, Math.min(32, maxColors)) : 8
	};
}

function parseSourceImage(value: unknown): SourceImage | undefined {
	if (value === undefined) return undefined;
	if (!isRecord(value)) throw new Error('Data gambar sumber file proyek tidak valid.');
	const type = requiredString(value.type, 'Tipe gambar sumber');
	if (!['image/png', 'image/jpeg', 'image/webp'].includes(type)) throw new Error('Format gambar sumber file proyek tidak didukung.');
	const dataUrl = requiredString(value.dataUrl, 'Data gambar sumber');
	const match = dataUrl.match(/^data:image\/(?:png|jpeg|webp);base64,([a-zA-Z0-9+/=]+)$/);
	if (!match || Math.ceil(match[1].length * 3 / 4) > MAX_SOURCE_IMAGE_BYTES) throw new Error('Data gambar sumber file proyek tidak valid atau melebihi 20 MB.');
	const width = finiteInteger(value.width, 'Lebar gambar sumber');
	const height = finiteInteger(value.height, 'Tinggi gambar sumber');
	if (width < 1 || height < 1 || width * height > MAX_SOURCE_IMAGE_PIXELS) throw new Error('Resolusi gambar sumber file proyek tidak valid.');
	return { name: requiredString(value.name, 'Nama gambar sumber'), type, dataUrl, width, height };
}

function validTimestamp(value: unknown, fallback: string): string {
	return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : fallback;
}

function parseCommon(parsed: Record<string, unknown>) {
	const widthMm = finiteInteger(parsed.widthMm, 'Lebar');
	const heightMm = finiteInteger(parsed.heightMm, 'Tinggi');
	const cellMm = finiteInteger(parsed.cellMm, 'Ukuran sel');
	const columns = finiteInteger(parsed.columns, 'Jumlah kolom');
	const rows = finiteInteger(parsed.rows, 'Jumlah baris');
	const validation = validateGridMm(widthMm, heightMm, cellMm);
	if (!validation.valid || validation.columns !== columns || validation.rows !== rows) throw new Error('Dimensi file proyek tidak valid.');
	return { widthMm, heightMm, cellMm, columns, rows };
}

function validateCells(cells: Uint16Array, total: number, paletteLength: number): Uint16Array {
	if (cells.length !== total) throw new Error('Jumlah sel file proyek tidak valid.');
	if (cells.some((slot) => slot !== EMPTY_CELL && slot >= paletteLength)) throw new Error('File proyek merujuk warna yang tidak tersedia.');
	return cells;
}

function projectFromRecord(parsed: Record<string, unknown>, cells: Uint16Array, sourceOverride?: SourceImage): ProjectV2 {
	if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2 && parsed.schemaVersion !== 3) throw new Error('Versi file proyek belum didukung.');
	const dimensions = parseCommon(parsed);
	const palette = parsed.schemaVersion === 3 ? parsePaletteV3(parsed.palette) : parsed.schemaVersion === 2 ? parsePaletteV2(parsed.palette) : parsePaletteV1(parsed.palette);
	validateCells(cells, dimensions.columns * dimensions.rows, palette.length);
	const now = new Date().toISOString();
	return {
		schemaVersion: 3,
		id: requiredString(parsed.id, 'ID proyek'),
		name: requiredString(parsed.name, 'Nama proyek').slice(0, 200),
		...dimensions,
		palette,
		suggestedPalette: parsed.schemaVersion === 3 && parsed.suggestedPalette !== undefined
			? parsePaletteV3(parsed.suggestedPalette)
			: parsed.schemaVersion === 2 && parsed.suggestedPalette !== undefined
				? parsePaletteV2(parsed.suggestedPalette)
				: undefined,
		cells: cells.slice(),
		importSettings: parsed.schemaVersion === 2 || parsed.schemaVersion === 3 ? parseImportSettingsV2(parsed.importSettings) : migrateImportSettingsV1(parsed.importSettings),
		sourceImage: sourceOverride ?? parseSourceImage(parsed.sourceImage),
		createdAt: validTimestamp(parsed.createdAt, now),
		updatedAt: validTimestamp(parsed.updatedAt, now)
	};
}

export function createProject(input: { name: string; widthMm: number; heightMm: number; cellMm: number }): ProjectV2 {
	const validation = validateGridMm(input.widthMm, input.heightMm, input.cellMm);
	if (!validation.valid) throw new Error(validation.reason ?? 'Ukuran grid tidak valid.');
	const now = new Date().toISOString();
	const cells = new Uint16Array(validation.total);
	cells.fill(EMPTY_CELL);
	return {
		schemaVersion: 3,
		id: crypto.randomUUID(),
		name: input.name.trim() || 'Proyek tanpa nama',
		widthMm: input.widthMm,
		heightMm: input.heightMm,
		cellMm: input.cellMm,
		columns: validation.columns,
		rows: validation.rows,
		palette: [],
		cells,
		importSettings: defaultSettings(),
		createdAt: now,
		updatedAt: now
	};
}

export function serializeProject(project: ProjectV2): string {
	const serialized: SerializedProjectV2 = { ...cloneProject(project), cellsRle: encodeRle(project.cells) };
	delete (serialized as Partial<ProjectV2>).cells;
	return JSON.stringify(serialized);
}

export function deserializeProject(text: string): ProjectV2 {
	let parsed: unknown;
	try { parsed = JSON.parse(text); }
	catch { throw new Error('File proyek bukan JSON yang valid.'); }
	if (!isRecord(parsed)) throw new Error('Struktur file proyek tidak valid.');
	const dimensions = parseCommon(parsed);
	if (!Array.isArray(parsed.cellsRle) || parsed.cellsRle.some((value) => typeof value !== 'number')) throw new Error('Data grid RLE file proyek tidak valid.');
	return projectFromRecord(parsed, decodeRle(parsed.cellsRle as number[], dimensions.columns * dimensions.rows));
}

export function migrateStoredProject(value: unknown, sourceImage?: SourceImage): ProjectV2 {
	if (!isRecord(value)) throw new Error('Proyek tersimpan tidak valid.');
	const rawCells = value.cells;
	const cells = rawCells instanceof Uint16Array
		? rawCells
		: Array.isArray(rawCells) && rawCells.every((slot) => Number.isInteger(slot))
			? Uint16Array.from(rawCells as number[])
			: null;
	if (!cells) throw new Error('Data sel proyek tersimpan tidak valid.');
	return projectFromRecord(value, cells, sourceImage);
}

export function cloneProject(project: ProjectV2): ProjectV2 {
	return {
		...project,
		palette: project.palette.map((entry) => ({ ...entry })),
		suggestedPalette: project.suggestedPalette?.map((entry) => ({ ...entry })),
		cells: project.cells.slice(),
		importSettings: {
			...project.importSettings,
			crop: project.importSettings.crop ? { ...project.importSettings.crop } : null
		},
		sourceImage: project.sourceImage ? { ...project.sourceImage } : undefined
	};
}
