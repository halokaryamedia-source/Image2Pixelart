import { catalogColorToPalette, orderedProjectPalette } from '$lib/catalog';
import type { CatalogColor, ColorSample, ConversionRequest, ConversionResult, ProjectV1 } from '$lib/types';
import { colorDistanceSquared, hexToOklab, selectCatalogColorIds, srgbChannelToLinear } from '$lib/utils/color';

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export async function convertImageFile(file: File, project: ProjectV1, catalog: CatalogColor[]): Promise<ConversionResult> {
	if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Gunakan file PNG, JPEG, atau WebP.');
	if (file.size > MAX_IMAGE_BYTES) throw new Error('Ukuran file melebihi batas 20 MB.');
	const background = project.palette.find((entry) => entry.slot === project.backgroundSlot) ?? project.palette[0];
	if (!background) throw new Error('Palette proyek tidak memiliki warna latar.');
	const activeCatalog = catalog.filter((color) => color.active);
	for (const entry of project.palette.filter((color) => color.pinned || color.slot === project.backgroundSlot)) {
		if (!activeCatalog.some((color) => color.id === entry.catalogId)) {
			const original = catalog.find((color) => color.id === entry.catalogId);
			activeCatalog.push(original ? { ...original, active: true } : { id: entry.catalogId, name: entry.name, code: entry.code, hex: entry.hex, active: true, createdAt: project.createdAt, updatedAt: project.updatedAt });
		}
	}
	const requiredIds = [...new Set([background.catalogId, ...project.palette.filter((color) => color.pinned).map((color) => color.catalogId)])];
	if (project.importSettings.maxColors < requiredIds.length) {
		throw new Error(`Batas warna minimal ${requiredIds.length} karena warna latar dan warna pinned selalu disertakan.`);
	}
	const request: ConversionRequest = {
		buffer: await file.arrayBuffer(),
		mimeType: file.type,
		columns: project.columns,
		rows: project.rows,
		fit: project.importSettings.fit,
		focalX: project.importSettings.focalX,
		focalY: project.importSettings.focalY,
		backgroundHex: background.hex,
		backgroundCatalogId: background.catalogId,
		catalog: activeCatalog,
		existingPalette: project.palette,
		maxColors: project.importSettings.maxColors,
		autoPalette: project.importSettings.autoPalette
	};
	if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
		try { return await convertInWorker(request); }
		catch (error) { if (!(error instanceof Error) || error.message !== 'Web Worker tidak tersedia.') throw error; }
	}
	return convertOnMainThread(file, request);
}

function convertInWorker(request: ConversionRequest): Promise<ConversionResult> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('./workers/image-converter.worker.ts', import.meta.url), { type: 'module' });
		const timeout = window.setTimeout(() => { worker.terminate(); reject(new Error('Konversi gambar melewati batas waktu.')); }, 60_000);
		worker.onmessage = (event: MessageEvent<{ ok: boolean; result?: ConversionResult; error?: string }>) => {
			clearTimeout(timeout);
			worker.terminate();
			if (event.data.ok && event.data.result) resolve(event.data.result);
			else reject(new Error(event.data.error ?? 'Konversi gambar gagal.'));
		};
		worker.onerror = () => { clearTimeout(timeout); worker.terminate(); reject(new Error('Web Worker tidak tersedia.')); };
		worker.postMessage(request, [request.buffer]);
	});
}

async function convertOnMainThread(file: File, request: ConversionRequest): Promise<ConversionResult> {
	const image = await createImageBitmap(file);
	if (image.width * image.height > 25_000_000) throw new Error('Resolusi gambar melebihi batas 25 megapixel.');
	const scale = Math.max(1, Math.min(4, Math.floor(Math.sqrt(6_000_000 / (request.columns * request.rows)))));
	const width = request.columns * scale;
	const height = request.rows * scale;
	const canvas = document.createElement('canvas');
	canvas.width = width; canvas.height = height;
	const drawing = canvas.getContext('2d', { willReadFrequently: true });
	if (!drawing) throw new Error('Canvas konversi tidak tersedia.');
	drawing.imageSmoothingEnabled = true; drawing.imageSmoothingQuality = 'high';
	drawing.fillStyle = request.backgroundHex; drawing.fillRect(0, 0, width, height);
	const fitScale = request.fit === 'cover' ? Math.max(width / image.width, height / image.height) : Math.min(width / image.width, height / image.height);
	const drawWidth = image.width * fitScale; const drawHeight = image.height * fitScale;
	drawing.drawImage(image, (width - drawWidth) * (request.fit === 'contain' ? 0.5 : request.focalX), (height - drawHeight) * (request.fit === 'contain' ? 0.5 : request.focalY), drawWidth, drawHeight);
	const pixels = drawing.getImageData(0, 0, width, height).data;
	const samples: ColorSample[] = [];
	for (let row = 0; row < request.rows; row += 1) for (let column = 0; column < request.columns; column += 1) {
		let r = 0; let g = 0; let b = 0;
		for (let dy = 0; dy < scale; dy += 1) for (let dx = 0; dx < scale; dx += 1) {
			const offset = (((row * scale + dy) * width) + column * scale + dx) * 4;
			r += srgbChannelToLinear(pixels[offset]); g += srgbChannelToLinear(pixels[offset + 1]); b += srgbChannelToLinear(pixels[offset + 2]);
		}
		const count = scale * scale;
		const lr = Math.cbrt(0.4122214708 * r / count + 0.5363325363 * g / count + 0.0514459929 * b / count);
		const mr = Math.cbrt(0.2119034982 * r / count + 0.6806995451 * g / count + 0.1073969566 * b / count);
		const sr = Math.cbrt(0.0883024619 * r / count + 0.2817188376 * g / count + 0.6299787005 * b / count);
		samples.push({ l: 0.2104542553 * lr + 0.793617785 * mr - 0.0040720468 * sr, a: 1.9779984951 * lr - 2.428592205 * mr + 0.4505937099 * sr, b: 0.0259040371 * lr + 0.7827717662 * mr - 0.808675766 * sr });
	}
	const pinnedIds = [request.backgroundCatalogId, ...request.existingPalette.filter((color) => color.pinned).map((color) => color.catalogId)];
	const ids = selectCatalogColorIds(samples, request.catalog, request.maxColors, [...new Set(pinnedIds)]);
	ids.sort((left, right) => left === request.backgroundCatalogId ? -1 : right === request.backgroundCatalogId ? 1 : 0);
	const palette = request.autoPalette
		? ids.map((id, slot) => catalogColorToPalette(request.catalog.find((entry) => entry.id === id)!, slot, pinnedIds.includes(id)))
		: orderedProjectPalette(request.existingPalette, request.backgroundCatalogId, request.maxColors);
	const labs = palette.map((entry) => hexToOklab(entry.hex));
	const cells = new Uint16Array(samples.length);
	samples.forEach((sample, index) => {
		let best = 0; let distance = Number.POSITIVE_INFINITY;
		labs.forEach((lab, slot) => { const next = colorDistanceSquared(sample, lab); if (next < distance) { best = slot; distance = next; } });
		cells[index] = best;
	});
	const result = { cells, palette, backgroundSlot: palette.findIndex((entry) => entry.catalogId === request.backgroundCatalogId), imageWidth: image.width, imageHeight: image.height };
	image.close();
	return result;
}
