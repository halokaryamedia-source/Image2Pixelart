<script lang="ts">
	import { onMount } from 'svelte';
	import type { EditorTool, ProjectV1 } from '$lib/types';
	import { lineIndices } from '$lib/utils/grid';

	type Props = {
		project: ProjectV1;
		activeSlot: number;
		tool: EditorTool;
		zoom: number;
		showGrid: boolean;
		onPaint: (indices: Uint32Array, slot: number, phase: 'start' | 'move' | 'end') => void;
		onFill: (index: number, slot: number) => void;
		onEditCell: (index: number, slot: number) => void;
		onPick: (slot: number) => void;
		onZoom: (zoom: number) => void;
	};

	let { project, activeSlot, tool, zoom, showGrid, onPaint, onFill, onEditCell, onPick, onZoom }: Props = $props();
	let canvas: HTMLCanvasElement;
	let scroller: HTMLDivElement;
	let viewportWidth = $state(800);
	let viewportHeight = $state(600);
	let hoverIndex = $state(-1);
	let keyboardIndex = $state(0);
	let keyboardFocused = $state(false);
	let painting = false;
	let lastIndex = -1;
	let panning = $state(false);
	let panOrigin = { x: 0, y: 0, left: 0, top: 0 };
	const ruler = 34;
	let fitCell = $derived(Math.max(1.5, Math.min(26, (viewportWidth - ruler - 34) / project.columns, (viewportHeight - ruler - 34) / project.rows)));
	let cellSize = $derived(Math.max(1, fitCell * zoom));

	onMount(() => {
		const observer = new ResizeObserver(([entry]) => {
			viewportWidth = entry.contentRect.width;
			viewportHeight = entry.contentRect.height;
		});
		observer.observe(scroller);
		return () => observer.disconnect();
	});

	$effect(() => {
		project.cells;
		project.palette;
		cellSize;
		showGrid;
		keyboardIndex;
		keyboardFocused;
		draw();
	});

	function draw() {
		if (!canvas) return;
		const displayWidth = ruler + project.columns * cellSize + 1;
		const displayHeight = ruler + project.rows * cellSize + 1;
		const ratio = Math.max(displayWidth, displayHeight) > 16_000 ? 1 : Math.min(devicePixelRatio || 1, 2);
		canvas.width = Math.ceil(displayWidth * ratio);
		canvas.height = Math.ceil(displayHeight * ratio);
		canvas.style.width = `${displayWidth}px`;
		canvas.style.height = `${displayHeight}px`;
		const drawing = canvas.getContext('2d');
		if (!drawing) return;
		drawing.scale(ratio, ratio);
		drawing.imageSmoothingEnabled = false;
		drawing.fillStyle = '#F9F8F4';
		drawing.fillRect(0, 0, displayWidth, displayHeight);
		for (let row = 0; row < project.rows; row += 1) {
			let column = 0;
			while (column < project.columns) {
				const slot = project.cells[row * project.columns + column];
				let run = 1;
				while (column + run < project.columns && project.cells[row * project.columns + column + run] === slot) run += 1;
				drawing.fillStyle = project.palette[slot]?.hex ?? '#FFFFFF';
				drawing.fillRect(ruler + column * cellSize, ruler + row * cellSize, run * cellSize + 0.2, cellSize + 0.2);
				column += run;
			}
		}
		if (showGrid && cellSize >= 3) {
			drawing.strokeStyle = cellSize >= 10 ? 'rgba(38,44,40,.32)' : 'rgba(38,44,40,.18)';
			drawing.lineWidth = 0.65;
			drawing.beginPath();
			for (let column = 0; column <= project.columns; column += 1) {
				const x = ruler + column * cellSize;
				drawing.moveTo(x, ruler); drawing.lineTo(x, ruler + project.rows * cellSize);
			}
			for (let row = 0; row <= project.rows; row += 1) {
				const y = ruler + row * cellSize;
				drawing.moveTo(ruler, y); drawing.lineTo(ruler + project.columns * cellSize, y);
			}
			drawing.stroke();
		}
		drawing.fillStyle = '#EAE8E1';
		drawing.fillRect(0, 0, displayWidth, ruler - 1);
		drawing.fillRect(0, 0, ruler - 1, displayHeight);
		drawing.fillStyle = '#535A56';
		drawing.textAlign = 'center'; drawing.textBaseline = 'middle';
		drawing.font = '600 9px ui-monospace, SFMono-Regular, monospace';
		const labelEvery = Math.max(1, Math.ceil(24 / cellSize));
		for (let column = 0; column < project.columns; column += labelEvery) drawing.fillText(String(column + 1), ruler + (column + 0.5) * cellSize, ruler / 2);
		for (let row = 0; row < project.rows; row += labelEvery) drawing.fillText(String(row + 1), ruler / 2, ruler + (row + 0.5) * cellSize);
		drawing.fillStyle = '#D6D3CB'; drawing.fillRect(0, 0, ruler - 1, ruler - 1);
		if (keyboardFocused && keyboardIndex >= 0 && keyboardIndex < project.cells.length) {
			const column = keyboardIndex % project.columns;
			const row = Math.floor(keyboardIndex / project.columns);
			drawing.strokeStyle = '#F26A3D';
			drawing.lineWidth = Math.max(2, Math.min(4, cellSize * 0.16));
			drawing.strokeRect(ruler + column * cellSize + 1, ruler + row * cellSize + 1, Math.max(1, cellSize - 2), Math.max(1, cellSize - 2));
		}
	}

	function cellAt(event: PointerEvent): number {
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((event.clientX - rect.left - ruler) / cellSize);
		const y = Math.floor((event.clientY - rect.top - ruler) / cellSize);
		if (x < 0 || y < 0 || x >= project.columns || y >= project.rows) return -1;
		return y * project.columns + x;
	}

	function pointerDown(event: PointerEvent) {
		if (event.button !== 0 && event.button !== 1) return;
		if (tool === 'pan' || event.button === 1 || event.altKey) {
			panning = true;
			panOrigin = { x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
			canvas.setPointerCapture(event.pointerId);
			return;
		}
		const index = cellAt(event);
		if (index < 0) return;
		if (tool === 'fill') { onFill(index, activeSlot); return; }
		if (tool === 'picker') { onPick(project.cells[index]); return; }
		if (tool === 'pencil' || tool === 'eraser') {
			painting = true;
			lastIndex = index;
			canvas.setPointerCapture(event.pointerId);
			onPaint(Uint32Array.of(index), tool === 'eraser' ? project.backgroundSlot : activeSlot, 'start');
		}
	}

	function pointerMove(event: PointerEvent) {
		if (panning) {
			scroller.scrollLeft = panOrigin.left - (event.clientX - panOrigin.x);
			scroller.scrollTop = panOrigin.top - (event.clientY - panOrigin.y);
			return;
		}
		const index = cellAt(event);
		hoverIndex = index;
		if (!painting || index < 0 || index === lastIndex) return;
		const indices = lineIndices(lastIndex, index, project.columns);
		lastIndex = index;
		onPaint(indices, tool === 'eraser' ? project.backgroundSlot : activeSlot, 'move');
	}

	function pointerUp(event: PointerEvent) {
		if (panning) panning = false;
		if (painting) {
			painting = false;
			onPaint(new Uint32Array(), tool === 'eraser' ? project.backgroundSlot : activeSlot, 'end');
		}
		if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
	}

	function wheel(event: WheelEvent) {
		if (!event.ctrlKey && !event.metaKey) return;
		event.preventDefault();
		onZoom(Math.max(0.35, Math.min(6, zoom * (event.deltaY > 0 ? 0.9 : 1.1))));
	}

	function keyboard(event: KeyboardEvent) {
		let column = keyboardIndex % project.columns;
		let row = Math.floor(keyboardIndex / project.columns);
		if (event.key === 'ArrowLeft') column = Math.max(0, column - 1);
		else if (event.key === 'ArrowRight') column = Math.min(project.columns - 1, column + 1);
		else if (event.key === 'ArrowUp') row = Math.max(0, row - 1);
		else if (event.key === 'ArrowDown') row = Math.min(project.rows - 1, row + 1);
		else if (event.key === 'Home') column = 0;
		else if (event.key === 'End') column = project.columns - 1;
		else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (tool === 'fill') onFill(keyboardIndex, activeSlot);
			else if (tool === 'picker') onPick(project.cells[keyboardIndex]);
			else if (tool === 'pencil' || tool === 'eraser') onEditCell(keyboardIndex, tool === 'eraser' ? project.backgroundSlot : activeSlot);
			return;
		} else return;
		event.preventDefault();
		keyboardIndex = row * project.columns + column;
		hoverIndex = keyboardIndex;
		requestAnimationFrame(() => {
			const x = canvas.offsetLeft + ruler + (column + 0.5) * cellSize;
			const y = canvas.offsetTop + ruler + (row + 0.5) * cellSize;
			scroller.scrollTo({ left: Math.max(0, x - scroller.clientWidth / 2), top: Math.max(0, y - scroller.clientHeight / 2), behavior: 'smooth' });
		});
	}

	let hoverColumn = $derived(hoverIndex >= 0 ? hoverIndex % project.columns + 1 : 0);
	let hoverRow = $derived(hoverIndex >= 0 ? Math.floor(hoverIndex / project.columns) + 1 : 0);
	let hoverColor = $derived(hoverIndex >= 0 ? project.palette[project.cells[hoverIndex]] : undefined);
</script>

<div class:dragging={panning} class="canvas-scroller" bind:this={scroller} onwheel={wheel}>
	<div class="canvas-pad">
		<canvas
			bind:this={canvas}
			tabindex="0"
			onpointerdown={pointerDown}
			onpointermove={pointerMove}
			onpointerup={pointerUp}
			onpointercancel={pointerUp}
			onpointerleave={() => (hoverIndex = -1)}
			onkeydown={keyboard}
			onfocus={() => { keyboardFocused = true; hoverIndex = keyboardIndex; }}
			onblur={() => (keyboardFocused = false)}
			aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End Enter Space"
			aria-label={`Canvas mosaic ${project.columns} kolom dan ${project.rows} baris. Gunakan tombol panah untuk berpindah sel, lalu Enter atau Spasi untuk memakai alat aktif.`}
		></canvas>
	</div>
	{#if hoverColor}
		<div class="coordinate-chip">
			<span style={`--chip:${hoverColor.hex}`}></span>
			C{hoverColumn} / R{hoverRow}
			<b>{hoverColor.code || hoverColor.name}</b>
		</div>
	{/if}
</div>

<style>
	.canvas-scroller{position:relative;width:100%;height:100%;overflow:auto;overscroll-behavior:contain;background:#dcdad3;background-image:radial-gradient(#c7c4bb 1px,transparent 1px);background-size:18px 18px;cursor:crosshair}.canvas-scroller.dragging{cursor:grabbing}.canvas-pad{min-width:100%;min-height:100%;padding:26px;display:grid;place-items:center;width:max-content;height:max-content}canvas{display:block;box-shadow:0 10px 30px rgba(31,37,34,.16);touch-action:none;background:#f9f8f4}canvas:focus-visible{outline:3px solid rgba(242,106,61,.55);outline-offset:4px}.coordinate-chip{position:sticky;left:16px;bottom:14px;margin:-46px 0 14px 16px;width:max-content;display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(31,37,34,.16);border-radius:6px;background:rgba(251,250,247,.94);backdrop-filter:blur(8px);font:600 10px ui-monospace,monospace;color:#606661;pointer-events:none}.coordinate-chip span{width:12px;height:12px;border:1px solid rgba(0,0,0,.16);background:var(--chip)}.coordinate-chip b{color:#262c28;font-weight:750;margin-left:3px}
</style>
