import { describe, expect, it } from 'vitest';
import { EMPTY_CELL } from './types';
import { createProject, deserializeProject, serializeProject } from './project';
import { encodeRle } from './utils/rle';

describe('project schema v2', () => {
	it('starts empty and round trips palette, cells, settings, and source image', () => {
		const project = createProject({ name: 'Lobby', widthMm: 1200, heightMm: 2400, cellMm: 50 });
		expect(project.palette).toEqual([]);
		expect([...project.cells].every((slot) => slot === EMPTY_CELL)).toBe(true);
		project.palette = [{ id: 'blue', slot: 0, hex: '#00AACC' }];
		project.cells[25] = 0;
		project.importSettings = { placement: 'crop', crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.25 }, renderMode: 'photo', suggestionCount: 12 };
		project.sourceImage = { name: 'source.png', type: 'image/png', dataUrl: 'data:image/png;base64,AAAA', width: 100, height: 200 };
		const restored = deserializeProject(serializeProject(project));
		expect(restored.schemaVersion).toBe(2);
		expect(restored.cells[25]).toBe(0);
		expect(restored.cells[0]).toBe(EMPTY_CELL);
		expect(restored.importSettings.renderMode).toBe('photo');
		expect(restored.sourceImage?.name).toBe('source.png');
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
		expect(restored.schemaVersion).toBe(2);
		expect(restored.palette).toEqual([{ id: 'legacy-warm-white', slot: 0, hex: '#F1EFE6' }]);
		expect([...restored.cells]).toEqual([0, 0, 0, 0]);
		expect(restored.importSettings.placement).toBe('fit');
		expect(restored.importSettings.suggestionCount).toBe(6);
	});

	it('rejects invalid palette and remote source data', () => {
		const project = createProject({ name: 'Lobby', widthMm: 100, heightMm: 100, cellMm: 50 });
		project.palette = [{ id: 'black', slot: 0, hex: '#000000' }];
		const invalidHex = JSON.parse(serializeProject(project)) as { palette: Array<Record<string, unknown>> };
		invalidHex.palette[0].hex = 'not-a-color';
		expect(() => deserializeProject(JSON.stringify(invalidHex))).toThrow(/hex/i);
		const remoteSource = JSON.parse(serializeProject(project)) as Record<string, unknown>;
		remoteSource.sourceImage = { name: 'remote.png', type: 'image/png', dataUrl: 'https://example.com/pixel.png', width: 10, height: 10 };
		expect(() => deserializeProject(JSON.stringify(remoteSource))).toThrow(/gambar sumber/i);
	});
});
