import type { ImportSettings, ProjectPaletteEntry, ProjectSummary, ProjectV2 } from '$lib/types';

export type DeviceIdentity = {
	id: string;
	secret: string;
	displayName: string;
};

export type CloudSourceImage = {
	assetId: string;
	name: string;
	type: string;
	width: number;
	height: number;
};

export type CloudProjectDocument = {
	schemaVersion: 3;
	name: string;
	widthMm: number;
	heightMm: number;
	cellMm: number;
	columns: number;
	rows: number;
	palette: ProjectPaletteEntry[];
	suggestedPalette?: ProjectPaletteEntry[];
	importSettings: ImportSettings;
	sourceImage?: CloudSourceImage;
	createdAt: string;
	updatedAt: string;
};

export type CloudProjectPayload = {
	id: string;
	document: CloudProjectDocument;
	cellsBase64: string;
};

export type CloudProjectMeta = {
	revision: number;
	ownerDeviceId: string;
	activeEditorDeviceId: string | null;
	editorEpoch: number;
	deletedAt: string | null;
	purgeAfter: string | null;
	sourceUrl?: string;
};

export type CloudProjectResponse = CloudProjectMeta & {
	project: CloudProjectPayload;
};

export type CloudProjectSummary = ProjectSummary & CloudProjectMeta & {
	role: 'owner' | 'editor' | 'viewer';
	previewColumns: number;
	previewRows: number;
};

export type PresenceParticipant = {
	deviceId: string;
	displayName: string;
	isOwner: boolean;
	isEditor: boolean;
	requestingEdit: boolean;
};

export type PresenceSnapshot = {
	type: 'snapshot';
	participants: PresenceParticipant[];
	activeEditorDeviceId: string | null;
	editorEpoch: number;
};

export type CloudEditorProps = {
	project: ProjectV2;
	meta: CloudProjectMeta;
	device: DeviceIdentity;
	participants: PresenceParticipant[];
	realtimeState: 'connecting' | 'connected' | 'disconnected';
	requestingEdit: boolean;
};
