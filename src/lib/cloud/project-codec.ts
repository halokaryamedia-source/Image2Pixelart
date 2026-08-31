import { migrateStoredProject } from '$lib/project';
import type { ProjectV2 } from '$lib/types';
import type { CloudProjectDocument, CloudProjectPayload, CloudSourceImage } from './types';

function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	const chunk = 0x8000;
	for (let offset = 0; offset < bytes.length; offset += chunk) {
		binary += String.fromCharCode(...bytes.subarray(offset, Math.min(bytes.length, offset + chunk)));
	}
	return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
	return bytes;
}

export function cellsToBase64(cells: Uint16Array): string {
	const bytes = new Uint8Array(cells.length * 2);
	const view = new DataView(bytes.buffer);
	for (let index = 0; index < cells.length; index += 1) view.setUint16(index * 2, cells[index], true);
	return bytesToBase64(bytes);
}

export function cellsFromBase64(value: string, expectedLength?: number): Uint16Array {
	if (typeof value !== 'string' || value.length > 1_400_000) throw new Error('Data sel cloud tidak valid.');
	const bytes = base64ToBytes(value);
	if (bytes.length % 2 !== 0) throw new Error('Data sel cloud tidak valid.');
	const length = bytes.length / 2;
	if (expectedLength !== undefined && length !== expectedLength) throw new Error('Jumlah sel cloud tidak sesuai dimensi.');
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const cells = new Uint16Array(length);
	for (let index = 0; index < length; index += 1) cells[index] = view.getUint16(index * 2, true);
	return cells;
}

export function projectToCloudPayload(project: ProjectV2, source?: CloudSourceImage): CloudProjectPayload {
	const document: CloudProjectDocument = {
		schemaVersion: 3,
		name: project.name,
		widthMm: project.widthMm,
		heightMm: project.heightMm,
		cellMm: project.cellMm,
		columns: project.columns,
		rows: project.rows,
		palette: project.palette.map((entry) => ({ ...entry })),
		suggestedPalette: project.suggestedPalette?.map((entry) => ({ ...entry })),
		importSettings: { ...project.importSettings, crop: project.importSettings.crop ? { ...project.importSettings.crop } : null },
		sourceImage: source,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt
	};
	return { id: project.id, document, cellsBase64: cellsToBase64(project.cells) };
}

export function cloudPayloadToProject(payload: CloudProjectPayload, sourceUrl?: string): ProjectV2 {
	const { document } = payload;
	const sourceImage = document.sourceImage && sourceUrl
		? { name: document.sourceImage.name, type: document.sourceImage.type, dataUrl: sourceUrl, width: document.sourceImage.width, height: document.sourceImage.height }
		: undefined;
	return migrateStoredProject({
		...document,
		id: payload.id,
		cells: cellsFromBase64(payload.cellsBase64, document.columns * document.rows),
		sourceImage: undefined
	}, sourceImage);
}
