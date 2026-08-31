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
	let startMode = $state<'image' | 'blank'>('image');
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
	let saveLabel = $derived(saveState === 'saving' ? 'Menyimpan…' : saveState === 'error' ? 'Gagal menyimpan' : 'Tersimpan');

	async function chooseImageFile(file?: File) {
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
			startMode = 'image';
		} catch (caught) {
			localError = caught instanceof Error ? caught.message : 'Gambar tidak dapat dibuka.';
		} finally {
			processingImage = false;
		}
	}

	function chooseImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		void chooseImageFile(file);
	}

	function dropImage(event: DragEvent) {
		event.preventDefault();
		void chooseImageFile(event.dataTransfer?.files?.[0]);
	}

	function setPlacement(placement: 'crop' | 'fit') {
		if (!pendingImageProject) return;
		pendingImageProject = { ...pendingImageProject, importSettings: { ...pendingImageProject.importSettings, placement } };
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

	function startBlankBuild() {
		if (!editable) return;
		pendingFile = null;
		pendingImageProject = null;
		startedBlank = true;
	}

	async function exportPdf() {
		exporting = 'Panduan Build';
		localError = null;
		try {
			const { createProjectPdfInBackground } = await import('$lib/export/pdf-client');
			const bytes = await createProjectPdfInBackground(project);
			downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${safeFileName(project.name)}-blueprint.pdf`);
			showFinish = false;
		} catch (caught) {
			localError = caught instanceof Error ? caught.message : 'Panduan Build tidak dapat dibuat.';
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

{#if needsStartChoice}
	<div class="project-start">
		<header class="start-topbar">
			<a class="start-brand" href="/" onclick={(event) => { event.preventDefault(); onBack(); }} aria-label="Kembali ke daftar proyek">
				<img src="/mivubi-logo.png" alt="" width="36" height="36" />
				<span><strong>MIVUBI</strong><small>PIXEL MOSAIC PLANNER</small></span>
			</a>
			<nav aria-label="Navigasi utama"><a class="active" href="/" onclick={(event) => { event.preventDefault(); onBack(); }}>Proyek</a></nav>
		</header>

		<main class="start-main">
			<section class="intro">
				<p class="eyebrow">MIVUBI · PIXEL MOSAIC PLANNER</p>
				<h1>Dari gambar ke <em>grid presisi.</em></h1>
				<p>Pilih cara memulai, lalu lanjutkan ke editor.</p>
			</section>

			<section class="quick-start" aria-label="Mulai proyek">
				<div class="setup-card">
					<div class="mode-tabs" role="tablist" aria-label="Cara memulai">
						<button class:active={startMode === 'image'} type="button" role="tab" aria-selected={startMode === 'image'} onclick={() => (startMode = 'image')}><span>▧</span>Dari gambar</button>
						<button class:active={startMode === 'blank'} type="button" role="tab" aria-selected={startMode === 'blank'} onclick={() => (startMode = 'blank')}><span>▦</span>Build langsung</button>
					</div>

					{#if startMode === 'image'}
						<label class:has-file={!!pendingFile} class="dropzone" ondragover={(event) => event.preventDefault()} ondrop={dropImage}>
							<input class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onchange={chooseImage} disabled={processingImage || !editable} />
							<span class="upload-icon">↥</span>
							<strong>{pendingFile ? pendingFile.name : 'Unggah gambar atau seret ke sini'}</strong>
							<small>{pendingFile ? 'Klik untuk mengganti gambar' : 'PNG, JPG, WEBP · Maks. 20 MB'}</small>
						</label>
					{:else}
						<div class="blank-choice"><span>▦</span><div><strong>Mulai dari canvas kosong</strong><small>Langsung isi tile satu per satu di editor.</small></div></div>
					{/if}

					<div class="project-field"><small>PROYEK</small><strong>{project.name}</strong></div>

					<div class="canvas-summary">
						<span><b>▧</b><strong><small>Canvas</small>{project.widthMm / 10} × {project.heightMm / 10} cm</strong></span>
						<span><b>▦</b><strong><small>Grid Canvas</small>{project.columns} kolom × {project.rows} baris</strong></span>
						<span><b>▥</b><strong><small>Ukuran 1 Tile</small>{project.cellMm / 10} × {project.cellMm / 10} cm</strong></span>
					</div>

					{#if startMode === 'image'}
						<button class="primary-button" type="button" onclick={applyImage} disabled={!pendingFile || !pendingImageProject || processingImage || !editable}>{processingImage ? 'Membuat hasil…' : 'Gunakan gambar'} <span>→</span></button>
					{:else}
						<button class="primary-button" type="button" onclick={startBlankBuild} disabled={!editable}>Mulai build <span>→</span></button>
					{/if}
				</div>

				<aside class="visual-card" aria-label="Preview proyek">
					{#if startMode === 'image' && pendingImageProject?.sourceImage}
						<div class="preview-heading"><strong>Atur gambar</strong><span>Gambar sumber</span></div>
						<div class="segmented"><button class:active={pendingImageProject.importSettings.placement === 'crop'} type="button" onclick={() => setPlacement('crop')}>Isi canvas</button><button class:active={pendingImageProject.importSettings.placement === 'fit'} type="button" onclick={() => setPlacement('fit')}>Tampilkan semua</button></div>
						{#if pendingImageProject.importSettings.placement === 'crop'}
							<VisualCropper source={pendingImageProject.sourceImage} crop={pendingImageProject.importSettings.crop} targetAspect={pendingImageProject.columns / pendingImageProject.rows} onChange={(crop) => { if (pendingImageProject) pendingImageProject = { ...pendingImageProject, importSettings: { ...pendingImageProject.importSettings, crop } }; }} />
						{:else}
							<div class="fit-preview"><img src={pendingImageProject.sourceImage.dataUrl} alt="Preview gambar yang dipilih" /></div>
						{/if}
						<p>Atur posisi gambar sebelum digunakan.</p>
					{:else}
						<div class="preview-heading"><strong>Preview · {project.columns} × {project.rows}</strong><span>Grid fisik</span></div>
						<div class="dimension width"><i></i><span>{project.widthMm / 10} cm</span><i></i></div>
						<div class="preview-row"><div class="grid-stage" style={`--preview-columns:${project.columns};--preview-rows:${project.rows}`}><div class="grid-overlay"></div></div><div class="dimension height"><i></i><span>{project.heightMm / 10} cm</span><i></i></div></div>
						<p>{startMode === 'image' ? 'Gambar akan disesuaikan dengan grid proyek dan diubah menjadi pixel art.' : 'Canvas siap digunakan untuk build langsung.'}</p>
					{/if}
				</aside>
			</section>
		</main>

		{#if localError}<div class="player-error" role="alert"><span>{localError}</span><button type="button" onclick={() => (localError = null)}>×</button></div>{/if}
	</div>
{:else}
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
		<button class="more-tools secondary-shell" type="button" aria-pressed={showAdvancedTools} onclick={() => (showAdvancedTools = !showAdvancedTools)}>{showAdvancedTools ? 'Alat dasar' : 'Alat lainnya'}</button>
		<button class="finish-button" type="button" onclick={() => (showFinish = true)}>Selesai</button>

		{#if showFinish}
			<div class="modal-layer-player">
				<button class="backdrop" type="button" aria-label="Tutup" onclick={() => (showFinish = false)}></button>
				<div class="finish-card" role="dialog" aria-modal="true" aria-labelledby="finish-title">
					<div class="finish-heading"><div><small>SELESAI</small><h2 id="finish-title">Apa yang ingin kamu buat?</h2></div><button type="button" onclick={() => (showFinish = false)} aria-label="Tutup">×</button></div>
					<div class="finish-grid">
						<button type="button" onclick={exportPdf} disabled={!!exporting}><strong>Panduan Build</strong><span>PDF berisi grid untuk membantu proses build.</span><b>{exporting === 'Panduan Build' ? 'Menyiapkan…' : 'Buat PDF →'}</b></button>
						<button type="button" onclick={exportPng} disabled={!!exporting}><strong>Gambar pixel</strong><span>Simpan hasil pixel sebagai gambar PNG.</span><b>{exporting === 'Gambar pixel' ? 'Menyiapkan…' : 'Simpan PNG →'}</b></button>
					</div>
					<details><summary>Ekspor lainnya</summary><div class="advanced-export"><button type="button" onclick={() => exportOther('png-grid')}>PNG + grid</button><button type="button" onclick={() => exportOther('materials')}>CSV material</button><button type="button" onclick={() => exportOther('matrix')}>CSV matriks</button><button type="button" onclick={() => exportOther('project')}>File proyek</button></div></details>
				</div>
			</div>
		{/if}

		{#if localError}<div class="player-error" role="alert"><span>{localError}</span><button type="button" onclick={() => (localError = null)}>×</button></div>{/if}
	</div>
{/if}

<style>
	.project-start{min-height:100vh;background:transparent;color:var(--ink)}.start-topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:34px;background:rgba(254,252,245,.94);position:sticky;top:0;z-index:30}.start-brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);padding-right:32px;border-right:1px solid var(--line)}.start-brand img{width:36px;height:36px;image-rendering:pixelated}.start-brand>span{display:flex;flex-direction:column;line-height:1}.start-brand strong{font:700 17px "Readex Pro",sans-serif;letter-spacing:.12em}.start-brand small{margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.16em}.start-topbar nav{margin-right:auto;height:100%;display:flex;align-items:center}.start-topbar nav a{height:100%;display:flex;align-items:center;color:var(--ink);font-size:14px;font-weight:650;text-decoration:none;border-bottom:2px solid var(--forest)}.start-main{max-width:1440px;margin:auto;padding:34px clamp(24px,5vw,72px) 72px}.intro{margin-bottom:20px}.eyebrow{margin:0 0 9px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.intro h1{margin:0;font:700 clamp(36px,4vw,52px)/1.05 "Readex Pro",sans-serif;letter-spacing:-.045em}.intro h1 em{font-style:normal;color:var(--forest)}.intro>p:last-child{margin:10px 0 0;color:var(--muted);font-size:16px}.quick-start{display:grid;grid-template-columns:minmax(360px,40%) 1fr;border:1px solid #ded8c8;border-radius:14px;background:white;box-shadow:0 16px 45px rgba(33,48,47,.07);overflow:hidden}.setup-card{padding:28px;border-right:1px solid #e2ddcf}.mode-tabs{display:grid;grid-template-columns:1fr 1fr;margin-bottom:18px}.mode-tabs button{min-height:48px;border:1px solid #d8d3c5;background:#fbfaf5;color:#4d5651;font-size:14px;font-weight:700}.mode-tabs button:first-child{border-radius:8px 0 0 8px}.mode-tabs button:last-child{border-radius:0 8px 8px 0}.mode-tabs button.active{position:relative;z-index:1;border-color:#6f9b83;background:#eef6f1;color:var(--forest)}.mode-tabs span{margin-right:9px;font-size:18px}.dropzone{min-height:116px;border:1px dashed #9fa8a1;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;margin-bottom:14px;cursor:pointer;background:#fdfdfb}.dropzone.has-file{border-style:solid;border-color:#78a18b;background:#f1f7f3}.upload-icon{font-size:28px;line-height:1;color:var(--forest)}.dropzone strong{margin-top:6px;font-size:14px}.dropzone small{margin-top:4px;color:var(--muted);font-size:12px}.blank-choice{min-height:116px;margin-bottom:14px;padding:18px;border:1px solid #d9d5ca;border-radius:9px;background:#fdfdfb;display:flex;align-items:center;gap:14px}.blank-choice>span{font-size:28px;color:var(--forest)}.blank-choice>div{display:flex;flex-direction:column}.blank-choice strong{font-size:14px}.blank-choice small{margin-top:4px;color:var(--muted);font-size:12px}.project-field{margin-bottom:14px;padding:10px 12px;border:1px solid #d9d5ca;border-radius:7px;background:white;display:flex;flex-direction:column}.project-field small{color:#7a827d;font-size:10px;font-weight:750;letter-spacing:.08em}.project-field strong{margin-top:2px;font:650 14px "Readex Pro",sans-serif}.canvas-summary{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #bad2c5;border-radius:8px;background:#eef6f1;margin:5px 0 14px}.canvas-summary>span{min-width:0;display:flex;align-items:center;gap:8px;padding:10px}.canvas-summary>span+span{border-left:1px solid #c8dbd1}.canvas-summary b{color:var(--forest);font-size:16px}.canvas-summary strong{min-width:0;display:flex;flex-direction:column;color:var(--forest);font:700 12px/1.35 "Readex Pro",sans-serif}.canvas-summary small{margin-bottom:2px;font:600 9px Poppins,sans-serif;color:#63756b}.primary-button{width:100%;min-height:46px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:14px;font-weight:750}.primary-button span{margin-left:16px;font-size:18px}.primary-button:disabled{opacity:.48;cursor:not-allowed}.visual-card{min-width:0;padding:28px 30px 22px;background:#fffefa}.preview-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:14px}.preview-heading span{color:var(--muted);font-size:12px}.dimension{display:flex;align-items:center;color:#505953;font-size:12px}.dimension i{height:1px;background:#aeb5b0;flex:1}.dimension span{padding:0 12px}.preview-row{display:grid;grid-template-columns:minmax(0,1fr) 32px;align-items:stretch;gap:8px;margin-top:10px}.grid-stage{position:relative;width:100%;aspect-ratio:var(--preview-columns)/var(--preview-rows);max-height:450px;border:1px solid #aeb8b1;background:#fff;overflow:hidden}.grid-overlay{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(40,67,54,.18) 1px,transparent 1px),linear-gradient(to bottom,rgba(40,67,54,.18) 1px,transparent 1px);background-size:calc(100% / var(--preview-columns)) calc(100% / var(--preview-rows));background-color:rgba(250,250,246,.18)}.height{writing-mode:vertical-rl}.height i{width:1px;height:auto}.visual-card>p{margin:14px 0 0;color:var(--muted);font-size:13px}.segmented{display:grid;grid-template-columns:1fr 1fr;margin-bottom:12px}.segmented button{min-height:42px;border:1px solid #dbd6ca;background:#fff;color:#59635d;font-size:12px;font-weight:650}.segmented button:first-child{border-radius:7px 0 0 7px}.segmented button:last-child{border-radius:0 7px 7px 0}.segmented button.active{position:relative;z-index:1;border-color:#6f9b83;background:#eef6f1;color:var(--forest)}.fit-preview{height:320px;display:grid;place-items:center;overflow:hidden;border:1px solid #c9c7c0;border-radius:7px;background:#f4f2ec}.fit-preview img{max-width:100%;max-height:100%;object-fit:contain}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
	.player-editor{position:relative;height:100vh;min-height:680px;overflow:hidden}.player-status{position:absolute;z-index:45;top:9px;right:112px;height:38px;display:flex;align-items:center;gap:7px;padding:0 10px;color:#68716c;font-size:12px;font-weight:650;pointer-events:none}.player-status i{width:8px;height:8px;border-radius:50%;background:#17804f}.player-status.error i{background:var(--danger)}.finish-button{position:absolute;z-index:45;right:16px;top:8px;height:40px;padding:0 16px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:13px;font-weight:700}.more-tools{position:absolute;z-index:45;left:12px;bottom:70px;min-height:36px;padding:0 10px;font-size:11px}.secondary-shell{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 15px;border:1px solid #d8d3c6;border-radius:7px;background:white;color:var(--ink);font-size:13px;font-weight:650;cursor:pointer}.modal-layer-player{position:absolute;z-index:120;inset:0;display:grid;place-items:center;padding:20px}.backdrop{position:absolute;inset:0;border:0;background:rgba(24,31,27,.38)}.finish-card{position:relative;width:min(680px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:20px;border:1px solid #d8d3c6;border-radius:12px;background:#fffdfa;box-shadow:0 22px 60px rgba(24,35,29,.24)}.finish-heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:18px}.finish-heading small{color:var(--accent-dark);font-size:10px;font-weight:800;letter-spacing:.14em}.finish-heading h2{margin:3px 0 0;font:650 23px "Readex Pro",sans-serif}.finish-heading>button{width:38px;height:38px;border:0;background:transparent;font-size:22px}.finish-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.finish-grid>button{min-height:160px;display:flex;flex-direction:column;align-items:flex-start;padding:18px;border:1px solid #d8d3c6;border-radius:10px;background:white;text-align:left;color:var(--ink)}.finish-grid>button:hover{border-color:#88aa98;background:#f8fcf9}.finish-grid strong{font:650 17px "Readex Pro",sans-serif}.finish-grid span{margin-top:8px;color:#66746f;font-size:13px;line-height:1.5}.finish-grid b{margin-top:auto;color:var(--forest);font-size:13px}details{margin-top:14px;border-top:1px solid #e5e0d5;padding-top:12px}summary{cursor:pointer;color:#59635d;font-size:13px;font-weight:650}.advanced-export{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.advanced-export button{min-height:36px;padding:0 10px;border:1px solid #d8d3c6;border-radius:6px;background:white;color:#4d5751;font-size:11px}.player-error{position:fixed;z-index:150;left:50%;bottom:20px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:min(560px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.22)}.player-error button{border:0;background:transparent;color:white;font-size:18px}
	.player-editor :global(.metric-chip),.player-editor :global(.save-state),.player-editor :global(.shortcut-button),.player-editor :global(.export-select),.player-editor :global(.editor-header > .export){display:none!important}.player-editor :global(.left-panel .tabs.three){grid-template-columns:1fr 1fr}.player-editor :global(.left-panel .tabs.three button:nth-child(3)){display:none}.player-editor:not(.show-advanced) :global(.tool-rail button:nth-child(1)),.player-editor:not(.show-advanced) :global(.tool-rail button:nth-child(3)),.player-editor:not(.show-advanced) :global(.tool-rail button:nth-child(5)),.player-editor:not(.show-advanced) :global(.panel-picker){display:none!important}.player-editor :global(.viewer-banner){top:48px}
	@media(max-width:980px){.quick-start{grid-template-columns:1fr}.setup-card{border-right:0;border-bottom:1px solid #e2ddcf}.visual-card{min-height:420px}}@media(max-width:680px){.start-topbar{padding:0 16px;gap:12px}.start-brand{padding-right:0;border:0}.start-brand small,.start-topbar nav{display:none}.start-main{padding:24px 16px 56px}.intro h1{font-size:34px}.intro>p:last-child{font-size:14px}.setup-card,.visual-card{padding:20px}.canvas-summary{grid-template-columns:1fr}.canvas-summary>span+span{border-left:0;border-top:1px solid #c8dbd1}.preview-row{grid-template-columns:1fr}.height{display:none}.finish-grid{grid-template-columns:1fr}.player-status{display:none}}
</style>