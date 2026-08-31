<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProjectV2 } from '$lib/types';
	import { EMPTY_CELL } from '$lib/types';

	let { project }: { project: ProjectV2 } = $props();
	let container = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();
	let previewWidth = $state(280); let previewHeight = $state(150);
	let hasFilledCells = $derived.by(() => project.cells.some((slot) => slot !== EMPTY_CELL && !!project.palette[slot]));

	onMount(() => {
		if (!container) return;
		const observer = new ResizeObserver(([entry]) => {
			previewWidth = Math.max(1, Math.round(entry.contentRect.width));
			previewHeight = Math.max(1, Math.round(entry.contentRect.height));
		});
		observer.observe(container);
		return () => observer.disconnect();
	});

	$effect(() => {
		canvas; project.cells; project.palette; project.columns; project.rows; previewWidth; previewHeight;
		draw();
	});

	function draw() {
		if (!canvas) return;
		const width = previewWidth; const height = previewHeight;
		canvas.width = width * 2; canvas.height = height * 2;
		const ctx = canvas.getContext('2d'); if (!ctx) return;
		ctx.scale(2, 2);
		const pattern = 8;
		for (let y = 0; y < height; y += pattern) for (let x = 0; x < width; x += pattern) {
			ctx.fillStyle = ((x / pattern + y / pattern) % 2) ? '#E4E2DC' : '#F3F1EC';
			ctx.fillRect(x, y, pattern, pattern);
		}
		let minColumn = project.columns; let maxColumn = -1; let minRow = project.rows; let maxRow = -1;
		for (let row = 0; row < project.rows; row += 1) for (let column = 0; column < project.columns; column += 1) {
			const slot = project.cells[row * project.columns + column];
			if (slot === EMPTY_CELL || !project.palette[slot]) continue;
			minColumn = Math.min(minColumn, column); maxColumn = Math.max(maxColumn, column);
			minRow = Math.min(minRow, row); maxRow = Math.max(maxRow, row);
		}
		if (maxColumn < minColumn || maxRow < minRow) return;
		const paddingCells = 2;
		const visibleLeft = Math.max(0, minColumn - paddingCells); const visibleRight = Math.min(project.columns - 1, maxColumn + paddingCells);
		const visibleTop = Math.max(0, minRow - paddingCells); const visibleBottom = Math.min(project.rows - 1, maxRow + paddingCells);
		const visibleColumns = visibleRight - visibleLeft + 1; const visibleRows = visibleBottom - visibleTop + 1;
		const outerPadding = 12; const cell = Math.min((width - outerPadding * 2) / visibleColumns, (height - outerPadding * 2) / visibleRows);
		const left = (width - visibleColumns * cell) / 2; const top = (height - visibleRows * cell) / 2;
		for (let row = visibleTop; row <= visibleBottom; row += 1) for (let column = visibleLeft; column <= visibleRight; column += 1) {
			const slot = project.cells[row * project.columns + column];
			if (slot === EMPTY_CELL || !project.palette[slot]) continue;
			ctx.fillStyle = project.palette[slot].hex;
			ctx.fillRect(left + (column - visibleLeft) * cell, top + (row - visibleTop) * cell, cell + 0.2, cell + 0.2);
		}
	}
</script>

<div class="thumbnail" bind:this={container}>
	{#if !hasFilledCells && project.sourceImage}
		<img src={project.sourceImage.dataUrl} alt={`Gambar sumber proyek ${project.name}`} />
	{:else}
		<canvas bind:this={canvas} aria-label={`Preview mosaik proyek ${project.name}`}></canvas>
		{#if !hasFilledCells}<span>Canvas kosong</span>{/if}
	{/if}
</div>

<style>.thumbnail{position:relative;width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:#eeece6}.thumbnail img,.thumbnail canvas{display:block;width:100%;height:100%;object-fit:cover}.thumbnail canvas{image-rendering:pixelated}.thumbnail span{position:absolute;left:50%;bottom:9px;transform:translateX(-50%);padding:4px 7px;border-radius:4px;background:rgba(31,37,34,.72);color:white;font-size:9px;font-weight:700;white-space:nowrap}</style>
