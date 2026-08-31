import type { DeviceIdentity } from './types';

const DEVICE_KEY = 'mivubi-cloud-device-v1';

function randomSecret(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parseIdentity(value: string | null): DeviceIdentity | null {
	if (!value) return null;
	try {
		const parsed = JSON.parse(value) as Partial<DeviceIdentity>;
		if (!parsed.id || !parsed.secret || !parsed.displayName || !/^[0-9a-f-]{36}$/i.test(parsed.id) || parsed.secret.length < 32) return null;
		return { id: parsed.id, secret: parsed.secret, displayName: parsed.displayName.slice(0, 80) };
	} catch {
		return null;
	}
}

export function getDeviceIdentity(): DeviceIdentity {
	const existing = parseIdentity(localStorage.getItem(DEVICE_KEY));
	if (existing) return existing;
	const id = crypto.randomUUID();
	const created = { id, secret: randomSecret(), displayName: `Pengguna ${id.slice(0, 4).toUpperCase()}` };
	localStorage.setItem(DEVICE_KEY, JSON.stringify(created));
	return created;
}

export function updateDeviceDisplayName(identity: DeviceIdentity, displayName: string): DeviceIdentity {
	const next = { ...identity, displayName: displayName.trim().slice(0, 80) || identity.displayName };
	localStorage.setItem(DEVICE_KEY, JSON.stringify(next));
	return next;
}

export function deviceHeaders(identity: DeviceIdentity): HeadersInit {
	return { Authorization: `Bearer ${identity.secret}`, 'X-Device-Id': identity.id };
}
