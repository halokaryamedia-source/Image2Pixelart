<script lang="ts">
	import { onMount } from 'svelte';
	import HomeView from '$lib/components/HomeView.svelte';
	import EditorView from '$lib/components/EditorView.svelte';
	import type { ProjectV2 } from '$lib/types';
	import { cloneProject, createProject, deserializeProject } from '$lib/project';
	import { deleteProject, loadProjects, saveProject } from '$lib/storage';

	let projects = $state<ProjectV2[]>([]);
	let activeProject = $state<ProjectV2 | null>(null);
	let ready = $state(false);
	let saveState = $state<'saved' | 'saving' | 'error'>('saved');
	let startupError = $state<string | null>(null);
	const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const pendingProjects = new Map<string, ProjectV2>();
	const savesInFlight = new Map<string, Promise<void>>();

	onMount(() => {
		void initialize();
		const handleVisibility = () => { if (document.visibilityState === 'hidden') void flushAllSaves(); };
		const handlePageHide = () => { void flushAllSaves(); };
		document.addEventListener('visibilitychange', handleVisibility);
		window.addEventListener('pagehide', handlePageHide);
		return () => { document.removeEventListener('visibilitychange', handleVisibility); window.removeEventListener('pagehide', handlePageHide); void flushAllSaves(); };
	});

	async function initialize() {
		try { projects = await loadProjects(); }
		catch (error) { startupError = error instanceof Error ? error.message : 'Penyimpanan lokal tidak tersedia.'; }
		finally { ready = true; }
	}

	async function createNew(input: { name: string; widthMm: number; heightMm: number; cellMm: number }) {
		try {
			const project = createProject(input);
			await saveProject(project);
			projects = [project, ...projects]; activeProject = project;
		} catch (error) { startupError = error instanceof Error ? error.message : 'Proyek gagal dibuat.'; }
	}

	function openProject(project: ProjectV2) { activeProject = cloneProject(project); }

	function changeProject(next: ProjectV2) {
		activeProject = next;
		projects = [next, ...projects.filter((project) => project.id !== next.id)];
		saveState = 'saving'; pendingProjects.set(next.id, cloneProject(next));
		const existingTimer = saveTimers.get(next.id); if (existingTimer) clearTimeout(existingTimer);
		saveTimers.set(next.id, setTimeout(() => { void flushProjectSave(next.id); }, 650));
	}

	async function flushProjectSave(id: string): Promise<void> {
		const timer = saveTimers.get(id); if (timer) clearTimeout(timer); saveTimers.delete(id);
		const running = savesInFlight.get(id);
		if (running) { await running; if (pendingProjects.has(id)) await flushProjectSave(id); return; }
		const task = (async () => {
			while (pendingProjects.has(id)) {
				const next = pendingProjects.get(id)!; pendingProjects.delete(id);
				try { await saveProject(next); if (activeProject?.id === id && !pendingProjects.has(id)) saveState = 'saved'; }
				catch { if (!pendingProjects.has(id)) pendingProjects.set(id, next); if (activeProject?.id === id) saveState = 'error'; break; }
			}
		})();
		savesInFlight.set(id, task);
		try { await task; } finally { if (savesInFlight.get(id) === task) savesInFlight.delete(id); }
	}

	async function flushAllSaves() { await Promise.all([...new Set([...pendingProjects.keys(), ...savesInFlight.keys()])].map(flushProjectSave)); }
	function leaveEditor() { if (activeProject) void flushProjectSave(activeProject.id); activeProject = null; }

	async function removeProject(id: string) {
		const removed = projects.find((project) => project.id === id); projects = projects.filter((project) => project.id !== id);
		const timer = saveTimers.get(id); if (timer) clearTimeout(timer); saveTimers.delete(id); pendingProjects.delete(id);
		try { await savesInFlight.get(id); await deleteProject(id); }
		catch (error) { if (removed) projects = [removed, ...projects]; startupError = error instanceof Error ? error.message : 'Proyek gagal dihapus.'; }
	}

	async function importProject(file: File) {
		try {
			if (file.size > 50 * 1024 * 1024) throw new Error('File proyek melebihi batas 50 MB.');
			let project = deserializeProject(await file.text());
			if (projects.some((item) => item.id === project.id)) project = { ...project, id: crypto.randomUUID(), name: `${project.name} (impor)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
			await saveProject(project); projects = [project, ...projects]; activeProject = project;
		} catch (error) { startupError = error instanceof Error ? error.message : 'File proyek tidak dapat dibuka.'; }
	}
</script>

{#if activeProject}
	<EditorView project={activeProject} {saveState} onChange={changeProject} onBack={leaveEditor} />
{:else}
	<HomeView {projects} {ready} onCreate={createNew} onOpen={openProject} onDelete={removeProject} onImport={importProject} />
{/if}

{#if startupError}<div class="root-error" role="alert" aria-live="assertive"><span>{startupError}</span><button type="button" aria-label="Tutup pesan error" onclick={() => (startupError = null)}>×</button></div>{/if}

<style>.root-error{position:fixed;z-index:50;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;max-width:min(520px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:11px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.22)}.root-error button{border:0;background:transparent;color:white;font-size:18px}</style>
