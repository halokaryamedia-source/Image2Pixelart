/// <reference lib="webworker" />

import type { ProjectV1 } from '../types';
import { createProjectPdfBytes } from '../export/pdf';

const context: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

context.onmessage = async (event: MessageEvent<ProjectV1>) => {
	try {
		const bytes = await createProjectPdfBytes(event.data);
		context.postMessage({ ok: true, bytes }, [bytes.buffer]);
	} catch (error) {
		context.postMessage({ ok: false, error: error instanceof Error ? error.message : 'PDF tidak dapat dibuat.' });
	}
};
