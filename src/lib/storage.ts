import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { cloneProject, migrateStoredProject } from '$lib/project';
import type { ProjectV2, SourceImage } from '$lib/types';

type StoredProject = Omit<ProjectV2, 'sourceImage'> | Record<string, unknown>;
type LegacyCatalogColor = { id: string; name: string; code?: string; hex: string; active: boolean; createdAt: string; updatedAt: string };

interface MosaicDatabase extends DBSchema {
	projects: { key: string; value: StoredProject; indexes: { 'by-updated': string } };
	catalog: { key: string; value: LegacyCatalogColor; indexes: { 'by-name': string } };
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

export async function loadProjects(): Promise<ProjectV2[]> {
	const db = await database();
	const storedProjects = await db.getAll('projects');
	const projects: ProjectV2[] = [];
	for (const stored of storedProjects) {
		const record = stored as Record<string, unknown>;
		const legacySource = record.sourceImage as SourceImage | undefined;
		const projectId = typeof record.id === 'string' ? record.id : '';
		const sourceImage = legacySource ?? (projectId ? await db.get('sourceImages', projectId) : undefined);
		const project = migrateStoredProject(stored, sourceImage);
		if (sourceImage) sourceDataUrls.set(project.id, sourceImage.dataUrl);
		projects.push(project);
	}
	return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveProject(project: ProjectV2): Promise<void> {
	const db = await database();
	const tx = db.transaction(['projects', 'sourceImages'], 'readwrite');
	// IndexedDB uses structured cloning and cannot persist Svelte's reactive proxies.
	const snapshot = cloneProject(project);
	const { sourceImage, ...storedProject } = snapshot;
	await tx.objectStore('projects').put(storedProject);
	if (sourceImage) {
		if (sourceDataUrls.get(snapshot.id) !== sourceImage.dataUrl) await tx.objectStore('sourceImages').put(sourceImage, snapshot.id);
	} else await tx.objectStore('sourceImages').delete(snapshot.id);
	await tx.done;
	if (sourceImage) sourceDataUrls.set(snapshot.id, sourceImage.dataUrl);
	else sourceDataUrls.delete(snapshot.id);
}

export async function deleteProject(id: string): Promise<void> {
	const db = await database();
	const tx = db.transaction(['projects', 'sourceImages'], 'readwrite');
	await Promise.all([tx.objectStore('projects').delete(id), tx.objectStore('sourceImages').delete(id), tx.done]);
	sourceDataUrls.delete(id);
}
