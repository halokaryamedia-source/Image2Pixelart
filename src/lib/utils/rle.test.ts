import { describe, expect, it } from 'vitest';
import { decodeRle, encodeRle } from './rle';

describe('RLE project cells', () => {
	it('round trips typed cell data', () => {
		const cells = Uint16Array.from([0, 0, 0, 2, 2, 1, 1, 1, 1, 0]);
		expect(decodeRle(encodeRle(cells), cells.length)).toEqual(cells);
	});

	it('rejects malformed lengths', () => {
		expect(() => decodeRle([0, 3], 2)).toThrow(/jumlah sel/i);
	});
});
