import { analyzeRaster, SAMPLE_SCALE } from '$lib/image-analysis';
import type { ConversionRequest, ConversionResult, CropRect, ProjectV2 } from '$lib/types';
import { centeredCropRect } from '$lib/utils/image-crop';

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export async function convertImageFile(file: File, project: ProjectV2, suggestPalette = false): Promise<ConversionResult> {
	if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Gunakan file PNG, JPEG, atau WebP.');
	if (file.size > MAX_IMAGE_BYTES) throw new Error('Ukuran file melebihi batas 20 MB.');
	const request: ConversionRequest = {
		buffer: await file.arrayBuffer(),
		mimeType: file.type,
		columns: project.columns,
		rows: project.rows,
		placement: project.importSettings.placement,
		crop: project.importSettings.crop ? { ...project.importSettings.crop } : null,
		renderMode: project.importSettings.renderMode,
		suggestionCount: project.importSettings.suggestionCount,
		palette: project.palette.map((entry) => ({ ...entry })),
		suggestPalette
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
			clearTimeout(timeout); worker.terminate();
			if (event.data.ok && event.data.result) resolve(event.data.result);
			else reject(new Error(event.data.error ?? 'Konversi gambar gagal.'));
		};
		worker.onerror = () => { clearTimeout(timeout); worker.terminate(); reject(new Error('Web Worker tidak tersedia.')); };
		worker.postMessage(request, [request.buffer]);
	});
}

function sourceRect(request: ConversionRequest, imageWidth: number, imageHeight: number): CropRect {
	return request.crop ?? centeredCropRect(imageWidth, imageHeight, request.columns / request.rows);
}

async function convertOnMainThread(file: File, request: ConversionRequest): Promise<ConversionResult> {
	const image = await createImageBitmap(file);
	if (image.width * image.height > 25_000_000) { image.close(); throw new Error('Resolusi gambar melebihi batas 25 megapixel.'); }
	const width = request.columns * SAMPLE_SCALE;
	const height = request.rows * SAMPLE_SCALE;
	const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
	const drawing = canvas.getContext('2d', { willReadFrequently: true });
	if (!drawing) { image.close(); throw new Error('Canvas konversi tidak tersedia.'); }
	drawing.clearRect(0, 0, width, height);
	drawing.imageSmoothingEnabled = request.renderMode === 'photo';
	if (request.renderMode === 'photo') drawing.imageSmoothingQuality = 'high';
	if (request.placement === 'fit') {
		const scale = Math.min(width / image.width, height / image.height);
		const drawWidth = image.width * scale; const drawHeight = image.height * scale;
		drawing.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
	} else {
		const crop = sourceRect(request, image.width, image.height);
		drawing.drawImage(image, crop.x * image.width, crop.y * image.height, crop.width * image.width, crop.height * image.height, 0, 0, width, height);
	}
	const analyzed = analyzeRaster(drawing.getImageData(0, 0, width, height).data, width, request);
	const result = { ...analyzed, imageWidth: image.width, imageHeight: image.height };
	image.close();
	return result;
}
