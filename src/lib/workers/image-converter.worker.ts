/// <reference lib="webworker" />

import { catalogColorToPalette, orderedProjectPalette } from '../catalog';
import type { ConversionRequest, ConversionResult, ColorSample, ProjectPaletteEntry } from '../types';
import { colorDistanceSquared, hexToOklab, selectCatalogColorIds, srgbChannelToLinear } from '../utils/color';

const context: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

context.onmessage = async (event: MessageEvent<ConversionRequest>) => {
	try {
		const result = await convert(event.data);
		context.postMessage({ ok: true, result }, [result.cells.buffer]);
	} catch (error) {
		context.postMessage({ ok: false, error: error instanceof Error ? error.message : 'Konversi gambar gagal.' });
	}
};

async function convert(request: ConversionRequest): Promise<ConversionResult> {
	const image = await createImageBitmap(new Blob([request.buffer], { type: request.mimeType }));
	if (image.width * image.height > 25_000_000) throw new Error('Resolusi gambar melebihi batas 25 megapixel.');
	const imageWidth = image.width;
	const imageHeight = image.height;
	const scale = Math.max(1, Math.min(4, Math.floor(Math.sqrt(6_000_000 / (request.columns * request.rows)))));
	const width = request.columns * scale;
	const height = request.rows * scale;
	const canvas = new OffscreenCanvas(width, height);
	const drawing = canvas.getContext('2d', { willReadFrequently: true });
	if (!drawing) throw new Error('Canvas konversi tidak tersedia.');
	drawing.imageSmoothingEnabled = true;
	drawing.imageSmoothingQuality = 'high';
	drawing.fillStyle = request.backgroundHex;
	drawing.fillRect(0, 0, width, height);
	const fitScale = request.fit === 'cover'
		? Math.max(width / image.width, height / image.height)
		: Math.min(width / image.width, height / image.height);
	const drawWidth = image.width * fitScale;
	const drawHeight = image.height * fitScale;
	const x = (width - drawWidth) * (request.fit === 'contain' ? 0.5 : request.focalX);
	const y = (height - drawHeight) * (request.fit === 'contain' ? 0.5 : request.focalY);
	drawing.drawImage(image, x, y, drawWidth, drawHeight);
	image.close();
	const pixels = drawing.getImageData(0, 0, width, height).data;
	const samples = averageSamples(pixels, request.columns, request.rows, scale, width);
	const palette = choosePalette(samples, request);
	const paletteLabs = palette.map((color) => hexToOklab(color.hex));
	const cells = new Uint16Array(samples.length);
	for (let index = 0; index < samples.length; index += 1) {
		let nearest = 0;
		let nearestDistance = Number.POSITIVE_INFINITY;
		for (let slot = 0; slot < paletteLabs.length; slot += 1) {
			const distance = colorDistanceSquared(samples[index], paletteLabs[slot]);
			if (distance < nearestDistance) { nearestDistance = distance; nearest = slot; }
		}
		cells[index] = nearest;
	}
	return { cells, palette, backgroundSlot: palette.findIndex((entry) => entry.catalogId === request.backgroundCatalogId), imageWidth, imageHeight };
}

function averageSamples(pixels: Uint8ClampedArray, columns: number, rows: number, scale: number, bitmapWidth: number): ColorSample[] {
	const samples: ColorSample[] = new Array(columns * rows);
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < columns; column += 1) {
			let r = 0; let g = 0; let b = 0;
			for (let dy = 0; dy < scale; dy += 1) {
				for (let dx = 0; dx < scale; dx += 1) {
					const offset = (((row * scale + dy) * bitmapWidth) + column * scale + dx) * 4;
					r += srgbChannelToLinear(pixels[offset]);
					g += srgbChannelToLinear(pixels[offset + 1]);
					b += srgbChannelToLinear(pixels[offset + 2]);
				}
			}
			const count = scale * scale;
			const l = 0.4122214708 * (r / count) + 0.5363325363 * (g / count) + 0.0514459929 * (b / count);
			const m = 0.2119034982 * (r / count) + 0.6806995451 * (g / count) + 0.1073969566 * (b / count);
			const s = 0.0883024619 * (r / count) + 0.2817188376 * (g / count) + 0.6299787005 * (b / count);
			const lr = Math.cbrt(l); const mr = Math.cbrt(m); const sr = Math.cbrt(s);
			samples[row * columns + column] = {
				l: 0.2104542553 * lr + 0.793617785 * mr - 0.0040720468 * sr,
				a: 1.9779984951 * lr - 2.428592205 * mr + 0.4505937099 * sr,
				b: 0.0259040371 * lr + 0.7827717662 * mr - 0.808675766 * sr
			};
		}
	}
	return samples;
}

function choosePalette(samples: ColorSample[], request: ConversionRequest): ProjectPaletteEntry[] {
	if (!request.autoPalette) return orderedProjectPalette(request.existingPalette, request.backgroundCatalogId, request.maxColors);
	const pinnedIds = [request.backgroundCatalogId, ...request.existingPalette.filter((color) => color.pinned).map((color) => color.catalogId)];
	const ids = selectCatalogColorIds(samples, request.catalog, request.maxColors, [...new Set(pinnedIds)]);
	ids.sort((left, right) => left === request.backgroundCatalogId ? -1 : right === request.backgroundCatalogId ? 1 : 0);
	return ids.map((id, slot) => {
		const color = request.catalog.find((entry) => entry.id === id)!;
		return catalogColorToPalette(color, slot, pinnedIds.includes(id));
	});
}
