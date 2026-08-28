import { describe, expect, it } from 'vitest';
import { DEFAULT_CATALOG } from '$lib/catalog';
import { createProject } from '$lib/project';
import { planPaletteRemap } from './palette';

describe('palette remap preview', () => {
	it('preserves background and pinned colors while remapping every cell', () => {
		const project = createProject({ name: 'Reduce', widthMm: 200, heightMm: 200, cellMm: 50, backgroundCatalogId: 'medium-gray', catalog: DEFAULT_CATALOG });
		project.palette[5].pinned = true;
		for (let index = 0; index < project.cells.length; index += 1) project.cells[index] = index % project.palette.length;
		const result = planPaletteRemap(project, 3);
		expect(result.palette).toHaveLength(3);
		expect(result.palette[0].catalogId).toBe('medium-gray');
		expect(result.palette.some((entry) => entry.catalogId === project.palette[5].catalogId)).toBe(true);
		expect([...result.cells].every((slot) => slot < result.palette.length)).toBe(true);
		expect(result.removed).toHaveLength(project.palette.length - 3);
	});

	it('rejects a limit below the required pinned colors', () => {
		const project = createProject({ name: 'Pinned', widthMm: 100, heightMm: 100, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		project.palette[1].pinned = true;
		expect(() => planPaletteRemap(project, 1)).toThrow(/minimal 2/i);
	});
});
