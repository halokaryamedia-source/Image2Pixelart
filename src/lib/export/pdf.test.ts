import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { DEFAULT_CATALOG } from '$lib/catalog';
import { createProject } from '$lib/project';
import { createProjectPdfBytes, pdfDetailPanels } from './pdf';

describe('blueprint PDF', () => {
	it('paginates a 24 x 48 grid into overview plus two detail pages', async () => {
		const project = createProject({ name: 'Lobby', widthMm: 1200, heightMm: 2400, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		for (let row = 0; row < project.rows; row += 1) {
			for (let column = 0; column < project.columns; column += 1) {
				const index = row * project.columns + column;
				if (Math.abs(column - 12) + Math.abs(row - 24) < 9) project.cells[index] = 4;
				else if ((row + column) % 11 === 0) project.cells[index] = 7;
				else if (row > 30 && column > 4 && column < 19) project.cells[index] = 5;
				else if (row > 12 && row < 18) project.cells[index] = 2;
				else if (column > 8 && column < 15 && row < 12) project.cells[index] = 3;
			}
		}
		const bytes = await createProjectPdfBytes(project);
		const document = await PDFDocument.load(bytes);
		expect(document.getPageCount()).toBe(3);
	});

	it('covers every coordinate exactly once across detail panels', () => {
		const columns = 49;
		const rows = 37;
		const covered = new Uint8Array(columns * rows);
		for (const panel of pdfDetailPanels(columns, rows)) {
			expect(panel.columns).toBeLessThanOrEqual(24);
			expect(panel.rows).toBeLessThanOrEqual(24);
			for (let row = 0; row < panel.rows; row += 1) {
				for (let column = 0; column < panel.columns; column += 1) {
					covered[(panel.startRow + row) * columns + panel.startColumn + column] += 1;
				}
			}
		}
		expect([...covered].every((count) => count === 1)).toBe(true);
	});
});
