import type { ColorSample, ProjectPaletteEntry } from '$lib/types';

export type Rgb = { r: number; g: number; b: number };

export function normalizeHex(value: string): string | null {
	const raw = value.trim().replace(/^#/, '');
	if (/^[0-9a-fA-F]{3}$/.test(raw)) return `#${raw.split('').map((char) => char + char).join('').toUpperCase()}`;
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

function linearChannelToSrgb(value: number): number {
	const channel = Math.max(0, Math.min(1, value));
	return 255 * (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055);
}

export function linearRgbToOklab(r: number, g: number, b: number): ColorSample {
	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
	const lRoot = Math.cbrt(l); const mRoot = Math.cbrt(m); const sRoot = Math.cbrt(s);
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

export function oklabToHex(sample: ColorSample): string {
	const l = (sample.l + 0.3963377774 * sample.a + 0.2158037573 * sample.b) ** 3;
	const m = (sample.l - 0.1055613458 * sample.a - 0.0638541728 * sample.b) ** 3;
	const s = (sample.l - 0.0894841775 * sample.a - 1.291485548 * sample.b) ** 3;
	return rgbToHex({
		r: linearChannelToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
		g: linearChannelToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
		b: linearChannelToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
	});
}

export function colorDistanceSquared(left: ColorSample, right: ColorSample): number {
	const dl = left.l - right.l; const da = left.a - right.a; const db = left.b - right.b;
	return dl * dl + da * da + db * db;
}

export function nearestPaletteIndex(sample: ColorSample, palette: ProjectPaletteEntry[]): number {
	let best = 0; let bestDistance = Number.POSITIVE_INFINITY;
	for (let index = 0; index < palette.length; index += 1) {
		const distance = colorDistanceSquared(sample, hexToOklab(palette[index].hex));
		if (distance < bestDistance) { bestDistance = distance; best = index; }
	}
	return best;
}

export function suggestPalette(samples: ColorSample[], requestedCount: number): ProjectPaletteEntry[] {
	if (samples.length === 0) return [];
	const count = Math.max(1, Math.min(32, Math.trunc(requestedCount), samples.length));
	const stride = Math.max(1, Math.ceil(samples.length / 12_000));
	const reduced = samples.filter((_, index) => index % stride === 0);
	const centroids: ColorSample[] = [];
	let first = reduced[0];
	for (const sample of reduced) if (sample.l < first.l) first = sample;
	centroids.push({ ...first });
	while (centroids.length < count) {
		let farthest: ColorSample | undefined; let farthestDistance = -1;
		for (const sample of reduced) {
			let nearest = Number.POSITIVE_INFINITY;
			for (const centroid of centroids) nearest = Math.min(nearest, colorDistanceSquared(sample, centroid));
			if (nearest > farthestDistance) { farthestDistance = nearest; farthest = sample; }
		}
		if (!farthest || farthestDistance < 1e-8) break;
		centroids.push({ ...farthest });
	}

	let assignments = new Uint8Array(reduced.length);
	const totals = new Uint32Array(centroids.length);
	for (let iteration = 0; iteration < 12; iteration += 1) {
		const sums = centroids.map(() => ({ l: 0, a: 0, b: 0, count: 0 }));
		totals.fill(0);
		reduced.forEach((sample, index) => {
			let best = 0; let distance = Number.POSITIVE_INFINITY;
			centroids.forEach((centroid, candidate) => {
				const next = colorDistanceSquared(sample, centroid);
				if (next < distance) { best = candidate; distance = next; }
			});
			assignments[index] = best; totals[best] += 1;
			sums[best].l += sample.l; sums[best].a += sample.a; sums[best].b += sample.b; sums[best].count += 1;
		});
		centroids.forEach((centroid, index) => {
			if (!sums[index].count) return;
			centroid.l = sums[index].l / sums[index].count;
			centroid.a = sums[index].a / sums[index].count;
			centroid.b = sums[index].b / sums[index].count;
		});
	}
	return centroids
		.map((centroid, index) => ({ hex: oklabToHex(centroid), count: totals[index] }))
		.filter((entry, index, entries) => entries.findIndex((other) => other.hex === entry.hex) === index)
		.sort((left, right) => right.count - left.count || left.hex.localeCompare(right.hex))
		.map((entry, slot) => ({ id: crypto.randomUUID(), slot, hex: entry.hex, locked: false }));
}
