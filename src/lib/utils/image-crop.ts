import type { CropRect } from '$lib/types';

export const MIN_CROP_ZOOM = 0.5;
export const MAX_CROP_ZOOM = 6;

export function centeredCropRect(imageWidth: number, imageHeight: number, targetAspect: number): CropRect {
	const imageAspect = imageWidth / imageHeight;
	if (imageAspect > targetAspect) {
		const width = targetAspect / imageAspect;
		return { x: (1 - width) / 2, y: 0, width, height: 1 };
	}
	const height = imageAspect / targetAspect;
	return { x: 0, y: (1 - height) / 2, width: 1, height };
}

export function clampCropRect(crop: CropRect, targetAspect: number, imageWidth: number, imageHeight: number): CropRect {
	const normalizedAspect = targetAspect / (imageWidth / imageHeight);
	const base = centeredCropRect(imageWidth, imageHeight, targetAspect);
	const width = Math.max(base.width / MAX_CROP_ZOOM, Math.min(base.width / MIN_CROP_ZOOM, crop.width));
	const height = width / normalizedAspect;
	const clampAxis = (position: number, size: number) => size <= 1
		? Math.max(0, Math.min(1 - size, position))
		: Math.max(1 - size, Math.min(0, position));
	const x = clampAxis(crop.x, width);
	const y = clampAxis(crop.y, height);
	return { x, y, width, height };
}

export function zoomCropRect(crop: CropRect, zoomFactor: number, targetAspect: number, imageWidth: number, imageHeight: number): CropRect {
	const centerX = crop.x + crop.width / 2;
	const centerY = crop.y + crop.height / 2;
	const width = crop.width / Math.max(MIN_CROP_ZOOM, Math.min(MAX_CROP_ZOOM, zoomFactor));
	const normalizedAspect = targetAspect / (imageWidth / imageHeight);
	const height = width / normalizedAspect;
	return clampCropRect({ x: centerX - width / 2, y: centerY - height / 2, width, height }, targetAspect, imageWidth, imageHeight);
}

export function cropDestinationRect(crop: CropRect, canvasWidth: number, canvasHeight: number) {
	return {
		x: -crop.x / crop.width * canvasWidth,
		y: -crop.y / crop.height * canvasHeight,
		width: canvasWidth / crop.width,
		height: canvasHeight / crop.height
	};
}
