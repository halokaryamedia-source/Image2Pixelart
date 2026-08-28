export type FitMode = 'cover' | 'contain';
export type EditorTool = 'pencil' | 'fill' | 'picker' | 'eraser' | 'pan';

export type CatalogColor = {
	id: string;
	name: string;
	code?: string;
	hex: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ProjectPaletteEntry = {
	slot: number;
	catalogId: string;
	name: string;
	code?: string;
	hex: string;
	pinned: boolean;
};

export type SourceImage = {
	name: string;
	type: string;
	dataUrl: string;
	width: number;
	height: number;
};

export type ImportSettings = {
	fit: FitMode;
	focalX: number;
	focalY: number;
	maxColors: number;
	autoPalette: boolean;
};

export type ProjectV1 = {
	schemaVersion: 1;
	id: string;
	name: string;
	widthMm: number;
	heightMm: number;
	cellMm: number;
	columns: number;
	rows: number;
	palette: ProjectPaletteEntry[];
	backgroundSlot: number;
	cells: Uint16Array;
	importSettings: ImportSettings;
	sourceImage?: SourceImage;
	createdAt: string;
	updatedAt: string;
};

export type SerializedProjectV1 = Omit<ProjectV1, 'cells'> & {
	cellsRle: number[];
};

export type ProjectSummary = Pick<
	ProjectV1,
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
};

export type ConversionRequest = {
	buffer: ArrayBuffer;
	mimeType: string;
	columns: number;
	rows: number;
	fit: FitMode;
	focalX: number;
	focalY: number;
	backgroundHex: string;
	backgroundCatalogId: string;
	catalog: CatalogColor[];
	existingPalette: ProjectPaletteEntry[];
	maxColors: number;
	autoPalette: boolean;
};

export type ConversionResult = {
	cells: Uint16Array;
	palette: ProjectPaletteEntry[];
	backgroundSlot: number;
	imageWidth: number;
	imageHeight: number;
};

export type CellPatch = {
	indices: Uint32Array;
	before: Uint16Array;
	after: Uint16Array;
	label: string;
};
