<script lang="ts">
	import type { ProjectV2 } from '$lib/types';
	import { EMPTY_CELL } from '$lib/types';

	let { project }: { project: ProjectV2 } = $props();
	let canvas: HTMLCanvasElement | undefined;

	$effect(() => {
		project.cells; project.palette; project.columns; project.rows;
		draw();
	});

	function draw() {
		if (!canvas) return;
		const width = 256; const height = 150;
		canvas.width = width * 2; canvas.height = height * 2;
		canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
		const ctx = canvas.getContext('2d'); if (!ctx) return;
		ctx.scale(2, 2);
		const pattern = 8;
		for (let y = 0; y < height; y += pattern) for (let x = 0; x < width; x += pattern) {
			ctx.fillStyle = ((x / pattern + y / pattern) % 2) ? '#E4E2DC' : '#F3F1EC';
			ctx.fillRect(x, y, pattern, pattern);
		}
		const cell = Math.min(width / project.columns, height / project.rows);
		const gridWidth = project.columns * cell; const gridHeight = project.rows * cell;
		const left = (width - gridWidth) / 2; const top = (height - gridHeight) / 2;
		for (let row = 0; row < project.rows; row += 1) for (let column = 0; column < project.columns; column += 1) {
			const slot = project.cells[row * project.columns + column];
			if (slot === EMPTY_CELL || !project.palette[slot]) continue;
			ctx.fillStyle = project.palette[slot].hex;
			ctx.fillRect(left + column * cell, top + row * cell, cell + 0.2, cell + 0.2);
		}
	}
</script>

<canvas aria-label={`Preview aktual ${project.name}`}></canvas>

<style>canvas{display:block;width:100%!important;height:135px!important;object-fit:cover;background:#eeece6}</style>
