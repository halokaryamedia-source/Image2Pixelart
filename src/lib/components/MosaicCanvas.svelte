<script lang="ts">
	import { onMount } from 'svelte';
	import type { EditorTool, ProjectV2 } from '$lib/types';
	import { EMPTY_CELL } from '$lib/types';
	import { lineIndices } from '$lib/utils/grid';

	type Props = {
		project: ProjectV2;
		activeSlot: number;
		tool: EditorTool;
		zoom: number;
		showGrid: boolean;
		onPaint: (indices: Uint32Array, slot: number, phase: 'start' | 'move' | 'end') => void;
		onFill: (index: number, slot: number) => void;
		onEditCell: (index: number, slot: number) => void;
		onPick: (slot: number) => void;
		onZoom: (zoom: number) => void;
		onCoordinate?: (coordinate: { x: number; y: number } | null) => void;
		selection?: { anchor: number; focus: number } | null;
		onSelectionChange?: (selection: { anchor: number; focus: number } | null) => void;
		fitRequest?: number;
		editable?: boolean;
	};

	let { project, activeSlot, tool, zoom, showGrid, onPaint, onFill, onEditCell, onPick, onZoom, onCoordinate, selection = null, onSelectionChange, fitRequest = 0, editable = true }: Props = $props();
	let canvas: HTMLCanvasElement;
	let scroller: HTMLDivElement;
	let viewportWidth = $state(800);
	let viewportHeight = $state(600);
	let hoverIndex = $state(-1);
	let keyboardIndex = $state(0);
	let keyboardCursorVisible = $state(false);
	let painting = false;
	let selecting = false;
	let selectAnchor = -1;
	let lastIndex = -1;
	let panning = $state(false);
	let panOrigin = { x: 0, y: 0, left: 0, top: 0 };
	const ruler = 34;
	const canvasPadding = 26;
	const maxCanvasEdge = 16_000;
	let fitCell = $derived(Math.max(1.5, Math.min(26, (viewportWidth - ruler - canvasPadding * 2 - 1) / project.columns, (viewportHeight - ruler - canvasPadding * 2 - 1) / project.rows)));
	let cellSize = $derived(Math.max(0.5, Math.min(fitCell * zoom, (maxCanvasEdge - ruler - 1) / Math.max(project.columns, project.rows))));

	onMount(() => {
		let resizeFrame = 0;
		const observer = new ResizeObserver(([entry]) => {
			const nextWidth = Math.round(entry.contentRect.width);
			const nextHeight = Math.round(entry.contentRect.height);
			cancelAnimationFrame(resizeFrame);
			resizeFrame = requestAnimationFrame(() => {
				if (Math.abs(viewportWidth - nextWidth) >= 1) viewportWidth = nextWidth;
				if (Math.abs(viewportHeight - nextHeight) >= 1) viewportHeight = nextHeight;
			});
		});
		observer.observe(scroller);
		requestAnimationFrame(() => requestAnimationFrame(centerCanvas));
		return () => { cancelAnimationFrame(resizeFrame); observer.disconnect(); };
	});

	$effect(() => {
		fitRequest;
		if (canvas && scroller) requestAnimationFrame(centerCanvas);
	});

	$effect(() => {
		project.cells;
		project.palette;
		cellSize;
		showGrid;
		keyboardIndex;
		keyboardCursorVisible;
		selection;
		draw();
	});

	function centerCanvas() {
		if (!canvas || !scroller) return;
		scroller.scrollTo({
			left: Math.max(0, canvas.offsetLeft + canvas.clientWidth / 2 - scroller.clientWidth / 2),
			top: Math.max(0, canvas.offsetTop + canvas.clientHeight / 2 - scroller.clientHeight / 2)
		});
	}

	function draw() {
		if (!canvas) return;
		const displayWidth = ruler + project.columns * cellSize + 1;
		const displayHeight = ruler + project.rows * cellSize + 1;
		const ratio = Math.max(1, Math.min(devicePixelRatio || 1, 2, maxCanvasEdge / Math.max(displayWidth, displayHeight)));
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
		const checker = Math.max(4, Math.min(10, cellSize));
		for (let y = 0; y < project.rows * cellSize; y += checker) {
			for (let x = 0; x < project.columns * cellSize; x += checker) {
				drawing.fillStyle = ((Math.floor(x / checker) + Math.floor(y / checker)) % 2) ? '#E3E1DA' : '#F2F0EB';
				drawing.fillRect(ruler + x, ruler + y, Math.min(checker, project.columns * cellSize - x), Math.min(checker, project.rows * cellSize - y));
			}
		}
		for (let row = 0; row < project.rows; row += 1) {
			let column = 0;
			while (column < project.columns) {
				const slot = project.cells[row * project.columns + column];
				let run = 1;
				while (column + run < project.columns && project.cells[row * project.columns + column + run] === slot) run += 1;
				if (slot !== EMPTY_CELL && project.palette[slot]) {
					drawing.fillStyle = project.palette[slot].hex;
					drawing.fillRect(ruler + column * cellSize, ruler + row * cellSize, run * cellSize + 0.2, cellSize + 0.2);
				}
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
		if (selection) {
			const anchorColumn = selection.anchor % project.columns;
			const anchorRow = Math.floor(selection.anchor / project.columns);
			const focusColumn = selection.focus % project.columns;
			const focusRow = Math.floor(selection.focus / project.columns);
			const left = Math.min(anchorColumn, focusColumn);
			const top = Math.min(anchorRow, focusRow);
			const width = Math.abs(anchorColumn - focusColumn) + 1;
			const height = Math.abs(anchorRow - focusRow) + 1;
			drawing.fillStyle = 'rgba(0, 100, 54, .12)';
			drawing.fillRect(ruler + left * cellSize, ruler + top * cellSize, width * cellSize, height * cellSize);
			drawing.save();
			drawing.strokeStyle = '#006436';
			drawing.lineWidth = Math.max(2, Math.min(3, cellSize * 0.14));
			drawing.setLineDash([6, 4]);
			drawing.strokeRect(ruler + left * cellSize + 1, ruler + top * cellSize + 1, Math.max(1, width * cellSize - 2), Math.max(1, height * cellSize - 2));
			drawing.restore();
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
		if (keyboardCursorVisible && keyboardIndex >= 0 && keyboardIndex < project.cells.length) {
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
		keyboardCursorVisible = false;
		hoverIndex = -1;
		onCoordinate?.(null);
		if (!editable || tool === 'pan' || event.button === 1 || event.altKey) {
			event.preventDefault();
			panning = true;
			panOrigin = { x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
			canvas.setPointerCapture(event.pointerId);
			return;
		}
		const index = cellAt(event);
		if (index < 0) return;
		hoverIndex = index;
		onCoordinate?.({ x: index % project.columns + 1, y: Math.floor(index / project.columns) + 1 });
		if (tool === 'fill') { if (activeSlot >= 0) onFill(index, activeSlot); return; }
		if (tool === 'picker') { onPick(project.cells[index]); return; }
		if (tool === 'select') {
			selecting = true;
			selectAnchor = index;
			canvas.setPointerCapture(event.pointerId);
			onSelectionChange?.({ anchor: index, focus: index });
			return;
		}
		if ((tool === 'pencil' && activeSlot >= 0) || tool === 'eraser') {
			painting = true;
			lastIndex = index;
			canvas.setPointerCapture(event.pointerId);
			onPaint(Uint32Array.of(index), tool === 'eraser' ? EMPTY_CELL : activeSlot, 'start');
		}
	}

	function pointerMove(event: PointerEvent) {
		keyboardCursorVisible = false;
		if (panning) {
			scroller.scrollLeft = panOrigin.left - (event.clientX - panOrigin.x);
			scroller.scrollTop = panOrigin.top - (event.clientY - panOrigin.y);
			return;
		}
		const index = cellAt(event);
		hoverIndex = index;
		onCoordinate?.(index >= 0 ? { x: index % project.columns + 1, y: Math.floor(index / project.columns) + 1 } : null);
		if (selecting) {
			if (index >= 0 && selectAnchor >= 0 && index !== selection?.focus) onSelectionChange?.({ anchor: selectAnchor, focus: index });
			return;
		}
		if (!painting || index < 0 || index === lastIndex) return;
		const indices = lineIndices(lastIndex, index, project.columns);
		lastIndex = index;
		onPaint(indices, tool === 'eraser' ? EMPTY_CELL : activeSlot, 'move');
	}

	function pointerUp(event: PointerEvent) {
		if (panning) panning = false;
		if (selecting) { selecting = false; selectAnchor = -1; }
		if (painting) {
			painting = false;
			onPaint(new Uint32Array(), tool === 'eraser' ? EMPTY_CELL : activeSlot, 'end');
		}
		if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
	}

	function wheel(event: WheelEvent) {
		if (!event.ctrlKey && !event.metaKey) return;
		event.preventDefault();
		onZoom(Math.max(0.35, Math.min(6, zoom * (event.deltaY > 0 ? 0.9 : 1.1))));
	}

	function keyboard(event: KeyboardEvent) {
		if (!editable && tool !== 'pan') return;
		if (tool === 'pan' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
			event.preventDefault();
			const amount = 64;
			scroller.scrollBy({ left: event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0, top: event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0, behavior: 'smooth' });
			return;
		}
		let column = keyboardIndex % project.columns;
		let row = Math.floor(keyboardIndex / project.columns);
		if (event.key === 'ArrowLeft') column = Math.max(0, column - 1);
		else if (event.key === 'ArrowRight') column = Math.min(project.columns - 1, column + 1);
		else if (event.key === 'ArrowUp') row = Math.max(0, row - 1);
		else if (event.key === 'ArrowDown') row = Math.min(project.rows - 1, row + 1);
		else if (event.key === 'Home') column = 0;
		else if (event.key === 'End') column = project.columns - 1;
		else if (event.key === 'Enter') {
			event.preventDefault();
			keyboardCursorVisible = true;
			hoverIndex = keyboardIndex;
			onCoordinate?.({ x: keyboardIndex % project.columns + 1, y: Math.floor(keyboardIndex / project.columns) + 1 });
			if (tool === 'fill' && activeSlot >= 0) onFill(keyboardIndex, activeSlot);
			else if (tool === 'picker') onPick(project.cells[keyboardIndex]);
			else if (tool === 'select') onSelectionChange?.({ anchor: keyboardIndex, focus: keyboardIndex });
			else if (tool === 'eraser') onEditCell(keyboardIndex, EMPTY_CELL);
			else if (tool === 'pencil' && activeSlot >= 0) onEditCell(keyboardIndex, activeSlot);
			return;
		} else return;
		event.preventDefault();
		keyboardCursorVisible = true;
		keyboardIndex = row * project.columns + column;
		hoverIndex = keyboardIndex;
		onCoordinate?.({ x: column + 1, y: row + 1 });
		requestAnimationFrame(() => {
			const x = canvas.offsetLeft + ruler + (column + 0.5) * cellSize;
			const y = canvas.offsetTop + ruler + (row + 0.5) * cellSize;
			scroller.scrollTo({ left: Math.max(0, x - scroller.clientWidth / 2), top: Math.max(0, y - scroller.clientHeight / 2), behavior: 'smooth' });
		});
	}

	let hoverColumn = $derived(hoverIndex >= 0 ? hoverIndex % project.columns + 1 : 0);
	let hoverRow = $derived(hoverIndex >= 0 ? Math.floor(hoverIndex / project.columns) + 1 : 0);
	let hoverColor = $derived(hoverIndex >= 0 ? project.palette[project.cells[hoverIndex]] : undefined);
	let hoverEmpty = $derived(hoverIndex >= 0 && project.cells[hoverIndex] === EMPTY_CELL);
</script>

<div class:dragging={panning} class:pan-tool={tool === 'pan'} class:select-tool={tool === 'select'} class="canvas-scroller" bind:this={scroller} onwheel={wheel}>
	<div class="canvas-pad">
		<canvas
			bind:this={canvas}
			tabindex="0"
			onpointerdown={pointerDown}
			onpointermove={pointerMove}
			onpointerup={pointerUp}
			onpointercancel={pointerUp}
			onpointerleave={() => { hoverIndex = -1; onCoordinate?.(null); }}
			onkeydown={keyboard}
			onblur={() => { keyboardCursorVisible = false; hoverIndex = -1; onCoordinate?.(null); }}
			aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End Enter"
			aria-label={`Canvas mosaic ${project.columns} kolom dan ${project.rows} baris. Gunakan tombol panah untuk berpindah sel, lalu Enter untuk memakai alat aktif. Tahan Spasi untuk menggeser canvas.`}
		></canvas>
	</div>
	{#if hoverColor}
		<div class:keyboard={keyboardCursorVisible} class="coordinate-chip">
			{#if keyboardCursorVisible}<em>Fokus Keyboard</em>{/if}
			<span style={`--chip:${hoverColor.hex}`}></span>
			C{hoverColumn} / R{hoverRow}
			<b>{hoverColor.hex}</b>
		</div>
	{:else if hoverEmpty}
		<div class:keyboard={keyboardCursorVisible} class="coordinate-chip empty">{#if keyboardCursorVisible}<em>Fokus Keyboard</em>{/if}C{hoverColumn} / R{hoverRow}<b>SEL KOSONG</b></div>
	{/if}
</div>

<style>
	.canvas-scroller{position:relative;width:100%;height:100%;overflow:auto;overscroll-behavior:contain;background:#dcdad3;background-image:radial-gradient(#c7c4bb 1px,transparent 1px);background-size:18px 18px;cursor:crosshair}.canvas-scroller.pan-tool canvas{cursor:grab}.canvas-scroller.select-tool canvas{cursor:cell}.canvas-scroller.dragging,.canvas-scroller.dragging canvas{cursor:grabbing}.canvas-pad{min-width:calc(100% + 240px);min-height:calc(100% + 240px);padding:26px;display:grid;place-items:center;width:max-content;height:max-content}canvas{display:block;box-shadow:0 10px 30px rgba(31,37,34,.16);touch-action:none;background:#f9f8f4}canvas:focus-visible{outline:3px solid rgba(242,106,61,.55);outline-offset:4px}.coordinate-chip{position:sticky;left:16px;bottom:14px;margin:-46px 0 14px 16px;width:max-content;display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(31,37,34,.16);border-radius:6px;background:rgba(251,250,247,.94);backdrop-filter:blur(8px);font:600 10px ui-monospace,monospace;color:#606661;pointer-events:none}.coordinate-chip span{width:12px;height:12px;border:1px solid rgba(0,0,0,.16);background:var(--chip)}.coordinate-chip b{color:#262c28;font-weight:750;margin-left:3px}
	.canvas-scroller{min-width:0;max-width:100%;box-sizing:border-box}.canvas-pad{box-sizing:border-box}
	.coordinate-chip em{padding-right:7px;border-right:1px solid #d8d4c9;color:#9a4c2f;font-size:9px;font-style:normal;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
</style>
