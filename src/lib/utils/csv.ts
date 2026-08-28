import type { ProjectV2 } from '$lib/types';
import { EMPTY_CELL } from '$lib/types';
import { countSlots } from '$lib/utils/grid';

function escapeCsv(value: unknown): string {
	const raw = String(value ?? ''); const text = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
	return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function parseCsvRows(text: string): string[][] {
	const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		if (quoted) { if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; } else if (char === '"') quoted = false; else field += char; }
		else if (char === '"') quoted = true;
		else if (char === ',') { row.push(field); field = ''; }
		else if (char === '\n') { row.push(field); if (row.some((value) => value.trim())) rows.push(row); row = []; field = ''; }
		else if (char !== '\r') field += char;
	}
	row.push(field); if (row.some((value) => value.trim())) rows.push(row); return rows;
}

export function materialListCsv(project: ProjectV2): string {
	const counts = countSlots(project.cells, project.palette.length); const areaCm2 = (project.cellMm / 10) ** 2;
	const rows = project.palette.map((color) => [color.slot + 1, color.hex, counts[color.slot] ?? 0, Number(((counts[color.slot] ?? 0) * areaCm2).toFixed(2))]);
	return ['number,hex,count,area_cm2', ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
}

export function gridMatrixCsv(project: ProjectV2): string {
	const header = ['row/column', ...Array.from({ length: project.columns }, (_, index) => index + 1)];
	const rows = Array.from({ length: project.rows }, (_, row) => {
		const values = Array.from({ length: project.columns }, (_, column) => {
			const slot = project.cells[row * project.columns + column];
			return slot === EMPTY_CELL ? '' : `${slot + 1}:${project.palette[slot]?.hex ?? 'UNKNOWN'}`;
		});
		return [row + 1, ...values];
	});
	return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}
