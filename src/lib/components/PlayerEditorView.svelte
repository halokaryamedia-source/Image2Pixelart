<script lang="ts">
	import EditorView from '$lib/components/EditorView.svelte';
	import VisualCropper from '$lib/components/VisualCropper.svelte';
	import { convertProjectImage } from '$lib/image-project';
	import { createProjectPng } from '$lib/export/png';
	import { serializeProject } from '$lib/project';
	import { downloadBlob, downloadText, safeFileName } from '$lib/utils/download';
	import { gridMatrixCsv, materialListCsv } from '$lib/utils/csv';
	import { EMPTY_CELL } from '$lib/types';
	import type { GlobalPalette, ProjectV2 } from '$lib/types';
	import type { PresenceParticipant } from '$lib/cloud/types';

	type Props = {
		project: ProjectV2;
		saveState: 'saved' | 'saving' | 'error';
		globalPalettes: GlobalPalette[];
		onChange: (project: ProjectV2) => void;
		onBack: () => void;
		onCreateGlobalPalette: (input: { name: string; colors: Array<{ hex: string; name?: string }> }) => Promise<void>;
		onDeleteGlobalPalette: (id: string) => Promise<void>;
		onSaveNow?: () => Promise<void>;
		editable?: boolean;
		collaboration?: { participants: PresenceParticipant[]; deviceId: string; ownerDeviceId: string; activeEditorDeviceId: string | null; state: 'connecting' | 'connected' | 'disconnected'; requestingEdit: boolean; revision: number; onRequest: () => void; onCancelRequest: () => void; onGrant: (deviceId: string) => void };
		onSourceImageChange?: (file: File, project: ProjectV2) => Promise<void>;
	};

	let { project, saveState, globalPalettes, onChange, onBack, onCreateGlobalPalette, onDeleteGlobalPalette, onSaveNow, editable = true, collaboration, onSourceImageChange }: Props = $props();
	let showAdvancedTools = $state(false);
	let showFinish = $state(false);
	let startedBlank = $state(false);
	let processingImage = $state(false);
	let exporting = $state<string | null>(null);
	let localError = $state<string | null>(null);
	let pendingFile = $state<File | null>(null);
	let pendingImageProject = $state<ProjectV2 | null>(null);

	let hasPaint = $derived.by(() => {
		for (let index = 0; index < project.cells.length; index += 1) if (project.cells[index] !== EMPTY_CELL) return true;
		return false;
	});
	let needsStartChoice = $derived(!project.sourceImage && !hasPaint && !startedBlank);
	let showImageSetup = $derived(!!pendingFile && !!pendingImageProject?.sourceImage);
	let saveLabel = $derived(saveState === 'saving' ? 'Menyimpan…' : saveState === 'error' ? 'Gagal menyimpan' : 'Tersimpan');

	async function chooseImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file || processingImage || !editable) return;
		processingImage = true;
		localError = null;
		try {
			pendingImageProject = await convertProjectImage(project, file, {
				suggestPalette: false,
				applyPalette: false,
				applyCells: false,
				replaceSource: true
			});
			pendingFile = file;
		} catch (caught) {
			localError = caught instanceof Error ? caught.message : 'Gambar tidak dapat dibuka.';
		} finally {
			processingImage = false;
		}
	}

	function setPlacement(placement: 'crop' | 'fit') {
		if (!pendingImageProject) return;
		pendingImageProject = { ...pendingImageProject, importSettings: { ...pendingImageProject.importSettings, placement } };
	}

	function cancelImageSetup() {
		pendingFile = null;
		pendingImageProject = null;
	}

	async function applyImage() {
		if (!pendingFile || !pendingImageProject || processingImage || !editable) return;
		processingImage = true;
		localError = null;
		try {
			const next = await convertProjectImage(pendingImageProject, pendingFile, {
				suggestPalette: true,
				applyPalette: true,
				applyCells: true,
				replaceSource: true
			});
			onChange(next);
			if (onSourceImageChange) await onSourceImageChange(pendingFile, next);
			pendingFile = null;
			pendingImageProject = null;
		} catch (caught) {
			localError = caught instanceof Error ? caught.message : 'Hasil pixel belum dapat dibuat.';
		} finally {
			processingImage = false;
		}
	}

	async function exportPdf() {
		exporting = 'Panduan build';
		localError = null;
		try {
			const { createProjectPdfInBackground } = await import('$lib/export/pdf-client');
			const bytes = await createProjectPdfInBackground(project);
			downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${safeFileName(project.name)}-blueprint.pdf`);
			showFinish = false;
		} catch (caught) {
			localError = caught instanceof Error ? caught.message : 'Panduan build tidak dapat dibuat.';
		} finally {
			exporting = null;
		}
	}

	async function exportPng() {
		exporting = 'Gambar pixel';
		localError = null;
		try {
			downloadBlob(await createProjectPng(project, false), `${safeFileName(project.name)}.png`);
			showFinish = false;
		} catch (caught) {
			localError = caught instanceof Error ? caught.message : 'Gambar pixel tidak dapat dibuat.';
		} finally {
			exporting = null;
		}
	}

	function exportOther(kind: 'png-grid' | 'materials' | 'matrix' | 'project') {
		if (kind === 'png-grid') {
			exporting = 'PNG + grid';
			void createProjectPng(project, true)
				.then((blob) => downloadBlob(blob, `${safeFileName(project.name)}-grid.png`))
				.catch(() => (localError = 'PNG + grid tidak dapat dibuat.'))
				.finally(() => (exporting = null));
			return;
		}
		if (kind === 'materials') downloadText(materialListCsv(project), `${safeFileName(project.name)}-materials.csv`, 'text/csv;charset=utf-8');
		else if (kind === 'matrix') downloadText(gridMatrixCsv(project), `${safeFileName(project.name)}-matrix.csv`, 'text/csv;charset=utf-8');
		else downloadText(serializeProject(project), `${safeFileName(project.name)}.pixelgrid.json`, 'application/json');
	}
</script>

<div class:show-advanced={showAdvancedTools} class="player-editor">
	<EditorView
		{project}
		{saveState}
		{globalPalettes}
		{editable}
		{collaboration}
		{onChange}
		{onBack}
		{onCreateGlobalPalette}
		{onDeleteGlobalPalette}
		{onSaveNow}
		{onSourceImageChange}
	/>

	<div class="player-status" class:error={saveState === 'error'}><i></i>{saveLabel}</div>
	<div class="player-meta">{project.widthMm / 10} × {project.heightMm / 10} cm · {project.columns} × {project.rows} grid · tile {project.cellMm / 10} cm</div>
	<button class="more-tools secondary-shell" type="button" aria-pressed={showAdvancedTools} onclick={() => (showAdvancedTools = !showAdvancedTools)}>{showAdvancedTools ? 'Alat dasar' : 'Alat lainnya'}</button>
	<button class="finish-button" type="button" onclick={() => (showFinish = true)}>Selesai</button>

	{#if needsStartChoice && !showImageSetup}
		<div class="start-layer">
			<div class="start-card">
				<p class="eyebrow">MULAI PROYEK</p>
				<h2>Tambahkan gambar atau mulai build.</h2>
				<p>Canvas sudah ditentukan Admin: <strong>{project.widthMm / 10} × {project.heightMm / 10} cm</strong>, grid <strong>{project.columns} × {project.rows}</strong>, tile <strong>{project.cellMm / 10} cm</strong>.</p>
				<div class="start-actions">
					<label class="primary-shell">{processingImage ? 'Membuka gambar…' : 'Upload gambar'}<input class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onchange={chooseImage} disabled={processingImage || !editable} /></label>
					<button class="secondary-shell" type="button" onclick={() => (startedBlank = true)} disabled={!editable}>Mulai build kosong</button>
				</div>
				<small>Ukuran canvas tidak dapat diubah dari mode Player.</small>
			</div>
		</div>
	{/if}

	{#if showImageSetup && pendingImageProject?.sourceImage}
		<div class="start-layer">
			<div class="image-setup-card">
				<div class="setup-heading"><div><p class="eyebrow">ATUR GAMBAR</p><h2>Posisikan gambar di canvas.</h2></div><button type="button" onclick={cancelImageSetup} aria-label="Batal">×</button></div>
				<div class="segmented-shell"><button class:active={pendingImageProject.importSettings.placement === 'crop'} type="button" onclick={() => setPlacement('crop')}>Isi canvas</button><button class:active={pendingImageProject.importSettings.placement === 'fit'} type="button" onclick={() => setPlacement('fit')}>Tampilkan semua</button></div>
				{#if pendingImageProject.importSettings.placement === 'crop'}
					<VisualCropper source={pendingImageProject.sourceImage} crop={pendingImageProject.importSettings.crop} targetAspect={pendingImageProject.columns / pendingImageProject.rows} onChange={(crop) => { if (pendingImageProject) pendingImageProject = { ...pendingImageProject, importSettings: { ...pendingImageProject.importSettings, crop } }; }} />
				{:else}
					<div class="fit-preview"><img src={pendingImageProject.sourceImage.dataUrl} alt="Preview gambar" /></div>
				{/if}
				<p class="setup-helper">Sesuaikan posisi gambar. Setelah dilanjutkan, hasil pixel dan warna dibuat otomatis mengikuti grid proyek.</p>
				<div class="setup-actions"><button class="secondary-shell" type="button" onclick={cancelImageSetup}>Batal</button><button class="primary-shell" type="button" onclick={applyImage} disabled={processingImage}>{processingImage ? 'Membuat hasil…' : 'Gunakan gambar'}</button></div>
			</div>
		</div>
	{/if}

	{#if showFinish}
		<div class="modal-layer-player">
			<button class="backdrop" type="button" aria-label="Tutup" onclick={() => (showFinish = false)}></button>
			<div class="finish-card" role="dialog" aria-modal="true" aria-labelledby="finish-title">
				<div class="finish-heading"><div><small>SELESAI</small><h2 id="finish-title">Apa yang ingin kamu buat?</h2></div><button type="button" onclick={() => (showFinish = false)} aria-label="Tutup">×</button></div>
				<div class="finish-grid">
					<button type="button" onclick={exportPdf} disabled={!!exporting}><strong>Panduan Build</strong><span>PDF berisi grid dan panduan untuk membangun mosaic.</span><b>{exporting === 'Panduan build' ? 'Menyiapkan…' : 'Buat PDF →'}</b></button>
					<button type="button" onclick={exportPng} disabled={!!exporting}><strong>Gambar Pixel</strong><span>Simpan hasil mosaic sebagai gambar PNG.</span><b>{exporting === 'Gambar pixel' ? 'Menyiapkan…' : 'Simpan PNG →'}</b></button>
				</div>
				<details><summary>Export lainnya</summary><div class="advanced-export"><button type="button" onclick={() => exportOther('png-grid')}>PNG + grid</button><button type="button" onclick={() => exportOther('materials')}>CSV material</button><button type="button" onclick={() => exportOther('matrix')}>CSV matriks</button><button type="button" onclick={() => exportOther('project')}>File proyek</button></div></details>
			</div>
		</div>
	{/if}

	{#if localError}<div class="player-error" role="alert"><span>{localError}</span><button type="button" onclick={() => (localError = null)}>×</button></div>{/if}
</div>

<style>
	.player-editor{position:relative;height:100vh;min-height:680px;overflow:hidden}.player-status{position:absolute;z-index:45;top:9px;right:112px;height:38px;display:flex;align-items:center;gap:7px;padding:0 10px;color:#68716c;font-size:12px;font-weight:650;pointer-events:none}.player-status i{width:8px;height:8px;border-radius:50%;background:#17804f}.player-status.error i{background:var(--danger)}.player-meta{position:absolute;z-index:40;left:360px;top:64px;padding:6px 10px;border:1px solid #ded9ca;border-radius:7px;background:rgba(255,253,250,.94);color:#68716c;font-size:11px;box-shadow:0 4px 12px rgba(33,48,47,.05);pointer-events:none}.finish-button{position:absolute;z-index:45;right:16px;top:8px;height:40px;padding:0 16px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:13px;font-weight:700}.more-tools{position:absolute;z-index:45;left:12px;bottom:70px;min-height:36px;padding:0 10px;font-size:11px}.primary-shell,.secondary-shell{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 15px;border-radius:7px;font-size:13px;font-weight:650;cursor:pointer}.primary-shell{border:0;background:var(--forest);color:white}.secondary-shell{border:1px solid #d8d3c6;background:white;color:var(--ink)}.start-layer{position:absolute;z-index:42;inset:56px 0 0;display:grid;place-items:center;padding:24px;background:rgba(244,241,232,.88);backdrop-filter:blur(2px)}.start-card,.image-setup-card{width:min(580px,100%);padding:28px;border:1px solid #ded8c8;border-radius:14px;background:#fffefa;box-shadow:0 18px 48px rgba(33,48,47,.12)}.start-card .eyebrow,.image-setup-card .eyebrow{margin:0 0 8px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.start-card h2,.image-setup-card h2{margin:0;font:650 25px "Readex Pro",sans-serif;letter-spacing:-.025em}.start-card p{margin:10px 0 20px;color:#66746f;font-size:14px;line-height:1.6}.start-card p strong{color:var(--ink)}.start-actions{display:flex;gap:10px;flex-wrap:wrap}.start-card>small{display:block;margin-top:14px;color:#7a827d;font-size:11px;line-height:1.5}.setup-heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:16px}.setup-heading>button{width:38px;height:38px;border:0;background:transparent;font-size:22px}.segmented-shell{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px}.segmented-shell button{min-height:42px;border:1px solid #dbd6ca;background:white;color:#59635d;font-size:12px;font-weight:650}.segmented-shell button:first-child{border-radius:7px 0 0 7px}.segmented-shell button:last-child{border-radius:0 7px 7px 0}.segmented-shell button.active{position:relative;z-index:1;border-color:#6f9b83;background:#eef6f1;color:var(--forest)}.fit-preview{height:260px;display:grid;place-items:center;overflow:hidden;border:1px solid #c9c7c0;border-radius:7px;background:#f4f2ec}.fit-preview img{max-width:100%;max-height:100%;object-fit:contain}.setup-helper{margin:12px 0;color:#66746f;font-size:12px;line-height:1.5}.setup-actions{display:flex;justify-content:flex-end;gap:8px}.modal-layer-player{position:absolute;z-index:120;inset:0;display:grid;place-items:center;padding:20px}.backdrop{position:absolute;inset:0;border:0;background:rgba(24,31,27,.38)}.finish-card{position:relative;width:min(680px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:20px;border:1px solid #d8d3c6;border-radius:12px;background:#fffdfa;box-shadow:0 22px 60px rgba(24,35,29,.24)}.finish-heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:18px}.finish-heading small{color:var(--accent-dark);font-size:10px;font-weight:800;letter-spacing:.14em}.finish-heading h2{margin:3px 0 0;font:650 23px "Readex Pro",sans-serif}.finish-heading>button{width:38px;height:38px;border:0;background:transparent;font-size:22px}.finish-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.finish-grid>button{min-height:160px;display:flex;flex-direction:column;align-items:flex-start;padding:18px;border:1px solid #d8d3c6;border-radius:10px;background:white;text-align:left;color:var(--ink)}.finish-grid>button:hover{border-color:#88aa98;background:#f8fcf9}.finish-grid strong{font:650 17px "Readex Pro",sans-serif}.finish-grid span{margin-top:8px;color:#66746f;font-size:13px;line-height:1.5}.finish-grid b{margin-top:auto;color:var(--forest);font-size:13px}details{margin-top:14px;border-top:1px solid #e5e0d5;padding-top:12px}summary{cursor:pointer;color:#59635d;font-size:13px;font-weight:650}.advanced-export{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.advanced-export button{min-height:36px;padding:0 10px;border:1px solid #d8d3c6;border-radius:6px;background:white;color:#4d5751;font-size:11px}.player-error{position:absolute;z-index:150;left:50%;bottom:20px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:min(560px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.22)}.player-error button{border:0;background:transparent;color:white;font-size:18px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
	.player-editor :global(.metric-chip),.player-editor :global(.save-state),.player-editor :global(.shortcut-button),.player-editor :global(.export-select),.player-editor :global(.editor-header > .export){display:none!important}.player-editor :global(.left-panel .tabs.three){grid-template-columns:1fr 1fr}.player-editor :global(.left-panel .tabs.three button:nth-child(3)){display:none}.player-editor:not(.show-advanced) :global(.tool-rail button:nth-child(1)),.player-editor:not(.show-advanced) :global(.tool-rail button:nth-child(3)),.player-editor:not(.show-advanced) :global(.tool-rail button:nth-child(5)){display:none}.player-editor :global(.viewer-banner){top:48px}
	@media(max-width:900px){.player-meta{left:80px}.player-status{right:102px}.more-tools{bottom:62px}}@media(max-width:620px){.player-meta{display:none}.finish-grid{grid-template-columns:1fr}.player-status{display:none}.start-actions{flex-direction:column}.start-actions>*{width:100%}.setup-actions{flex-direction:column-reverse}.setup-actions>*{width:100%}}
</style>