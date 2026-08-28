import type { CatalogColor, ColorSample, ProjectPaletteEntry } from '$lib/types';

export type Rgb = { r: number; g: number; b: number };

export function normalizeHex(value: string): string | null {
	const raw = value.trim().replace(/^#/, '');
	if (/^[0-9a-fA-F]{3}$/.test(raw)) {
		return `#${raw.split('').map((char) => char + char).join('').toUpperCase()}`;
	}
	return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw.toUpperCase()}` : null;
}

export function hexToRgb(hex: string): Rgb {
	const normalized = normalizeHex(hex) ?? '#000000';
	return {
		r: Number.parseInt(normalized.slice(1, 3), 16),
		g: Number.parseInt(normalized.slice(3, 5), 16),
		b: Number.parseInt(normalized.slice(5, 7), 16)
	};
}

export function rgbToHex(rgb: Rgb): string {
	const byte = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
	return `#${byte(rgb.r)}${byte(rgb.g)}${byte(rgb.b)}`.toUpperCase();
}

export function srgbChannelToLinear(value: number): number {
	const channel = value / 255;
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function linearRgbToOklab(r: number, g: number, b: number): ColorSample {
	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
	const lRoot = Math.cbrt(l);
	const mRoot = Math.cbrt(m);
	const sRoot = Math.cbrt(s);
	return {
		l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
		a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
		b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot
	};
}

export function rgbToOklab(rgb: Rgb): ColorSample {
	return linearRgbToOklab(srgbChannelToLinear(rgb.r), srgbChannelToLinear(rgb.g), srgbChannelToLinear(rgb.b));
}

export function hexToOklab(hex: string): ColorSample {
	return rgbToOklab(hexToRgb(hex));
}

export function colorDistanceSquared(left: ColorSample, right: ColorSample): number {
	const dl = left.l - right.l;
	const da = left.a - right.a;
	const db = left.b - right.b;
	return dl * dl + da * da + db * db;
}

export function nearestPaletteIndex(sample: ColorSample, palette: ProjectPaletteEntry[]): number {
	let best = 0;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (let index = 0; index < palette.length; index += 1) {
		const distance = colorDistanceSquared(sample, hexToOklab(palette[index].hex));
		if (distance < bestDistance) {
			bestDistance = distance;
			best = index;
		}
	}
	return best;
}

export function selectCatalogColorIds(samples: ColorSample[], catalog: CatalogColor[], maxColors: number, pinnedIds: string[]): string[] {
	const active = catalog.filter((color) => color.active);
	const limit = Math.max(1, Math.min(maxColors, active.length));
	const activeById = new Map(active.map((color) => [color.id, color]));
	const selected = [...new Set(pinnedIds)].map((id) => activeById.get(id)).filter((color): color is CatalogColor => Boolean(color)).slice(0, limit);
	const labs = new Map(active.map((color) => [color.id, hexToOklab(color.hex)]));
	const reducedSamples = samples.length > 12_000
		? samples.filter((_, index) => index % Math.ceil(samples.length / 12_000) === 0)
		: samples;
	const currentDistances = reducedSamples.map((sample) => {
		let nearest = Number.POSITIVE_INFINITY;
		for (const color of selected) nearest = Math.min(nearest, colorDistanceSquared(sample, labs.get(color.id)!));
		return nearest;
	});

	while (selected.length < limit) {
		let bestColor: CatalogColor | undefined;
		let bestScore = Number.POSITIVE_INFINITY;
		const previousScore = currentDistances.reduce((sum, distance) => sum + distance, 0);
		for (const candidate of active) {
			if (selected.some((item) => item.id === candidate.id)) continue;
			let score = 0;
			const candidateLab = labs.get(candidate.id)!;
			for (let index = 0; index < reducedSamples.length; index += 1) {
				score += Math.min(currentDistances[index], colorDistanceSquared(reducedSamples[index], candidateLab));
			}
			if (score < bestScore) {
				bestScore = score;
				bestColor = candidate;
			}
		}
		if (!bestColor || previousScore - bestScore <= 1e-12) break;
		selected.push(bestColor);
		const selectedLab = labs.get(bestColor.id)!;
		for (let index = 0; index < reducedSamples.length; index += 1) {
			currentDistances[index] = Math.min(currentDistances[index], colorDistanceSquared(reducedSamples[index], selectedLab));
		}
	}
	return selected.map((color) => color.id);
}
