import type { ProjectV1 } from '$lib/types';

const MAX_EXPORT_EDGE = 12_000;
const MAX_EXPORT_PIXELS = 32_000_000;

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG tidak dapat dibuat.')), 'image/png'));
}

export async function createProjectPng(project: ProjectV1, blueprint = false): Promise<Blob> {
	const targetCell = blueprint ? 28 : 18;
	let cell = Math.max(2, Math.min(targetCell, Math.floor((MAX_EXPORT_EDGE - (blueprint ? 100 : 0)) / Math.max(project.columns, project.rows))));
	const ruler = blueprint ? 42 : 0;
	const legendHeight = blueprint ? Math.max(94, Math.ceil(project.palette.length / 4) * 28 + 42) : 0;
	const legendColumns = blueprint ? Math.min(4, project.palette.length) : 0;
	const dimensions = (size: number) => {
		const gridWidth = project.columns * size;
		const contentWidth = blueprint ? Math.max(gridWidth, legendColumns * 160) : gridWidth;
		return { width: ruler + contentWidth + (blueprint ? 24 : 0), height: ruler + project.rows * size + legendHeight + (blueprint ? 24 : 0), gridWidth, contentWidth };
	};
	while (cell > 2) {
		const next = dimensions(cell);
		if (next.width <= MAX_EXPORT_EDGE && next.height <= MAX_EXPORT_EDGE && next.width * next.height <= MAX_EXPORT_PIXELS) break;
		cell -= 1;
	}
	const size = dimensions(cell);
	if (size.width * size.height > MAX_EXPORT_PIXELS) throw new Error('Grid terlalu besar untuk diekspor sebagai satu PNG pada perangkat ini. Gunakan PDF blueprint.');
	const gridLeft = blueprint ? ruler + Math.floor((size.contentWidth - size.gridWidth) / 2) : 0;
	const canvas = document.createElement('canvas');
	canvas.width = size.width;
	canvas.height = size.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas export tidak tersedia.');
	ctx.fillStyle = '#FBFAF7';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (let row = 0; row < project.rows; row += 1) {
		for (let column = 0; column < project.columns; column += 1) {
			const slot = project.cells[row * project.columns + column];
			ctx.fillStyle = project.palette[slot]?.hex ?? '#FFFFFF';
			ctx.fillRect(gridLeft + column * cell, ruler + row * cell, cell, cell);
		}
	}
	if (blueprint) {
		ctx.strokeStyle = 'rgba(31,37,34,.36)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let column = 0; column <= project.columns; column += 1) {
			const x = gridLeft + column * cell + 0.5;
			ctx.moveTo(x, ruler); ctx.lineTo(x, ruler + project.rows * cell);
		}
		for (let row = 0; row <= project.rows; row += 1) {
			const y = ruler + row * cell + 0.5;
			ctx.moveTo(gridLeft, y); ctx.lineTo(gridLeft + project.columns * cell, y);
		}
		ctx.stroke();
		ctx.fillStyle = '#343A37';
		ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		ctx.font = `600 ${Math.max(8, Math.min(12, cell * 0.42))}px ui-monospace, monospace`;
		const interval = cell >= 14 ? 1 : Math.ceil(14 / cell);
		for (let column = 0; column < project.columns; column += interval) ctx.fillText(String(column + 1), gridLeft + (column + 0.5) * cell, ruler / 2);
		for (let row = 0; row < project.rows; row += interval) ctx.fillText(String(row + 1), ruler / 2, ruler + (row + 0.5) * cell);
		const legendTop = ruler + project.rows * cell + 28;
		const legendLeft = ruler + Math.floor((size.contentWidth - legendColumns * 160) / 2);
		ctx.textAlign = 'left'; ctx.font = '700 13px Inter, sans-serif'; ctx.fillText(`${project.name} — ${project.columns} × ${project.rows} sel`, legendLeft, legendTop);
		project.palette.forEach((entry, index) => {
			const column = index % legendColumns;
			const row = Math.floor(index / legendColumns);
			const x = legendLeft + column * 160;
			const y = legendTop + 23 + row * 28;
			ctx.fillStyle = entry.hex; ctx.fillRect(x, y, 18, 18);
			ctx.strokeStyle = '#7A7E7A'; ctx.strokeRect(x + 0.5, y + 0.5, 17, 17);
			ctx.fillStyle = '#343A37'; ctx.font = '11px Inter, sans-serif'; ctx.fillText(`${entry.slot + 1}. ${entry.code || entry.name}`, x + 25, y + 9);
		});
	}
	return canvasToBlob(canvas);
}
