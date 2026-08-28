import type { CatalogColor, ProjectPaletteEntry } from '$lib/types';

const createdAt = '2026-01-01T00:00:00.000Z';

export const DEFAULT_CATALOG: CatalogColor[] = [
	{ id: 'warm-white', name: 'Warm White', code: 'MP-01', hex: '#F1EFE6', active: true, createdAt, updatedAt: createdAt },
	{ id: 'light-gray', name: 'Light Gray', code: 'MP-02', hex: '#C2C8C6', active: true, createdAt, updatedAt: createdAt },
	{ id: 'medium-gray', name: 'Medium Gray', code: 'MP-03', hex: '#788184', active: true, createdAt, updatedAt: createdAt },
	{ id: 'charcoal-gray', name: 'Charcoal Gray', code: 'MP-04', hex: '#30383C', active: true, createdAt, updatedAt: createdAt },
	{ id: 'dark-forest-green', name: 'Dark Forest Green', code: 'MP-05', hex: '#31543A', active: true, createdAt, updatedAt: createdAt },
	{ id: 'moss-green', name: 'Moss Green', code: 'MP-06', hex: '#719154', active: true, createdAt, updatedAt: createdAt },
	{ id: 'warm-brown', name: 'Warm Brown', code: 'MP-07', hex: '#875A3C', active: true, createdAt, updatedAt: createdAt },
	{ id: 'cyan-blue', name: 'Cyan Blue', code: 'MP-08', hex: '#45A8B5', active: true, createdAt, updatedAt: createdAt }
];

export function snapshotPalette(colors: CatalogColor[]): ProjectPaletteEntry[] {
	return colors.map((color, slot) => ({
		slot,
		catalogId: color.id,
		name: color.name,
		code: color.code,
		hex: color.hex.toUpperCase(),
		pinned: slot === 0
	}));
}

export function catalogColorToPalette(color: CatalogColor, slot: number, pinned = false): ProjectPaletteEntry {
	return {
		slot,
		catalogId: color.id,
		name: color.name,
		code: color.code,
		hex: color.hex.toUpperCase(),
		pinned
	};
}

export function orderedProjectPalette(
	palette: ProjectPaletteEntry[],
	backgroundCatalogId: string,
	maxColors: number
): ProjectPaletteEntry[] {
	const background = palette.find((entry) => entry.catalogId === backgroundCatalogId) ?? palette[0];
	const ordered = [
		background,
		...palette.filter((entry) => entry.pinned && entry.catalogId !== background?.catalogId),
		...palette.filter((entry) => !entry.pinned && entry.catalogId !== background?.catalogId)
	].filter((entry, index, entries): entry is ProjectPaletteEntry => Boolean(entry) && entries.findIndex((other) => other?.catalogId === entry.catalogId) === index);
	return ordered.slice(0, maxColors).map((entry, slot) => ({ ...entry, slot, pinned: slot === 0 || entry.pinned }));
}
