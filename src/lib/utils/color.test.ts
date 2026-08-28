import { describe, expect, it } from 'vitest';
import type { CatalogColor } from '$lib/types';
import { orderedProjectPalette } from '$lib/catalog';
import { hexToOklab, nearestPaletteIndex, normalizeHex, selectCatalogColorIds } from './color';

const stamp = '2026-01-01T00:00:00.000Z';
const catalog: CatalogColor[] = [
	{ id: 'red', name: 'Red', hex: '#FF0000', active: true, createdAt: stamp, updatedAt: stamp },
	{ id: 'blue', name: 'Blue', hex: '#0000FF', active: true, createdAt: stamp, updatedAt: stamp },
	{ id: 'green', name: 'Green', hex: '#00FF00', active: true, createdAt: stamp, updatedAt: stamp }
];

describe('perceptual colors', () => {
	it('normalizes shorthand HEX', () => expect(normalizeHex('#abc')).toBe('#AABBCC'));

	it('selects catalog colors that represent image samples and respects a pin', () => {
		const samples = [hexToOklab('#F00010'), hexToOklab('#EF0010'), hexToOklab('#0010EE')];
		const selected = selectCatalogColorIds(samples, catalog, 2, ['blue']);
		expect(selected).toContain('blue');
		expect(selected).toContain('red');
		expect(selected).toHaveLength(2);
	});

	it('maps a sample to the nearest palette entry', () => {
		const palette = catalog.slice(0, 2).map((color, slot) => ({ slot, catalogId: color.id, name: color.name, hex: color.hex, pinned: false }));
		expect(nearestPaletteIndex(hexToOklab('#0000F5'), palette)).toBe(1);
	});

	it('keeps requested pin order and moves the background to slot zero', () => {
		const selected = selectCatalogColorIds([hexToOklab('#FFFFFF')], catalog, 2, ['green', 'red']);
		expect(selected).toEqual(['green', 'red']);
		const palette = catalog.map((color, slot) => ({ slot, catalogId: color.id, name: color.name, hex: color.hex, pinned: color.id === 'green' }));
		const ordered = orderedProjectPalette(palette, 'blue', 3);
		expect(ordered.map((entry) => entry.catalogId)).toEqual(['blue', 'green', 'red']);
		expect(ordered[0].pinned).toBe(true);
	});
});
