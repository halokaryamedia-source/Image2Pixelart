<script lang="ts">
	import EditorView from '$lib/components/EditorView.svelte';
	import type { GlobalPalette, ProjectV2 } from '$lib/types';
	import { cmToMm, resizeGridCells, validateGridMm } from '$lib/utils/grid';

	type Props = {
		project: ProjectV2;
		saveState: 'saved' | 'saving' | 'error';
		globalPalettes: GlobalPalette[];
		onChange: (project: ProjectV2) => void;
		onBack: () => void;
		onExitAdmin: () => void | Promise<void>;
		onCreateGlobalPalette: (input: { name: string; colors: Array<{ hex: string; name?: string }> }) => Promise<void>;
		onDeleteGlobalPalette: (id: string) => Promise<void>;
		onSaveNow?: () => Promise<void>;
		onSourceImageChange?: (file: File, project: ProjectV2) => Promise<void>;
		editable?: boolean;
	};

	let {
		project,
		saveState,
		globalPalettes,
		onChange,
		onBack,
		onExitAdmin,
		onCreateGlobalPalette,
		onDeleteGlobalPalette,
		onSaveNow,
		onSourceImageChange,
		editable = true
	}: Props = $props();

	let showCanvasSettings = $state(false);
	let canvasWidthCm = $state(1);
	let canvasHeightCm = $state(1);
	let canvasCellCm = $state(1);
	let adminNotice = $state<string | null>(null);
	let validation = $derived(validateGridMm(cmToMm(canvasWidthCm), cmToMm(canvasHeightCm), cmToMm(canvasCellCm)));

	function openCanvasSettings() {
		canvasWidthCm = project.widthMm / 10;
		canvasHeightCm = project.heightMm / 10;
		canvasCellCm = project.cellMm / 10;
		adminNotice = null;
		showCanvasSettings = true;
	}

	function validationMessage() {
		return validation.reason?.replace('Ukuran tile', 'Ukuran sel') ?? '';
	}

	function applyCanvasSize(event: SubmitEvent) {
		event.preventDefault();
		if (!editable || !validation.valid) return;

		const widthMm = cmToMm(canvasWidthCm);
		const heightMm = cmToMm(canvasHeightCm);
		const cellMm = cmToMm(canvasCellCm);
		if (widthMm === project.widthMm && heightMm === project.heightMm && cellMm === project.cellMm) {
			showCanvasSettings = false;
			return;
		}

		const gridChanged = validation.columns !== project.columns || validation.rows !== project.rows;
		const cells = gridChanged
			? resizeGridCells(project.cells, project.columns, project.rows, validation.columns, validation.rows)
			: project.cells.slice();

		onChange({
			...project,
			widthMm,
			heightMm,
			cellMm,
			columns: validation.columns,
			rows: validation.rows,
			cells,
			updatedAt: new Date().toISOString()
		});

		showCanvasSettings = false;
		adminNotice = project.sourceImage && gridChanged
			? 'Ukuran Canvas berubah. Perbarui Pixel Art dari Gambar untuk melihat hasil terbaru.'
			: `Ukuran Canvas diubah menjadi Grid ${validation.columns} × ${validation.rows}.`;
	}
</script>

<div class="admin-editor-shell">
	<EditorView
		{project}
		{saveState}
		{globalPalettes}
		{editable}
		onChange={onChange}
		onBack={onBack}
		onSaveNow={onSaveNow}
		onCreateGlobalPalette={onCreateGlobalPalette}
		onDeleteGlobalPalette={onDeleteGlobalPalette}
		onSourceImageChange={onSourceImageChange}
	/>

	<div class="admin-toolbar" aria-label="Mode Admin">
		<span>MODE ADMIN</span>
		<button type="button" onclick={openCanvasSettings} disabled={!editable}>Ukuran Canvas</button>
		<button type="button" onclick={onExitAdmin}>Akses Umum</button>
	</div>

	{#if adminNotice}<div class="admin-notice" role="status">{adminNotice}</div>{/if}

	{#if showCanvasSettings}
		<div class="modal-layer">
			<button class="modal-backdrop" type="button" onclick={() => (showCanvasSettings = false)} aria-label="Tutup Pengaturan Canvas"></button>
			<form class="modal-card" onsubmit={applyCanvasSize} role="dialog" aria-modal="true" aria-labelledby="admin-canvas-title">
				<div class="modal-heading">
					<div><small>MODE ADMIN</small><h2 id="admin-canvas-title">Ukuran Canvas</h2></div>
					<button type="button" onclick={() => (showCanvasSettings = false)} aria-label="Tutup">×</button>
				</div>
				<p>Atur ukuran fisik dan ukuran sel. Ukuran Grid dihitung otomatis.</p>
				<div class="field-grid">
					<label class="field"><span>Lebar</span><div><input type="number" bind:value={canvasWidthCm} step="0.1" min="0.1" /><b>cm</b></div></label>
					<label class="field"><span>Tinggi</span><div><input type="number" bind:value={canvasHeightCm} step="0.1" min="0.1" /><b>cm</b></div></label>
				</div>
				<label class="field"><span>Ukuran Sel</span><div><input type="number" bind:value={canvasCellCm} step="0.1" min="0.1" /><b>cm</b></div></label>
				<div class="size-result">
					<span><small>UKURAN GRID</small><strong>{validation.valid ? `${validation.columns} × ${validation.rows}` : 'Tidak valid'}</strong></span>
					<span><small>TOTAL SEL</small><strong>{validation.valid ? validation.total.toLocaleString('id-ID') : '—'}</strong></span>
				</div>
				{#if !validation.valid}<p class="error-text">{validationMessage()}{#if validation.suggestionsCm.length} Coba {validation.suggestionsCm.join(', ')} cm.{/if}</p>{/if}
				<div class="modal-actions">
					<button class="secondary" type="button" onclick={() => (showCanvasSettings = false)}>Batal</button>
					<button class="primary" type="submit" disabled={!validation.valid || !editable}>Terapkan Ukuran</button>
				</div>
			</form>
		</div>
	{/if}
</div>

<style>
	.admin-editor-shell{position:relative;min-height:100vh}.admin-toolbar{position:fixed;z-index:90;right:16px;top:64px;display:flex;align-items:center;gap:7px;padding:7px;border:1px solid #d8d3c6;border-radius:9px;background:#fffdfa;box-shadow:0 10px 26px rgba(31,43,36,.12)}.admin-toolbar>span{padding:0 7px;color:var(--forest);font-size:9px;font-weight:850;letter-spacing:.12em}.admin-toolbar button{height:36px;padding:0 11px;border:1px solid #d8d3c6;border-radius:7px;background:white;color:var(--ink);font-size:11px;font-weight:700}.admin-toolbar button:first-of-type{border-color:#79a18b;background:#edf6f1;color:var(--forest)}.admin-toolbar button:disabled{opacity:.45;cursor:not-allowed}.admin-notice{position:fixed;z-index:89;right:16px;top:112px;max-width:360px;padding:9px 11px;border:1px solid #d7bd80;border-radius:8px;background:#fff8e7;color:#746344;font-size:11px;box-shadow:0 8px 22px rgba(31,43,36,.08)}.modal-layer{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:18px}.modal-backdrop{position:absolute;inset:0;border:0;background:rgba(24,31,27,.52);backdrop-filter:blur(3px)}.modal-card{position:relative;width:min(460px,100%);max-height:calc(100vh - 36px);overflow:auto;padding:24px;border:1px solid #d3cec1;border-radius:12px;background:#fffdfa;box-shadow:0 28px 80px rgba(22,29,25,.28)}.modal-heading{display:flex;align-items:flex-start;justify-content:space-between}.modal-heading small{color:var(--forest);font-size:10px;font-weight:800;letter-spacing:.14em}.modal-heading h2{margin:4px 0 0;font:650 25px "Readex Pro",sans-serif}.modal-heading>button{width:40px;height:40px;border:1px solid #ddd8cc;border-radius:7px;background:white;font-size:20px}.modal-card>p{color:var(--muted);font-size:13px;line-height:1.5}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{display:block;margin-bottom:13px}.field>span{display:block;margin-bottom:6px;color:#59625d;font-size:12px;font-weight:700}.field>div{position:relative}.field input{width:100%;height:43px;border:1px solid #d8d3c6;border-radius:7px;background:white;padding:0 42px 0 10px;color:var(--ink);font-size:13px}.field b{position:absolute;right:10px;top:13px;color:var(--muted);font-size:11px}.size-result{display:grid;grid-template-columns:1fr 1fr;margin-top:8px;border:1px solid #bcd2c6;border-radius:8px;background:#edf6f1}.size-result span{padding:12px}.size-result span+span{border-left:1px solid #c6d8ce}.size-result small{display:block;color:#65776d;font-size:10px}.size-result strong{display:block;margin-top:4px;color:var(--forest);font-size:18px}.error-text{color:var(--danger)!important}.modal-actions{display:grid;grid-template-columns:1fr 1.5fr;gap:8px;margin-top:18px}.modal-actions button{min-height:42px;border-radius:7px;font-size:13px;font-weight:650}.secondary{border:1px solid #d8d3c6;background:white;color:var(--ink)}.primary{border:0;background:var(--forest);color:white}.primary:disabled{opacity:.45;cursor:not-allowed}@media(max-width:700px){.admin-toolbar{right:8px;top:62px;max-width:calc(100vw - 16px);overflow-x:auto}.admin-toolbar>span{display:none}.admin-notice{right:8px;top:108px;max-width:calc(100vw - 16px)}.field-grid{grid-template-columns:1fr}.modal-card{padding:18px}}
</style>
