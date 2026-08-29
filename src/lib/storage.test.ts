import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { createProject } from '$lib/project';
import { createGlobalPalette, DEFAULT_GLOBAL_PALETTE_ID } from '$lib/global-palettes';
import { EMPTY_CELL } from '$lib/types';
import { deleteGlobalPalette, deleteProject, loadGlobalPalettes, loadProjects, saveGlobalPalette, saveProject } from './storage';

describe('IndexedDB project persistence', () => {
	beforeEach(async () => {
		for (const project of await loadProjects()) await deleteProject(project.id);
		for (const palette of await loadGlobalPalettes()) if (!palette.builtIn) await deleteGlobalPalette(palette.id);
	});

	it('preserves empty cells, local palette, settings, and source image', async () => {
		const project = createProject({ name: 'Persisted lobby', widthMm: 1200, heightMm: 2400, cellMm: 50 });
		project.palette = [{ id: 'red', slot: 0, hex: '#FF0000' }];
		project.cells[0] = 0;
		project.importSettings = { placement: 'fit', crop: null, renderMode: 'photo', suggestionCount: 8 };
		project.sourceImage = { name: 'source.webp', type: 'image/webp', dataUrl: 'data:image/webp;base64,AAAA', width: 10, height: 20 };
		await saveProject(project);
		const restored = (await loadProjects()).find((entry) => entry.id === project.id);
		expect(restored?.cells[0]).toBe(0);
		expect(restored?.cells[1]).toBe(EMPTY_CELL);
		expect(restored?.palette).toEqual(project.palette);
		expect(restored?.sourceImage?.dataUrl).toBe(project.sourceImage.dataUrl);
	});

	it('unwraps reactive-style proxies before saving', async () => {
		const project = createProject({ name: 'Proxy project', widthMm: 2400, heightMm: 1200, cellMm: 50 });
		const proxied = new Proxy({ ...project, palette: new Proxy(project.palette, {}), importSettings: new Proxy({ ...project.importSettings }, {}) }, {}) as typeof project;
		expect(() => structuredClone(proxied)).toThrow();
		await expect(saveProject(proxied)).resolves.toBeUndefined();
		expect((await loadProjects()).some((entry) => entry.id === project.id)).toBe(true);
	});

	it('seeds one immutable default palette and persists user palettes', async () => {
		const initial = await loadGlobalPalettes();
		expect(initial.filter((palette) => palette.id === DEFAULT_GLOBAL_PALETTE_ID)).toHaveLength(1);
		expect(initial[0].colors.map((color) => color.hex)).toEqual(['#101418', '#343B40', '#737C80', '#E8ECE8', '#2AA6B4', '#397A20', '#744126', '#B78850']);
		const custom = createGlobalPalette('Suggestion lobby', ['#112233', '#AABBCC']);
		await saveGlobalPalette(custom);
		expect((await loadGlobalPalettes()).find((palette) => palette.id === custom.id)?.colors).toEqual(custom.colors);
		await expect(deleteGlobalPalette(DEFAULT_GLOBAL_PALETTE_ID)).rejects.toThrow('tidak dapat dihapus');
	});
});
