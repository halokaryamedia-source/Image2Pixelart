import { cellsFromBase64, cellsToBase64 } from '$lib/cloud/project-codec';
import type { CloudProjectDocument, CloudProjectPayload, CloudSourceImage } from '$lib/cloud/types';
import { migrateStoredProject } from '$lib/project';
import type { ProjectV2 } from '$lib/types';
import { ApiError } from './http';

export type ProjectRow = {
	id: string;
	owner_device_id: string;
	active_editor_device_id: string | null;
	editor_epoch: string | number;
	document: CloudProjectDocument;
	cells: Uint8Array | string;
	revision: string | number;
	deleted_at: string | null;
	purge_after: string | null;
	source_asset_id?: string | null;
	source_file_name?: string | null;
	source_mime_type?: string | null;
	source_width?: number | null;
	source_height?: number | null;
};

function rowCells(value: Uint8Array | string): Uint16Array {
	const bytes = typeof value === 'string' ? Uint8Array.from(Buffer.from(value, 'base64')) : new Uint8Array(value);
	if (bytes.length % 2) throw new Error('Data sel database rusak.');
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const cells = new Uint16Array(bytes.length / 2);
	for (let index = 0; index < cells.length; index += 1) cells[index] = view.getUint16(index * 2, true);
	return cells;
}

export function validateCloudPayload(value: unknown, expectedId?: string): { project: ProjectV2; document: CloudProjectDocument; cellBytes: Buffer } {
	if (!value || typeof value !== 'object') throw new ApiError(400, 'Payload proyek tidak valid.');
	const payload = value as CloudProjectPayload;
	if (expectedId && payload.id !== expectedId) throw new ApiError(400, 'ID proyek tidak cocok.');
	try {
		const cells = cellsFromBase64(payload.cellsBase64, payload.document?.columns * payload.document?.rows);
		const project = migrateStoredProject({ ...payload.document, id: payload.id, cells, sourceImage: undefined });
		const document: CloudProjectDocument = {
			...payload.document,
			name: project.name,
			palette: project.palette,
			suggestedPalette: project.suggestedPalette,
			importSettings: project.importSettings,
			sourceImage: payload.document.sourceImage,
			updatedAt: project.updatedAt
		};
		const bytes = Buffer.allocUnsafe(cells.length * 2);
		for (let index = 0; index < cells.length; index += 1) bytes.writeUInt16LE(cells[index], index * 2);
		return { project, document, cellBytes: bytes };
	} catch (error) {
		throw new ApiError(400, error instanceof Error ? error.message : 'Payload proyek tidak valid.');
	}
}

export function rowToPayload(row: ProjectRow): CloudProjectPayload {
	const cells = rowCells(row.cells);
	const source: CloudSourceImage | undefined = row.source_asset_id && row.source_file_name && row.source_mime_type && row.source_width && row.source_height
		? { assetId: row.source_asset_id, name: row.source_file_name, type: row.source_mime_type, width: row.source_width, height: row.source_height }
		: undefined;
	return { id: row.id, document: { ...row.document, sourceImage: source }, cellsBase64: cellsToBase64(cells) };
}
