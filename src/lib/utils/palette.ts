import type { ProjectPaletteEntry, ProjectV1 } from '$lib/types';
import { nearestPaletteIndex, hexToOklab } from '$lib/utils/color';
import { countSlots } from '$lib/utils/grid';

export type PaletteRemap = {
	palette: ProjectPaletteEntry[];
	cells: Uint16Array;
	backgroundSlot: number;
	changedCells: number;
	slotMap: Uint16Array;
	removed: Array<{ from: ProjectPaletteEntry; to: ProjectPaletteEntry }>;
};

export function planPaletteRemap(project: ProjectV1, requestedLimit: number): PaletteRemap {
	const limit = Math.max(1, Math.min(32, Math.trunc(requestedLimit)));
	const background = project.palette[project.backgroundSlot] ?? project.palette[0];
	if (!background) throw new Error('Palette proyek kosong.');
	const pinned = project.palette.filter((entry) => entry.pinned && entry.catalogId !== background.catalogId);
	if (1 + pinned.length > limit) throw new Error(`Batas minimal ${1 + pinned.length} warna karena background dan warna pinned harus dipertahankan.`);
	const counts = countSlots(project.cells, project.palette.length);
	const remaining = project.palette
		.filter((entry) => entry.catalogId !== background.catalogId && !entry.pinned)
		.sort((left, right) => (counts[right.slot] ?? 0) - (counts[left.slot] ?? 0) || left.slot - right.slot);
	const kept = [background, ...pinned, ...remaining].slice(0, limit);
	const palette = kept.map((entry, slot) => ({ ...entry, slot, pinned: slot === 0 || entry.pinned }));
	const newSlotByCatalogId = new Map(palette.map((entry) => [entry.catalogId, entry.slot]));
	const slotMap = new Uint16Array(project.palette.length);
	const removed: PaletteRemap['removed'] = [];
	project.palette.forEach((entry) => {
		const keptSlot = newSlotByCatalogId.get(entry.catalogId);
		const nextSlot = keptSlot ?? nearestPaletteIndex(hexToOklab(entry.hex), palette);
		slotMap[entry.slot] = nextSlot;
		if (keptSlot === undefined) removed.push({ from: entry, to: palette[nextSlot] });
	});
	const cells = new Uint16Array(project.cells.length);
	let changedCells = 0;
	for (let index = 0; index < project.cells.length; index += 1) {
		cells[index] = slotMap[project.cells[index]];
		if (cells[index] !== project.cells[index]) changedCells += 1;
	}
	return { palette, cells, backgroundSlot: newSlotByCatalogId.get(background.catalogId) ?? 0, changedCells, slotMap, removed };
}
