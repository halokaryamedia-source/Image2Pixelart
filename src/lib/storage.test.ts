import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { createProject } from '$lib/project';
import { EMPTY_CELL } from '$lib/types';
import { deleteProject, loadProjects, saveProject } from './storage';

describe('IndexedDB project persistence', () => {
	beforeEach(async () => {
		for (const project of await loadProjects()) await deleteProject(project.id);
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
});
