import type { GlobalPalette } from '$lib/types';
import { normalizeHex } from '$lib/utils/color';

export const DEFAULT_GLOBAL_PALETTE_ID = 'mosaic-default-architecture';

export const DEFAULT_GLOBAL_PALETTE: GlobalPalette = {
	id: DEFAULT_GLOBAL_PALETTE_ID,
	name: 'Arsitektur Pixel Default',
	builtIn: true,
	createdAt: '2026-08-29T00:00:00.000Z',
	updatedAt: '2026-08-29T00:00:00.000Z',
	colors: [
		{ id: 'default-near-black', name: 'Hitam gelap', hex: '#101418', usage: 'Outline dan bayangan terdalam' },
		{ id: 'default-dark-gray', name: 'Abu-abu gelap', hex: '#343B40', usage: 'Struktur gelap dan kedalaman' },
		{ id: 'default-mid-gray', name: 'Abu-abu sedang', hex: '#737C80', usage: 'Beton, batu, dan logam' },
		{ id: 'default-bone-white', name: 'Putih tulang', hex: '#E8ECE8', usage: 'Highlight, layar, dan bangunan terang' },
		{ id: 'default-cyan', name: 'Biru cyan', hex: '#2AA6B4', usage: 'Air, kaca, dan lampu teknologi' },
		{ id: 'default-green', name: 'Hijau', hex: '#397A20', usage: 'Pohon, rumput, dan vegetasi' },
		{ id: 'default-brown', name: 'Cokelat', hex: '#744126', usage: 'Kayu, tanah, dan bayangan atap' },
		{ id: 'default-tan', name: 'Kuning-tan', hex: '#B78850', usage: 'Atap, cahaya hangat, pasir, dan detail kayu' }
	]
};

export function cloneGlobalPalette(palette: GlobalPalette): GlobalPalette {
	return { ...palette, colors: palette.colors.map((color) => ({ ...color })) };
}

export function createGlobalPalette(name: string, hexes: string[]): GlobalPalette {
	const normalized = hexes.map((hex) => normalizeHex(hex));
	if (!name.trim()) throw new Error('Nama palet global wajib diisi.');
	if (normalized.length < 1 || normalized.length > 32 || normalized.some((hex) => !hex)) throw new Error('Palet global harus memiliki 1–32 warna HEX yang valid.');
	if (new Set(normalized).size !== normalized.length) throw new Error('Palet global tidak boleh memiliki warna duplikat.');
	const now = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		name: name.trim().slice(0, 80),
		builtIn: false,
		colors: normalized.map((hex) => ({ id: crypto.randomUUID(), hex: hex! })),
		createdAt: now,
		updatedAt: now
	};
}
