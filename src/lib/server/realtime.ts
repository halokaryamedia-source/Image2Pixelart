import { env } from '$env/dynamic/private';
import { SignJWT } from 'jose';

function bytes(value: string | undefined, label: string): Uint8Array {
	if (!value || value.length < 32) throw new Error(`${label} belum dikonfigurasi dengan aman.`);
	return new TextEncoder().encode(value);
}

export async function createRealtimeToken(input: { projectId: string; deviceId: string; displayName: string; isOwner: boolean; activeEditorDeviceId: string | null; editorEpoch: number }): Promise<string> {
	return new SignJWT({ ...input })
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(input.deviceId).setAudience('mivubi-realtime').setIssuer('mivubi-vercel')
		.setIssuedAt().setExpirationTime('1h')
		.sign(bytes(env.REALTIME_TOKEN_SECRET, 'REALTIME_TOKEN_SECRET'));
}

export async function realtimeInternal(path: string, body: unknown): Promise<void> {
	if (!env.REALTIME_HTTP_URL || !env.REALTIME_INTERNAL_SECRET) return;
	const response = await fetch(`${env.REALTIME_HTTP_URL.replace(/\/$/, '')}${path}`, {
		method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.REALTIME_INTERNAL_SECRET}` }, body: JSON.stringify(body)
	});
	if (!response.ok) throw new Error(`Realtime sync gagal (${response.status}).`);
}

export async function authorizeRealtimeEditor(projectId: string, deviceId: string, editorEpoch: number): Promise<void> {
	if (!env.REALTIME_HTTP_URL || !env.REALTIME_INTERNAL_SECRET) {
		if (process.env.NODE_ENV === 'production') throw new Error('Realtime authorization belum dikonfigurasi.');
		return;
	}
	const response = await fetch(`${env.REALTIME_HTTP_URL.replace(/\/$/, '')}/internal/projects/${projectId}/authorize`, {
		method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.REALTIME_INTERNAL_SECRET}` },
		body: JSON.stringify({ deviceId, editorEpoch })
	});
	if (!response.ok) throw new Error(response.status === 403 ? 'Editor tidak lagi aktif atau koneksi realtime terputus.' : 'Realtime tidak tersedia.');
}
