export function safeFileName(value: string): string {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mosaic-project';
}

export function downloadBlob(blob: Blob, fileName: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export function downloadText(text: string, fileName: string, type = 'text/plain;charset=utf-8'): void {
	downloadBlob(new Blob([text], { type }), fileName);
}

export function fileToDataUrl(file: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error ?? new Error('File tidak dapat dibaca.'));
		reader.readAsDataURL(file);
	});
}
