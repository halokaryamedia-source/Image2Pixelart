import { describe, expect, it } from 'vitest';
import { setPendingUpload, takePendingUpload } from './pending-upload';

describe('pending source upload', () => {
	it('keeps the original file dimensions until the editor realtime connection is ready', () => {
		const projectId = crypto.randomUUID();
		const file = new File(['pixel'], 'source.png', { type: 'image/png' });
		setPendingUpload(projectId, { file, width: 1920, height: 1080 });

		const upload = takePendingUpload(projectId);
		expect(upload).toMatchObject({ file, width: 1920, height: 1080 });
		expect(takePendingUpload(projectId)).toBeUndefined();
	});
});
