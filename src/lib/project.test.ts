import { describe, expect, it } from 'vitest';
import { EMPTY_CELL } from './types';
import { createProject, deserializeProject, serializeProject } from './project';
import { encodeRle } from './utils/rle';

describe('project schema v3', () => {
	it('starts empty and round trips palette, cells, settings, and source image', () => {
		const project = createProject({ name: 'Lobby', widthMm: 1200, heightMm: 2400, cellMm: 50 });
		expect(project.palette).toEqual([]);
		expect([...project.cells].every((slot) => slot === EMPTY_CELL)).toBe(true);
		project.palette = [{ id: 'blue', slot: 0, hex: '#00AACC', name: 'Biru', locked: true }];
		project.suggestedPalette = [{ id: 'suggested-blue', slot: 0, hex: '#00BBCC', locked: false }];
		project.cells[25] = 0;
		project.importSettings = { placement: 'crop', crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.25 }, renderMode: 'photo', suggestionCount: 12 };
		project.sourceImage = { name: 'source.png', type: 'image/png', dataUrl: 'data:image/png;base64,AAAA', width: 100, height: 200 };
		const restored = deserializeProject(serializeProject(project));
		expect(restored.schemaVersion).toBe(3);
		expect(restored.cells[25]).toBe(0);
		expect(restored.cells[0]).toBe(EMPTY_CELL);
		expect(restored.suggestedPalette).toEqual(project.suggestedPalette);
		expect(restored.importSettings.renderMode).toBe('photo');
		expect(restored.sourceImage?.name).toBe('source.png');
	});

	it('round trips an overscan crop used to create empty canvas margins', () => {
		const project = createProject({ name: 'Margin', widthMm: 100, heightMm: 100, cellMm: 10 });
		project.importSettings.crop = { x: -0.25, y: -0.5, width: 1.5, height: 2 };
		const restored = deserializeProject(serializeProject(project));
		expect(restored.importSettings.crop).toEqual(project.importSettings.crop);
	});

	it('migrates schema v2 colors to unlocked schema v3 entries', () => {
		const project = createProject({ name: 'Schema two', widthMm: 100, heightMm: 100, cellMm: 50 });
		project.palette = [{ id: 'legacy-v2', slot: 0, hex: '#123456', locked: false }];
		const raw = JSON.parse(serializeProject(project)) as Record<string, unknown>;
		raw.schemaVersion = 2;
		(raw.palette as Array<Record<string, unknown>>).forEach((entry) => { delete entry.locked; delete entry.name; });
		const restored = deserializeProject(JSON.stringify(raw));
		expect(restored.schemaVersion).toBe(3);
		expect(restored.palette).toEqual([{ id: 'legacy-v2', slot: 0, hex: '#123456', locked: false }]);
	});

	it('migrates schema v1 palette and placement without changing cells', () => {
		const raw = {
			schemaVersion: 1, id: 'legacy', name: 'Legacy', widthMm: 100, heightMm: 100, cellMm: 50, columns: 2, rows: 2,
			palette: [{ slot: 0, catalogId: 'warm-white', name: 'Warm White', code: 'MP-01', hex: '#F1EFE6', pinned: true }],
			backgroundSlot: 0, cellsRle: encodeRle(Uint16Array.from([0, 0, 0, 0])),
			importSettings: { fit: 'contain', focalX: 0.25, focalY: 0.75, maxColors: 6, autoPalette: true },
			createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
		};
		const restored = deserializeProject(JSON.stringify(raw));
		expect(restored.schemaVersion).toBe(3);
		expect(restored.palette).toEqual([{ id: 'legacy-warm-white', slot: 0, hex: '#F1EFE6', locked: false }]);
		expect([...restored.cells]).toEqual([0, 0, 0, 0]);
		expect(restored.importSettings.placement).toBe('fit');
		expect(restored.importSettings.suggestionCount).toBe(6);
	});

	it('rejects invalid palette and remote source data', () => {
		const project = createProject({ name: 'Lobby', widthMm: 100, heightMm: 100, cellMm: 50 });
		project.palette = [{ id: 'black', slot: 0, hex: '#000000', locked: false }];
		const invalidHex = JSON.parse(serializeProject(project)) as { palette: Array<Record<string, unknown>> };
		invalidHex.palette[0].hex = 'not-a-color';
		expect(() => deserializeProject(JSON.stringify(invalidHex))).toThrow(/hex/i);
		const remoteSource = JSON.parse(serializeProject(project)) as Record<string, unknown>;
		remoteSource.sourceImage = { name: 'remote.png', type: 'image/png', dataUrl: 'https://example.com/pixel.png', width: 10, height: 10 };
		expect(() => deserializeProject(JSON.stringify(remoteSource))).toThrow(/gambar sumber/i);
	});
});
