import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export class ApiError extends Error {
	constructor(public status: number, message: string, public details?: Record<string, unknown>) { super(message); }
}

export function apiError(error: unknown): Response {
	if (error instanceof ApiError) return json({ error: error.message, ...error.details }, { status: error.status });
	console.error(error);
	return json({ error: error instanceof Error ? error.message : 'Terjadi kesalahan pada server.' }, { status: 500 });
}

export async function readJson<T>(request: Request): Promise<T> {
	const length = Number(request.headers.get('content-length') || 0);
	if (length > 2_000_000) throw new ApiError(413, 'Payload terlalu besar.');
	try { return await request.json() as T; }
	catch { throw new ApiError(400, 'Body JSON tidak valid.'); }
}

export function requestIp(event: RequestEvent): string {
	return event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
		|| event.request.headers.get('x-real-ip')
		|| event.getClientAddress?.()
		|| 'unknown';
}

export function uuid(value: string, label = 'ID'): string {
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new ApiError(400, `${label} tidak valid.`);
	return value;
}
