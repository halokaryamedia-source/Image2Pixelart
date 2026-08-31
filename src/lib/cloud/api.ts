import type { ProjectV2 } from '$lib/types';
import { cloudPayloadToProject, projectToCloudPayload } from './project-codec';
import { deviceHeaders } from './device';
import type { CloudProjectMeta, CloudProjectResponse, CloudProjectSummary, DeviceIdentity } from './types';

async function api<T>(path: string, identity?: DeviceIdentity, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	if (identity) for (const [key, value] of Object.entries(deviceHeaders(identity))) headers.set(key, String(value));
	if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
	const response = await fetch(path, { ...init, headers });
	const body = await response.json().catch(() => ({})) as { error?: string } & T;
	if (!response.ok) {
		const error = new Error(body.error || `Request gagal (${response.status}).`) as Error & { status?: number; payload?: unknown };
		error.status = response.status; error.payload = body; throw error;
	}
	return body;
}

export async function registerDevice(identity: DeviceIdentity): Promise<void> {
	await api('/api/devices/register', identity, { method: 'POST', body: JSON.stringify({ displayName: identity.displayName }) });
}

export function listCloudProjects(identity: DeviceIdentity): Promise<{ projects: CloudProjectSummary[] }> {
	return api('/api/projects', identity);
}

export async function createCloudProject(identity: DeviceIdentity, project: ProjectV2): Promise<CloudProjectResponse> {
	return api('/api/projects', identity, { method: 'POST', body: JSON.stringify(projectToCloudPayload(project)) });
}

export async function loadCloudProject(identity: DeviceIdentity, id: string): Promise<{ project: ProjectV2; meta: CloudProjectMeta }> {
	const response = await api<CloudProjectResponse>(`/api/projects/${id}`, identity);
	return { project: cloudPayloadToProject(response.project, response.sourceUrl), meta: response };
}

export async function joinCloudProject(identity: DeviceIdentity, id: string): Promise<void> {
	await api(`/api/projects/${id}/join`, identity, { method: 'POST', body: JSON.stringify({ displayName: identity.displayName }) });
}

export async function saveCloudProject(identity: DeviceIdentity, project: ProjectV2, revision: number): Promise<{ revision: number; updatedAt: string }> {
	return api(`/api/projects/${project.id}`, identity, { method: 'PUT', headers: { 'If-Match': String(revision) }, body: JSON.stringify(projectToCloudPayload(project)) });
}

export async function deleteCloudProject(identity: DeviceIdentity, id: string): Promise<{ purgeAfter: string }> {
	return api(`/api/projects/${id}`, identity, { method: 'DELETE' });
}

export async function restoreCloudProject(identity: DeviceIdentity, id: string): Promise<void> {
	await api(`/api/projects/${id}/restore`, identity, { method: 'POST' });
}

export async function grantCloudEditor(identity: DeviceIdentity, id: string, targetDeviceId: string, revision: number): Promise<{ activeEditorDeviceId: string; editorEpoch: number }> {
	return api(`/api/projects/${id}/editor/grant`, identity, { method: 'POST', body: JSON.stringify({ targetDeviceId, revision }) });
}

export async function realtimeToken(identity: DeviceIdentity, id: string): Promise<{ token: string; wsUrl: string }> {
	return api(`/api/projects/${id}/realtime-token`, identity, { method: 'POST' });
}

export async function uploadSourceImage(identity: DeviceIdentity, projectId: string, file: File, dimensions: { width: number; height: number }): Promise<{ assetId: string; revision: number }> {
	const signed = await api<{ assetId: string; uploadUrl: string }>(`/api/projects/${projectId}/source/presign`, identity, {
		method: 'POST', body: JSON.stringify({ fileName: file.name, mimeType: file.type, byteSize: file.size })
	});
	const uploaded = await fetch(signed.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
	if (!uploaded.ok) throw new Error('Upload gambar ke R2 gagal.');
	return api(`/api/projects/${projectId}/source/finalize`, identity, {
		method: 'POST', body: JSON.stringify({ assetId: signed.assetId, width: dimensions.width, height: dimensions.height })
	});
}
