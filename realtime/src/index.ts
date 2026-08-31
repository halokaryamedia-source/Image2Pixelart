import { DurableObject } from 'cloudflare:workers';
import { jwtVerify } from 'jose';

type Env = {
	PROJECT_ROOMS: DurableObjectNamespace<ProjectRoom>;
	REALTIME_TOKEN_SECRET: string;
	REALTIME_INTERNAL_SECRET: string;
	ALLOWED_ORIGINS: string;
};

type Claims = {
	projectId: string;
	deviceId: string;
	displayName: string;
	isOwner: boolean;
	activeEditorDeviceId: string | null;
	editorEpoch: number;
};

type Attachment = Pick<Claims, 'deviceId' | 'displayName' | 'isOwner'> & { requestingEdit: boolean };
type RoomState = { activeEditorDeviceId: string | null; editorEpoch: number };

function json(value: unknown, status = 200): Response {
	return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

function bearer(request: Request): string { return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''; }

export class ProjectRoom extends DurableObject<Env> {
	private room: RoomState = { activeEditorDeviceId: null, editorEpoch: 0 };

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => { this.room = await ctx.storage.get<RoomState>('room') || this.room; });
	}

	private attachments(): Array<{ socket: WebSocket; attachment: Attachment }> {
		return this.ctx.getWebSockets().flatMap((socket) => {
			const attachment = socket.deserializeAttachment() as Attachment | null;
			return attachment ? [{ socket, attachment }] : [];
		});
	}

	private snapshot() {
		const byDevice = new Map<string, Attachment>();
		for (const { attachment } of this.attachments()) {
			const current = byDevice.get(attachment.deviceId);
			byDevice.set(attachment.deviceId, current ? { ...current, requestingEdit: current.requestingEdit || attachment.requestingEdit } : attachment);
		}
		return {
			type: 'snapshot', activeEditorDeviceId: this.room.activeEditorDeviceId, editorEpoch: this.room.editorEpoch,
			participants: [...byDevice.values()].map((participant) => ({ ...participant, isEditor: participant.deviceId === this.room.activeEditorDeviceId }))
		};
	}

	private broadcast(value: string | ArrayBuffer, except?: WebSocket) {
		for (const socket of this.ctx.getWebSockets()) if (socket !== except) {
			try { socket.send(value); } catch { /* close handler cleans it up */ }
		}
	}

	private broadcastSnapshot() { this.broadcast(JSON.stringify(this.snapshot())); }

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/connect') {
			if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return json({ error: 'WebSocket upgrade required.' }, 426);
			if (this.ctx.getWebSockets().length >= 50) return json({ error: 'Room penuh.' }, 429);
			const raw = request.headers.get('x-realtime-claims');
			if (!raw) return json({ error: 'Claims missing.' }, 401);
			const claims = JSON.parse(raw) as Claims;
			if (Number(claims.editorEpoch) > this.room.editorEpoch) {
				this.room = { activeEditorDeviceId: claims.activeEditorDeviceId, editorEpoch: Number(claims.editorEpoch) };
				await this.ctx.storage.put('room', this.room);
			}
			const pair = new WebSocketPair(); const client = pair[0]; const server = pair[1];
			this.ctx.acceptWebSocket(server);
			server.serializeAttachment({ deviceId: claims.deviceId, displayName: claims.displayName.slice(0, 80), isOwner: !!claims.isOwner, requestingEdit: false } satisfies Attachment);
			server.send(JSON.stringify(this.snapshot())); this.broadcastSnapshot();
			return new Response(null, { status: 101, webSocket: client });
		}
		if (url.pathname === '/sync') {
			const body = await request.json<RoomState>();
			if (Number(body.editorEpoch) >= this.room.editorEpoch) {
				this.room = { activeEditorDeviceId: body.activeEditorDeviceId, editorEpoch: Number(body.editorEpoch) };
				await this.ctx.storage.put('room', this.room); this.broadcastSnapshot();
			}
			return json({ ok: true });
		}
		if (url.pathname === '/authorize') {
			const body = await request.json<{ deviceId: string; editorEpoch: number }>();
			const connected = this.attachments().some(({ attachment }) => attachment.deviceId === body.deviceId);
			return connected && body.deviceId === this.room.activeEditorDeviceId && Number(body.editorEpoch) === this.room.editorEpoch
				? json({ ok: true }) : json({ error: 'Editor tidak aktif.' }, 403);
		}
		if (url.pathname === '/event') {
			const body = await request.text(); this.broadcast(body); return json({ ok: true });
		}
		return json({ error: 'Not found.' }, 404);
	}

	webSocketMessage(socket: WebSocket, message: string | ArrayBuffer) {
		const attachment = socket.deserializeAttachment() as Attachment | null;
		if (!attachment) return socket.close(1008, 'Missing identity');
		if (message instanceof ArrayBuffer) {
			if (attachment.deviceId === this.room.activeEditorDeviceId) this.broadcast(message, socket);
			return;
		}
		let event: { type?: string; [key: string]: unknown };
		try { event = JSON.parse(message); } catch { return; }
		if (event.type === 'request_edit' || event.type === 'cancel_edit_request') {
			attachment.requestingEdit = event.type === 'request_edit'; socket.serializeAttachment(attachment); this.broadcastSnapshot(); return;
		}
		if ((event.type === 'project_patch' || event.type === 'project_snapshot') && attachment.deviceId === this.room.activeEditorDeviceId) this.broadcast(message, socket);
	}

	webSocketClose() { this.broadcastSnapshot(); }
	webSocketError() { this.broadcastSnapshot(); }
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url); const match = url.pathname.match(/^\/projects\/([0-9a-f-]{36})\/(connect)$/i);
		if (match) {
			const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
			const origin = request.headers.get('origin') || '';
			if (origin && allowed.length && !allowed.includes(origin)) return json({ error: 'Origin tidak diizinkan.' }, 403);
			try {
				const token = url.searchParams.get('token') || '';
				const verified = await jwtVerify(token, new TextEncoder().encode(env.REALTIME_TOKEN_SECRET), { issuer: 'mivubi-vercel', audience: 'mivubi-realtime' });
				const claims = verified.payload as unknown as Claims;
				if (claims.projectId !== match[1]) return json({ error: 'Project token tidak cocok.' }, 403);
				const stub = env.PROJECT_ROOMS.getByName(match[1]);
				const forwarded = new Request('https://room/connect', request);
				forwarded.headers.set('x-realtime-claims', JSON.stringify(claims));
				return stub.fetch(forwarded);
			} catch { return json({ error: 'Realtime token tidak valid.' }, 401); }
		}
		const internal = url.pathname.match(/^\/internal\/projects\/([0-9a-f-]{36})\/(sync|authorize|event)$/i);
		if (internal) {
			if (bearer(request) !== env.REALTIME_INTERNAL_SECRET) return json({ error: 'Unauthorized.' }, 401);
			return env.PROJECT_ROOMS.getByName(internal[1]).fetch(new Request(`https://room/${internal[2]}`, request));
		}
		return json({ service: 'mivubi-mosaic-realtime', ok: true });
	}
} satisfies ExportedHandler<Env>;
