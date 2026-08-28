import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CATALOG } from '$lib/catalog';
import { createProject } from '$lib/project';
import { deleteProject, loadProjects, saveProject } from '$lib/storage';

describe('IndexedDB project persistence', () => {
	it('preserves grid, palette, dimensions, settings, and source image after save and reload', async () => {
		const project = createProject({ name: 'Persisted lobby', widthMm: 1200, heightMm: 2400, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		project.cells[0] = 3;
		project.cells[project.cells.length - 1] = 7;
		project.importSettings = { fit: 'contain', focalX: 0.25, focalY: 0.75, maxColors: 8, autoPalette: false };
		project.sourceImage = { name: 'source.webp', type: 'image/webp', dataUrl: 'data:image/webp;base64,AAAA', width: 10, height: 20 };
		await saveProject(project);

		const restored = (await loadProjects()).find((entry) => entry.id === project.id);
		expect(restored).toBeDefined();
		expect(restored?.cells).toBeInstanceOf(Uint16Array);
		expect(restored?.cells[0]).toBe(3);
		expect(restored?.cells[restored.cells.length - 1]).toBe(7);
		expect(restored?.palette).toEqual(project.palette);
		expect(restored?.importSettings).toEqual(project.importSettings);
		expect(restored?.sourceImage).toEqual(project.sourceImage);
		expect([restored?.columns, restored?.rows, restored?.cells.length]).toEqual([24, 48, 1152]);
		await deleteProject(project.id);
	});
});
