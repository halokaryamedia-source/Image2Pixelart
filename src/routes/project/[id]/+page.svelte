<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import EditorView from '$lib/components/EditorView.svelte';
	import { deleteCloudDraft, loadGlobalPalettes, saveCloudDraft, saveGlobalPalette, deleteGlobalPalette } from '$lib/storage';
	import { createGlobalPalette } from '$lib/global-palettes';
	import { joinCloudProject, loadCloudProject, registerDevice, restoreCloudProject, saveCloudProject, uploadSourceImage } from '$lib/cloud/api';
	import { getDeviceIdentity } from '$lib/cloud/device';
	import { ProjectRealtime } from '$lib/cloud/realtime';
	import { takePendingUpload, setPendingUpload, type PendingSourceUpload } from '$lib/cloud/pending-upload';
	import type { CloudProjectMeta, DeviceIdentity, PresenceSnapshot } from '$lib/cloud/types';
	import type { GlobalPalette, ProjectV2 } from '$lib/types';
	import { cloneProject } from '$lib/project';

	const projectId = page.params.id!;
	let device = $state<DeviceIdentity | null>(null);
	let project = $state<ProjectV2 | null>(null);
	let meta = $state<CloudProjectMeta | null>(null);
	let globalPalettes = $state<GlobalPalette[]>([]);
	let realtimeState = $state<'connecting' | 'connected' | 'disconnected'>('connecting');
	let saveState = $state<'saved' | 'saving' | 'error'>('saved');
	let error = $state<string | null>(null);
	let deleted = $state<{ ownerDeviceId: string; purgeAfter?: string } | null>(null);
	let realtime: ProjectRealtime | null = null;
	let pendingProject: ProjectV2 | null = null;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let draftTimer: ReturnType<typeof setTimeout> | undefined;
	let liveTimer: ReturnType<typeof setTimeout> | undefined;
	let saveInFlight: Promise<void> | null = null;
	let pendingSource: PendingSourceUpload | undefined;
	let uploadingSource = false;
	let editable = $derived(!!device && !!meta && meta.activeEditorDeviceId === device.id && realtimeState === 'connected');
	let showStartGuide = $derived(!!project && editable && project.palette.length === 0);

	onMount(() => {
		void initialize();
		const hide = () => { if (document.visibilityState === 'hidden') void flushSave(); };
		document.addEventListener('visibilitychange', hide); window.addEventListener('pagehide', hide);
		return () => { document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', hide); };
	});

	onDestroy(() => { if (saveTimer) clearTimeout(saveTimer); if (draftTimer) clearTimeout(draftTimer); if (liveTimer) clearTimeout(liveTimer); realtime?.stop(); });

	async function initialize() {
		try {
			device = getDeviceIdentity(); await registerDevice(device);
			globalPalettes = await loadGlobalPalettes();
			const loaded = await loadCloudProject(device, projectId); project = loaded.project; meta = loaded.meta;
			await joinCloudProject(device, projectId); pendingSource = takePendingUpload(projectId);
			realtime = new ProjectRealtime(projectId, device, {
				onState: (state) => { realtimeState = state; if (state === 'connected') void uploadPendingSource(); },
				onPresence: (snapshot) => { void applyPresence(snapshot); },
				onProject: (next) => { if (!editable) { project = next; realtime?.setCurrentProject(next); } },
				onSaved: (revision) => { if (meta && revision > meta.revision) meta = { ...meta, revision }; },
				onDeleted: (purgeAfter) => { deleted = { ownerDeviceId: meta?.ownerDeviceId || '', purgeAfter }; project = null; }
			});
			realtime.setCurrentProject(project); await realtime.start();
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
			try { const latest = await loadCloudProject(device, projectId); project = latest.project; meta = latest.meta; realtime?.setCurrentProject(latest.project); }
			catch (caught) { error = caught instanceof Error ? caught.message : 'Versi terbaru gagal dimuat.'; }
		}
		if (snapshot.activeEditorDeviceId === device.id && project) realtime?.broadcastProject(project);
	}

	function changeProject(next: ProjectV2) {
		if (!editable) return;
		project = next; pendingProject = cloneProject(next); saveState = 'saving'; realtime?.setCurrentProject(next);
		if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(() => { void flushSave(); }, 2_000);
		if (draftTimer) clearTimeout(draftTimer); draftTimer = setTimeout(() => { void saveCloudDraft(next); }, 350);
		if (liveTimer) clearTimeout(liveTimer); liveTimer = setTimeout(() => realtime?.broadcastProject(next), 150);
	}

	async function flushSave(): Promise<void> {
		if (saveTimer) clearTimeout(saveTimer); saveTimer = undefined;
		if (saveInFlight) { await saveInFlight; if (pendingProject) await flushSave(); return; }
		if (!pendingProject || !device || !meta || !editable) return;
		const snapshot = pendingProject; pendingProject = null;
		saveInFlight = (async () => {
			try {
				const saved = await saveCloudProject(device!, snapshot, meta!.revision);
				meta = { ...meta!, revision: saved.revision }; saveState = 'saved'; realtime?.broadcastProject(snapshot); await deleteCloudDraft(projectId);
			} catch (caught) {
				pendingProject ??= snapshot; saveState = 'error'; await saveCloudDraft(snapshot);
				error = caught instanceof Error ? caught.message : 'Autosave gagal.';
			}
		})();
		try { await saveInFlight; } finally { saveInFlight = null; }
	}

	async function sourceChanged(file: File, next: ProjectV2) {
		pendingProject = cloneProject(next); await flushSave();
		if (!device || !meta || !next.sourceImage) return;
		try {
			const uploaded = await uploadSourceImage(device, projectId, file, { width: next.sourceImage.width, height: next.sourceImage.height });
			meta = { ...meta, revision: uploaded.revision };
		} catch (caught) { error = caught instanceof Error ? caught.message : 'Gambar sumber gagal disimpan.'; throw caught; }
	}

	async function uploadPendingSource() {
		if (!pendingSource || uploadingSource || !project || !editable || !device || !meta) return;
		const upload = pendingSource; pendingSource = undefined; uploadingSource = true;
		try {
			await uploadSourceImage(device, projectId, upload.file, { width: upload.width, height: upload.height });
			const latest = await loadCloudProject(device, projectId);
			project = latest.project; meta = latest.meta; realtime?.setCurrentProject(latest.project);
		} catch (caught) { pendingSource = upload; setPendingUpload(projectId, upload); error = caught instanceof Error ? caught.message : 'Gambar awal gagal disimpan.'; }
		finally { uploadingSource = false; }
	}

	async function leave() { await flushSave(); realtime?.stop(); await goto('/'); }
	async function restore() { if (!device) return; try { await restoreCloudProject(device, projectId); deleted = null; await initialize(); } catch (caught) { error = caught instanceof Error ? caught.message : 'File gagal dipulihkan.'; } }
	async function addGlobalPalette(input: { name: string; colors: Array<{ hex: string; name?: string }> }) { const palette = createGlobalPalette(input.name, input.colors); await saveGlobalPalette(palette); globalPalettes = [...globalPalettes, palette]; }
	async function removeGlobalPalette(id: string) { await deleteGlobalPalette(id); globalPalettes = globalPalettes.filter((palette) => palette.id !== id); }
</script>

<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>

{#if project && meta && device}
	<EditorView {project} {saveState} {globalPalettes} {editable} onChange={changeProject} onBack={leave} onSaveNow={flushSave} onCreateGlobalPalette={addGlobalPalette} onDeleteGlobalPalette={removeGlobalPalette} onSourceImageChange={sourceChanged} />
	{#if showStartGuide}<div class="start-guide" role="status"><strong>Tambahkan warna untuk mulai menggambar</strong><span>Gunakan “+ Tambah Warna” pada Palet Cepat di bawah Canvas.</span></div>{/if}
{:else if deleted && device}
	<main class="status-card"><img src="/mivubi-logo.png" alt="" /><h1>File ini berada di Sampah</h1><p>{deleted.purgeAfter ? `File akan dihapus permanen pada ${new Date(deleted.purgeAfter).toLocaleString('id-ID')}.` : 'File akan dihapus permanen dalam 7 hari.'}</p>{#if deleted.ownerDeviceId === device.id}<button onclick={restore}>Pulihkan File</button>{/if}<a href="/">Kembali ke File Tersimpan</a></main>
{:else}
	<main class="status-card"><img src="/mivubi-logo.png" alt="" /><h1>Membuka file…</h1>{#if error}<p class="error">{error}</p><a href="/">Kembali ke File Tersimpan</a>{/if}</main>
{/if}

{#if error && project}<div class="root-error" role="alert"><span>{error}</span><button onclick={() => (error = null)}>×</button></div>{/if}

<style>
	.status-card{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px;text-align:center}.status-card img{width:64px;height:64px;image-rendering:pixelated}.status-card h1{margin:0;font:650 28px "Readex Pro",sans-serif}.status-card p{max-width:520px;color:#66716b}.status-card .error{color:#963f27}.status-card button,.status-card a{min-height:42px;display:inline-flex;align-items:center;padding:0 16px;border:0;border-radius:7px;background:#1f6d4a;color:white;text-decoration:none;font-weight:700}.root-error{position:fixed;z-index:150;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;max-width:min(600px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700}.root-error button{border:0;background:transparent;color:white;font-size:18px}.start-guide{position:fixed;z-index:68;left:50%;bottom:92px;transform:translateX(-50%);min-width:min(430px,calc(100vw - 32px));display:flex;align-items:center;justify-content:center;gap:8px;padding:9px 13px;border:1px solid #cfc9bc;border-radius:8px;background:#fffdfa;box-shadow:0 8px 22px rgba(31,43,36,.09);color:#56615b;font-size:12px;text-align:center;pointer-events:none}.start-guide strong{color:#1f6d4a;font-weight:750}.start-guide span{color:#66716b}@media(max-width:760px){.start-guide{bottom:220px;min-width:calc(100vw - 24px);flex-direction:column;gap:2px;padding:9px 12px}}
	:global(.left-panel .panel-section > .helper){display:none}
	:global(.left-panel .panel-section > button.secondary.wide){display:none}
	:global(.left-panel .suggestion-strip){display:none}

	/* Tool hierarchy: keep all capabilities one click away while making everyday tools dominant. */
	:global(.tool-rail button:nth-child(2)){order:1}
	:global(.tool-rail button:nth-child(4)){order:2}
	:global(.tool-rail button:nth-child(6)){order:3}
	:global(.tool-rail::before){content:'ALAT LAINNYA';order:4;min-height:25px;display:flex;align-items:center;justify-content:center;border-top:1px solid #ded9cd;border-bottom:1px solid #e8e4da;background:#faf9f4;color:#7a837e;font-size:8px;font-weight:800;letter-spacing:.09em}
	:global(.tool-rail button:nth-child(1)){order:5}
	:global(.tool-rail button:nth-child(3)){order:6}
	:global(.tool-rail button:nth-child(5)){order:7}
	:global(.tool-rail button:nth-child(1):not(.active)),:global(.tool-rail button:nth-child(3):not(.active)),:global(.tool-rail button:nth-child(5):not(.active)){min-height:50px;background:#faf9f4;color:#68716c}
	:global(.tool-rail button:nth-child(1) b),:global(.tool-rail button:nth-child(3) b),:global(.tool-rail button:nth-child(5) b){font-size:18px}
	:global(.tool-rail button:nth-child(1) span),:global(.tool-rail button:nth-child(3) span),:global(.tool-rail button:nth-child(5) span){font-size:9px}

	/* Palette management stays available without competing with Palet Cepat. */
	:global(.right-panel .palette-overview){grid-template-columns:1fr;gap:6px}
	:global(.right-panel .palette-overview button){min-height:58px;display:grid;grid-template-columns:42px 26px minmax(0,1fr);align-items:center;gap:8px;padding:7px 36px 7px 7px}
	:global(.right-panel .palette-overview i){width:42px;height:42px}
	:global(.right-panel .palette-overview span){margin:0;font-size:11px;text-align:center}
	:global(.right-panel .palette-overview small){font-size:11px}
	:global(.right-panel .add-color){grid-template-columns:1fr}
	:global(.right-panel .add-color .primary){min-height:42px}
	:global(.right-panel .panel-empty){padding:14px}

	/* Basic Canvas information only; editing statistics stay out of ordinary UI. */
	:global(.left-panel .property-grid span:nth-child(n+3)){display:none}
	:global(.left-panel .property-grid){grid-template-columns:1fr 1fr;margin-bottom:0}

	@media(max-width:760px){
		:global(.tool-rail::before){content:'';width:1px;min-width:1px;min-height:36px;align-self:center;margin:7px 3px;padding:0;border:0;background:#d8d3c6}
		:global(.tool-rail button:nth-child(1):not(.active)),:global(.tool-rail button:nth-child(3):not(.active)),:global(.tool-rail button:nth-child(5):not(.active)){min-width:58px;min-height:54px}
	}
</style>
