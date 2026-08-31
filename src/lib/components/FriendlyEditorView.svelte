<script lang="ts">
	import EditorView from '$lib/components/EditorView.svelte';
	import { createProjectPng } from '$lib/export/png';
	import { serializeProject } from '$lib/project';
	import { downloadBlob, downloadText, safeFileName } from '$lib/utils/download';
	import { gridMatrixCsv, materialListCsv } from '$lib/utils/csv';
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
		collaboration?: {
			participants: PresenceParticipant[];
			deviceId: string;
			ownerDeviceId: string;
			activeEditorDeviceId: string | null;
			state: 'connecting' | 'connected' | 'disconnected';
			requestingEdit: boolean;
			revision: number;
			onRequest: () => void;
			onCancelRequest: () => void;
			onGrant: (deviceId: string) => void;
		};
		onSourceImageChange?: (file: File, project: ProjectV2) => Promise<void>;
	};

	let {
		project,
		saveState,
		globalPalettes,
		onChange,
		onBack,
		onCreateGlobalPalette,
		onDeleteGlobalPalette,
		onSaveNow,
		editable = true,
		collaboration,
		onSourceImageChange
	}: Props = $props();

	let showAdvancedTools = $state(false);
	let showExportMenu = $state(false);
	let exporting = $state<string | null>(null);
	let exportError = $state<string | null>(null);
	let soloEditing = $derived(!collaboration || (collaboration.participants.length <= 1 && editable));

	async function exportPdf() {
		exporting = 'Panduan Build';
		exportError = null;
		try {
			const { createProjectPdfInBackground } = await import('$lib/export/pdf-client');
			const bytes = await createProjectPdfInBackground(project);
			downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${safeFileName(project.name)}-blueprint.pdf`);
			showExportMenu = false;
		} catch (caught) {
			exportError = caught instanceof Error ? caught.message : 'Panduan Build tidak dapat dibuat.';
		} finally {
			exporting = null;
		}
	}

	async function exportPng(grid = false) {
		exporting = grid ? 'PNG + grid' : 'Gambar pixel';
		exportError = null;
		try {
			downloadBlob(await createProjectPng(project, grid), `${safeFileName(project.name)}${grid ? '-grid' : ''}.png`);
			showExportMenu = false;
		} catch (caught) {
			exportError = caught instanceof Error ? caught.message : 'Gambar tidak dapat dibuat.';
		} finally {
			exporting = null;
		}
	}

	function exportOther(kind: 'materials' | 'matrix' | 'project') {
		if (kind === 'materials') downloadText(materialListCsv(project), `${safeFileName(project.name)}-materials.csv`, 'text/csv;charset=utf-8');
		else if (kind === 'matrix') downloadText(gridMatrixCsv(project), `${safeFileName(project.name)}-matrix.csv`, 'text/csv;charset=utf-8');
		else downloadText(serializeProject(project), `${safeFileName(project.name)}.pixelgrid.json`, 'application/json');
		showExportMenu = false;
	}
</script>

<div class:advanced-tools={showAdvancedTools} class:solo={soloEditing} class:empty-palette={project.palette.length === 0} class="friendly-editor">
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

	<button
		class="advanced-tools-toggle"
		type="button"
		aria-pressed={showAdvancedTools}
		onclick={() => (showAdvancedTools = !showAdvancedTools)}
	>
		{showAdvancedTools ? 'Alat dasar' : 'Alat lainnya'}
	</button>

	<div class="friendly-export">
		<button class="export-trigger" type="button" aria-expanded={showExportMenu} onclick={() => (showExportMenu = !showExportMenu)} disabled={!!exporting}>
			{exporting ? 'Menyiapkan…' : 'Ekspor'}
		</button>
		{#if showExportMenu}
			<div class="export-menu" role="menu">
				<strong>Ekspor</strong>
				<button type="button" onclick={exportPdf} disabled={!!exporting}><span>Panduan Build</span><small>PDF dengan grid untuk proses build.</small></button>
				<button type="button" onclick={() => exportPng(false)} disabled={!!exporting}><span>Gambar pixel</span><small>Simpan hasil sebagai PNG.</small></button>
				<details>
					<summary>Pilihan lainnya</summary>
					<div class="other-exports">
						<button type="button" onclick={() => exportPng(true)}>PNG + grid</button>
						<button type="button" onclick={() => exportOther('materials')}>CSV material</button>
						<button type="button" onclick={() => exportOther('matrix')}>CSV matriks</button>
						<button type="button" onclick={() => exportOther('project')}>File proyek</button>
					</div>
				</details>
			</div>
		{/if}
	</div>

	{#if exportError}<div class="friendly-error" role="alert"><span>{exportError}</span><button type="button" onclick={() => (exportError = null)}>×</button></div>{/if}
</div>

<style>
	.friendly-editor{position:relative;height:100vh;min-height:680px;overflow:hidden}

	/* Keep the original editor and assets; reduce what appears at once. */
	.friendly-editor.solo :global(.collaboration){display:none!important}
	.friendly-editor :global(.editor-header .export-select),
	.friendly-editor :global(.editor-header > .export){display:none!important}

	.friendly-editor :global(.left-panel .panel-title strong){font-size:0}
	.friendly-editor :global(.left-panel .panel-title strong)::after{content:'Gambar';font:650 15px "Readex Pro",sans-serif}
	.friendly-editor :global(.left-panel .tabs.three){grid-template-columns:1fr 1fr}
	.friendly-editor :global(.left-panel .tabs.three button:nth-child(3)){display:none}
	.friendly-editor :global(.left-panel .tabs.three button:nth-child(1)),
	.friendly-editor :global(.left-panel .tabs.three button:nth-child(2)){font-size:0}
	.friendly-editor :global(.left-panel .tabs.three button:nth-child(1))::after{content:'Gambar';font-size:12px}
	.friendly-editor :global(.left-panel .tabs.three button:nth-child(2))::after{content:'Pengaturan gambar';font-size:12px}
	.friendly-editor :global(.left-panel .summary-card){display:none!important}
	.friendly-editor :global(.left-panel .reconstruction-update strong),
	.friendly-editor :global(.left-panel .reconstruction-update small),
	.friendly-editor :global(.left-panel .reconstruction-update button){font-size:0}
	.friendly-editor :global(.left-panel .reconstruction-update strong)::after{content:'Gambar telah diubah';font-size:13px}
	.friendly-editor :global(.left-panel .reconstruction-update small)::after{content:'Perbarui canvas untuk menggunakan perubahan terbaru.';font-size:11px}
	.friendly-editor :global(.left-panel .reconstruction-update button)::after{content:'Perbarui hasil';font-size:13px}

	.friendly-editor:not(.advanced-tools) :global(.tool-rail button:nth-child(1)),
	.friendly-editor:not(.advanced-tools) :global(.tool-rail button:nth-child(3)),
	.friendly-editor:not(.advanced-tools) :global(.tool-rail button:nth-child(5)){display:none!important}
	.advanced-tools-toggle{position:absolute;z-index:70;left:282px;bottom:82px;min-height:36px;padding:0 10px;border:1px solid #d8d3c6;border-radius:7px;background:#fff;color:var(--ink);font-size:11px;font-weight:700;box-shadow:0 7px 18px rgba(31,43,36,.08)}

	.friendly-editor :global(.right-panel .panel-title strong){font-size:0}
	.friendly-editor :global(.right-panel .panel-title strong)::after{content:'Warna';font:650 15px "Readex Pro",sans-serif}
	.friendly-editor.empty-palette :global(.right-panel .tabs button:nth-child(2)){display:none}
	.friendly-editor.empty-palette :global(.right-panel .tabs){grid-template-columns:1fr}
	.friendly-editor.empty-palette :global(.right-panel .panel-empty){font-size:0}
	.friendly-editor.empty-palette :global(.right-panel .panel-empty)::after{content:'Belum ada warna. Tambah warna untuk mulai mengisi canvas.';font-size:13px;line-height:1.5}
	.friendly-editor :global(.right-panel .secondary.wide){font-size:0}
	.friendly-editor :global(.right-panel .secondary.wide)::after{content:'Kelola warna';font-size:13px}

	.friendly-export{position:absolute;z-index:90;right:15px;top:8px}
	.export-trigger{height:40px;padding:0 16px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:13px;font-weight:750}
	.export-menu{position:absolute;right:0;top:46px;width:310px;padding:12px;border:1px solid #d8d3c6;border-radius:10px;background:#fffdfa;box-shadow:0 18px 45px rgba(24,35,29,.2)}
	.export-menu>strong{display:block;margin:2px 3px 10px;font:650 15px "Readex Pro",sans-serif}
	.export-menu>button{width:100%;min-height:66px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:10px 12px;border:1px solid #ddd8cc;border-radius:8px;background:white;text-align:left;color:var(--ink);margin-top:8px}
	.export-menu>button:hover{border-color:#8daf9d;background:#f5faf7}
	.export-menu>button span{font-size:13px;font-weight:750}
	.export-menu>button small{margin-top:3px;color:#66746f;font-size:11px}
	.export-menu details{margin-top:10px;padding-top:9px;border-top:1px solid #e7e2d7}
	.export-menu summary{cursor:pointer;color:#59635d;font-size:12px;font-weight:700}
	.other-exports{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
	.other-exports button{min-height:36px;border:1px solid #ddd8cc;border-radius:6px;background:white;color:#4d5751;font-size:10px}

	.friendly-error{position:absolute;z-index:150;left:50%;bottom:20px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:min(560px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.22)}
	.friendly-error button{border:0;background:transparent;color:white;font-size:18px}

	@media(max-width:900px){.advanced-tools-toggle{left:12px}.friendly-export{right:10px}}
</style>