<script lang="ts">
	import MosaicCanvas from '$lib/components/MosaicCanvas.svelte';
	import VisualCropper from '$lib/components/VisualCropper.svelte';
	import { EditHistory } from '$lib/history';
	import { convertImageFile } from '$lib/image-converter';
	import { cloneProject, serializeProject } from '$lib/project';
	import type { CellPatch, EditorTool, ProjectV2 } from '$lib/types';
	import { EMPTY_CELL } from '$lib/types';
	import { createProjectPng } from '$lib/export/png';
	import { downloadBlob, downloadText, fileToDataUrl, safeFileName } from '$lib/utils/download';
	import { floodFillIndices, countSlots } from '$lib/utils/grid';
	import { gridMatrixCsv, materialListCsv } from '$lib/utils/csv';
	import { normalizeHex } from '$lib/utils/color';
	import { centeredCropRect } from '$lib/utils/image-crop';
	import { removePaletteSlot } from '$lib/utils/palette';

	type Props = { project: ProjectV2; saveState: 'saved' | 'saving' | 'error'; onChange: (project: ProjectV2) => void; onBack: () => void };
	let { project, saveState, onChange, onBack }: Props = $props();
	let tool = $state<EditorTool>('pencil');
	let activeSlot = $state(-1);
	let zoom = $state(1);
	let showGrid = $state(true);
	let panel = $state<'import' | 'palette'>('import');
	type ExportFormat = 'pdf' | 'png' | 'png-grid' | 'materials-csv' | 'matrix-csv' | 'project';
	let exportFormat = $state<ExportFormat>('pdf');
	let processing = $state(false);
	let exporting = $state<string | null>(null);
	let notice = $state<string | null>(null);
	let error = $state<string | null>(null);
	let newHex = $state('#000000');
	let stale = $state(false);
	let conversionGeneration = 0;
	let initializedProject = '';
	const history = new EditHistory();
	let historyVersion = $state(0);
	let strokeBefore = new Map<number, number>();
	let structuralSnapshots = new Map<string, { before: ProjectV2; after: ProjectV2 }>();

	let canUndo = $derived.by(() => historyVersion >= 0 && history.canUndo);
	let canRedo = $derived.by(() => historyVersion >= 0 && history.canRedo);
	let counts = $derived(countSlots(project.cells, project.palette.length));
	let filledCount = $derived(counts.reduce((sum, count) => sum + count, 0));
	let emptyCount = $derived(project.cells.length - filledCount);
	let pageCount = $derived(1 + Math.ceil(project.columns / 24) * Math.ceil(project.rows / 24));

	$effect(() => {
		if (initializedProject !== project.id) {
			activeSlot = project.palette.length ? 0 : -1;
			initializedProject = project.id; stale = false;
		}
	});

	function update(next: ProjectV2) { onChange({ ...next, updatedAt: new Date().toISOString() }); }
	function flash(message: string) { notice = message; setTimeout(() => { if (notice === message) notice = null; }, 2_800); }

	function commitStructural(before: ProjectV2, after: ProjectV2, labelText: string) {
		const label = `${labelText}:${Date.now()}:${Math.random()}`;
		const indices = Uint32Array.from({ length: before.cells.length }, (_, index) => index);
		history.push({ indices, before: before.cells.slice(), after: after.cells.slice(), label });
		structuralSnapshots.set(label, { before: cloneProject(before), after: cloneProject(after) });
		historyVersion += 1; update(after);
	}

	function applyCellPatch(indices: Uint32Array, nextSlot: number, label: string) {
		if (indices.length === 0) return;
		const cells = project.cells.slice(); const changed: number[] = []; const before: number[] = [];
		indices.forEach((index) => { if (cells[index] === nextSlot) return; changed.push(index); before.push(cells[index]); cells[index] = nextSlot; });
		if (!changed.length) return;
		history.push({ indices: Uint32Array.from(changed), before: Uint16Array.from(before), after: Uint16Array.from({ length: changed.length }, () => nextSlot), label });
		historyVersion += 1; update({ ...project, cells });
	}

	function paint(indices: Uint32Array, slot: number, phase: 'start' | 'move' | 'end') {
		if (phase === 'start') strokeBefore = new Map();
		if (phase !== 'end') {
			const cells = project.cells.slice(); let changed = false;
			indices.forEach((index) => { if (!strokeBefore.has(index)) strokeBefore.set(index, cells[index]); if (cells[index] !== slot) { cells[index] = slot; changed = true; } });
			if (changed) update({ ...project, cells }); return;
		}
		const changedEntries = [...strokeBefore.entries()].filter(([index, before]) => project.cells[index] !== before);
		if (changedEntries.length) {
			const patch: CellPatch = { indices: Uint32Array.from(changedEntries.map(([index]) => index)), before: Uint16Array.from(changedEntries.map(([, before]) => before)), after: Uint16Array.from(changedEntries.map(([index]) => project.cells[index])), label: tool === 'eraser' ? 'Hapus stroke' : 'Gambar stroke' };
			history.push(patch); historyVersion += 1;
		}
		strokeBefore.clear();
	}

	function fill(index: number, slot: number) { applyCellPatch(floodFillIndices(project.cells, project.columns, project.rows, index, slot), slot, 'Isi area'); }
	function undo() {
		const result = history.undo(project.cells); if (!result.label) return;
		const structural = structuralSnapshots.get(result.label);
		const next = structural ? { ...cloneProject(structural.before), cells: result.cells } : { ...project, cells: result.cells };
		historyVersion += 1; activeSlot = next.palette.length ? Math.min(Math.max(activeSlot, 0), next.palette.length - 1) : -1; update(next); flash(`Undo: ${result.label.replace(/:.+$/, '')}`);
	}
	function redo() {
		const result = history.redo(project.cells); if (!result.label) return;
		const structural = structuralSnapshots.get(result.label);
		const next = structural ? { ...cloneProject(structural.after), cells: result.cells } : { ...project, cells: result.cells };
		historyVersion += 1; activeSlot = next.palette.length ? Math.min(Math.max(activeSlot, 0), next.palette.length - 1) : -1; update(next); flash(`Redo: ${result.label.replace(/:.+$/, '')}`);
	}

	function updateSettings(changes: Partial<ProjectV2['importSettings']>, marksStale = true) {
		const importSettings = { ...project.importSettings, ...changes };
		update({ ...project, importSettings });
		if (project.sourceImage && marksStale) stale = true;
	}

	async function importImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; input.value = ''; if (!file) return;
		const suggest = !project.sourceImage || confirm('Buat suggestion palet baru dari gambar ini?\n\nOK = suggestion baru\nBatal = pertahankan palet sekarang');
		await runImageConversion(file, suggest, true);
	}

	async function sourceFile(): Promise<File> {
		if (!project.sourceImage) throw new Error('Belum ada gambar sumber.');
		const response = await fetch(project.sourceImage.dataUrl); const blob = await response.blob();
		return new File([blob], project.sourceImage.name, { type: project.sourceImage.type });
	}
	async function recreateSource() { try { await runImageConversion(await sourceFile(), false, false); } catch (caught) { error = caught instanceof Error ? caught.message : 'Canvas gagal dibuat ulang.'; } }
	async function refreshSuggestion() { try { await runImageConversion(await sourceFile(), true, false); } catch (caught) { error = caught instanceof Error ? caught.message : 'Suggestion gagal dibuat ulang.'; } }

	async function runImageConversion(file: File, suggestPalette: boolean, replaceSource: boolean) {
		const generation = ++conversionGeneration; processing = true; error = null;
		const before = cloneProject(project);
		try {
			const conversionProject = replaceSource ? { ...project, importSettings: { ...project.importSettings, crop: null } } : project;
			const [result, dataUrl] = await Promise.all([convertImageFile(file, conversionProject, suggestPalette), replaceSource ? fileToDataUrl(file) : Promise.resolve(project.sourceImage?.dataUrl)]);
			if (generation !== conversionGeneration) return;
			const crop = project.importSettings.placement === 'crop'
				? project.importSettings.crop ?? centeredCropRect(result.imageWidth, result.imageHeight, project.columns / project.rows)
				: project.importSettings.crop;
			const after: ProjectV2 = {
				...project,
				palette: result.palette,
				cells: result.cells.slice(),
				importSettings: { ...project.importSettings, crop },
				sourceImage: replaceSource ? { name: file.name, type: file.type, dataUrl: dataUrl!, width: result.imageWidth, height: result.imageHeight } : project.sourceImage,
				updatedAt: new Date().toISOString()
			};
			commitStructural(before, after, suggestPalette ? 'Buat suggestion' : 'Recreate canvas');
			activeSlot = after.palette.length ? 0 : -1; stale = false;
			flash(suggestPalette ? `${after.palette.length} warna disarankan dari gambar.` : 'Canvas berhasil dibuat ulang.');
		} catch (caught) { if (generation === conversionGeneration) error = caught instanceof Error ? caught.message : 'Gambar tidak dapat dikonversi.'; }
		finally { if (generation === conversionGeneration) processing = false; }
	}

	function addPaletteColor() {
		const hex = normalizeHex(newHex);
		if (!hex) { error = 'Masukkan HEX yang valid, misalnya #45A8B5.'; return; }
		if (project.palette.length >= 32) { error = 'Maksimum 32 warna per proyek.'; return; }
		if (project.palette.some((entry) => entry.hex === hex)) { error = 'Warna HEX tersebut sudah ada.'; return; }
		const before = cloneProject(project); const palette = [...project.palette, { id: crypto.randomUUID(), slot: project.palette.length, hex }];
		commitStructural(before, { ...project, palette }, 'Tambah warna'); activeSlot = palette.length - 1; if (project.sourceImage) stale = true;
	}

	function setPaletteHex(id: string, value: string) {
		const hex = normalizeHex(value); if (!hex) return;
		const entry = project.palette.find((color) => color.id === id); if (!entry || entry.hex === hex) return;
		if (project.palette.some((color) => color.id !== id && color.hex === hex)) { error = 'Warna HEX tersebut sudah ada.'; return; }
		const before = cloneProject(project); const palette = project.palette.map((color) => color.id === id ? { ...color, hex } : color);
		commitStructural(before, { ...project, palette }, 'Ubah HEX');
	}

	function removeColor(slot: number) {
		const before = cloneProject(project); const result = removePaletteSlot(project.palette, project.cells, slot);
		commitStructural(before, { ...project, ...result }, 'Hapus warna');
		activeSlot = result.palette.length ? Math.min(Math.max(0, activeSlot > slot ? activeSlot - 1 : activeSlot), result.palette.length - 1) : -1;
		if (project.sourceImage) stale = true;
	}

	async function exportPdf() { if (pageCount > 100 && !confirm(`Blueprint ini akan menghasilkan ${pageCount} halaman. Lanjutkan?`)) return; exporting = 'PDF'; error = null; try { const { createProjectPdfInBackground } = await import('$lib/export/pdf-client'); const bytes = await createProjectPdfInBackground(project); downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${safeFileName(project.name)}-blueprint.pdf`); flash('Blueprint PDF berhasil dibuat.'); } catch (caught) { error = caught instanceof Error ? caught.message : 'PDF tidak dapat dibuat.'; } finally { exporting = null; } }
	async function exportPng(blueprint: boolean) { exporting = blueprint ? 'PNG blueprint' : 'PNG'; error = null; try { downloadBlob(await createProjectPng(project, blueprint), `${safeFileName(project.name)}${blueprint ? '-grid' : ''}.png`); flash('PNG berhasil dibuat.'); } catch (caught) { error = caught instanceof Error ? caught.message : 'PNG tidak dapat dibuat.'; } finally { exporting = null; } }
	function exportMaterialsCsv() { downloadText(materialListCsv(project), `${safeFileName(project.name)}-materials.csv`, 'text/csv;charset=utf-8'); flash('CSV daftar material berhasil dibuat.'); }
	function exportMatrixCsv() { downloadText(gridMatrixCsv(project), `${safeFileName(project.name)}-matrix.csv`, 'text/csv;charset=utf-8'); flash('CSV matriks warna berhasil dibuat.'); }
	function exportProject() { downloadText(serializeProject(project), `${safeFileName(project.name)}.pixelgrid.json`, 'application/json'); flash('File proyek berhasil dibuat.'); }
	async function runSelectedExport() {
		if (exportFormat === 'pdf') await exportPdf();
		else if (exportFormat === 'png') await exportPng(false);
		else if (exportFormat === 'png-grid') await exportPng(true);
		else if (exportFormat === 'materials-csv') exportMaterialsCsv();
		else if (exportFormat === 'matrix-csv') exportMatrixCsv();
		else exportProject();
	}
	function rename(event: Event) { const value = (event.currentTarget as HTMLInputElement).value.trim(); if (value && value !== project.name) update({ ...project, name: value }); }
</script>

{#snippet paletteEditor(sectionLabel: string)}
	<section class="palette-section">
		<p class="section-number">{sectionLabel}</p>
		<h2>{project.palette.length} warna aktif</h2>
		<p class="helper">Edit HEX akan langsung mengubah semua sel pada slot warna yang sama.</p>
		{#if project.palette.length === 0}<div class="palette-empty"><strong>Belum ada warna</strong><span>Tambah HEX untuk menggambar manual, atau impor gambar untuk suggestion otomatis.</span></div>{/if}
		<div class="palette-list">{#each project.palette as entry}<div class:chosen={activeSlot === entry.slot} class="palette-row"><button class="color-choice" type="button" onclick={() => (activeSlot = entry.slot)}><span style={`--color:${entry.hex}`}></span><span><strong>{entry.slot + 1}. {entry.hex}</strong><small>{counts[entry.slot]?.toLocaleString('id-ID')} tile</small></span></button><input class="native-color" type="color" value={entry.hex} oninput={(event) => setPaletteHex(entry.id, event.currentTarget.value)} aria-label={`Pilih warna ${entry.hex}`} /><input class="hex-input" value={entry.hex} oninput={(event) => setPaletteHex(entry.id, event.currentTarget.value)} onblur={(event) => (event.currentTarget.value = entry.hex)} aria-label={`HEX warna ${entry.slot + 1}`} /><button class="delete-color" type="button" onclick={() => removeColor(entry.slot)} aria-label={`Hapus ${entry.hex}`}>×</button></div>{/each}</div>
		<div class="add-color"><input bind:value={newHex} maxlength="7" aria-label="HEX warna baru" /><button type="button" onclick={addPaletteColor} disabled={project.palette.length >= 32}>＋ Tambah HEX</button></div>
		{#if stale && project.sourceImage}<button class="recreate-inline" type="button" onclick={recreateSource} disabled={processing || project.palette.length === 0}>Recreate canvas dengan palet ini ↻</button>{/if}
		<div class="palette-totals"><span><small>TERISI</small><strong>{filledCount.toLocaleString('id-ID')}</strong></span><span><small>KOSONG</small><strong>{emptyCount.toLocaleString('id-ID')}</strong></span></div>
	</section>
{/snippet}

<div class="editor-shell">
	<header class="editor-header">
		<button class="back" type="button" onclick={onBack} aria-label="Kembali ke daftar proyek">←</button>
		<div class="project-name"><small>PROYEK AKTIF</small><input value={project.name} onblur={rename} aria-label="Nama proyek" /></div>
		<div class="project-metrics"><span>{project.widthMm / 10} × {project.heightMm / 10} cm</span><i></i><span>{project.columns} × {project.rows} sel</span></div>
		<div class:problem={saveState === 'error'} class="save-state"><span></span>{saveState === 'saving' ? 'Menyimpan…' : saveState === 'error' ? 'Gagal simpan' : 'Tersimpan lokal'}</div>
		<div class="header-export">
			<select bind:value={exportFormat} disabled={!!exporting} aria-label="Format export">
				<option value="pdf">PDF blueprint</option><option value="png">PNG transparan</option><option value="png-grid">PNG + grid</option><option value="materials-csv">CSV material</option><option value="matrix-csv">CSV matriks</option><option value="project">File proyek</option>
			</select>
			<button type="button" onclick={runSelectedExport} disabled={!!exporting}>{exporting ? 'Menyiapkan…' : 'Export'} <span>↓</span></button>
		</div>
		<div class="history-buttons"><button type="button" onclick={undo} disabled={!canUndo} title="Undo">↶</button><button type="button" onclick={redo} disabled={!canRedo} title="Redo">↷</button></div>
	</header>

	<div class="editor-body">
		<aside class="left-panel">
			<div class="panel-tabs"><button class:active={panel === 'import'} onclick={() => (panel = 'import')} type="button">Import</button><button class:active={panel === 'palette'} onclick={() => (panel = 'palette')} type="button">Palette</button></div>
			<div class:mobile-hidden={panel !== 'import'} class="import-panel">
				<section><p class="section-number">01 / SUMBER</p><h2>Recreate gambar</h2>
					<label class="upload-zone">{#if project.sourceImage}<img src={project.sourceImage.dataUrl} alt="Gambar sumber" /><span>Ganti gambar</span>{:else}<b>＋</b><strong>Pilih gambar</strong><small>PNG, JPEG, WebP · maks. 20 MB</small>{/if}<input class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onchange={importImage} disabled={processing} /></label>
					{#if project.sourceImage}
						<div class="segmented"><button class:active={project.importSettings.placement === 'crop'} type="button" onclick={() => updateSettings({ placement: 'crop' })}>Crop to fill</button><button class:active={project.importSettings.placement === 'fit'} type="button" onclick={() => updateSettings({ placement: 'fit' })}>Fit utuh</button></div>
						{#if project.importSettings.placement === 'crop'}<VisualCropper source={project.sourceImage} crop={project.importSettings.crop} targetAspect={project.columns / project.rows} onChange={(crop) => updateSettings({ crop })} />{:else}<div class="fit-preview"><img src={project.sourceImage.dataUrl} alt="Preview seluruh gambar" /></div>{/if}
						<label class="control-label"><span>Mode rekonstruksi</span><select value={project.importSettings.renderMode} onchange={(event) => updateSettings({ renderMode: event.currentTarget.value as 'contour' | 'photo' })}><option value="contour">Contour — shape tegas</option><option value="photo">Photo — gradasi halus</option></select></label>
						<label class="control-label"><span>Jumlah suggestion</span><input type="number" min="2" max="32" value={project.importSettings.suggestionCount} onchange={(event) => updateSettings({ suggestionCount: Math.max(2, Math.min(32, Number(event.currentTarget.value) || 8)) }, false)} /></label>
						{#if stale}<p class="stale">Pengaturan atau struktur palet berubah. Recreate canvas untuk menerapkannya ke gambar.</p>{/if}
						<div class="conversion-actions"><button class="secondary" type="button" onclick={refreshSuggestion} disabled={processing}>Buat ulang suggestion</button><button class="primary" type="button" onclick={recreateSource} disabled={processing || project.palette.length === 0}>{processing ? 'Memproses…' : 'Recreate canvas ↻'}</button></div>
					{/if}
					{#if processing}<div class="progress"><i></i><span>Menganalisis warna dan shape…</span></div>{/if}
				</section>
			</div>
			<div class="mobile-palette">{#if panel === 'palette'}{@render paletteEditor('02 / PALETTE HEX')}{/if}</div>
		</aside>

		<section class="canvas-column">
			<div class="canvas-toolbar"><div class="tool-group" role="toolbar" aria-label="Alat gambar"><button class:active={tool === 'pencil'} onclick={() => (tool = 'pencil')} type="button" disabled={activeSlot < 0}><b>✎</b><span>Pencil</span></button><button class:active={tool === 'fill'} onclick={() => (tool = 'fill')} type="button" disabled={activeSlot < 0}><b>▰</b><span>Fill</span></button><button class:active={tool === 'picker'} onclick={() => (tool = 'picker')} type="button"><b>⌾</b><span>Picker</span></button><button class:active={tool === 'eraser'} onclick={() => (tool = 'eraser')} type="button"><b>◇</b><span>Eraser</span></button><button class:active={tool === 'pan'} onclick={() => (tool = 'pan')} type="button"><b>✥</b><span>Pan</span></button></div><div class="view-controls"><label><input type="checkbox" bind:checked={showGrid} /> Grid</label><button type="button" onclick={() => (zoom = Math.max(.35, zoom / 1.2))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" onclick={() => (zoom = Math.min(6, zoom * 1.2))}>＋</button><button type="button" onclick={() => (zoom = 1)}>Fit</button></div></div>
			<div class="canvas-wrap"><MosaicCanvas {project} {activeSlot} {tool} {zoom} {showGrid} onPaint={paint} onFill={fill} onEditCell={(index, slot) => applyCellPatch(Uint32Array.of(index), slot, 'Edit keyboard')} onPick={(slot) => { if (slot === EMPTY_CELL) tool = 'eraser'; else { activeSlot = slot; tool = 'pencil'; } }} onZoom={(value) => (zoom = value)} /></div>
			<div class="palette-strip"><div class="palette-meta"><small>WARNA AKTIF</small><strong>{activeSlot >= 0 ? project.palette[activeSlot]?.hex : 'Belum dipilih'}</strong></div><div class="strip-scroll">{#each project.palette as entry}<button class:active={entry.slot === activeSlot} onclick={() => (activeSlot = entry.slot)} type="button"><i style={`--color:${entry.hex}`}></i><span>{entry.slot + 1}</span><small>{counts[entry.slot]?.toLocaleString('id-ID')}</small></button>{/each}</div>{#if project.palette.length === 0}<button class="open-palette" type="button" onclick={() => (panel = 'palette')}>＋ Tambah warna HEX</button>{/if}</div>
		</section>

		<aside class="right-panel">{@render paletteEditor('03 / PALETTE')}</aside>
	</div>
	{#if notice}<div class="toast success" role="status">✓ {notice}</div>{/if}{#if error}<div class="toast error" role="alert"><span>! {error}</span><button type="button" onclick={() => (error = null)}>×</button></div>{/if}
</div>

<style>
	.editor-shell{height:100vh;min-height:680px;display:flex;flex-direction:column;background:#e2e0da;color:#202622;overflow:hidden}.editor-header{height:66px;display:flex;align-items:center;gap:16px;padding:0 18px;border-bottom:1px solid #c8c6bf;background:#faf9f5}.back{width:36px;height:36px;border:1px solid #d2d0c9;border-radius:6px;background:white;font-size:18px}.project-name{display:flex;flex-direction:column;border-right:1px solid #d5d2cb;padding-right:20px;min-width:220px}.project-name small,.section-number{font-size:8px;letter-spacing:.16em;font-weight:850;color:#8a8e89}.project-name input{border:0;background:transparent;height:23px;font-size:14px;font-weight:800}.project-metrics{display:flex;align-items:center;gap:11px;color:#646b66;font-size:11px;margin-right:auto}.project-metrics i{width:3px;height:3px;background:#abaea9;border-radius:50%}.save-state{font-size:10px;color:#6b736d;display:flex;align-items:center;gap:7px}.save-state>span{width:7px;height:7px;border-radius:50%;background:#66a56d}.save-state.problem>span{background:#d05b38}.header-export{height:36px;display:flex;align-items:stretch;border:1px solid #c9c7c0;border-radius:6px;background:white;overflow:hidden}.header-export select{min-width:148px;border:0;border-right:1px solid #d6d3cb;background:white;padding:0 28px 0 10px;font-size:9px;font-weight:750;color:#353b37}.header-export button{min-width:88px;border:0;background:var(--accent);color:white;padding:0 11px;font-size:9px;font-weight:850}.header-export button span{margin-left:8px;font-size:13px}.header-export select:disabled,.header-export button:disabled{opacity:.65}.history-buttons{display:flex}.history-buttons button{width:35px;height:34px;border:1px solid #d0cec7;background:white;font-size:17px}.history-buttons button:disabled{opacity:.35}.editor-body{display:grid;grid-template-columns:300px minmax(420px,1fr) 300px;min-height:0;flex:1}.left-panel,.right-panel{background:#f9f8f4;overflow-y:auto}.left-panel{border-right:1px solid #c9c7c0}.right-panel{border-left:1px solid #c9c7c0}.panel-tabs{display:none;grid-template-columns:1fr 1fr;height:48px;border-bottom:1px solid #d6d3cb}.panel-tabs button{border:0;background:transparent;font-size:10px;font-weight:800;text-transform:uppercase;position:relative}.panel-tabs button.active:after{content:"";height:2px;position:absolute;bottom:0;left:20px;right:20px;background:var(--accent)}.left-panel section,.palette-section{padding:23px 20px 35px}.mobile-palette{display:none}.left-panel h2,.right-panel h2{font-size:20px;letter-spacing:-.04em;margin:5px 0 17px}.upload-zone{height:140px;border:1px dashed #b8bbb5;background:#eeece6;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:14px;overflow:hidden;position:relative;cursor:pointer}.upload-zone img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.upload-zone>span{position:absolute;bottom:9px;background:rgba(31,37,34,.82);color:white;padding:6px 9px;border-radius:5px;font-size:9px;font-weight:750}.upload-zone b{font-size:26px;color:var(--accent)}.upload-zone strong{font-size:12px}.upload-zone small{font-size:9px;color:#858b86}.segmented{display:grid;grid-template-columns:1fr 1fr;margin-bottom:10px}.segmented button{height:34px;border:1px solid #c9c7c0;background:white;font-size:9px;font-weight:800}.segmented button.active{background:var(--forest);border-color:var(--forest);color:white}.fit-preview{height:160px;display:grid;place-items:center;background:repeating-conic-gradient(#ddd 0 25%,#f4f2ed 0 50%) 50%/12px 12px;border:1px solid #c7c5be;border-radius:7px;margin-bottom:14px;overflow:hidden}.fit-preview img{width:100%;height:100%;object-fit:contain}.control-label{display:block;margin:0 0 13px}.control-label>span{display:block;margin-bottom:6px;font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;color:#6b726d}.control-label select,.control-label input{width:100%;height:38px;border:1px solid #cfcdc6;background:white;border-radius:6px;padding:0 9px;font-size:10px}.stale{padding:9px;border:1px solid #e3c79c;border-radius:6px;background:#fff7e8;color:#6d542d;font-size:9px;line-height:1.45}.conversion-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.conversion-actions button,.recreate-inline{min-height:38px;border-radius:6px;font-size:8px;font-weight:800}.conversion-actions .secondary{border:1px solid #b8c8c0;background:white;color:#315447}.conversion-actions .primary,.recreate-inline{border:0;background:var(--forest);color:white}.progress{display:flex;gap:9px;align-items:center;background:#edf3f1;padding:10px;margin-top:10px;font-size:10px}.progress i{width:12px;height:12px;border:2px solid #91aca0;border-top-color:#315447;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.helper{font-size:10px;color:#747b76;line-height:1.5}.palette-empty{display:flex;flex-direction:column;gap:4px;padding:14px;border:1px dashed #c9c7c0;border-radius:7px;color:#747a75;font-size:9px}.palette-empty strong{color:#303632}.palette-list{display:flex;flex-direction:column;gap:7px;margin-top:10px}.palette-row{display:grid;grid-template-columns:minmax(75px,1fr) 28px 74px 25px;align-items:center;border:1px solid #d7d4cd;border-radius:6px;background:white}.palette-row.chosen{border-color:var(--cyan);box-shadow:0 0 0 1px var(--cyan)}.color-choice{border:0;background:transparent;display:flex;align-items:center;gap:7px;text-align:left;padding:6px;min-width:0}.color-choice>span:first-child{width:27px;height:27px;flex:0 0 auto;background:var(--color);border:1px solid rgba(0,0,0,.16)}.color-choice>span:last-child{min-width:0;display:flex;flex-direction:column}.color-choice strong{font-size:8px}.color-choice small{font-size:7px;color:#7c827e}.native-color{width:24px;height:24px;border:0;padding:0;background:transparent}.hex-input{width:70px;height:28px;border:1px solid #d0cec7;border-radius:4px;padding:0 5px;font:700 8px ui-monospace}.delete-color{border:0;background:transparent;color:#9b4e3a;font-size:16px}.add-color{display:grid;grid-template-columns:1fr 105px;gap:6px;margin-top:12px}.add-color input{height:36px;border:1px solid #cfcdc6;border-radius:6px;padding:0 9px;font:700 10px ui-monospace}.add-color button{border:0;border-radius:6px;background:var(--forest);color:white;font-size:8px;font-weight:800}.recreate-inline{width:100%;margin-top:9px}.palette-totals{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid #d4d1ca}.palette-totals span{display:flex;flex-direction:column;gap:3px}.palette-totals small{font-size:7px;letter-spacing:.12em;color:#858a86}.palette-totals strong{font:700 16px Georgia;color:var(--forest)}.canvas-column{min-width:0;display:grid;grid-template-rows:49px minmax(0,1fr) 72px}.canvas-toolbar{display:flex;justify-content:space-between;align-items:center;padding:0 12px;background:#f5f3ee;border-bottom:1px solid #c8c6bf}.tool-group{display:flex;height:100%}.tool-group button{width:56px;border:0;border-right:1px solid #dbd8d1;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#656c67}.tool-group button b{font-size:15px}.tool-group button span{font-size:7px;text-transform:uppercase;font-weight:800}.tool-group button.active{color:white;background:var(--forest)}.tool-group button:disabled{opacity:.3}.view-controls{display:flex;align-items:center;gap:5px}.view-controls label{font-size:9px}.view-controls button{height:27px;min-width:29px;border:1px solid #d0cec7;background:white;border-radius:4px}.view-controls span{font-size:9px;width:38px;text-align:center}.canvas-wrap{min-height:0}.palette-strip{display:flex;align-items:stretch;border-top:1px solid #c4c2bb;background:#f8f7f3;padding:9px 12px;gap:14px}.palette-meta{width:110px;display:flex;flex-direction:column;justify-content:center}.palette-meta small{font-size:7px;letter-spacing:.1em}.palette-meta strong{font:700 10px ui-monospace;margin-top:4px}.strip-scroll{display:flex;gap:5px;overflow-x:auto}.strip-scroll button{min-width:47px;border:1px solid #d2d0c9;border-radius:5px;background:white;display:grid;grid-template-columns:18px 1fr;align-items:center;padding:4px}.strip-scroll button.active{border-color:var(--cyan)}.strip-scroll i{width:18px;height:34px;background:var(--color)}.strip-scroll span,.strip-scroll small{font-size:7px}.open-palette{border:1px dashed #aaa;background:transparent;border-radius:6px;font-size:9px}.toast{position:fixed;z-index:60;left:50%;bottom:18px;transform:translateX(-50%);padding:10px 13px;border-radius:6px;color:white;font-size:10px;font-weight:750}.toast.success{background:#315447}.toast.error{background:#963f27;display:flex;gap:12px}.toast button{border:0;background:transparent;color:white}@media(max-width:1100px){.editor-body{grid-template-columns:280px minmax(380px,1fr)}.right-panel{display:none}.panel-tabs{display:grid}.mobile-palette{display:block}.import-panel.mobile-hidden{display:none}}@media(max-width:760px){.editor-shell{height:auto;min-height:100vh;overflow:auto}.editor-header{position:sticky;top:0;z-index:20}.project-metrics,.save-state{display:none}.editor-body{display:flex;flex-direction:column}.left-panel{order:2;max-height:none}.canvas-column{height:70vh;order:1}.palette-strip{overflow:hidden}.editor-header{gap:8px;padding:0 10px}.project-name{min-width:0;flex:1;padding-right:8px}.project-name input{width:100%}.header-export select{min-width:0;width:112px}.header-export button{min-width:68px;padding:0 7px}.history-buttons{display:none}}@media(max-width:520px){.header-export select{width:44px;color:transparent;padding:0}.header-export select:focus{width:112px;color:#353b37;padding-left:8px}.header-export button{min-width:64px}.project-name small{display:none}}
	@media(max-width:520px){.header-export select,.header-export select:focus{width:90px;color:#353b37;padding:0 20px 0 7px}.header-export button{min-width:60px}.project-name small{display:none}}
</style>
