<script lang="ts">
	import MosaicCanvas from '$lib/components/MosaicCanvas.svelte';
	import { catalogColorToPalette } from '$lib/catalog';
	import { EditHistory } from '$lib/history';
	import { convertImageFile } from '$lib/image-converter';
	import { cloneProject, serializeProject } from '$lib/project';
	import type { CatalogColor, CellPatch, EditorTool, ProjectV1 } from '$lib/types';
	import { createProjectPng } from '$lib/export/png';
	import { downloadBlob, downloadText, fileToDataUrl, safeFileName } from '$lib/utils/download';
	import { floodFillIndices, countSlots } from '$lib/utils/grid';
	import { gridMatrixCsv, materialListCsv } from '$lib/utils/csv';
	import { planPaletteRemap, type PaletteRemap } from '$lib/utils/palette';

	type Props = {
		project: ProjectV1;
		catalog: CatalogColor[];
		saveState: 'saved' | 'saving' | 'error';
		onChange: (project: ProjectV1) => void;
		onBack: () => void;
	};

	let { project, catalog, saveState, onChange, onBack }: Props = $props();
	let tool = $state<EditorTool>('pencil');
	let activeSlot = $state(0);
	let zoom = $state(1);
	let showGrid = $state(true);
	let panel = $state<'import' | 'palette'>('import');
	let processing = $state(false);
	let exporting = $state<string | null>(null);
	let notice = $state<string | null>(null);
	let error = $state<string | null>(null);
	let fit = $state<ProjectV1['importSettings']['fit']>('cover');
	let focalX = $state(0.5);
	let focalY = $state(0.5);
	let maxColors = $state(8);
	let autoPalette = $state(true);
	let initializedProject = '';
	let catalogChoice = $state('');
	let replacement = $state<Record<number, number>>({});
	let remapPreview = $state<PaletteRemap | null>(null);
	const history = new EditHistory();
	let historyVersion = $state(0);
	let strokeBefore = new Map<number, number>();
	let structuralSnapshots = new Map<string, { before: ProjectV1; after: ProjectV1 }>();

	let canUndo = $derived.by(() => historyVersion >= 0 && history.canUndo);
	let canRedo = $derived.by(() => historyVersion >= 0 && history.canRedo);
	let counts = $derived(countSlots(project.cells, project.palette.length));
	let availableCatalog = $derived(catalog.filter((color) => color.active && !project.palette.some((entry) => entry.catalogId === color.id)));
	let pageCount = $derived(1 + Math.ceil(project.columns / 24) * Math.ceil(project.rows / 24));
	let minimumPaletteLimit = $derived(new Set([project.palette[project.backgroundSlot]?.catalogId, ...project.palette.filter((entry) => entry.pinned).map((entry) => entry.catalogId)].filter(Boolean)).size);

	$effect(() => {
		if (initializedProject !== project.id) {
			loadLocalSettings(project);
			initializedProject = project.id;
		}
	});

	function loadLocalSettings(value: ProjectV1) {
		fit = value.importSettings.fit;
		focalX = value.importSettings.focalX;
		focalY = value.importSettings.focalY;
		maxColors = value.importSettings.maxColors;
		autoPalette = value.importSettings.autoPalette;
		remapPreview = null;
	}

	function update(next: ProjectV1) {
		onChange({ ...next, updatedAt: new Date().toISOString() });
	}

	function flash(message: string) {
		notice = message;
		setTimeout(() => { if (notice === message) notice = null; }, 2_800);
	}

	function applyCellPatch(indices: Uint32Array, nextSlot: number, label: string) {
		if (indices.length === 0) return;
		const cells = project.cells.slice();
		const changed: number[] = [];
		const before: number[] = [];
		indices.forEach((index) => {
			if (cells[index] === nextSlot) return;
			changed.push(index);
			before.push(cells[index]);
			cells[index] = nextSlot;
		});
		if (changed.length === 0) return;
		history.push({ indices: Uint32Array.from(changed), before: Uint16Array.from(before), after: Uint16Array.from({ length: changed.length }, () => nextSlot), label });
		historyVersion += 1;
		update({ ...project, cells });
	}

	function paint(indices: Uint32Array, slot: number, phase: 'start' | 'move' | 'end') {
		if (phase === 'start') strokeBefore = new Map();
		if (phase !== 'end') {
			const cells = project.cells.slice();
			let changed = false;
			indices.forEach((index) => {
				if (!strokeBefore.has(index)) strokeBefore.set(index, cells[index]);
				if (cells[index] !== slot) { cells[index] = slot; changed = true; }
			});
			if (changed) update({ ...project, cells });
			return;
		}
		const changedEntries = [...strokeBefore.entries()].filter(([index, before]) => project.cells[index] !== before);
		if (changedEntries.length) {
			const patch: CellPatch = {
				indices: Uint32Array.from(changedEntries.map(([index]) => index)),
				before: Uint16Array.from(changedEntries.map(([, before]) => before)),
				after: Uint16Array.from(changedEntries.map(([index]) => project.cells[index])),
				label: tool === 'eraser' ? 'Hapus stroke' : 'Gambar stroke'
			};
			history.push(patch);
			historyVersion += 1;
		}
		strokeBefore.clear();
	}

	function fill(index: number, slot: number) {
		applyCellPatch(floodFillIndices(project.cells, project.columns, project.rows, index, slot), slot, 'Isi area');
	}

	function undo() {
		const result = history.undo(project.cells);
		if (!result.label) return;
		const structural = structuralSnapshots.get(result.label);
		const next = structural ? { ...cloneProject(structural.before), cells: result.cells } : { ...project, cells: result.cells };
		if (structural) loadLocalSettings(next);
		historyVersion += 1;
		activeSlot = Math.min(activeSlot, next.palette.length - 1);
		update(next);
		flash(`Undo: ${result.label.replace(/:.+$/, '')}`);
	}

	function redo() {
		const result = history.redo(project.cells);
		if (!result.label) return;
		const structural = structuralSnapshots.get(result.label);
		const next = structural ? { ...cloneProject(structural.after), cells: result.cells } : { ...project, cells: result.cells };
		if (structural) loadLocalSettings(next);
		historyVersion += 1;
		activeSlot = Math.min(activeSlot, next.palette.length - 1);
		update(next);
		flash(`Redo: ${result.label.replace(/:.+$/, '')}`);
	}

	function syncImportSettings() {
		maxColors = Math.max(minimumPaletteLimit, Math.min(32, Number(maxColors) || 8));
		remapPreview = null;
		update({ ...project, importSettings: { fit, focalX, focalY, maxColors, autoPalette } });
	}

	function previewPaletteRemap() {
		try { remapPreview = planPaletteRemap(project, maxColors); }
		catch (caught) { error = caught instanceof Error ? caught.message : 'Preview remap palette gagal dibuat.'; }
	}

	function applyPaletteRemap() {
		if (!remapPreview) return;
		const before = cloneProject(project);
		const after: ProjectV1 = {
			...project,
			palette: remapPreview.palette,
			cells: remapPreview.cells,
			backgroundSlot: remapPreview.backgroundSlot,
			importSettings: { ...project.importSettings, maxColors },
			updatedAt: new Date().toISOString()
		};
		const label = `Kurangi palette:${Date.now()}`;
		history.clear();
		structuralSnapshots.clear();
		const indices = Uint32Array.from({ length: project.cells.length }, (_, index) => index);
		history.push({ indices, before: before.cells.slice(), after: after.cells.slice(), label });
		structuralSnapshots.set(label, { before, after: cloneProject(after) });
		historyVersion += 1;
		activeSlot = remapPreview.slotMap[activeSlot] ?? 0;
		const removedCount = remapPreview.removed.length;
		remapPreview = null;
		update(after);
		flash(`${removedCount} warna di-remap ke palette ${after.palette.length} warna.`);
	}

	async function importImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		await runImageConversion(file);
	}

	async function reconvertSource() {
		if (!project.sourceImage) return;
		const response = await fetch(project.sourceImage.dataUrl);
		const blob = await response.blob();
		await runImageConversion(new File([blob], project.sourceImage.name, { type: project.sourceImage.type }));
	}

	async function runImageConversion(file: File) {
		processing = true; error = null;
		const before = cloneProject(project);
		maxColors = Math.max(minimumPaletteLimit, Math.min(32, Number(maxColors) || 8));
		const settings = { fit, focalX, focalY, maxColors, autoPalette };
		const conversionProject = { ...cloneProject(project), importSettings: settings };
		try {
			const [result, dataUrl] = await Promise.all([convertImageFile(file, conversionProject, catalog), fileToDataUrl(file)]);
			const after: ProjectV1 = {
				...project,
				palette: result.palette,
				backgroundSlot: result.backgroundSlot,
				cells: result.cells,
				sourceImage: { name: file.name, type: file.type, dataUrl, width: result.imageWidth, height: result.imageHeight },
				importSettings: settings,
				updatedAt: new Date().toISOString()
			};
			const label = `Import gambar:${Date.now()}`;
			history.clear();
			structuralSnapshots.clear();
			const indices = Uint32Array.from({ length: project.cells.length }, (_, index) => index);
			history.push({ indices, before: before.cells.slice(), after: after.cells.slice(), label });
			structuralSnapshots.set(label, { before, after: cloneProject(after) });
			historyVersion += 1;
			activeSlot = result.backgroundSlot;
			update(after);
			flash(`Gambar dikonversi ke ${after.palette.length} warna katalog.`);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Gambar tidak dapat dikonversi.';
		} finally { processing = false; }
	}

	function addPaletteColor() {
		const selected = catalog.find((color) => color.id === catalogChoice);
		if (!selected || project.palette.length >= maxColors) return;
		const palette = [...project.palette, catalogColorToPalette(selected, project.palette.length)];
		remapPreview = null;
		catalogChoice = '';
		update({ ...project, palette });
		activeSlot = palette.length - 1;
	}

	function togglePin(slot: number) {
		remapPreview = null;
		const palette = project.palette.map((entry) => entry.slot === slot ? { ...entry, pinned: !entry.pinned } : entry);
		const required = new Set([palette[project.backgroundSlot]?.catalogId, ...palette.filter((entry) => entry.pinned).map((entry) => entry.catalogId)].filter(Boolean)).size;
		maxColors = Math.max(maxColors, required);
		update({ ...project, palette, importSettings: { ...project.importSettings, maxColors } });
	}

	function removePaletteColor(slot: number) {
		remapPreview = null;
		if (project.palette.length <= 1) return;
		const target = Number(replacement[slot] ?? project.backgroundSlot);
		if (target === slot || !project.palette[target]) { error = 'Pilih warna pengganti yang berbeda.'; return; }
		const nextPalette = project.palette.filter((entry) => entry.slot !== slot).map((entry, nextSlot) => ({ ...entry, slot: nextSlot }));
		const cells = project.cells.slice();
		for (let index = 0; index < cells.length; index += 1) {
			if (cells[index] === slot) cells[index] = target;
			if (cells[index] > slot) cells[index] -= 1;
		}
		const oldBackground = project.backgroundSlot === slot ? target : project.backgroundSlot;
		const backgroundSlot = oldBackground > slot ? oldBackground - 1 : oldBackground;
		history.clear(); structuralSnapshots.clear(); historyVersion += 1;
		activeSlot = Math.min(activeSlot, nextPalette.length - 1);
		update({ ...project, palette: nextPalette, cells, backgroundSlot: Math.max(0, backgroundSlot) });
		flash('Warna diganti dan dihapus dari palette.');
	}

	function setBackground(slot: number) {
		remapPreview = null;
		const palette = project.palette.map((entry) => ({ ...entry, pinned: entry.slot === slot ? true : entry.pinned }));
		const required = new Set(palette.filter((entry) => entry.pinned).map((entry) => entry.catalogId)).size;
		maxColors = Math.max(maxColors, required);
		update({ ...project, backgroundSlot: slot, palette, importSettings: { ...project.importSettings, maxColors } });
	}

	async function exportPdf() {
		if (pageCount > 100 && !confirm(`Blueprint ini akan menghasilkan ${pageCount} halaman. Lanjutkan?`)) return;
		exporting = 'PDF'; error = null;
		try {
			const { createProjectPdfInBackground } = await import('$lib/export/pdf-client');
			const bytes = await createProjectPdfInBackground(project);
			downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${safeFileName(project.name)}-blueprint.pdf`);
			flash('Blueprint PDF berhasil dibuat.');
		} catch (caught) { error = caught instanceof Error ? caught.message : 'PDF tidak dapat dibuat.'; }
		finally { exporting = null; }
	}

	async function exportPng(blueprint: boolean) {
		exporting = blueprint ? 'PNG blueprint' : 'PNG'; error = null;
		try {
			downloadBlob(await createProjectPng(project, blueprint), `${safeFileName(project.name)}${blueprint ? '-grid' : ''}.png`);
			flash('PNG berhasil dibuat.');
		} catch (caught) { error = caught instanceof Error ? caught.message : 'PNG tidak dapat dibuat.'; }
		finally { exporting = null; }
	}

	function exportMaterialsCsv() {
		const base = safeFileName(project.name);
		downloadText(materialListCsv(project), `${base}-materials.csv`, 'text/csv;charset=utf-8');
		flash('CSV daftar material berhasil dibuat.');
	}

	function exportMatrixCsv() {
		const base = safeFileName(project.name);
		downloadText(gridMatrixCsv(project), `${base}-matrix.csv`, 'text/csv;charset=utf-8');
		flash('CSV matriks warna berhasil dibuat.');
	}

	function exportProject() {
		downloadText(serializeProject(project), `${safeFileName(project.name)}.pixelgrid.json`, 'application/json');
		flash('File proyek berhasil dibuat.');
	}

	function rename(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value.trim();
		if (value && value !== project.name) update({ ...project, name: value });
	}
</script>

<div class="editor-shell">
	<header class="editor-header">
		<button class="back" type="button" onclick={onBack} aria-label="Kembali ke daftar proyek">←</button>
		<div class="project-name"><small>PROYEK AKTIF</small><input value={project.name} onblur={rename} aria-label="Nama proyek" /></div>
		<div class="project-metrics"><span>{project.widthMm / 10} × {project.heightMm / 10} cm</span><i></i><span>{project.columns} × {project.rows} sel</span><i></i><span>{project.cellMm / 10} cm/tile</span></div>
		<div class:problem={saveState === 'error'} class="save-state"><span></span>{saveState === 'saving' ? 'Menyimpan…' : saveState === 'error' ? 'Gagal simpan' : 'Tersimpan lokal'}</div>
		<div class="history-buttons"><button type="button" onclick={undo} disabled={!canUndo} title="Undo">↶</button><button type="button" onclick={redo} disabled={!canRedo} title="Redo">↷</button></div>
		<details class="compact-export"><summary>Export</summary><div><button type="button" onclick={exportPdf}>PDF blueprint</button><button type="button" onclick={() => exportPng(true)}>PNG + grid</button><button type="button" onclick={exportMaterialsCsv}>CSV material</button><button type="button" onclick={exportMatrixCsv}>CSV matriks</button><button type="button" onclick={exportProject}>File proyek</button></div></details>
	</header>

	<div class="editor-body">
		<aside class="left-panel">
			<div class="panel-tabs"><button class:active={panel === 'import'} aria-pressed={panel === 'import'} onclick={() => (panel = 'import')} type="button">Import</button><button class:active={panel === 'palette'} aria-pressed={panel === 'palette'} onclick={() => (panel = 'palette')} type="button">Palette</button></div>
			{#if panel === 'import'}
				<section>
					<p class="section-number">01 / SUMBER</p>
					<h2>Konversi gambar</h2>
					<label class="upload-zone">
						{#if project.sourceImage}<img src={project.sourceImage.dataUrl} alt="Gambar sumber" /><span>Ganti gambar</span>{:else}<b>＋</b><strong>Pilih gambar</strong><small>PNG, JPEG, WebP · maks. 20 MB</small>{/if}
						<input class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onchange={importImage} disabled={processing} />
					</label>
					<label class="control-label"><span>Penempatan</span><select bind:value={fit} onchange={syncImportSettings}><option value="cover">Cover / crop</option><option value="contain">Contain / utuh</option></select></label>
					{#if fit === 'cover'}
						<label class="range-label"><span>Posisi horizontal <b>{Math.round(focalX * 100)}%</b></span><input type="range" min="0" max="1" step="0.01" bind:value={focalX} onchange={syncImportSettings} /></label>
						<label class="range-label"><span>Posisi vertikal <b>{Math.round(focalY * 100)}%</b></span><input type="range" min="0" max="1" step="0.01" bind:value={focalY} onchange={syncImportSettings} /></label>
					{/if}
					<label class="toggle-row"><span><strong>Pilih otomatis</strong><small>Dari katalog aktif</small></span><input type="checkbox" bind:checked={autoPalette} onchange={syncImportSettings} /></label>
					<label class="control-label"><span>Maksimum warna</span><input class="number-input" type="number" min={minimumPaletteLimit} max="32" bind:value={maxColors} onchange={syncImportSettings} /></label>
					{#if maxColors < project.palette.length}
						<div class="remap-box">
							<strong>Palette proyek masih {project.palette.length} warna</strong>
							<small>Buat preview sebelum menerapkan batas {maxColors} warna.</small>
							{#if remapPreview}
								<p>{remapPreview.changedCells.toLocaleString('id-ID')} sel akan dinomori atau dipetakan ulang.</p>
								<ul>{#each remapPreview.removed.slice(0, 5) as mapping}<li><i style={`--color:${mapping.from.hex}`}></i>{mapping.from.name}<span>→</span><i style={`--color:${mapping.to.hex}`}></i>{mapping.to.name}</li>{/each}</ul>
								<button type="button" class="apply-remap" onclick={applyPaletteRemap}>Terapkan remap</button>
							{:else}
								<button type="button" onclick={previewPaletteRemap}>Preview remap</button>
							{/if}
						</div>
					{/if}
					{#if project.sourceImage && !processing}<button class="reconvert" type="button" onclick={reconvertSource}>Terapkan ulang pengaturan <span>↻</span></button>{/if}
					{#if processing}<div class="progress"><i></i><span>Menganalisis warna gambar…</span></div>{/if}
				</section>
			{:else}
				<section>
					<p class="section-number">02 / PALETTE</p>
					<h2>{project.palette.length} warna aktif</h2>
					<p class="helper">Warna proyek adalah snapshot katalog. Pin warna agar selalu masuk saat konversi otomatis.</p>
					<div class="palette-list">
						{#each project.palette as entry}
							<div class:chosen={activeSlot === entry.slot} class="palette-row">
								<button class="color-choice" type="button" aria-pressed={activeSlot === entry.slot} onclick={() => (activeSlot = entry.slot)}><span style={`--color:${entry.hex}`}></span><span><strong>{entry.slot + 1}. {entry.name}</strong><small>{entry.code || 'Tanpa kode'} · {counts[entry.slot]?.toLocaleString('id-ID')} pcs</small></span></button>
								<button class:active={entry.pinned} class="pin" type="button" aria-pressed={entry.pinned} aria-label={`${entry.pinned ? 'Lepas pin' : 'Pin'} warna ${entry.name}`} onclick={() => togglePin(entry.slot)} title="Pin warna">◆</button>
								{#if project.palette.length > 1}
									<details><summary title="Hapus warna">×</summary><div class="replace-pop"><span>Ganti dengan</span><select value={replacement[entry.slot] ?? project.backgroundSlot} onchange={(event) => (replacement[entry.slot] = Number(event.currentTarget.value))}>{#each project.palette.filter((item) => item.slot !== entry.slot) as target}<option value={target.slot}>{target.name}</option>{/each}</select><button type="button" onclick={() => removePaletteColor(entry.slot)}>Ganti & hapus</button></div></details>
								{/if}
							</div>
						{/each}
					</div>
					<div class="add-color"><select bind:value={catalogChoice}><option value="">Tambah dari katalog…</option>{#each availableCatalog as color}<option value={color.id}>{color.code || '—'} · {color.name}</option>{/each}</select><button type="button" onclick={addPaletteColor} disabled={!catalogChoice || project.palette.length >= maxColors}>＋</button></div>
					<label class="control-label background"><span>Warna latar / eraser</span><select value={project.backgroundSlot} onchange={(event) => setBackground(Number(event.currentTarget.value))}>{#each project.palette as color}<option value={color.slot}>{color.name}</option>{/each}</select></label>
				</section>
			{/if}
		</aside>

		<section class="canvas-column">
			<div class="canvas-toolbar">
				<div class="tool-group" role="toolbar" aria-label="Alat gambar">
					<button class:active={tool === 'pencil'} aria-pressed={tool === 'pencil'} onclick={() => (tool = 'pencil')} type="button" title="Pencil"><b>✎</b><span>Pencil</span></button>
					<button class:active={tool === 'fill'} aria-pressed={tool === 'fill'} onclick={() => (tool = 'fill')} type="button" title="Bucket fill"><b>▰</b><span>Fill</span></button>
					<button class:active={tool === 'picker'} aria-pressed={tool === 'picker'} onclick={() => (tool = 'picker')} type="button" title="Eyedropper"><b>⌾</b><span>Picker</span></button>
					<button class:active={tool === 'eraser'} aria-pressed={tool === 'eraser'} onclick={() => (tool = 'eraser')} type="button" title="Eraser"><b>◇</b><span>Eraser</span></button>
					<button class:active={tool === 'pan'} aria-pressed={tool === 'pan'} onclick={() => (tool = 'pan')} type="button" title="Pan"><b>✥</b><span>Pan</span></button>
				</div>
				<div class="view-controls"><label><input type="checkbox" bind:checked={showGrid} /> Grid</label><button type="button" onclick={() => (zoom = Math.max(.35, zoom / 1.2))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" onclick={() => (zoom = Math.min(6, zoom * 1.2))}>＋</button><button type="button" onclick={() => (zoom = 1)}>Fit</button></div>
			</div>
			<div class="canvas-wrap">
				<MosaicCanvas {project} {activeSlot} {tool} {zoom} {showGrid} onPaint={paint} onFill={fill} onEditCell={(index, slot) => applyCellPatch(Uint32Array.of(index), slot, 'Edit keyboard')} onPick={(slot) => { activeSlot = slot; tool = 'pencil'; }} onZoom={(value) => (zoom = value)} />
			</div>
			<div class="palette-strip">
				<div class="palette-meta"><small>WARNA AKTIF</small><strong>{project.palette[activeSlot]?.name}</strong></div>
				<div class="strip-scroll">{#each project.palette as entry}<button class:active={entry.slot === activeSlot} aria-pressed={entry.slot === activeSlot} aria-label={`Pilih ${entry.name}`} onclick={() => (activeSlot = entry.slot)} type="button"><i style={`--color:${entry.hex}`}></i><span>{entry.slot + 1}</span><small>{counts[entry.slot]?.toLocaleString('id-ID')}</small></button>{/each}</div>
			</div>
		</section>

		<aside class="right-panel">
			<p class="section-number">03 / PRODUKSI</p>
			<h2>Export blueprint</h2>
			<div class="production-total"><span>TOTAL SEL</span><strong>{project.cells.length.toLocaleString('id-ID')}</strong><small>{project.palette.length} warna · {pageCount} halaman PDF</small></div>
			<button class="export-primary" type="button" onclick={exportPdf} disabled={!!exporting}><span><b>PDF</b><small>Overview + panel 24 × 24</small></span><i>{exporting === 'PDF' ? '…' : '↓'}</i></button>
			<div class="export-grid"><button type="button" onclick={() => exportPng(false)} disabled={!!exporting}><b>PNG</b><small>Gambar bersih</small></button><button type="button" onclick={() => exportPng(true)} disabled={!!exporting}><b>PNG + Grid</b><small>Preview label</small></button><button type="button" onclick={exportMaterialsCsv}><b>CSV material</b><small>Jumlah per warna</small></button><button type="button" onclick={exportMatrixCsv}><b>CSV matriks</b><small>Kode setiap sel</small></button><button type="button" onclick={exportProject}><b>Project</b><small>.pixelgrid.json</small></button></div>
			<div class="material-summary"><div><span>MATERIAL</span><span>PCS</span></div>{#each project.palette as entry}<p><span><i style={`--color:${entry.hex}`}></i>{entry.code || entry.name}</span><b>{counts[entry.slot]?.toLocaleString('id-ID')}</b></p>{/each}<footer><span>Total</span><b>{counts.reduce((sum, count) => sum + count, 0).toLocaleString('id-ID')}</b></footer></div>
		</aside>
	</div>

	{#if notice}<div class="toast success" role="status" aria-live="polite">✓ {notice}</div>{/if}
	{#if error}<div class="toast error" role="alert" aria-live="assertive"><span>! {error}</span><button type="button" aria-label="Tutup pesan error" onclick={() => (error = null)}>×</button></div>{/if}
</div>

<style>
	.compact-export{display:none;position:relative}.compact-export summary{list-style:none;border:0;border-radius:6px;background:var(--accent);color:white;padding:9px 12px;font-size:9px;font-weight:800}.compact-export>div{position:absolute;right:0;top:38px;z-index:15;width:145px;padding:6px;border:1px solid #ccc9c1;border-radius:7px;background:white;box-shadow:0 12px 28px rgba(31,37,34,.18)}.compact-export>div button{width:100%;border:0;background:transparent;text-align:left;padding:8px;border-radius:4px;font-size:9px;font-weight:700}.compact-export>div button:hover{background:#eeece6}
	.remap-box{margin:-5px 0 16px;padding:11px;border:1px solid #d6c9ad;border-radius:7px;background:#f7f1e5}.remap-box>strong,.remap-box>small{display:block}.remap-box>strong{font-size:9px}.remap-box>small{font-size:8px;line-height:1.45;color:#777266;margin:3px 0 8px}.remap-box>button{width:100%;border:1px solid #b7a47a;border-radius:5px;background:white;padding:7px;color:#5d5033;font-size:8px;font-weight:800}.remap-box>button.apply-remap{background:var(--forest);border-color:var(--forest);color:white}.remap-box p{font-size:8px;line-height:1.4;color:#5d5033}.remap-box ul{list-style:none;padding:0;margin:7px 0;display:flex;flex-direction:column;gap:4px}.remap-box li{display:grid;grid-template-columns:10px minmax(0,1fr) 10px 10px minmax(0,1fr);align-items:center;gap:4px;font-size:7px}.remap-box li i{width:10px;height:10px;background:var(--color);border:1px solid rgba(0,0,0,.12)}.remap-box li span{text-align:center;color:#8c7651}
	.reconvert{width:100%;height:38px;margin:-3px 0 14px;border:1px solid #b8c8c0;border-radius:6px;background:#eef3f0;color:#315447;font-size:9px;font-weight:800}.reconvert span{margin-left:7px;font-size:13px}
	.editor-shell{height:100vh;min-height:680px;display:flex;flex-direction:column;background:#e2e0da;color:#202622;overflow:hidden}.editor-header{height:66px;flex:0 0 auto;display:flex;align-items:center;gap:16px;padding:0 18px;border-bottom:1px solid #c8c6bf;background:#faf9f5}.back{width:36px;height:36px;border:1px solid #d2d0c9;border-radius:6px;background:white;font-size:18px;color:#333a36}.project-name{display:flex;flex-direction:column;border-right:1px solid #d5d2cb;padding-right:20px;min-width:220px}.project-name small,.section-number{font-size:8px;letter-spacing:.16em;font-weight:850;color:#8a8e89}.project-name input{border:0;background:transparent;padding:0;height:23px;font-size:14px;font-weight:800;color:#252b27;min-width:0}.project-name input:focus{outline:0;border-bottom:1px solid var(--cyan)}.project-metrics{display:flex;align-items:center;gap:11px;color:#646b66;font-size:11px;font-weight:650;margin-right:auto}.project-metrics i{width:3px;height:3px;background:#abaea9;border-radius:50%}.save-state{font-size:10px;color:#6b736d;display:flex;align-items:center;gap:7px}.save-state>span{width:7px;height:7px;border-radius:50%;background:#66a56d;box-shadow:0 0 0 4px rgba(102,165,109,.12)}.save-state.problem>span{background:#d05b38}.history-buttons{display:flex}.history-buttons button{width:35px;height:34px;border:1px solid #d0cec7;background:white;color:#464c48;font-size:17px}.history-buttons button:first-child{border-radius:6px 0 0 6px}.history-buttons button:last-child{border-radius:0 6px 6px 0;border-left:0}.history-buttons button:disabled{opacity:.35}
	.editor-body{display:grid;grid-template-columns:270px minmax(420px,1fr) 250px;min-height:0;flex:1}.left-panel,.right-panel{background:#f9f8f4;overflow-y:auto}.left-panel{border-right:1px solid #c9c7c0}.right-panel{border-left:1px solid #c9c7c0;padding:25px 20px}.panel-tabs{display:grid;grid-template-columns:1fr 1fr;height:48px;border-bottom:1px solid #d6d3cb}.panel-tabs button{border:0;background:transparent;color:#7b817d;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.11em;position:relative}.panel-tabs button.active{color:#252b27}.panel-tabs button.active:after{content:"";height:2px;position:absolute;bottom:0;left:20px;right:20px;background:var(--accent)}.left-panel section{padding:23px 20px 35px}.left-panel h2,.right-panel h2{font-size:20px;letter-spacing:-.04em;margin:5px 0 17px}.upload-zone{height:150px;border:1px dashed #b8bbb5;background:#eeece6;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:18px;overflow:hidden;position:relative;cursor:pointer}.upload-zone:hover{border-color:var(--cyan);background:#edf3f1}.upload-zone b{font-size:27px;color:var(--accent);font-weight:400}.upload-zone strong{font-size:12px;margin-top:5px}.upload-zone small{font-size:9px;color:#858b86;margin-top:4px}.upload-zone img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.upload-zone>span{position:absolute;bottom:9px;background:rgba(31,37,34,.82);color:white;padding:6px 9px;border-radius:5px;font-size:9px;font-weight:750}.control-label{display:block;margin:0 0 16px}.control-label>span,.range-label>span{display:flex;justify-content:space-between;margin-bottom:7px;font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;color:#6b726d}.control-label select,.control-label input,.add-color select,.replace-pop select{width:100%;height:38px;border:1px solid #cfcdc6;background:white;border-radius:6px;padding:0 9px;font-size:11px;font-weight:650;color:#303632}.control-label input.number-input{width:100%}.range-label{display:block;margin-bottom:15px}.range-label input{width:100%;accent-color:var(--accent)}.toggle-row{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #dedbd4;border-bottom:1px solid #dedbd4;padding:13px 0;margin:4px 0 16px}.toggle-row>span{display:flex;flex-direction:column}.toggle-row strong{font-size:11px}.toggle-row small{font-size:9px;color:#848983;margin-top:2px}.toggle-row input{width:32px;accent-color:var(--forest)}.progress{display:flex;gap:9px;align-items:center;background:#edf3f1;color:#315447;border-radius:6px;padding:10px;font-size:10px;font-weight:700}.progress i{width:12px;height:12px;border:2px solid #91aca0;border-top-color:#315447;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.helper{font-size:10px;color:#747b76;line-height:1.5;margin:-8px 0 15px}.palette-list{display:flex;flex-direction:column;gap:6px}.palette-row{display:grid;grid-template-columns:1fr 26px 24px;align-items:center;border:1px solid #d7d4cd;border-radius:6px;background:white;position:relative}.palette-row.chosen{border-color:var(--cyan);box-shadow:0 0 0 1px var(--cyan)}.color-choice{border:0;background:transparent;display:flex;align-items:center;gap:9px;text-align:left;padding:7px;min-width:0}.color-choice>span:first-child{width:27px;height:27px;flex:0 0 auto;background:var(--color);border:1px solid rgba(0,0,0,.16)}.color-choice>span:last-child{min-width:0;display:flex;flex-direction:column}.color-choice strong{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.color-choice small{font-size:8px;color:#7c827e;margin-top:2px}.pin{border:0;background:transparent;color:#c4c5c2;font-size:10px}.pin.active{color:var(--accent)}details{position:relative}summary{list-style:none;cursor:pointer;text-align:center;color:#9b6557;font-size:16px}.replace-pop{position:absolute;right:0;top:25px;width:185px;z-index:5;padding:10px;background:#fff;border:1px solid #ccc8c0;border-radius:7px;box-shadow:0 12px 28px rgba(31,37,34,.18)}.replace-pop span{display:block;font-size:8px;font-weight:800;text-transform:uppercase;margin-bottom:5px}.replace-pop button{width:100%;margin-top:7px;border:0;border-radius:5px;background:#99482f;color:white;padding:7px;font-size:9px;font-weight:800}.add-color{display:grid;grid-template-columns:1fr 34px;gap:5px;margin-top:10px}.add-color select{min-width:0}.add-color button{border:0;border-radius:6px;background:var(--forest);color:white;font-size:18px}.add-color button:disabled{opacity:.35}.background{margin-top:18px}
	.canvas-column{min-width:0;display:grid;grid-template-rows:49px minmax(0,1fr) 72px}.canvas-toolbar{display:flex;justify-content:space-between;align-items:center;padding:0 12px;background:#f5f3ee;border-bottom:1px solid #c8c6bf}.tool-group{display:flex;height:100%}.tool-group button{width:56px;border:0;border-right:1px solid #dbd8d1;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#656c67}.tool-group button:first-child{border-left:1px solid #dbd8d1}.tool-group button b{font-size:15px;font-weight:500}.tool-group button span{font-size:7px;text-transform:uppercase;font-weight:800;letter-spacing:.06em}.tool-group button.active{color:white;background:var(--forest)}.view-controls{display:flex;align-items:center;gap:5px}.view-controls label{font-size:9px;font-weight:750;margin-right:7px}.view-controls input{accent-color:var(--forest)}.view-controls button{height:27px;min-width:29px;border:1px solid #d0cec7;background:white;color:#555c57;font-size:10px;border-radius:4px}.view-controls span{font-size:9px;width:38px;text-align:center}.canvas-wrap{min-height:0}.palette-strip{display:flex;align-items:stretch;border-top:1px solid #c4c2bb;background:#f8f7f3;padding:9px 12px;gap:14px}.palette-meta{width:110px;flex:0 0 auto;border-right:1px solid #d4d1ca;display:flex;justify-content:center;flex-direction:column}.palette-meta small{font-size:7px;letter-spacing:.12em;color:#858a86;font-weight:850}.palette-meta strong{font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.strip-scroll{display:flex;gap:6px;overflow-x:auto}.strip-scroll button{height:52px;min-width:49px;border:1px solid #d3d1ca;border-radius:5px;background:white;padding:4px;display:grid;grid-template-columns:1fr auto;grid-template-rows:1fr auto;text-align:left}.strip-scroll button.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}.strip-scroll i{grid-column:1/-1;height:20px;background:var(--color);border:1px solid rgba(0,0,0,.13)}.strip-scroll span{font-size:9px;font-weight:850}.strip-scroll small{font-size:7px;color:#747a75}
	.production-total{border:1px solid #ced8d2;background:#edf2ef;border-radius:7px;padding:13px 14px;margin-bottom:13px}.production-total span{display:block;font-size:7px;letter-spacing:.13em;font-weight:850;color:#738179}.production-total strong{display:block;font:700 27px Georgia,serif;color:var(--forest);margin:3px 0}.production-total small{font-size:8px;color:#728078}.export-primary{width:100%;height:54px;border:0;border-radius:7px;background:var(--accent);color:white;padding:0 14px;display:flex;align-items:center;justify-content:space-between;text-align:left}.export-primary span{display:flex;flex-direction:column}.export-primary b{font-size:12px}.export-primary small{font-size:8px;opacity:.83;margin-top:2px}.export-primary i{font-style:normal;font-size:18px}.export-primary:disabled{opacity:.55}.export-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0 19px}.export-grid button{min-height:50px;border:1px solid #d2d0c8;background:white;border-radius:6px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:8px 9px}.export-grid b{font-size:9px}.export-grid small{font-size:7px;color:#858a86;margin-top:2px}.material-summary{border-top:1px solid #d7d4cd;padding-top:11px}.material-summary>div,.material-summary p,.material-summary footer{display:flex;justify-content:space-between;align-items:center}.material-summary>div{font-size:7px;letter-spacing:.1em;font-weight:850;color:#8a8e8b;padding-bottom:6px}.material-summary p{font-size:8px;margin:0;padding:6px 0;border-top:1px solid #e4e1da}.material-summary p span{display:flex;align-items:center;gap:6px;min-width:0}.material-summary p i{width:13px;height:13px;background:var(--color);border:1px solid rgba(0,0,0,.13);flex:0 0 auto}.material-summary footer{border-top:1px solid #c7c4bc;padding-top:8px;font-size:9px}.toast{position:fixed;z-index:20;right:20px;bottom:20px;max-width:390px;border-radius:7px;padding:11px 14px;font-size:11px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.2)}.toast.success{background:#315a49;color:white}.toast.error{background:#963f27;color:white;display:flex;gap:12px;align-items:center}.toast.error button{border:0;background:transparent;color:white;font-size:17px}
	@media(max-width:1100px){.editor-body{grid-template-columns:245px minmax(420px,1fr)}.right-panel{display:none}.project-metrics{display:none}.compact-export{display:block}}
	@media(max-width:760px){.editor-shell{height:auto;min-height:100vh;overflow:visible}.editor-header{position:sticky;top:0;z-index:8}.project-name{min-width:0;flex:1;border:0}.save-state{display:none}.editor-body{display:flex;flex-direction:column}.left-panel{order:2;border-right:0;border-top:1px solid #c9c7c0;max-height:none}.canvas-column{height:70vh;min-height:530px;order:1}.view-controls label{display:none}.tool-group button{width:46px}.tool-group button span{display:none}}
</style>
