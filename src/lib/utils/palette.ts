import type { ProjectPaletteEntry } from '$lib/types';
import { EMPTY_CELL } from '$lib/types';
import { hexToOklab, nearestPaletteIndex, normalizeHex } from '$lib/utils/color';

export function paletteHasSameColors(
	palette: Array<{ hex: string }>,
	colors: Array<{ hex: string }>
): boolean {
	if (palette.length !== colors.length) return false;
	const current = new Set(palette.map((entry) => normalizeHex(entry.hex)).filter(Boolean));
	const candidate = new Set(colors.map((entry) => normalizeHex(entry.hex)).filter(Boolean));
	return current.size === palette.length && candidate.size === colors.length
		&& [...current].every((hex) => candidate.has(hex));
}

export function removePaletteSlot(
	palette: ProjectPaletteEntry[],
	cells: Uint16Array,
	removedSlot: number
): { palette: ProjectPaletteEntry[]; cells: Uint16Array } {
	if (!palette[removedSlot]) return { palette, cells };
	if (palette[removedSlot].locked) throw new Error('Warna terkunci tidak dapat dihapus.');
	const nextPalette = palette.filter((entry) => entry.slot !== removedSlot).map((entry, slot) => ({ ...entry, slot }));
	const removed = palette[removedSlot];
	const replacement = nextPalette.length ? nearestPaletteIndex(hexToOklab(removed.hex), nextPalette) : EMPTY_CELL;
	const nextCells = new Uint16Array(cells.length);
	for (let index = 0; index < cells.length; index += 1) {
		const slot = cells[index];
		if (slot === EMPTY_CELL) nextCells[index] = EMPTY_CELL;
		else if (slot === removedSlot) nextCells[index] = replacement;
		else nextCells[index] = slot > removedSlot ? slot - 1 : slot;
	}
	return { palette: nextPalette, cells: nextCells };
}

export function applyPaletteHexes(
	palette: ProjectPaletteEntry[],
	cells: Uint16Array,
	colors: Array<string | { hex: string; name?: string }>
): { palette: ProjectPaletteEntry[]; cells: Uint16Array } {
	if (palette.some((entry) => entry.locked)) throw new Error('Buka kunci semua warna sebelum mengganti palet.');
	if (colors.length < 1 || colors.length > 32) throw new Error('Palet tujuan harus memiliki 1–32 warna.');
	const nextPalette = colors.map((color, slot) => ({
		id: crypto.randomUUID(),
		slot,
		hex: typeof color === 'string' ? color : color.hex,
		name: typeof color === 'string' ? undefined : color.name,
		locked: false
	}));
	const slotMap = palette.map((entry) => nearestPaletteIndex(hexToOklab(entry.hex), nextPalette));
	const nextCells = new Uint16Array(cells.length);
	for (let index = 0; index < cells.length; index += 1) {
		const slot = cells[index];
		nextCells[index] = slot === EMPTY_CELL ? EMPTY_CELL : (slotMap[slot] ?? EMPTY_CELL);
	}
	return { palette: nextPalette, cells: nextCells };
}
