<script lang="ts">
	import type { CloudProjectSummary } from '$lib/cloud/types';
	import { EMPTY_CELL } from '$lib/types';
	let { project }: { project: CloudProjectSummary } = $props();
	let canvas: HTMLCanvasElement;
	$effect(() => { canvas; project.previewCells; draw(); });
	function draw() {
		if (!canvas) return; const width = 280; const height = 150;
		canvas.width = width * 2; canvas.height = height * 2; const context = canvas.getContext('2d'); if (!context) return;
		context.scale(2, 2); context.fillStyle = '#EEECE6'; context.fillRect(0, 0, width, height);
		const cell = Math.min((width - 24) / project.previewColumns, (height - 24) / project.previewRows);
		const left = (width - project.previewColumns * cell) / 2; const top = (height - project.previewRows * cell) / 2;
		for (let y = 0; y < project.previewRows; y += 1) for (let x = 0; x < project.previewColumns; x += 1) {
			const slot = project.previewCells[y * project.previewColumns + x]; if (slot === EMPTY_CELL || !project.palette[slot]) continue;
			context.fillStyle = project.palette[slot].hex; context.fillRect(left + x * cell, top + y * cell, cell + .2, cell + .2);
		}
	}
</script>
<canvas bind:this={canvas} aria-label={`Preview cloud ${project.name}`}></canvas>
<style>canvas{display:block;width:100%;height:100%;image-rendering:pixelated}</style>
