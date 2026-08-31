import { cloudPayloadToProject, projectToCloudPayload } from './project-codec';
import { realtimeToken } from './api';
import type { DeviceIdentity, PresenceSnapshot } from './types';
import type { ProjectV2 } from '$lib/types';

type RealtimeCallbacks = {
	onState: (state: 'connecting' | 'connected' | 'disconnected') => void;
	onPresence: (snapshot: PresenceSnapshot) => void;
	onProject: (project: ProjectV2) => void;
	onSaved: (revision: number) => void;
	onDeleted: (purgeAfter?: string) => void;
};

type ProjectPatchMessage = {
	type: 'project_patch';
	projectId: string;
	document: ReturnType<typeof projectToCloudPayload>['document'];
	indices: number[];
	values: number[];
};

export class ProjectRealtime {
	private socket?: WebSocket;
	private stopped = false;
	private retry = 1_000;
	private lastBroadcast?: ProjectV2;
	private currentProject?: ProjectV2;

	constructor(private projectId: string, private device: DeviceIdentity, private callbacks: RealtimeCallbacks) {}

	setCurrentProject(project: ProjectV2) { this.currentProject = project; }

	async start() {
		this.stopped = false; this.callbacks.onState('connecting');
		try {
			const signed = await realtimeToken(this.device, this.projectId);
			const socket = new WebSocket(`${signed.wsUrl}?token=${encodeURIComponent(signed.token)}`); this.socket = socket;
			socket.binaryType = 'arraybuffer';
			socket.onopen = () => { this.retry = 1_000; this.callbacks.onState('connected'); };
			socket.onmessage = (event) => this.message(event.data);
			socket.onclose = () => this.reconnect(); socket.onerror = () => socket.close();
		} catch { this.reconnect(); }
	}

	stop() { this.stopped = true; this.socket?.close(); this.socket = undefined; this.callbacks.onState('disconnected'); }

	private reconnect() {
		this.callbacks.onState('disconnected'); if (this.stopped) return;
		const delay = this.retry; this.retry = Math.min(10_000, this.retry * 2);
		setTimeout(() => { if (!this.stopped) void this.start(); }, delay);
	}

	private message(raw: unknown) {
		if (typeof raw !== 'string') return;
		let message: Record<string, unknown>;
		try { message = JSON.parse(raw); } catch { return; }
		if (message.type === 'snapshot') return this.callbacks.onPresence(message as unknown as PresenceSnapshot);
		if (message.type === 'project_saved') return this.callbacks.onSaved(Number(message.revision));
		if (message.type === 'project_deleted') return this.callbacks.onDeleted(typeof message.purgeAfter === 'string' ? message.purgeAfter : undefined);
		if (message.type === 'project_snapshot' && message.payload) {
			try { this.callbacks.onProject(cloudPayloadToProject(message.payload as ReturnType<typeof projectToCloudPayload>, this.currentProject?.sourceImage?.dataUrl)); } catch { /* ignore malformed peer message */ }
			return;
		}
		if (message.type === 'project_patch' && this.currentProject) {
			const patch = message as unknown as ProjectPatchMessage;
			if (!Array.isArray(patch.indices) || !Array.isArray(patch.values) || patch.indices.length !== patch.values.length) return;
			try {
				const payload = projectToCloudPayload(this.currentProject); payload.document = patch.document;
				const next = cloudPayloadToProject(payload, this.currentProject.sourceImage?.dataUrl); next.cells = this.currentProject.cells.slice();
				for (let index = 0; index < patch.indices.length; index += 1) if (patch.indices[index] < next.cells.length) next.cells[patch.indices[index]] = patch.values[index];
				this.callbacks.onProject(next);
			} catch { /* ignore malformed peer message */ }
		}
	}

	send(type: 'request_edit' | 'cancel_edit_request') { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type })); }

	broadcastProject(project: ProjectV2) {
		if (this.socket?.readyState !== WebSocket.OPEN) return;
		const payload = projectToCloudPayload(project); const previous = this.lastBroadcast;
		if (!previous || previous.cells.length !== project.cells.length) {
			this.socket.send(JSON.stringify({ type: 'project_snapshot', payload })); this.lastBroadcast = structuredCloneProject(project); return;
		}
		const indices: number[] = []; const values: number[] = [];
		for (let index = 0; index < project.cells.length; index += 1) if (previous.cells[index] !== project.cells[index]) { indices.push(index); values.push(project.cells[index]); }
		if (indices.length > 50_000) this.socket.send(JSON.stringify({ type: 'project_snapshot', payload }));
		else this.socket.send(JSON.stringify({ type: 'project_patch', projectId: project.id, document: payload.document, indices, values } satisfies ProjectPatchMessage));
		this.lastBroadcast = structuredCloneProject(project);
	}
}

function structuredCloneProject(project: ProjectV2): ProjectV2 {
	return { ...project, palette: project.palette.map((entry) => ({ ...entry })), suggestedPalette: project.suggestedPalette?.map((entry) => ({ ...entry })), cells: project.cells.slice(), importSettings: { ...project.importSettings, crop: project.importSettings.crop ? { ...project.importSettings.crop } : null }, sourceImage: project.sourceImage ? { ...project.sourceImage } : undefined };
}
