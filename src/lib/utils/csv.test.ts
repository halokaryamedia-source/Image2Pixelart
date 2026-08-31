import { describe, expect, it } from 'vitest';
import { createProject } from '$lib/project';
import { EMPTY_CELL } from '$lib/types';
import { gridMatrixCsv, materialListCsv, parseCsvRows } from './csv';

describe('CSV', () => {
	it('parses quoted commas', () => {
		expect(parseCsvRows('name,hex\n"Blue, Ocean",#00AACC')[1][0]).toBe('Blue, Ocean');
	});

	it('excludes empty cells from material totals and leaves matrix entries blank', () => {
		const project = createProject({ name: 'Test', widthMm: 100, heightMm: 100, cellMm: 50 });
		project.palette = [{ id: 'blue', slot: 0, hex: '#00AACC', locked: false }];
		project.cells[0] = 0;
		expect(materialListCsv(project)).toContain('1,#00AACC,1,25');
		const matrix = gridMatrixCsv(project);
		expect(matrix).toContain('1:#00AACC');
		expect(project.cells[1]).toBe(EMPTY_CELL);
		expect(matrix.split('\n')[1].endsWith(',')).toBe(true);
	});
});
