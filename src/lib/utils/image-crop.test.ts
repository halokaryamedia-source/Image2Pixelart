import { describe, expect, it } from 'vitest';
import { centeredCropRect, zoomCropRect } from './image-crop';

describe('visual crop geometry', () => {
	it('creates a centered crop with the canvas aspect', () => {
		const crop = centeredCropRect(1600, 900, 1);
		expect(crop.height).toBe(1);
		expect(crop.width).toBeCloseTo(0.5625);
		expect(crop.x).toBeCloseTo(0.21875);
	});

	it('keeps zoomed crop inside normalized image bounds', () => {
		const base = centeredCropRect(1600, 900, 1);
		const crop = zoomCropRect(base, 3, 1, 1600, 900);
		expect(crop.x).toBeGreaterThanOrEqual(0);
		expect(crop.y).toBeGreaterThanOrEqual(0);
		expect(crop.x + crop.width).toBeLessThanOrEqual(1);
		expect(crop.y + crop.height).toBeLessThanOrEqual(1);
	});
});
