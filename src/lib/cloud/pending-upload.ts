export type PendingSourceUpload = {
	file: File;
	width: number;
	height: number;
};

const pendingUploads = new Map<string, PendingSourceUpload>();

export function setPendingUpload(projectId: string, upload: PendingSourceUpload) { pendingUploads.set(projectId, upload); }
export function takePendingUpload(projectId: string): PendingSourceUpload | undefined { const upload = pendingUploads.get(projectId); pendingUploads.delete(projectId); return upload; }
