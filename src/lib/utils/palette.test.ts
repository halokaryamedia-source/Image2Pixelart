import { describe, expect, it } from 'vitest';
import { EMPTY_CELL } from '$lib/types';
import { applyPaletteHexes, removePaletteSlot } from './palette';

describe('local palette structure', () => {
	it('removes a color and maps its cells to the nearest remaining color', () => {
		const palette = [{ id: 'black', slot: 0, hex: '#000000' }, { id: 'gray', slot: 1, hex: '#222222' }, { id: 'white', slot: 2, hex: '#FFFFFF' }];
		const result = removePaletteSlot(palette, Uint16Array.from([0, 1, 2, EMPTY_CELL]), 1);
		expect(result.palette.map((entry) => entry.slot)).toEqual([0, 1]);
		expect([...result.cells]).toEqual([0, 0, 1, EMPTY_CELL]);
	});

	it('turns all used cells empty when the last color is removed', () => {
		const result = removePaletteSlot([{ id: 'black', slot: 0, hex: '#000000' }], Uint16Array.from([0, EMPTY_CELL]), 0);
		expect(result.palette).toEqual([]);
		expect([...result.cells]).toEqual([EMPTY_CELL, EMPTY_CELL]);
	});

	it('applies a new palette immediately by mapping every used slot to its nearest color', () => {
		const palette = [{ id: 'black', slot: 0, hex: '#101010' }, { id: 'white', slot: 1, hex: '#F0F0F0' }];
		const result = applyPaletteHexes(palette, Uint16Array.from([0, 1, EMPTY_CELL]), ['#000000', '#FFFFFF', '#FF0000']);
		expect(result.palette.map((entry) => entry.hex)).toEqual(['#000000', '#FFFFFF', '#FF0000']);
		expect([...result.cells]).toEqual([0, 1, EMPTY_CELL]);
	});
});
