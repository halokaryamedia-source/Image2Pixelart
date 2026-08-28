<script lang="ts">
	import type { CropRect, SourceImage } from '$lib/types';
	import { centeredCropRect, clampCropRect } from '$lib/utils/image-crop';

	let { source, crop, targetAspect, onChange }: { source: SourceImage; crop: CropRect | null; targetAspect: number; onChange: (crop: CropRect) => void } = $props();
	let frame: HTMLButtonElement;
	let dragging = $state(false);
	let origin = { x: 0, y: 0, crop: null as CropRect | null };
	let base = $derived(centeredCropRect(source.width, source.height, targetAspect));
	let active = $derived(clampCropRect(crop ?? base, targetAspect, source.width, source.height));
	let zoom = $derived(Math.max(1, Math.min(6, base.width / active.width)));

	function pointerDown(event: PointerEvent) {
		dragging = true; origin = { x: event.clientX, y: event.clientY, crop: { ...active } };
		frame.setPointerCapture(event.pointerId);
	}
	function pointerMove(event: PointerEvent) {
		if (!dragging || !origin.crop) return;
		const rect = frame.getBoundingClientRect();
		onChange(clampCropRect({
			...origin.crop,
			x: origin.crop.x - (event.clientX - origin.x) / rect.width * origin.crop.width,
			y: origin.crop.y - (event.clientY - origin.y) / rect.height * origin.crop.height
		}, targetAspect, source.width, source.height));
	}
	function pointerUp(event: PointerEvent) { dragging = false; if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId); }
	function changeZoom(event: Event) {
		const nextZoom = Number((event.currentTarget as HTMLInputElement).value);
		const width = base.width / Math.max(1, nextZoom);
		const height = width / (targetAspect / (source.width / source.height));
		const centerX = active.x + active.width / 2; const centerY = active.y + active.height / 2;
		onChange(clampCropRect({ x: centerX - width / 2, y: centerY - height / 2, width, height }, targetAspect, source.width, source.height));
	}
	function keyboard(event: KeyboardEvent) {
		const step = event.shiftKey ? 0.03 : 0.01;
		let x = active.x; let y = active.y;
		if (event.key === 'ArrowLeft') x -= active.width * step;
		else if (event.key === 'ArrowRight') x += active.width * step;
		else if (event.key === 'ArrowUp') y -= active.height * step;
		else if (event.key === 'ArrowDown') y += active.height * step;
		else return;
		event.preventDefault(); onChange(clampCropRect({ ...active, x, y }, targetAspect, source.width, source.height));
	}
</script>

<div class="cropper">
	<button type="button" class:dragging class="frame" bind:this={frame} style={`aspect-ratio:${targetAspect}`} aria-label="Area crop. Seret gambar atau gunakan tombol panah." onpointerdown={pointerDown} onpointermove={pointerMove} onpointerup={pointerUp} onpointercancel={pointerUp} onkeydown={keyboard}>
		<img src={source.dataUrl} alt="Preview crop gambar sumber" draggable="false" style={`left:${-active.x / active.width * 100}%;top:${-active.y / active.height * 100}%;width:${100 / active.width}%;height:${100 / active.height}%`} />
		<div class="thirds"><i></i><i></i><b></b><b></b></div>
		<span>Seret untuk mengatur crop</span>
	</button>
	<div class="crop-controls"><label><span>Zoom</span><input type="range" min="1" max="6" step="0.01" value={zoom} oninput={changeZoom} /></label><button type="button" onclick={() => onChange(base)}>Reset</button></div>
</div>

<style>
	.frame{position:relative;display:block;padding:0;width:100%;max-height:210px;overflow:hidden;background:#d9d7d0;cursor:grab;touch-action:none;border:1px solid #b7bab4;border-radius:7px;outline:none}.frame.dragging{cursor:grabbing}.frame:focus-visible{box-shadow:0 0 0 3px rgba(69,168,181,.35)}img{position:absolute;max-width:none;object-fit:fill;pointer-events:none;user-select:none}.thirds{position:absolute;inset:0;pointer-events:none;border:2px solid rgba(255,255,255,.9);box-shadow:inset 0 0 0 999px rgba(0,0,0,.02)}.thirds i,.thirds b{position:absolute;background:rgba(255,255,255,.55)}.thirds i{top:0;bottom:0;width:1px}.thirds i:first-child{left:33.333%}.thirds i:nth-child(2){left:66.666%}.thirds b{left:0;right:0;height:1px}.thirds b:nth-child(3){top:33.333%}.thirds b:nth-child(4){top:66.666%}.frame>span{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:5px 8px;border-radius:4px;background:rgba(28,32,29,.72);color:white;font-size:8px;font-weight:750;white-space:nowrap}.crop-controls{display:flex;align-items:end;gap:8px;margin:8px 0 16px}.crop-controls label{flex:1}.crop-controls label span{display:block;font-size:8px;font-weight:800;text-transform:uppercase;color:#6b726d;margin-bottom:3px}.crop-controls input{width:100%;accent-color:var(--forest)}.crop-controls button{height:28px;border:1px solid #c9c7c0;background:white;border-radius:5px;font-size:8px;font-weight:800;color:#555c57}
</style>
