import { describe, expect, it } from 'vitest';
import { centeredCropRect, cropDestinationRect, zoomCropRect } from './image-crop';

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

	it('allows zooming out to create transparent space around the image', () => {
		const base = centeredCropRect(1600, 900, 1);
		const crop = zoomCropRect(base, 0.5, 1, 1600, 900);
		expect(crop.height).toBeCloseTo(2);
		expect(crop.y).toBeCloseTo(-0.5);
		const destination = cropDestinationRect(crop, 100, 100);
		expect(destination.y).toBeCloseTo(25);
		expect(destination.height).toBeCloseTo(50);
	});
});
