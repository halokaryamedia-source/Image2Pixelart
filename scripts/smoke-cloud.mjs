import { neon } from '@neondatabase/serverless';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:5173';
const randomSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (value) => value.toString(16).padStart(2, '0')).join('');
const owner = { id: crypto.randomUUID(), secret: randomSecret(), displayName: 'Smoke Owner' };
const viewer = { id: crypto.randomUUID(), secret: randomSecret(), displayName: 'Smoke Viewer' };
const projectId = crypto.randomUUID();
const headers = (device, extra = {}) => ({ Authorization: `Bearer ${device.secret}`, 'X-Device-Id': device.id, 'Content-Type': 'application/json', ...extra });

async function call(path, device, init = {}) {
	const response = await fetch(`${base}${path}`, { ...init, headers: headers(device, init.headers) });
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(`${init.method || 'GET'} ${path}: ${response.status} ${body.error || ''}`);
	return body;
}

function projectPayload(name, cellsBase64) {
	const now = new Date().toISOString();
	return { id: projectId, cellsBase64, document: { schemaVersion: 3, name, widthMm: 200, heightMm: 200, cellMm: 50, columns: 4, rows: 4, palette: [{ id: 'black', slot: 0, hex: '#101418', locked: false }], importSettings: { placement: 'crop', crop: null, renderMode: 'contour', suggestionCount: 8 }, createdAt: now, updatedAt: now } };
}

function cellsBase64(slot = 65535) {
	const bytes = new Uint8Array(32); const view = new DataView(bytes.buffer);
	for (let index = 0; index < 16; index += 1) view.setUint16(index * 2, index === 0 ? slot : 65535, true);
	return Buffer.from(bytes).toString('base64');
}

function connect(url) {
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(url); const timeout = setTimeout(() => reject(new Error('WebSocket timeout')), 8_000);
		socket.onopen = () => { clearTimeout(timeout); resolve(socket); }; socket.onerror = () => reject(new Error('WebSocket gagal.'));
	});
}

const sockets = [];
try {
	await call('/api/devices/register', owner, { method: 'POST', body: JSON.stringify({ displayName: owner.displayName }) });
	await call('/api/devices/register', viewer, { method: 'POST', body: JSON.stringify({ displayName: viewer.displayName }) });
	await call('/api/projects', owner, { method: 'POST', body: JSON.stringify(projectPayload('Smoke Cloud', cellsBase64())) });
	await call(`/api/projects/${projectId}/join`, viewer, { method: 'POST', body: '{}' });
	const ownerToken = await call(`/api/projects/${projectId}/realtime-token`, owner, { method: 'POST', body: '{}' });
	const viewerToken = await call(`/api/projects/${projectId}/realtime-token`, viewer, { method: 'POST', body: '{}' });
	sockets.push(await connect(`${ownerToken.wsUrl}?token=${encodeURIComponent(ownerToken.token)}`));
	sockets.push(await connect(`${viewerToken.wsUrl}?token=${encodeURIComponent(viewerToken.token)}`));
	await new Promise((resolve) => setTimeout(resolve, 250));
	const saved = await call(`/api/projects/${projectId}`, owner, { method: 'PUT', headers: { 'If-Match': '1' }, body: JSON.stringify(projectPayload('Smoke Saved', cellsBase64(0))) });
	await call(`/api/projects/${projectId}/editor/grant`, owner, { method: 'POST', body: JSON.stringify({ targetDeviceId: viewer.id, revision: saved.revision }) });
	const viewerSaved = await call(`/api/projects/${projectId}`, viewer, { method: 'PUT', headers: { 'If-Match': String(saved.revision) }, body: JSON.stringify(projectPayload('Smoke Viewer Saved', cellsBase64(0))) });
	const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
	const signed = await call(`/api/projects/${projectId}/source/presign`, viewer, { method: 'POST', body: JSON.stringify({ fileName: 'pixel.png', mimeType: 'image/png', byteSize: png.length }) });
	const uploaded = await fetch(signed.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: png });
	if (!uploaded.ok) throw new Error(`R2 PUT gagal: ${uploaded.status}`);
	await call(`/api/projects/${projectId}/source/finalize`, viewer, { method: 'POST', body: JSON.stringify({ assetId: signed.assetId, width: 1, height: 1 }) });
	await call(`/api/projects/${projectId}`, owner, { method: 'DELETE' });
	await call(`/api/projects/${projectId}/restore`, owner, { method: 'POST', body: '{}' });
	console.log(`Cloud smoke test lulus sampai revision ${viewerSaved.revision}.`);
} finally {
	for (const socket of sockets) socket.close();
	if (process.env.DATABASE_URL) {
		const sql = neon(process.env.DATABASE_URL);
		const assets = await sql.query('SELECT r2_key FROM project_assets WHERE project_id = $1::uuid', [projectId]).catch(() => []);
		if (process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME) {
			const r2 = new S3Client({ region: process.env.R2_REGION || 'auto', endpoint: process.env.R2_ENDPOINT, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
			for (const asset of assets) await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: asset.r2_key })).catch(() => undefined);
		}
		await sql.query('DELETE FROM projects WHERE id = $1::uuid', [projectId]).catch(() => undefined);
		await sql.query('DELETE FROM devices WHERE id = ANY($1::uuid[])', [[owner.id, viewer.id]]).catch(() => undefined);
	}
}
