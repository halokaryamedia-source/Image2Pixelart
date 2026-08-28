import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { ProjectV2 } from '$lib/types';
import { EMPTY_CELL } from '$lib/types';
import { hexToRgb } from '$lib/utils/color';
import { countSlots } from '$lib/utils/grid';

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 42;
const CHUNK = 24;

export type PdfDetailPanel = { startColumn: number; startRow: number; columns: number; rows: number };

export function pdfDetailPanels(columns: number, rows: number): PdfDetailPanel[] {
	const panels: PdfDetailPanel[] = [];
	for (let startRow = 0; startRow < rows; startRow += CHUNK) {
		for (let startColumn = 0; startColumn < columns; startColumn += CHUNK) {
			panels.push({ startColumn, startRow, columns: Math.min(CHUNK, columns - startColumn), rows: Math.min(CHUNK, rows - startRow) });
		}
	}
	return panels;
}

function color(hex: string) {
	const value = hexToRgb(hex);
	return rgb(value.r / 255, value.g / 255, value.b / 255);
}

function safeText(value: string): string {
	return value.normalize('NFKD').replace(/[^\x20-\xFF]/g, '?');
}

function drawFooter(page: PDFPage, font: PDFFont, pageNumber: number, totalPages: number): void {
	page.drawLine({ start: { x: MARGIN, y: 29 }, end: { x: A4.width - MARGIN, y: 29 }, thickness: 0.5, color: rgb(0.82, 0.82, 0.79) });
	page.drawText(`MOSAIC/PLAN  |  Halaman ${pageNumber} dari ${totalPages}`, { x: MARGIN, y: 16, size: 7.5, font, color: rgb(0.36, 0.39, 0.37) });
}

function drawOverviewGrid(page: PDFPage, project: ProjectV2, x: number, y: number, maxWidth: number, maxHeight: number): void {
	const cell = Math.min(maxWidth / project.columns, maxHeight / project.rows);
	const width = project.columns * cell;
	const height = project.rows * cell;
	const startX = x + (maxWidth - width) / 2;
	for (let row = 0; row < project.rows; row += 1) {
		let column = 0;
		while (column < project.columns) {
			const slot = project.cells[row * project.columns + column];
			let run = 1;
			while (column + run < project.columns && project.cells[row * project.columns + column + run] === slot) run += 1;
			if (slot !== EMPTY_CELL && project.palette[slot]) page.drawRectangle({ x: startX + column * cell, y: y + height - (row + 1) * cell, width: run * cell + 0.05, height: cell + 0.05, color: color(project.palette[slot].hex) });
			column += run;
		}
	}
	page.drawRectangle({ x: startX, y, width, height, borderWidth: 0.75, borderColor: rgb(0.28, 0.3, 0.29) });
}

function drawCover(page: PDFPage, project: ProjectV2, regular: PDFFont, bold: PDFFont): void {
	page.drawText('MOSAIC/PLAN', { x: MARGIN, y: 786, size: 10, font: bold, color: rgb(0.91, 0.33, 0.15) });
	page.drawText(safeText(project.name), { x: MARGIN, y: 743, size: 27, font: bold, color: rgb(0.12, 0.15, 0.13) });
	page.drawText('Blueprint produksi pixel mosaic', { x: MARGIN, y: 721, size: 10, font: regular, color: rgb(0.4, 0.43, 0.41) });

	const counts = countSlots(project.cells, project.palette.length);
	const filledCount = counts.reduce((sum, count) => sum + count, 0);
	const cards = [
		['UKURAN FISIK', `${project.widthMm / 10} x ${project.heightMm / 10} cm`],
		['UKURAN TILE', `${project.cellMm / 10} x ${project.cellMm / 10} cm`],
		['GRID', `${project.columns} x ${project.rows}`],
		['TILE TERISI', filledCount.toLocaleString('id-ID')]
	];
	cards.forEach(([label, value], index) => {
		const width = (A4.width - MARGIN * 2 - 18) / 4;
		const x = MARGIN + index * (width + 6);
		page.drawRectangle({ x, y: 658, width, height: 48, color: rgb(0.94, 0.95, 0.93), borderColor: rgb(0.8, 0.82, 0.79), borderWidth: 0.5 });
		page.drawText(label, { x: x + 8, y: 687, size: 6.5, font: bold, color: rgb(0.4, 0.45, 0.42) });
		page.drawText(value, { x: x + 8, y: 670, size: 11, font: bold, color: rgb(0.16, 0.28, 0.23) });
	});

	drawOverviewGrid(page, project, MARGIN, 286, A4.width - MARGIN * 2, 340);
	page.drawText('LEGENDA & KEBUTUHAN MATERIAL', { x: MARGIN, y: 256, size: 8, font: bold, color: rgb(0.36, 0.39, 0.37) });
	project.palette.forEach((entry, index) => {
		const column = index % 4;
		const row = Math.floor(index / 4);
		const x = MARGIN + column * 127;
		const y = 224 - row * 22;
		page.drawRectangle({ x, y, width: 14, height: 14, color: color(entry.hex), borderWidth: 0.45, borderColor: rgb(0.45, 0.47, 0.45) });
		page.drawText(String(entry.slot + 1), { x: x + 18, y: y + 5, size: 6.5, font: bold, color: rgb(0.18, 0.2, 0.19) });
		const label = entry.hex;
		page.drawText(label, { x: x + 31, y: y + 5, size: 6.5, font: regular, color: rgb(0.18, 0.2, 0.19) });
		page.drawText(`${counts[entry.slot] ?? 0}`, { x: x + 102, y: y + 5, size: 6.5, font: bold, color: rgb(0.18, 0.2, 0.19) });
	});
	page.drawText('Warna di layar dan PDF adalah representasi. Cocokkan dengan sampel material fisik sebelum produksi.', { x: MARGIN, y: 48, size: 7.5, font: regular, color: rgb(0.45, 0.47, 0.45) });
}

function drawDetail(page: PDFPage, project: ProjectV2, regular: PDFFont, bold: PDFFont, startColumn: number, startRow: number): void {
	const columns = Math.min(CHUNK, project.columns - startColumn);
	const rows = Math.min(CHUNK, project.rows - startRow);
	page.drawText('MOSAIC/PLAN', { x: MARGIN, y: 795, size: 9, font: bold, color: rgb(0.91, 0.33, 0.15) });
	page.drawText(safeText(project.name), { x: MARGIN, y: 771, size: 17, font: bold, color: rgb(0.13, 0.16, 0.14) });
	page.drawText(`Panel kolom ${startColumn + 1}-${startColumn + columns} / baris ${startRow + 1}-${startRow + rows}`, { x: MARGIN, y: 754, size: 8.5, font: regular, color: rgb(0.4, 0.43, 0.41) });

	const availableWidth = A4.width - MARGIN * 2 - 28;
	const availableHeight = 620;
	const cell = Math.min(availableWidth / columns, availableHeight / rows, 21);
	const gridWidth = columns * cell;
	const gridHeight = rows * cell;
	const x0 = MARGIN + 28 + (availableWidth - gridWidth) / 2;
	const y0 = 104 + (availableHeight - gridHeight) / 2;
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < columns; column += 1) {
			const slot = project.cells[(startRow + row) * project.columns + startColumn + column];
			const entry = project.palette[slot];
			const x = x0 + column * cell;
			const y = y0 + gridHeight - (row + 1) * cell;
			page.drawRectangle({ x, y, width: cell, height: cell, color: entry ? color(entry.hex) : rgb(1, 1, 1), borderColor: rgb(0.35, 0.37, 0.36), borderWidth: 0.35 });
			if (cell >= 12 && slot !== EMPTY_CELL && entry) {
				const rgbValue = hexToRgb(entry.hex);
				const luminance = 0.2126 * rgbValue.r + 0.7152 * rgbValue.g + 0.0722 * rgbValue.b;
				const label = String(slot + 1);
				page.drawText(label, { x: x + cell / 2 - regular.widthOfTextAtSize(label, 6) / 2, y: y + cell / 2 - 2, size: 6, font: bold, color: luminance > 145 ? rgb(0.12, 0.14, 0.13) : rgb(1, 1, 1) });
			}
		}
	}
	for (let column = 0; column < columns; column += 1) {
		const label = String(startColumn + column + 1);
		page.drawText(label, { x: x0 + (column + 0.5) * cell - regular.widthOfTextAtSize(label, 6) / 2, y: y0 + gridHeight + 8, size: 6, font: bold, color: rgb(0.28, 0.3, 0.29) });
	}
	for (let row = 0; row < rows; row += 1) {
		const label = String(startRow + row + 1);
		page.drawText(label, { x: x0 - 7 - regular.widthOfTextAtSize(label, 6), y: y0 + gridHeight - (row + 0.5) * cell - 2, size: 6, font: bold, color: rgb(0.28, 0.3, 0.29) });
	}
	page.drawText('Nomor di dalam sel mengacu pada legenda warna di halaman overview.', { x: MARGIN, y: 61, size: 7.5, font: regular, color: rgb(0.43, 0.45, 0.44) });
}

export async function createProjectPdfBytes(project: ProjectV2): Promise<Uint8Array> {
	const document = await PDFDocument.create();
	const regular = await document.embedFont(StandardFonts.Helvetica);
	const bold = await document.embedFont(StandardFonts.HelveticaBold);
	const panels = pdfDetailPanels(project.columns, project.rows);
	const totalPages = 1 + panels.length;
	const cover = document.addPage([A4.width, A4.height]);
	drawCover(cover, project, regular, bold);
	drawFooter(cover, regular, 1, totalPages);
	let pageNumber = 2;
	for (const panel of panels) {
		const page = document.addPage([A4.width, A4.height]);
		drawDetail(page, project, regular, bold, panel.startColumn, panel.startRow);
		drawFooter(page, regular, pageNumber++, totalPages);
	}
	document.setTitle(safeText(`${project.name} - Mosaic blueprint`));
	document.setAuthor('MOSAIC/PLAN');
	document.setSubject('Pixel mosaic production blueprint');
	return document.save();
}
