export type CanvasSettings = {
	widthMm: number;
	heightMm: number;
	cellMm: number;
	columns: number;
	rows: number;
	total: number;
};

export type CanvasSettingsInput = Pick<CanvasSettings, 'widthMm' | 'heightMm' | 'cellMm'>;
