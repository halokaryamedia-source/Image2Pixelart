import { describe, expect, it } from 'vitest';
import { createProject } from '$lib/project';
import { EMPTY_CELL } from '$lib/types';
import { cellsFromBase64, cellsToBase64, cloudPayloadToProject, projectToCloudPayload } from './project-codec';

describe('cloud project codec', () => {
	it('round-trips Uint16 cells in deterministic little-endian order', () => {
		const cells = Uint16Array.from([0, 1, 255, 256, EMPTY_CELL]);
		expect([...cellsFromBase64(cellsToBase64(cells))]).toEqual([...cells]);
	});

	it('rejects cell payloads whose length does not match the grid', () => {
		expect(() => cellsFromBase64(cellsToBase64(Uint16Array.of(1, 2)), 3)).toThrow('Jumlah sel');
	});

	it('never serializes source image data URLs into the cloud document', () => {
		const project = createProject({ name: 'Cloud', widthMm: 200, heightMm: 200, cellMm: 50 });
		project.sourceImage = { name: 'source.png', type: 'image/png', dataUrl: 'data:image/png;base64,AAAA', width: 1, height: 1 };
		const payload = projectToCloudPayload(project);
		expect(JSON.stringify(payload)).not.toContain('base64,AAAA');
		expect(payload.document.sourceImage).toBeUndefined();
	});

	it('hydrates signed source URLs only at runtime', () => {
		const project = createProject({ name: 'Cloud', widthMm: 200, heightMm: 200, cellMm: 50 });
		const payload = projectToCloudPayload(project, { assetId: crypto.randomUUID(), name: 'source.png', type: 'image/png', width: 1, height: 1 });
		expect(cloudPayloadToProject(payload, 'https://signed.example/source').sourceImage?.dataUrl).toBe('https://signed.example/source');
	});
});
