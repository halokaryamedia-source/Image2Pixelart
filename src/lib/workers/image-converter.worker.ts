/// <reference lib="webworker" />

import { analyzeRaster, SAMPLE_SCALE } from '../image-analysis';
import type { ConversionRequest, ConversionResult, CropRect } from '../types';
import { centeredCropRect } from '../utils/image-crop';

const context: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

context.onmessage = async (event: MessageEvent<ConversionRequest>) => {
	try {
		const result = await convert(event.data);
		context.postMessage({ ok: true, result }, [result.cells.buffer]);
	} catch (error) {
		context.postMessage({ ok: false, error: error instanceof Error ? error.message : 'Konversi gambar gagal.' });
	}
};

function sourceRect(request: ConversionRequest, imageWidth: number, imageHeight: number): CropRect {
	return request.crop ?? centeredCropRect(imageWidth, imageHeight, request.columns / request.rows);
}

async function convert(request: ConversionRequest): Promise<ConversionResult> {
	const image = await createImageBitmap(new Blob([request.buffer], { type: request.mimeType }));
	if (image.width * image.height > 25_000_000) { image.close(); throw new Error('Resolusi gambar melebihi batas 25 megapixel.'); }
	const imageWidth = image.width; const imageHeight = image.height;
	const width = request.columns * SAMPLE_SCALE; const height = request.rows * SAMPLE_SCALE;
	const canvas = new OffscreenCanvas(width, height);
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
	image.close();
	const analyzed = analyzeRaster(drawing.getImageData(0, 0, width, height).data, width, request);
	return { ...analyzed, imageWidth, imageHeight };
}
