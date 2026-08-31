import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateDevice } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { ApiError, apiError, readJson, requestIp, uuid } from '$lib/server/http';
import { validateCloudPayload, rowToPayload, type ProjectRow } from '$lib/server/project-data';
import { enforceRateLimit } from '$lib/server/rate-limit';
import { cellsFromBase64 } from '$lib/cloud/project-codec';
import { EMPTY_CELL } from '$lib/types';

function preview(payload: ReturnType<typeof rowToPayload>) {
	const cells = cellsFromBase64(payload.cellsBase64);
	const previewColumns = Math.min(48, payload.document.columns);
	const previewRows = Math.min(32, payload.document.rows);
	const previewCells = Array.from({ length: previewColumns * previewRows }, (_, index) => {
		const x = index % previewColumns; const y = Math.floor(index / previewColumns);
		const sourceX = Math.min(payload.document.columns - 1, Math.floor((x + 0.5) * payload.document.columns / previewColumns));
		const sourceY = Math.min(payload.document.rows - 1, Math.floor((y + 0.5) * payload.document.rows / previewRows));
		return cells[sourceY * payload.document.columns + sourceX] ?? EMPTY_CELL;
	});
	return { previewColumns, previewRows, previewCells };
}

export const GET: RequestHandler = async ({ request }) => {
	try {
		const device = await authenticateDevice(request);
		const rows = await db().query(
			`SELECT p.*, a.file_name source_file_name, a.mime_type source_mime_type, a.width source_width, a.height source_height
			 FROM projects p JOIN project_participants pp ON pp.project_id = p.id
			 LEFT JOIN project_assets a ON a.id = p.source_asset_id AND a.status = 'ready'
			 WHERE pp.device_id = $1::uuid AND (p.purge_after IS NULL OR p.purge_after > now())
			 ORDER BY p.updated_at DESC`, [device.id]
		) as ProjectRow[];
		const projects = rows.map((row) => {
			const payload = rowToPayload(row); const sampled = preview(payload); const document = payload.document;
			return {
				id: row.id, name: document.name, widthMm: document.widthMm, heightMm: document.heightMm, cellMm: document.cellMm,
				columns: document.columns, rows: document.rows, palette: document.palette, createdAt: document.createdAt, updatedAt: document.updatedAt,
				hasSourceImage: Boolean(row.source_file_name),
				...sampled, revision: Number(row.revision), ownerDeviceId: row.owner_device_id,
				activeEditorDeviceId: row.active_editor_device_id, editorEpoch: Number(row.editor_epoch), deletedAt: row.deleted_at, purgeAfter: row.purge_after,
				role: row.owner_device_id === device.id ? 'owner' : row.active_editor_device_id === device.id ? 'editor' : 'viewer'
			};
		});
		return json({ projects });
	} catch (error) { return apiError(error); }
};

export const POST: RequestHandler = async (event) => {
	try {
		const device = await authenticateDevice(event.request);
		await enforceRateLimit('project-create', requestIp(event), 10, 3600);
		const input = await readJson<unknown>(event.request);
		const { project, document, cellBytes } = validateCloudPayload(input);
		uuid(project.id, 'Project ID');
		const rows = await db().query(
			`WITH inserted AS (
				INSERT INTO projects (id, owner_device_id, active_editor_device_id, name, document, cells)
				VALUES ($1::uuid, $2::uuid, $2::uuid, $3, $4::jsonb, $5)
				RETURNING *
			), participant AS (
				INSERT INTO project_participants (project_id, device_id) SELECT id, $2::uuid FROM inserted
			)
			SELECT * FROM inserted`,
			[project.id, device.id, project.name, JSON.stringify({ ...document, sourceImage: undefined }), cellBytes]
		) as ProjectRow[];
		if (!rows.length) throw new ApiError(500, 'Proyek gagal dibuat.');
		const row = rows[0];
		return json({ project: rowToPayload(row), revision: 1, ownerDeviceId: device.id, activeEditorDeviceId: device.id, editorEpoch: 1, deletedAt: null, purgeAfter: null }, { status: 201 });
	} catch (error) { return apiError(error); }
};