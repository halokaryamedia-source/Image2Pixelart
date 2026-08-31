import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createProject } from '$lib/project';
import { createProjectPdfBytes, pdfDetailPanels } from './pdf';

describe('blueprint PDF', () => {
	it('paginates a 24 x 48 grid with empty cells safely', async () => {
		const project = createProject({ name: 'Lobby', widthMm: 1200, heightMm: 2400, cellMm: 50 });
		project.palette = [{ id: 'black', slot: 0, hex: '#222222', locked: false }, { id: 'orange', slot: 1, hex: '#F26A3D', locked: false }];
		for (let index = 0; index < project.cells.length; index += 11) project.cells[index] = index % 2;
		const bytes = await createProjectPdfBytes(project);
		const document = await PDFDocument.load(bytes);
		expect(document.getPageCount()).toBe(3);
	});

	it('covers every coordinate exactly once across detail panels', () => {
		const columns = 49; const rows = 37; const covered = new Uint8Array(columns * rows);
		for (const panel of pdfDetailPanels(columns, rows)) for (let row = 0; row < panel.rows; row += 1) for (let column = 0; column < panel.columns; column += 1) covered[(panel.startRow + row) * columns + panel.startColumn + column] += 1;
		expect([...covered].every((count) => count === 1)).toBe(true);
	});
});
