export const EMPTY_CELL = 0xffff;

export type PlacementMode = 'crop' | 'fit';
export type RenderMode = 'contour' | 'photo';
export type EditorTool = 'pencil' | 'fill' | 'picker' | 'eraser' | 'select' | 'pan';

export type ProjectPaletteEntry = {
	id: string;
	slot: number;
	hex: string;
	name?: string;
	locked: boolean;
};

export type GlobalPaletteColor = {
	id: string;
	name?: string;
	hex: string;
	usage?: string;
};

export type GlobalPalette = {
	id: string;
	name: string;
	colors: GlobalPaletteColor[];
	builtIn: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CropRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type SourceImage = {
	name: string;
	type: string;
	dataUrl: string;
	width: number;
	height: number;
};

export type ImportSettings = {
	placement: PlacementMode;
	crop: CropRect | null;
	renderMode: RenderMode;
	suggestionCount: number;
};

export type ProjectV2 = {
	schemaVersion: 3;
	id: string;
	name: string;
	widthMm: number;
	heightMm: number;
	cellMm: number;
	columns: number;
	rows: number;
	palette: ProjectPaletteEntry[];
	suggestedPalette?: ProjectPaletteEntry[];
	cells: Uint16Array;
	importSettings: ImportSettings;
	sourceImage?: SourceImage;
	createdAt: string;
	updatedAt: string;
};

// Compatibility aliases for existing internal imports. Serialized projects use schema v3.
export type ProjectV1 = ProjectV2;

export type SerializedProjectV2 = Omit<ProjectV2, 'cells'> & {
	cellsRle: number[];
};

export type ProjectSummary = Pick<
	ProjectV2,
	'id' | 'name' | 'widthMm' | 'heightMm' | 'cellMm' | 'columns' | 'rows' | 'palette' | 'createdAt' | 'updatedAt'
> & { previewCells: number[] };

export type GridValidation = {
	valid: boolean;
	columns: number;
	rows: number;
	total: number;
	reason?: string;
	suggestionsCm: number[];
};

export type ColorSample = {
	l: number;
	a: number;
	b: number;
	alpha?: number;
};

export type ConversionRequest = {
	buffer: ArrayBuffer;
	mimeType: string;
	columns: number;
	rows: number;
	placement: PlacementMode;
	crop: CropRect | null;
	renderMode: RenderMode;
	suggestionCount: number;
	palette: ProjectPaletteEntry[];
	suggestPalette: boolean;
};

export type ConversionResult = {
	cells: Uint16Array;
	palette: ProjectPaletteEntry[];
	imageWidth: number;
	imageHeight: number;
};

export type CellPatch = {
	indices: Uint32Array;
	before: Uint16Array;
	after: Uint16Array;
	label: string;
};
