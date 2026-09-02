<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import EditorView from '$lib/components/EditorView.svelte';
	import AdminEditorView from '$lib/components/AdminEditorView.svelte';
	import { deleteCloudDraft, loadGlobalPalettes, saveCloudDraft, saveGlobalPalette, deleteGlobalPalette } from '$lib/storage';
	import { createGlobalPalette } from '$lib/global-palettes';
	import { joinCloudProject, loadCloudProject, registerDevice, restoreCloudProject, saveCloudProject, uploadSourceImage } from '$lib/cloud/api';
	import { getDeviceIdentity } from '$lib/cloud/device';
	import { ProjectRealtime } from '$lib/cloud/realtime';
	import { takePendingUpload, setPendingUpload, type PendingSourceUpload } from '$lib/cloud/pending-upload';
	import type { CloudProjectMeta, DeviceIdentity, PresenceSnapshot } from '$lib/cloud/types';
	import type { GlobalPalette, ProjectV2 } from '$lib/types';
	import { cloneProject } from '$lib/project';

	let { projectId, adminMode = false }: { projectId: string; adminMode?: boolean } = $props();
	let device = $state<DeviceIdentity | null>(null);
	let project = $state<ProjectV2 | null>(null);
	let meta = $state<CloudProjectMeta | null>(null);
	let globalPalettes = $state<GlobalPalette[]>([]);
	let realtimeState = $state<'connecting' | 'connected' | 'disconnected'>('connecting');
	let saveState = $state<'saved' | 'saving' | 'error'>('saved');
	let error = $state<string | null>(null);
	let deleted = $state<{ ownerDeviceId: string; purgeAfter?: string } | null>(null);
	let adminDenied = $state(false);
	let realtime: ProjectRealtime | null = null;
	let pendingProject: ProjectV2 | null = null;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let draftTimer: ReturnType<typeof setTimeout> | undefined;
	let liveTimer: ReturnType<typeof setTimeout> | undefined;
	let saveInFlight: Promise<void> | null = null;
	let pendingSource: PendingSourceUpload | undefined;
	let uploadingSource = false;
	let editable = $derived(!!device && !!meta && meta.activeEditorDeviceId === device.id && realtimeState === 'connected');

	onMount(() => {
		void initialize();
		const hide = () => { if (document.visibilityState === 'hidden') void flushSave(); };
		document.addEventListener('visibilitychange', hide);
		window.addEventListener('pagehide', hide);
		return () => {
			document.removeEventListener('visibilitychange', hide);
			window.removeEventListener('pagehide', hide);
		};
	});

	onDestroy(() => {
		if (saveTimer) clearTimeout(saveTimer);
		if (draftTimer) clearTimeout(draftTimer);
		if (liveTimer) clearTimeout(liveTimer);
		realtime?.stop();
	});

	async function initialize() {
		try {
			adminDenied = false;
			error = null;
			device = getDeviceIdentity();
			await registerDevice(device);
			globalPalettes = await loadGlobalPalettes();
			const loaded = await loadCloudProject(device, projectId);
			project = loaded.project;
			meta = loaded.meta;

			if (adminMode && loaded.meta.ownerDeviceId !== device.id) {
				adminDenied = true;
				return;
			}

			await joinCloudProject(device, projectId);
			pendingSource = takePendingUpload(projectId);
			realtime = new ProjectRealtime(projectId, device, {
				onState: (state) => {
					realtimeState = state;
					if (state === 'connected') void uploadPendingSource();
				},
				onPresence: (snapshot) => { void applyPresence(snapshot); },
				onProject: (next) => {
					if (!editable) {
						project = next;
						realtime?.setCurrentProject(next);
					}
				},
				onSaved: (revision) => {
					if (meta && revision > meta.revision) meta = { ...meta, revision };
				},
				onDeleted: (purgeAfter) => {
					deleted = { ownerDeviceId: meta?.ownerDeviceId || '', purgeAfter };
					project = null;
				}
			});
			realtime.setCurrentProject(project);
			await realtime.start();
		} catch (caught) {
			const api = caught as Error & { status?: number; payload?: { ownerDeviceId?: string; purgeAfter?: string } };
			if (api.status === 410) deleted = { ownerDeviceId: api.payload?.ownerDeviceId || '', purgeAfter: api.payload?.purgeAfter };
			else error = api.message || 'File gagal dibuka.';
		}
	}

	async function applyPresence(snapshot: PresenceSnapshot) {
		if (!device || !meta) return;
		const becomingEditor = snapshot.activeEditorDeviceId === device.id && meta.activeEditorDeviceId !== device.id;
		meta = { ...meta, activeEditorDeviceId: snapshot.activeEditorDeviceId, editorEpoch: snapshot.editorEpoch };
		if (becomingEditor) {
			try {
				const latest = await loadCloudProject(device, projectId);
				project = latest.project;
				meta = latest.meta;
				realtime?.setCurrentProject(latest.project);
			} catch (caught) {
				error = caught instanceof Error ? caught.message : 'Versi terbaru gagal dimuat.';
			}
		}
		if (snapshot.activeEditorDeviceId === device.id && project) realtime?.broadcastProject(project);
	}

	function changeProject(next: ProjectV2) {
		if (!editable) return;
		project = next;
		pendingProject = cloneProject(next);
		saveState = 'saving';
		realtime?.setCurrentProject(next);
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => { void flushSave(); }, 2_000);
		if (draftTimer) clearTimeout(draftTimer);
		draftTimer = setTimeout(() => { void saveCloudDraft(next); }, 350);
		if (liveTimer) clearTimeout(liveTimer);
		liveTimer = setTimeout(() => realtime?.broadcastProject(next), 150);
	}

	async function flushSave(): Promise<void> {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = undefined;
		if (saveInFlight) {
			await saveInFlight;
			if (pendingProject) await flushSave();
			return;
		}
		if (!pendingProject || !device || !meta || !editable) return;
		const snapshot = pendingProject;
		pendingProject = null;
		saveInFlight = (async () => {
			try {
				const saved = await saveCloudProject(device!, snapshot, meta!.revision);
				meta = { ...meta!, revision: saved.revision };
				saveState = 'saved';
				realtime?.broadcastProject(snapshot);
				await deleteCloudDraft(projectId);
			} catch (caught) {
				pendingProject ??= snapshot;
				saveState = 'error';
				await saveCloudDraft(snapshot);
				error = caught instanceof Error ? caught.message : 'Autosave gagal.';
			}
		})();
		try { await saveInFlight; } finally { saveInFlight = null; }
	}

	async function sourceChanged(file: File, next: ProjectV2) {
		pendingProject = cloneProject(next);
		await flushSave();
		if (!device || !meta || !next.sourceImage) return;
		try {
			const uploaded = await uploadSourceImage(device, projectId, file, { width: next.sourceImage.width, height: next.sourceImage.height });
			meta = { ...meta, revision: uploaded.revision };
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Gambar sumber gagal disimpan.';
			throw caught;
		}
	}

	async function uploadPendingSource() {
		if (!pendingSource || uploadingSource || !project || !editable || !device || !meta) return;
		const upload = pendingSource;
		pendingSource = undefined;
		uploadingSource = true;
		try {
			await uploadSourceImage(device, projectId, upload.file, { width: upload.width, height: upload.height });
			const latest = await loadCloudProject(device, projectId);
			project = latest.project;
			meta = latest.meta;
			realtime?.setCurrentProject(latest.project);
		} catch (caught) {
			pendingSource = upload;
			setPendingUpload(projectId, upload);
			error = caught instanceof Error ? caught.message : 'Gambar awal gagal disimpan.';
		} finally {
			uploadingSource = false;
		}
	}

	async function leave() {
		await flushSave();
		realtime?.stop();
		await goto(adminMode ? '/admin' : '/');
	}

	async function exitAdmin() {
		await flushSave();
		realtime?.stop();
		await goto(`/project/${projectId}`);
	}

	async function restore() {
		if (!device) return;
		try {
			await restoreCloudProject(device, projectId);
			deleted = null;
			await initialize();
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'File gagal dipulihkan.';
		}
	}

	async function addGlobalPalette(input: { name: string; colors: Array<{ hex: string; name?: string }> }) {
		const palette = createGlobalPalette(input.name, input.colors);
		await saveGlobalPalette(palette);
		globalPalettes = [...globalPalettes, palette];
	}

	async function removeGlobalPalette(id: string) {
		await deleteGlobalPalette(id);
		globalPalettes = globalPalettes.filter((palette) => palette.id !== id);
	}
</script>

<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>

{#if adminMode && adminDenied && device}
	<main class="status-card">
		<img src="/mivubi-logo.png" alt="" />
		<h1>Akses Admin tidak tersedia</h1>
		<p>Mode Admin hanya tersedia untuk pemilik file ini.</p>
		<a href={`/project/${projectId}`}>Buka Akses Umum</a>
		<a class="secondary-link" href="/admin">Kembali ke Admin</a>
	</main>
{:else if project && meta && device}
	{#if adminMode}
		<AdminEditorView
			{project}
			{saveState}
			{globalPalettes}
			{editable}
			onChange={changeProject}
			onBack={leave}
			onExitAdmin={exitAdmin}
			onSaveNow={flushSave}
			onCreateGlobalPalette={addGlobalPalette}
			onDeleteGlobalPalette={removeGlobalPalette}
			onSourceImageChange={sourceChanged}
		/>
	{:else}
		<EditorView
			{project}
			{saveState}
			{globalPalettes}
			{editable}
			onChange={changeProject}
			onBack={leave}
			onSaveNow={flushSave}
			onCreateGlobalPalette={addGlobalPalette}
			onDeleteGlobalPalette={removeGlobalPalette}
			onSourceImageChange={sourceChanged}
		/>
	{/if}
{:else if deleted && device}
	<main class="status-card">
		<img src="/mivubi-logo.png" alt="" />
		<h1>File ini berada di Sampah</h1>
		<p>{deleted.purgeAfter ? `File akan dihapus permanen pada ${new Date(deleted.purgeAfter).toLocaleString('id-ID')}.` : 'File akan dihapus permanen dalam 7 hari.'}</p>
		{#if deleted.ownerDeviceId === device.id}<button onclick={restore}>Pulihkan File</button>{/if}
		<a href={adminMode ? '/admin' : '/'}>{adminMode ? 'Kembali ke Admin' : 'Kembali ke File Tersimpan'}</a>
	</main>
{:else}
	<main class="status-card">
		<img src="/mivubi-logo.png" alt="" />
		<h1>Membuka file…</h1>
		{#if error}
			<p class="error">{error}</p>
			<a href={adminMode ? '/admin' : '/'}>{adminMode ? 'Kembali ke Admin' : 'Kembali ke File Tersimpan'}</a>
		{/if}
	</main>
{/if}

{#if error && project && !adminDenied}
	<div class="root-error" role="alert"><span>{error}</span><button onclick={() => (error = null)} aria-label="Tutup pesan">×</button></div>
{/if}

<style>
	.status-card{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px;text-align:center}.status-card img{width:64px;height:64px;image-rendering:pixelated}.status-card h1{margin:0;font:650 28px "Readex Pro",sans-serif}.status-card p{max-width:520px;color:#66716b}.status-card .error{color:#963f27}.status-card button,.status-card a{min-height:42px;display:inline-flex;align-items:center;padding:0 16px;border:0;border-radius:7px;background:#1f6d4a;color:white;text-decoration:none;font-weight:700}.status-card .secondary-link{border:1px solid #d8d3c6;background:white;color:var(--ink)}.root-error{position:fixed;z-index:150;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;max-width:min(600px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700}.root-error button{border:0;background:transparent;color:white;font-size:18px}
</style>
