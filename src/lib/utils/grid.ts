import type { GridValidation } from '$lib/types';

export const MAX_CELLS = 250_000;
export const MAX_AXIS_CELLS = 2_000;
export const MAX_PHYSICAL_MM = 1_000_000;

export function cmToMm(value: number): number {
	return Math.round(value * 10);
}

export function mmToCm(value: number): number {
	return value / 10;
}

export function gcd(a: number, b: number): number {
	let x = Math.abs(Math.trunc(a));
	let y = Math.abs(Math.trunc(b));
	while (y !== 0) {
		const next = x % y;
		x = y;
		y = next;
	}
	return x;
}

export function compatibleCellSizesMm(widthMm: number, heightMm: number): number[] {
	if (![widthMm, heightMm].every(Number.isSafeInteger) || widthMm <= 0 || heightMm <= 0 || widthMm > MAX_PHYSICAL_MM || heightMm > MAX_PHYSICAL_MM) return [];
	const common = gcd(widthMm, heightMm);
	const divisors = new Set<number>();
	for (let candidate = 1; candidate * candidate <= common; candidate += 1) {
		if (common % candidate === 0) {
			divisors.add(candidate);
			divisors.add(common / candidate);
		}
	}
	return [...divisors].filter((cell) => {
		const columns = widthMm / cell;
		const rows = heightMm / cell;
		return columns <= MAX_AXIS_CELLS && rows <= MAX_AXIS_CELLS && columns * rows <= MAX_CELLS;
	}).sort((a, b) => a - b);
}

export function validateGridMm(widthMm: number, heightMm: number, cellMm: number): GridValidation {
	const base = { columns: 0, rows: 0, total: 0, suggestionsCm: [] as number[] };
	if (![widthMm, heightMm, cellMm].every(Number.isSafeInteger) || widthMm <= 0 || heightMm <= 0 || cellMm <= 0) {
		return { ...base, valid: false, reason: 'Ukuran harus lebih dari 0 dengan presisi 0,1 cm.' };
	}
	if (widthMm > MAX_PHYSICAL_MM || heightMm > MAX_PHYSICAL_MM || cellMm > MAX_PHYSICAL_MM) {
		return { ...base, valid: false, reason: `Ukuran fisik maksimum ${MAX_PHYSICAL_MM / 10} cm.` };
	}

	const sizes = compatibleCellSizesMm(widthMm, heightMm);
	const suggestionsCm = sizes
		.slice()
		.sort((a, b) => Math.abs(a - cellMm) - Math.abs(b - cellMm) || a - b)
		.slice(0, 3)
		.map(mmToCm);

	if (widthMm % cellMm !== 0 || heightMm % cellMm !== 0) {
		return { ...base, valid: false, reason: 'Ukuran tile harus membagi habis lebar dan tinggi.', suggestionsCm };
	}

	const columns = widthMm / cellMm;
	const rows = heightMm / cellMm;
	const total = columns * rows;
	if (columns > MAX_AXIS_CELLS || rows > MAX_AXIS_CELLS) {
		return { valid: false, columns, rows, total, reason: `Maksimum ${MAX_AXIS_CELLS.toLocaleString('id-ID')} sel per sisi.`, suggestionsCm };
	}
	if (total > MAX_CELLS) {
		return { valid: false, columns, rows, total, reason: `Maksimum ${MAX_CELLS.toLocaleString('id-ID')} sel per proyek.`, suggestionsCm };
	}
	return { valid: true, columns, rows, total, suggestionsCm };
}

export function countSlots(cells: Uint16Array, paletteSize: number): number[] {
	const counts = Array.from({ length: paletteSize }, () => 0);
	for (const slot of cells) {
		if (slot < counts.length) counts[slot] += 1;
	}
	return counts;
}

export function floodFillIndices(cells: Uint16Array, columns: number, rows: number, startIndex: number, nextSlot: number): Uint32Array {
	const targetSlot = cells[startIndex];
	if (targetSlot === nextSlot || startIndex < 0 || startIndex >= cells.length) return new Uint32Array();
	const visited = new Uint8Array(cells.length);
	const queue = new Uint32Array(cells.length);
	const result: number[] = [];
	let read = 0;
	let write = 0;
	queue[write++] = startIndex;
	visited[startIndex] = 1;
	while (read < write) {
		const index = queue[read++];
		if (cells[index] !== targetSlot) continue;
		result.push(index);
		const x = index % columns;
		const y = Math.floor(index / columns);
		const neighbors = [
			x > 0 ? index - 1 : -1,
			x < columns - 1 ? index + 1 : -1,
			y > 0 ? index - columns : -1,
			y < rows - 1 ? index + columns : -1
		];
		for (const neighbor of neighbors) {
			if (neighbor >= 0 && !visited[neighbor] && cells[neighbor] === targetSlot) {
				visited[neighbor] = 1;
				queue[write++] = neighbor;
			}
		}
	}
	return Uint32Array.from(result);
}

export function lineIndices(from: number, to: number, columns: number): Uint32Array {
	let x0 = from % columns;
	let y0 = Math.floor(from / columns);
	const x1 = to % columns;
	const y1 = Math.floor(to / columns);
	const dx = Math.abs(x1 - x0);
	const sx = x0 < x1 ? 1 : -1;
	const dy = -Math.abs(y1 - y0);
	const sy = y0 < y1 ? 1 : -1;
	let error = dx + dy;
	const result: number[] = [];
	while (true) {
		result.push(y0 * columns + x0);
		if (x0 === x1 && y0 === y1) break;
		const twice = 2 * error;
		if (twice >= dy) { error += dy; x0 += sx; }
		if (twice <= dx) { error += dx; y0 += sy; }
	}
	return Uint32Array.from(result);
}
