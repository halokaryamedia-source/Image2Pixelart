import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DEFAULT_CATALOG } from '$lib/catalog';
import type { CatalogColor, ProjectV1, SourceImage } from '$lib/types';

type StoredProject = Omit<ProjectV1, 'sourceImage'>;

interface MosaicDatabase extends DBSchema {
	projects: { key: string; value: StoredProject | ProjectV1; indexes: { 'by-updated': string } };
	catalog: { key: string; value: CatalogColor; indexes: { 'by-name': string } };
	sourceImages: { key: string; value: SourceImage };
}

let databasePromise: Promise<IDBPDatabase<MosaicDatabase>> | undefined;
const sourceDataUrls = new Map<string, string>();

function database(): Promise<IDBPDatabase<MosaicDatabase>> {
	if (!databasePromise) {
		databasePromise = openDB<MosaicDatabase>('mosaic-plan', 2, {
			upgrade(db, oldVersion) {
				if (oldVersion < 1) {
					const projects = db.createObjectStore('projects', { keyPath: 'id' });
					projects.createIndex('by-updated', 'updatedAt');
					const catalog = db.createObjectStore('catalog', { keyPath: 'id' });
					catalog.createIndex('by-name', 'name');
				}
				if (oldVersion < 2) db.createObjectStore('sourceImages');
			}
		});
	}
	return databasePromise;
}

export async function loadCatalog(): Promise<CatalogColor[]> {
	const db = await database();
	let colors = await db.getAll('catalog');
	if (colors.length === 0) {
		const tx = db.transaction('catalog', 'readwrite');
		await Promise.all([...DEFAULT_CATALOG.map((color) => tx.store.put({ ...color })), tx.done]);
		colors = DEFAULT_CATALOG.map((color) => ({ ...color }));
	}
	return colors.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCatalog(catalog: CatalogColor[]): Promise<void> {
	const db = await database();
	const tx = db.transaction('catalog', 'readwrite');
	await tx.store.clear();
	for (const color of catalog) await tx.store.put(color);
	await tx.done;
}

export async function loadProjects(): Promise<ProjectV1[]> {
	const db = await database();
	const storedProjects = await db.getAll('projects');
	const projects = await Promise.all(storedProjects.map(async (stored) => {
		const legacySource = 'sourceImage' in stored ? stored.sourceImage : undefined;
		const sourceImage = legacySource ?? await db.get('sourceImages', stored.id);
		if (sourceImage) sourceDataUrls.set(stored.id, sourceImage.dataUrl);
		return { ...stored, sourceImage } as ProjectV1;
	}));
	return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveProject(project: ProjectV1): Promise<void> {
	const db = await database();
	const tx = db.transaction(['projects', 'sourceImages'], 'readwrite');
	const { sourceImage, ...storedProject } = project;
	await tx.objectStore('projects').put(storedProject);
	if (sourceImage) {
		if (sourceDataUrls.get(project.id) !== sourceImage.dataUrl) await tx.objectStore('sourceImages').put(sourceImage, project.id);
	} else {
		await tx.objectStore('sourceImages').delete(project.id);
	}
	await tx.done;
	if (sourceImage) sourceDataUrls.set(project.id, sourceImage.dataUrl);
	else sourceDataUrls.delete(project.id);
}

export async function deleteProject(id: string): Promise<void> {
	const db = await database();
	const tx = db.transaction(['projects', 'sourceImages'], 'readwrite');
	await Promise.all([tx.objectStore('projects').delete(id), tx.objectStore('sourceImages').delete(id), tx.done]);
	sourceDataUrls.delete(id);
}
