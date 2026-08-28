import type { ProjectV1 } from '$lib/types';
import { cloneProject } from '$lib/project';

export async function createProjectPdfInBackground(project: ProjectV1): Promise<Uint8Array> {
	if (typeof Worker === 'undefined') {
		const { createProjectPdfBytes } = await import('$lib/export/pdf');
		return createProjectPdfBytes(project);
	}
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('../workers/pdf-export.worker.ts', import.meta.url), { type: 'module' });
		const timeout = window.setTimeout(() => {
			worker.terminate();
			reject(new Error('Pembuatan PDF melewati batas waktu lima menit.'));
		}, 5 * 60_000);
		worker.onmessage = (event: MessageEvent<{ ok: boolean; bytes?: Uint8Array; error?: string }>) => {
			clearTimeout(timeout);
			worker.terminate();
			if (event.data.ok && event.data.bytes) resolve(event.data.bytes);
			else reject(new Error(event.data.error ?? 'PDF tidak dapat dibuat.'));
		};
		worker.onerror = () => {
			clearTimeout(timeout);
			worker.terminate();
			reject(new Error('Worker PDF tidak tersedia pada browser ini.'));
		};
		const snapshot = cloneProject(project);
		snapshot.sourceImage = undefined;
		worker.postMessage(snapshot, [snapshot.cells.buffer]);
	});
}
