import { describe, expect, it } from 'vitest';
import { cmToMm, floodFillIndices, lineIndices, validateGridMm } from './grid';

describe('grid math', () => {
	it('creates an exact 24 x 48 grid for 120 x 240 cm with 5 cm tiles', () => {
		const result = validateGridMm(cmToMm(120), cmToMm(240), cmToMm(5));
		expect(result).toMatchObject({ valid: true, columns: 24, rows: 48, total: 1152 });
	});

	it('rejects a tile that leaves partial edges and suggests compatible sizes', () => {
		const result = validateGridMm(cmToMm(121), cmToMm(240), cmToMm(5));
		expect(result.valid).toBe(false);
		expect(result.suggestionsCm.length).toBeGreaterThan(0);
		expect(result.suggestionsCm.every((size) => 1210 % cmToMm(size) === 0 && 2400 % cmToMm(size) === 0)).toBe(true);
	});

	it('rejects unsafe physical dimensions before divisor search', () => {
		const result = validateGridMm(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1);
		expect(result.valid).toBe(false);
		expect(result.suggestionsCm).toEqual([]);
	});

	it('flood fills only the connected region', () => {
		const cells = Uint16Array.from([0, 0, 1, 0, 1, 1, 1, 0, 1]);
		expect([...floodFillIndices(cells, 3, 3, 0, 2)].sort()).toEqual([0, 1, 3]);
	});

	it('interpolates a continuous diagonal stroke', () => {
		expect([...lineIndices(0, 8, 3)]).toEqual([0, 4, 8]);
	});
});
