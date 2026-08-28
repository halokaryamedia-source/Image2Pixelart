import { describe, expect, it } from 'vitest';
import { createProject } from '$lib/project';
import { DEFAULT_CATALOG } from '$lib/catalog';
import { catalogToCsv, gridMatrixCsv, materialListCsv, parseCatalogCsv, parseCsvRows } from './csv';

describe('CSV', () => {
	it('parses quoted commas', () => {
		expect(parseCsvRows('name,code,hex\n"Blue, Ocean",B-1,#00AACC')[1][0]).toBe('Blue, Ocean');
	});

	it('validates catalog rows', () => {
		const result = parseCatalogCsv('name,code,hex\nOcean,B-1,#00AACC\nBad,B-2,nope');
		expect(result.colors).toHaveLength(1);
		expect(result.errors).toHaveLength(1);
	});

	it('preserves inactive catalog colors through CSV export and import', () => {
		const source = [{ ...DEFAULT_CATALOG[0], active: false }];
		const restored = parseCatalogCsv(catalogToCsv(source));
		expect(restored.errors).toEqual([]);
		expect(restored.colors[0].active).toBe(false);
	});

	it('keeps material totals equal to the cell count', () => {
		const project = createProject({ name: 'Test', widthMm: 100, heightMm: 100, cellMm: 50, backgroundCatalogId: 'warm-white', catalog: DEFAULT_CATALOG });
		const rows = materialListCsv(project).trim().split('\n').slice(1);
		const total = rows.reduce((sum, row) => sum + Number(row.split(',')[4]), 0);
		expect(total).toBe(project.cells.length);
	});

	it('escapes formulas and keeps matrix slots unambiguous', () => {
		const catalog = [{ ...DEFAULT_CATALOG[0], name: '=SUM(A1:A2)', code: '+DANGER' }];
		const project = createProject({ name: 'Test', widthMm: 50, heightMm: 50, cellMm: 50, backgroundCatalogId: catalog[0].id, catalog });
		expect(materialListCsv(project)).toContain("'+DANGER");
		expect(materialListCsv(project)).toContain("'=SUM(A1:A2)");
		expect(gridMatrixCsv(project)).toContain('1:+DANGER');
	});
});
