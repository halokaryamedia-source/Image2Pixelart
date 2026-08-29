import type { ProjectPaletteEntry } from '$lib/types';
import { EMPTY_CELL } from '$lib/types';
import { hexToOklab, nearestPaletteIndex } from '$lib/utils/color';

export function removePaletteSlot(
	palette: ProjectPaletteEntry[],
	cells: Uint16Array,
	removedSlot: number
): { palette: ProjectPaletteEntry[]; cells: Uint16Array } {
	if (!palette[removedSlot]) return { palette, cells };
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
	hexes: string[]
): { palette: ProjectPaletteEntry[]; cells: Uint16Array } {
	if (hexes.length < 1 || hexes.length > 32) throw new Error('Palet tujuan harus memiliki 1–32 warna.');
	const nextPalette = hexes.map((hex, slot) => ({ id: crypto.randomUUID(), slot, hex }));
	const slotMap = palette.map((entry) => nearestPaletteIndex(hexToOklab(entry.hex), nextPalette));
	const nextCells = new Uint16Array(cells.length);
	for (let index = 0; index < cells.length; index += 1) {
		const slot = cells[index];
		nextCells[index] = slot === EMPTY_CELL ? EMPTY_CELL : (slotMap[slot] ?? EMPTY_CELL);
	}
	return { palette: nextPalette, cells: nextCells };
}
