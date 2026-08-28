import type { ColorSample, ConversionRequest, ProjectPaletteEntry } from '$lib/types';
import { EMPTY_CELL } from '$lib/types';
import { colorDistanceSquared, hexToOklab, linearRgbToOklab, srgbChannelToLinear, suggestPalette } from '$lib/utils/color';

export const SAMPLE_SCALE = 4;

function pixelSample(pixels: Uint8ClampedArray, offset: number): ColorSample {
	return {
		...linearRgbToOklab(
			srgbChannelToLinear(pixels[offset]),
			srgbChannelToLinear(pixels[offset + 1]),
			srgbChannelToLinear(pixels[offset + 2])
		),
		alpha: pixels[offset + 3] / 255
	};
}

function opaqueSamples(pixels: Uint8ClampedArray): ColorSample[] {
	const samples: ColorSample[] = [];
	const pixelCount = pixels.length / 4;
	const stride = Math.max(1, Math.ceil(pixelCount / 40_000));
	for (let pixel = 0; pixel < pixelCount; pixel += stride) {
		const offset = pixel * 4;
		if (pixels[offset + 3] >= 64) samples.push(pixelSample(pixels, offset));
	}
	return samples;
}

function nearest(sample: ColorSample, labs: ColorSample[]): number {
	let best = 0; let distance = Number.POSITIVE_INFINITY;
	labs.forEach((lab, slot) => {
		const next = colorDistanceSquared(sample, lab);
		if (next < distance) { best = slot; distance = next; }
	});
	return best;
}

function contourCell(pixels: Uint8ClampedArray, row: number, column: number, bitmapWidth: number, scale: number, labs: ColorSample[]): number {
	const votes = new Uint16Array(labs.length + 1);
	for (let dy = 0; dy < scale; dy += 1) for (let dx = 0; dx < scale; dx += 1) {
		const offset = (((row * scale + dy) * bitmapWidth) + column * scale + dx) * 4;
		if (pixels[offset + 3] < 64) votes[labs.length] += 1;
		else votes[nearest(pixelSample(pixels, offset), labs)] += 1;
	}
	let best = 0;
	for (let index = 1; index < votes.length; index += 1) if (votes[index] > votes[best]) best = index;
	return best === labs.length ? EMPTY_CELL : best;
}

function photoCell(pixels: Uint8ClampedArray, row: number, column: number, bitmapWidth: number, scale: number, labs: ColorSample[]): number {
	let r = 0; let g = 0; let b = 0; let weight = 0; let alpha = 0;
	for (let dy = 0; dy < scale; dy += 1) for (let dx = 0; dx < scale; dx += 1) {
		const offset = (((row * scale + dy) * bitmapWidth) + column * scale + dx) * 4;
		const nextAlpha = pixels[offset + 3] / 255;
		alpha += nextAlpha;
		if (nextAlpha <= 0) continue;
		r += srgbChannelToLinear(pixels[offset]) * nextAlpha;
		g += srgbChannelToLinear(pixels[offset + 1]) * nextAlpha;
		b += srgbChannelToLinear(pixels[offset + 2]) * nextAlpha;
		weight += nextAlpha;
	}
	if (alpha / (scale * scale) < 0.25 || weight === 0) return EMPTY_CELL;
	return nearest(linearRgbToOklab(r / weight, g / weight, b / weight), labs);
}

export function analyzeRaster(pixels: Uint8ClampedArray, bitmapWidth: number, request: ConversionRequest): { palette: ProjectPaletteEntry[]; cells: Uint16Array } {
	const palette = request.suggestPalette ? suggestPalette(opaqueSamples(pixels), request.suggestionCount) : request.palette.map((entry, slot) => ({ ...entry, slot }));
	const cells = new Uint16Array(request.columns * request.rows);
	if (palette.length === 0) { cells.fill(EMPTY_CELL); return { palette, cells }; }
	const labs = palette.map((entry) => hexToOklab(entry.hex));
	for (let row = 0; row < request.rows; row += 1) for (let column = 0; column < request.columns; column += 1) {
		cells[row * request.columns + column] = request.renderMode === 'contour'
			? contourCell(pixels, row, column, bitmapWidth, SAMPLE_SCALE, labs)
			: photoCell(pixels, row, column, bitmapWidth, SAMPLE_SCALE, labs);
	}
	return { palette, cells };
}
