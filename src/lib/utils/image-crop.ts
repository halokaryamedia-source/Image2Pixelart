import type { CropRect } from '$lib/types';

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
	let width = Math.max(0.02, Math.min(1, crop.width));
	let height = width / normalizedAspect;
	if (height > 1) { height = 1; width = height * normalizedAspect; }
	const x = Math.max(0, Math.min(1 - width, crop.x));
	const y = Math.max(0, Math.min(1 - height, crop.y));
	return { x, y, width, height };
}

export function zoomCropRect(crop: CropRect, zoomFactor: number, targetAspect: number, imageWidth: number, imageHeight: number): CropRect {
	const centerX = crop.x + crop.width / 2;
	const centerY = crop.y + crop.height / 2;
	const width = crop.width / Math.max(1, zoomFactor);
	return clampCropRect({ x: centerX - width / 2, y: centerY - width / 2, width, height: crop.height }, targetAspect, imageWidth, imageHeight);
}
