import { describe, expect, it } from 'vitest';
import type { ProjectPaletteEntry } from '$lib/types';
import { hexToOklab, nearestPaletteIndex, normalizeHex, suggestPalette } from './color';

describe('color utilities', () => {
	it('normalizes shorthand and full hex', () => {
		expect(normalizeHex('#abc')).toBe('#AABBCC');
		expect(normalizeHex('00ff10')).toBe('#00FF10');
		expect(normalizeHex('nope')).toBeNull();
	});

	it('maps a sample to the nearest project color', () => {
		const palette: ProjectPaletteEntry[] = [{ id: 'red', slot: 0, hex: '#FF0000' }, { id: 'blue', slot: 1, hex: '#0000FF' }];
		expect(nearestPaletteIndex(hexToOklab('#0000F5'), palette)).toBe(1);
	});

	it('extracts deterministic local suggestions ordered by dominance', () => {
		const samples = [...Array.from({ length: 20 }, () => hexToOklab('#FF0000')), ...Array.from({ length: 5 }, () => hexToOklab('#0000FF'))];
		const first = suggestPalette(samples, 2).map((entry) => entry.hex);
		const second = suggestPalette(samples, 2).map((entry) => entry.hex);
		expect(first).toEqual(second);
		expect(first).toHaveLength(2);
		expect(first[0]).toBe('#FF0000');
	});
});
