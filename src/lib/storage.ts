import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DEFAULT_CATALOG } from '$lib/catalog';
import type { CatalogColor, ProjectV1 } from '$lib/types';

interface MosaicDatabase extends DBSchema {
	projects: { key: string; value: ProjectV1; indexes: { 'by-updated': string } };
	catalog: { key: string; value: CatalogColor; indexes: { 'by-name': string } };
}

let databasePromise: Promise<IDBPDatabase<MosaicDatabase>> | undefined;

function database(): Promise<IDBPDatabase<MosaicDatabase>> {
	if (!databasePromise) {
		databasePromise = openDB<MosaicDatabase>('mosaic-plan', 1, {
			upgrade(db) {
				const projects = db.createObjectStore('projects', { keyPath: 'id' });
				projects.createIndex('by-updated', 'updatedAt');
				const catalog = db.createObjectStore('catalog', { keyPath: 'id' });
				catalog.createIndex('by-name', 'name');
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
	const projects = await db.getAll('projects');
	return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveProject(project: ProjectV1): Promise<void> {
	const db = await database();
	await db.put('projects', project);
}

export async function deleteProject(id: string): Promise<void> {
	const db = await database();
	await db.delete('projects', id);
}
