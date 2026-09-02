import { convertImageFile } from '$lib/image-converter';
import type { ProjectV2 } from '$lib/types';
import { centeredCropRect } from '$lib/utils/image-crop';
import { fileToDataUrl } from '$lib/utils/download';

export type ProjectImageConversionOptions = {
	suggestPalette: boolean;
	applyPalette: boolean;
	applyCells: boolean;
	replaceSource: boolean;
};

export async function convertProjectImage(
	project: ProjectV2,
	file: File,
	options: ProjectImageConversionOptions
): Promise<ProjectV2> {
	const conversionProject = options.replaceSource
		? { ...project, importSettings: { ...project.importSettings, crop: null } }
		: project;
	const autoSuggestForCells = options.applyCells && (
		project.palette.length === 0 ||
		(project.suggestedPalette?.length ?? project.importSettings.suggestionCount) !== project.importSettings.suggestionCount
	);
	const shouldSuggestPalette = options.suggestPalette || autoSuggestForCells;
	const shouldApplyPalette = options.applyPalette || autoSuggestForCells;
	const [result, dataUrl] = await Promise.all([
		convertImageFile(file, conversionProject, shouldSuggestPalette),
		options.replaceSource ? fileToDataUrl(file) : Promise.resolve(project.sourceImage?.dataUrl)
	]);
	const crop = conversionProject.importSettings.placement === 'crop'
		? conversionProject.importSettings.crop ?? centeredCropRect(result.imageWidth, result.imageHeight, project.columns / project.rows)
		: conversionProject.importSettings.crop;
	const suggestion = shouldSuggestPalette
		? result.palette.map((entry) => ({ ...entry, name: undefined, locked: false }))
		: project.suggestedPalette?.map((entry) => ({ ...entry }));
	return {
		...project,
		palette: shouldApplyPalette
			? result.palette.map((entry) => ({ ...entry, name: undefined, locked: false }))
			: project.palette.map((entry) => ({ ...entry })),
		suggestedPalette: suggestion,
		cells: options.applyCells ? result.cells.slice() : project.cells.slice(),
		importSettings: { ...project.importSettings, crop },
		sourceImage: options.replaceSource
			? { name: file.name, type: file.type, dataUrl: dataUrl!, width: result.imageWidth, height: result.imageHeight }
			: project.sourceImage ? { ...project.sourceImage } : undefined,
		updatedAt: new Date().toISOString()
	};
}
