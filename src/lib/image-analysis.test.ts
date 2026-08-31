import { describe, expect, it } from 'vitest';
import { analyzeRaster, SAMPLE_SCALE } from './image-analysis';
import type { ConversionRequest } from './types';

function request(renderMode: 'contour' | 'photo', suggestPalette = false): ConversionRequest {
	return { buffer: new ArrayBuffer(0), mimeType: 'image/png', columns: 1, rows: 1, placement: 'crop', crop: null, renderMode, suggestionCount: 2, palette: [{ id: 'black', slot: 0, hex: '#000000', locked: false }, { id: 'white', slot: 1, hex: '#FFFFFF', locked: false }], suggestPalette };
}

describe('raster analysis', () => {
	it('uses majority sampling for contour and averaging for photo', () => {
		const pixels = new Uint8ClampedArray(SAMPLE_SCALE * SAMPLE_SCALE * 4);
		for (let pixel = 0; pixel < 16; pixel += 1) {
			const white = pixel >= 9; const offset = pixel * 4;
			pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = white ? 255 : 0; pixels[offset + 3] = 255;
		}
		expect(analyzeRaster(pixels, SAMPLE_SCALE, request('contour')).cells[0]).toBe(0);
		expect(analyzeRaster(pixels, SAMPLE_SCALE, request('photo')).cells[0]).toBe(1);
	});

	it('keeps fully transparent output empty', () => {
		const pixels = new Uint8ClampedArray(SAMPLE_SCALE * SAMPLE_SCALE * 4);
		const result = analyzeRaster(pixels, SAMPLE_SCALE, request('contour', true));
		expect(result.palette).toEqual([]);
		expect(result.cells[0]).toBe(65535);
	});
});
