import type { CatalogColor, ProjectV1 } from '$lib/types';
import { normalizeHex } from '$lib/utils/color';
import { countSlots } from '$lib/utils/grid';

function escapeCsv(value: unknown): string {
	const raw = String(value ?? '');
	const text = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
	return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function parseCsvRows(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		if (quoted) {
			if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
			else if (char === '"') quoted = false;
			else field += char;
		} else if (char === '"') quoted = true;
		else if (char === ',') { row.push(field); field = ''; }
		else if (char === '\n') { row.push(field); if (row.some((value) => value.trim())) rows.push(row); row = []; field = ''; }
		else if (char !== '\r') field += char;
	}
	row.push(field);
	if (row.some((value) => value.trim())) rows.push(row);
	return rows;
}

export function parseCatalogCsv(text: string): { colors: CatalogColor[]; errors: string[] } {
	const rows = parseCsvRows(text);
	if (rows.length === 0) return { colors: [], errors: ['File CSV kosong.'] };
	const headers = rows[0].map((header) => header.trim().toLowerCase());
	const nameIndex = headers.indexOf('name');
	const codeIndex = headers.indexOf('code');
	const hexIndex = headers.indexOf('hex');
	const activeIndex = headers.indexOf('active');
	if (nameIndex < 0 || hexIndex < 0) return { colors: [], errors: ['Header wajib memuat name dan hex.'] };
	const now = new Date().toISOString();
	const errors: string[] = [];
	const colors: CatalogColor[] = [];
	const codes = new Set<string>();
	rows.slice(1).forEach((row, offset) => {
		const rowNumber = offset + 2;
		const name = row[nameIndex]?.trim();
		const code = codeIndex >= 0 ? row[codeIndex]?.trim() : undefined;
		const hex = normalizeHex(row[hexIndex] ?? '');
		const activeText = activeIndex >= 0 ? (row[activeIndex] ?? '').trim().toLowerCase() : 'true';
		if (!name) { errors.push(`Baris ${rowNumber}: nama kosong.`); return; }
		if (!hex) { errors.push(`Baris ${rowNumber}: HEX tidak valid.`); return; }
		if (!['true', 'false', '1', '0', 'yes', 'no', ''].includes(activeText)) { errors.push(`Baris ${rowNumber}: nilai active tidak valid.`); return; }
		if (code && codes.has(code.toLowerCase())) { errors.push(`Baris ${rowNumber}: kode ${code} duplikat.`); return; }
		if (code) codes.add(code.toLowerCase());
		colors.push({ id: crypto.randomUUID(), name, code: code || undefined, hex, active: !['false', '0', 'no'].includes(activeText), createdAt: now, updatedAt: now });
	});
	return { colors, errors };
}

export function catalogToCsv(catalog: CatalogColor[]): string {
	return ['name,code,hex,active', ...catalog.map((color) => [color.name, color.code ?? '', color.hex, color.active ? 'true' : 'false'].map(escapeCsv).join(','))].join('\n');
}

export function materialListCsv(project: ProjectV1): string {
	const counts = countSlots(project.cells, project.palette.length);
	const areaCm2 = (project.cellMm / 10) ** 2;
	const rows = project.palette.map((color) => [color.slot + 1, color.code ?? '', color.name, color.hex, counts[color.slot] ?? 0, Number(((counts[color.slot] ?? 0) * areaCm2).toFixed(2))]);
	return ['number,code,name,hex,count,area_cm2', ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
}

export function gridMatrixCsv(project: ProjectV1): string {
	const header = ['row/column', ...Array.from({ length: project.columns }, (_, index) => index + 1)];
	const rows = Array.from({ length: project.rows }, (_, row) => {
		const values = Array.from({ length: project.columns }, (_, column) => {
			const slot = project.cells[row * project.columns + column];
			const color = project.palette[slot];
			return `${slot + 1}:${color?.code || color?.name || 'UNKNOWN'}`;
		});
		return [row + 1, ...values];
	});
	return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}
