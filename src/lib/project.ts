import { DEFAULT_CATALOG, snapshotPalette } from '$lib/catalog';
import type { CatalogColor, ImportSettings, ProjectPaletteEntry, ProjectV1, SerializedProjectV1, SourceImage } from '$lib/types';
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

function parsePalette(value: unknown): ProjectPaletteEntry[] {
	if (!Array.isArray(value) || value.length < 1 || value.length > 32) throw new Error('Palette file proyek harus berisi 1–32 warna.');
	const catalogIds = new Set<string>();
	return value.map((item, index) => {
		if (!isRecord(item) || item.slot !== index) throw new Error('Urutan slot palette file proyek tidak valid.');
		const catalogId = requiredString(item.catalogId, 'ID warna');
		if (catalogIds.has(catalogId)) throw new Error('Palette file proyek memiliki ID warna duplikat.');
		catalogIds.add(catalogId);
		const hex = typeof item.hex === 'string' ? normalizeHex(item.hex) : null;
		if (!hex) throw new Error('HEX palette file proyek tidak valid.');
		if (item.code !== undefined && typeof item.code !== 'string') throw new Error('Kode produk file proyek tidak valid.');
		return {
			slot: index,
			catalogId,
			name: requiredString(item.name, 'Nama warna'),
			code: typeof item.code === 'string' && item.code.trim() ? item.code.trim() : undefined,
			hex,
			pinned: item.pinned === true
		};
	});
}

function parseImportSettings(value: unknown, paletteLength: number): ImportSettings {
	if (value === undefined) return { fit: 'cover', focalX: 0.5, focalY: 0.5, maxColors: Math.min(8, paletteLength), autoPalette: true };
	if (!isRecord(value)) throw new Error('Pengaturan impor file proyek tidak valid.');
	const fit = value.fit === 'contain' ? 'contain' : value.fit === 'cover' ? 'cover' : null;
	const focalX = Number(value.focalX);
	const focalY = Number(value.focalY);
	const maxColors = Number(value.maxColors);
	if (!fit || !Number.isFinite(focalX) || focalX < 0 || focalX > 1 || !Number.isFinite(focalY) || focalY < 0 || focalY > 1) {
		throw new Error('Posisi crop file proyek tidak valid.');
	}
	if (!Number.isInteger(maxColors) || maxColors < 1 || maxColors > 32) throw new Error('Batas warna file proyek tidak valid.');
	return { fit, focalX, focalY, maxColors, autoPalette: value.autoPalette !== false };
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

export function createProject(input: { name: string; widthMm: number; heightMm: number; cellMm: number; backgroundCatalogId: string; catalog?: CatalogColor[] }): ProjectV1 {
	const validation = validateGridMm(input.widthMm, input.heightMm, input.cellMm);
	if (!validation.valid) throw new Error(validation.reason ?? 'Ukuran grid tidak valid.');
	const activeCatalog = (input.catalog ?? DEFAULT_CATALOG).filter((color) => color.active);
	const background = activeCatalog.find((color) => color.id === input.backgroundCatalogId) ?? activeCatalog[0];
	if (!background) throw new Error('Aktifkan minimal satu warna katalog sebelum membuat proyek.');
	const sourceCatalog = [background, ...activeCatalog.filter((color) => color.id !== background.id)].slice(0, 8);
	const palette = snapshotPalette(sourceCatalog);
	palette[0].pinned = true;
	const now = new Date().toISOString();
	return {
		schemaVersion: 1,
		id: crypto.randomUUID(),
		name: input.name.trim() || 'Proyek tanpa nama',
		widthMm: input.widthMm,
		heightMm: input.heightMm,
		cellMm: input.cellMm,
		columns: validation.columns,
		rows: validation.rows,
		palette,
		backgroundSlot: 0,
		cells: new Uint16Array(validation.total),
		importSettings: { fit: 'cover', focalX: 0.5, focalY: 0.5, maxColors: 8, autoPalette: true },
		createdAt: now,
		updatedAt: now
	};
}

export function serializeProject(project: ProjectV1): string {
	const serialized: SerializedProjectV1 = { ...project, cellsRle: encodeRle(project.cells) };
	delete (serialized as Partial<ProjectV1>).cells;
	return JSON.stringify(serialized);
}

export function deserializeProject(text: string): ProjectV1 {
	let parsed: unknown;
	try { parsed = JSON.parse(text); }
	catch { throw new Error('File proyek bukan JSON yang valid.'); }
	if (!isRecord(parsed)) throw new Error('Struktur file proyek tidak valid.');
	if (parsed.schemaVersion !== 1) throw new Error('Versi file proyek belum didukung.');
	const widthMm = finiteInteger(parsed.widthMm, 'Lebar');
	const heightMm = finiteInteger(parsed.heightMm, 'Tinggi');
	const cellMm = finiteInteger(parsed.cellMm, 'Ukuran sel');
	const columns = finiteInteger(parsed.columns, 'Jumlah kolom');
	const rows = finiteInteger(parsed.rows, 'Jumlah baris');
	const validation = validateGridMm(widthMm, heightMm, cellMm);
	if (!validation.valid || validation.columns !== columns || validation.rows !== rows) throw new Error('Dimensi file proyek tidak valid.');
	const palette = parsePalette(parsed.palette);
	const backgroundSlot = finiteInteger(parsed.backgroundSlot, 'Slot latar');
	if (backgroundSlot >= palette.length) throw new Error('Slot latar file proyek tidak tersedia di palette.');
	if (!Array.isArray(parsed.cellsRle) || parsed.cellsRle.some((value) => typeof value !== 'number')) throw new Error('Data grid RLE file proyek tidak valid.');
	const cells = decodeRle(parsed.cellsRle as number[], columns * rows);
	if (cells.some((slot) => slot >= palette.length)) throw new Error('File proyek merujuk warna yang tidak tersedia.');
	const now = new Date().toISOString();
	const importSettings = parseImportSettings(parsed.importSettings, palette.length);
	const pinnedCount = new Set([palette[backgroundSlot].catalogId, ...palette.filter((entry) => entry.pinned).map((entry) => entry.catalogId)]).size;
	if (importSettings.maxColors < pinnedCount) importSettings.maxColors = pinnedCount;
	return {
		schemaVersion: 1,
		id: requiredString(parsed.id, 'ID proyek'),
		name: requiredString(parsed.name, 'Nama proyek').slice(0, 200),
		widthMm,
		heightMm,
		cellMm,
		columns,
		rows,
		palette,
		backgroundSlot,
		cells,
		importSettings,
		sourceImage: parseSourceImage(parsed.sourceImage),
		createdAt: validTimestamp(parsed.createdAt, now),
		updatedAt: validTimestamp(parsed.updatedAt, now)
	};
}

export function cloneProject(project: ProjectV1): ProjectV1 {
	return {
		...project,
		palette: project.palette.map((entry) => ({ ...entry })),
		cells: project.cells.slice(),
		importSettings: { ...project.importSettings },
		sourceImage: project.sourceImage ? { ...project.sourceImage } : undefined
	};
}
