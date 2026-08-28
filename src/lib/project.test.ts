import { describe, expect, it } from 'vitest';
import { DEFAULT_CATALOG } from './catalog';
import { createProject, deserializeProject, serializeProject } from './project';

describe('project file', () => {
	it('round trips grid, palette, dimensions, and source image', () => {
		const project = createProject({ name: 'Lobby', widthMm: 1200, heightMm: 2400, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		project.cells[25] = 3;
		project.sourceImage = { name: 'source.png', type: 'image/png', dataUrl: 'data:image/png;base64,AAAA', width: 100, height: 200 };
		const restored = deserializeProject(serializeProject(project));
		expect(restored.columns).toBe(24);
		expect(restored.rows).toBe(48);
		expect(restored.cells[25]).toBe(3);
		expect(restored.sourceImage?.name).toBe('source.png');
	});

	it('supplies safe defaults for older schema v1 settings', () => {
		const project = createProject({ name: 'Lobby', widthMm: 100, heightMm: 100, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		const raw = JSON.parse(serializeProject(project)) as Record<string, unknown>;
		delete raw.importSettings;
		delete raw.updatedAt;
		const restored = deserializeProject(JSON.stringify(raw));
		expect(restored.importSettings.fit).toBe('cover');
		expect(Number.isFinite(Date.parse(restored.updatedAt))).toBe(true);
	});

	it('rejects unsafe palette, background, and remote source data', () => {
		const project = createProject({ name: 'Lobby', widthMm: 100, heightMm: 100, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		const invalidBackground = JSON.parse(serializeProject(project)) as Record<string, unknown>;
		invalidBackground.backgroundSlot = 99;
		expect(() => deserializeProject(JSON.stringify(invalidBackground))).toThrow(/slot latar/i);

		const invalidHex = JSON.parse(serializeProject(project)) as { palette: Array<Record<string, unknown>> };
		invalidHex.palette[0].hex = 'not-a-color';
		expect(() => deserializeProject(JSON.stringify(invalidHex))).toThrow(/hex/i);

		const remoteSource = JSON.parse(serializeProject(project)) as Record<string, unknown>;
		remoteSource.sourceImage = { name: 'remote.png', type: 'image/png', dataUrl: 'https://example.com/pixel.png', width: 10, height: 10 };
		expect(() => deserializeProject(JSON.stringify(remoteSource))).toThrow(/gambar sumber/i);
	});
});
