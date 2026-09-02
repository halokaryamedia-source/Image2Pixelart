<script lang="ts">
	import { onDestroy } from 'svelte';
	import CloudProjectThumbnail from '$lib/components/CloudProjectThumbnail.svelte';
	import type { CloudProjectSummary } from '$lib/cloud/types';
	import { MAX_IMAGE_BYTES } from '$lib/image-converter';
	import { cmToMm, validateGridMm } from '$lib/utils/grid';

	type CreateInput = { name: string; widthMm: number; heightMm: number; cellMm: number; mode: 'image' | 'blank'; file?: File };
	type Props = {
		projects: CloudProjectSummary[]; ready: boolean; deviceName: string; deviceId: string;
		onCreate: (input: CreateInput) => Promise<void>;
		onOpen: (project: CloudProjectSummary) => void; onDelete: (id: string) => void; onImport: (file: File) => void; onRenameDevice: () => void;
	};
	let { projects, ready, deviceName, deviceId, onCreate, onOpen, onDelete, onImport, onRenameDevice }: Props = $props();
	let mode = $state<'image' | 'blank'>('image');
	let name = $state('');
	let widthCm = $state(240); let heightCm = $state(120); let cellCm = $state(5);
	let selectedFile = $state<File | null>(null); let previewUrl = $state(''); let fileError = $state('');
	let creating = $state(false); let openMenu = $state<string | null>(null);
	let validation = $derived(validateGridMm(cmToMm(widthCm), cmToMm(heightCm), cmToMm(cellCm)));
	let previewColumns = $derived(validation.valid ? validation.columns : 24);
	let previewRows = $derived(validation.valid ? validation.rows : 24);
	let activeProjects = $derived(projects.filter((project) => !project.deletedAt));
	let canSubmit = $derived(validation.valid && ready && !creating && (mode === 'blank' || !!selectedFile));

	onDestroy(() => { if (previewUrl) URL.revokeObjectURL(previewUrl); });
	function baseName(fileName: string) { return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 120); }
	function fallbackName() {
		const used = new Set(projects.map((project) => project.name));
		let index = 1;
		while (used.has(`Karya-${index}`)) index += 1;
		return `Karya-${index}`;
	}
	function chooseImage(file?: File) {
		if (!file) return; fileError = '';
		if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { fileError = 'Gunakan Format File.'; return; }
		if (file.size > MAX_IMAGE_BYTES) { fileError = 'Ukuran file melebihi 20 MB.'; return; }
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		selectedFile = file; previewUrl = URL.createObjectURL(file);
		const suggestedName = baseName(file.name); if (suggestedName) name = suggestedName;
	}
	function imageInput(event: Event) { const input = event.currentTarget as HTMLInputElement; chooseImage(input.files?.[0]); input.value = ''; }
	function dropImage(event: DragEvent) { event.preventDefault(); chooseImage(event.dataTransfer?.files?.[0]); }
	async function submit(event: SubmitEvent) {
		event.preventDefault(); if (!canSubmit) return; creating = true;
		const finalName = name.trim() || fallbackName(); name = finalName;
		try { await onCreate({ name: finalName, widthMm: cmToMm(widthCm), heightMm: cmToMm(heightCm), cellMm: cmToMm(cellCm), mode, file: selectedFile ?? undefined }); }
		finally { creating = false; }
	}
	function importFile(event: Event) { const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; input.value = ''; if (file) onImport(file); }
</script>

<header class="topbar">
	<a class="brand" href="/" aria-label="MIVUBI Pixel Art Editor, beranda"><img src="/mivubi-logo.png" alt="" width="36" height="36" /><span><strong>MIVUBI</strong><small>PIXEL ART EDITOR</small></span></a>
	<nav aria-label="Navigasi utama"><a class="active" href="#projects">File Tersimpan</a></nav>
	<button class="device-button" type="button" onclick={onRenameDevice} title={`Device ID: ${deviceId}`}>☁ {deviceName}</button>
	<label class="secondary-button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v10h-17z" /></svg>Buka File<input class="sr-only" type="file" accept=".json,.pixelgrid.json,application/json" onchange={importFile} /></label>
</header>

<main>
	<section class="intro"><p class="eyebrow">MIVUBI · PIXEL ART EDITOR</p><h1>Buat dan edit <em>Pixel Art.</em></h1><p>Ubah gambarmu menjadi Pixel Art, atau mulai berkarya dari Canvas kosong.</p></section>
	<section class="quick-start" aria-label="Buat Karya Baru">
		<form class="setup-card" onsubmit={submit}>
			<h2 class="creation-title">Buat Karya Baru</h2>
			<div class="mode-tabs" role="tablist" aria-label="Cara memulai karya">
				<button class:active={mode === 'image'} type="button" role="tab" aria-selected={mode === 'image'} onclick={() => (mode = 'image')}><span>▧</span>Upload Gambar</button>
				<button class:active={mode === 'blank'} type="button" role="tab" aria-selected={mode === 'blank'} onclick={() => (mode = 'blank')}><span>▦</span>Buat Baru</button>
			</div>
			<p class="mode-description">{mode === 'image' ? 'Ubah gambar menjadi Pixel Art secara otomatis.' : 'Buat Pixel Art dari Canvas kosong.'}</p>
			{#if mode === 'image'}
				<label class:has-file={!!selectedFile} class="dropzone" ondragover={(event) => event.preventDefault()} ondrop={dropImage}>
					<input class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onchange={imageInput} /><span class="upload-icon">↥</span>
					<strong>{selectedFile ? selectedFile.name : 'Klik untuk memilih gambar atau drag & drop ke area ini.'}</strong>
					<small>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB · klik untuk mengganti` : 'PNG, JPG, WEBP · Maks. 20 MB'}</small>
				</label>
				{#if fileError}<p class="form-error" role="alert">{fileError}</p>{/if}
			{/if}
			<label><span>Nama Karya</span><input bind:value={name} maxlength="200" placeholder="Beri nama karyamu" /></label>
			<div class:invalid={!validation.valid} class="grid-result"><span><b>▦</b><strong><small>Ukuran Grid</small>{validation.valid ? `${validation.columns} × ${validation.rows}` : '—'}</strong></span></div>
			{#if !validation.valid}<p class="form-error">{validation.reason}</p>{/if}
			<button class="primary-button" type="submit" disabled={!canSubmit}>{creating ? (mode === 'image' ? 'Memproses gambar…' : 'Membuat karya…') : 'Buat Karya'} <span>→</span></button>
		</form>
		<aside class="visual-card" aria-label="Preview Karya">
			<div class="preview-heading"><strong>Preview Karya</strong><span>{mode === 'image' && selectedFile ? 'Gambar siap diproses' : 'Ukuran Grid'}</span></div>
			<div class="dimension width"><i></i><span>{widthCm} cm</span><i></i></div>
			<div class="preview-row"><div class="grid-stage" style={`--preview-columns:${previewColumns};--preview-rows:${previewRows}`}>{#if previewUrl && mode === 'image'}<img src={previewUrl} alt="Preview gambar yang dipilih" />{/if}<div class="grid-overlay"></div></div><div class="dimension height"><i></i><span>{heightCm} cm</span><i></i></div></div>
			<p>{mode === 'image' ? 'Gambar akan diproses menjadi Pixel Art dengan palet 8 warna.' : 'Mulai Pixel Art baru dari Canvas kosong.'}</p>
		</aside>
	</section>
	<section class="projects" id="projects">
		<div class="projects-heading"><div><p class="eyebrow">File Tersimpan</p><h2>Lanjutkan pekerjaan</h2></div><span>{activeProjects.length} file tersedia di perangkat ini</span></div>
		{#if !ready}<div class="empty">Membuka daftar file tersimpan…</div>{:else if activeProjects.length === 0}<div class="empty"><strong>Belum ada file tersimpan.</strong></div>{:else}
			<div class="project-grid">{#each activeProjects as project}<article><button class="project-open" type="button" onclick={() => onOpen(project)}><div class="mini-mosaic"><CloudProjectThumbnail {project} /></div><div class="project-copy"><strong>{project.name}</strong><span>{project.columns} × {project.rows} Grid · {project.palette.length} warna</span><small>Terakhir diubah {new Date(project.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</small><b>Lanjutkan <i>→</i></b></div></button><button class="menu-trigger" type="button" aria-label={`Menu file ${project.name}`} aria-expanded={openMenu === project.id} onclick={() => (openMenu = openMenu === project.id ? null : project.id)}>⋮</button>{#if openMenu === project.id}<div class="project-menu"><button type="button" onclick={() => { openMenu = null; if (confirm(`Pindahkan file “${project.name}” ke Sampah? File dapat dipulihkan selama 7 hari.`)) onDelete(project.id); }} disabled={project.role !== 'owner'}>Hapus File</button></div>{/if}</article>{/each}</div>
		{/if}
	</section>
</main>

<style>
	.topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:34px;background:rgba(254,252,245,.94);position:sticky;top:0;z-index:30}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);padding-right:32px;border-right:1px solid var(--line)}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand>span{display:flex;flex-direction:column;line-height:1}.brand strong{font:700 17px "Readex Pro",sans-serif;letter-spacing:.12em}.brand small{margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.16em}nav{margin-right:auto;height:100%;display:flex;align-items:center}nav a{height:100%;display:flex;align-items:center;color:var(--ink);font-size:14px;font-weight:650;text-decoration:none;border-bottom:2px solid var(--forest)}.secondary-button{min-height:44px;display:inline-flex;align-items:center;gap:9px;padding:0 15px;border:1px solid #d7d2c4;border-radius:8px;background:white;color:var(--ink);font-size:14px;font-weight:650;cursor:pointer}.secondary-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}main{max-width:1440px;margin:auto;padding:34px clamp(24px,5vw,72px) 72px}.intro{margin-bottom:20px}.eyebrow{margin:0 0 9px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.intro h1{margin:0;font:700 clamp(36px,4vw,52px)/1.05 "Readex Pro",sans-serif;letter-spacing:-.045em}.intro h1 em{font-style:normal;color:var(--forest)}.intro>p:last-child{margin:10px 0 0;color:var(--muted);font-size:16px}.quick-start{display:grid;grid-template-columns:minmax(360px,40%) 1fr;border:1px solid #ded8c8;border-radius:14px;background:white;box-shadow:0 16px 45px rgba(33,48,47,.07);overflow:hidden}.setup-card{padding:28px;border-right:1px solid #e2ddcf}.creation-title{margin:0 0 16px;font:650 22px "Readex Pro",sans-serif;letter-spacing:-.025em}.mode-tabs{display:grid;grid-template-columns:1fr 1fr;margin-bottom:8px}.mode-tabs button{min-height:48px;border:1px solid #d8d3c5;background:#fbfaf5;color:#4d5651;font-size:14px;font-weight:700}.mode-tabs button:first-child{border-radius:8px 0 0 8px}.mode-tabs button:last-child{border-radius:0 8px 8px 0}.mode-tabs button.active{position:relative;z-index:1;border-color:#6f9b83;background:#eef6f1;color:var(--forest)}.mode-tabs span{margin-right:9px;font-size:18px}.mode-description{margin:0 0 16px;color:var(--muted);font-size:12px}.dropzone{min-height:116px;border:1px dashed #9fa8a1;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;margin-bottom:18px;cursor:pointer;background:#fdfdfb}.dropzone.has-file{border-style:solid;border-color:#78a18b;background:#f1f7f3}.upload-icon{font-size:28px;line-height:1;color:var(--forest)}.dropzone strong{margin-top:6px;font-size:14px}.dropzone small{margin-top:4px;color:var(--muted);font-size:12px}.setup-card>label{display:block;margin-bottom:14px}.setup-card label>span:not(.upload-icon){display:block;margin-bottom:6px;font-size:13px;font-weight:650}.setup-card input{width:100%;height:44px;border:1px solid #d9d5ca;border-radius:7px;background:white;padding:0 12px;color:var(--ink);font-size:14px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field-grid label{display:block}.unit-input{position:relative}.unit-input input{padding-right:46px}.unit-input b{position:absolute;right:12px;top:13px;color:#7a827d;font-size:12px}.grid-result{display:grid;grid-template-columns:1fr;border:1px solid #bad2c5;border-radius:8px;background:#eef6f1;margin:5px 0 14px}.grid-result>span{min-width:0;display:flex;align-items:center;gap:9px;padding:10px}.grid-result b{color:var(--forest);font-size:16px}.grid-result strong{display:flex;flex-direction:column;color:var(--forest);font:700 15px "Readex Pro",sans-serif}.grid-result small{font:500 11px Poppins,sans-serif;color:#63756b}.grid-result.invalid{border-color:#e5b9aa;background:#fff2ed}.form-error{margin:-8px 0 12px;color:var(--danger);font-size:12px}.primary-button{width:100%;min-height:46px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:14px;font-weight:750}.primary-button span{margin-left:16px;font-size:18px}.primary-button:disabled{opacity:.48;cursor:not-allowed}.visual-card{min-width:0;padding:28px 30px 22px;background:#fffefa}.preview-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:14px}.preview-heading span{color:var(--muted);font-size:12px}.dimension{display:flex;align-items:center;color:#505953;font-size:12px}.dimension i{height:1px;background:#aeb5b0;flex:1}.dimension span{padding:0 12px}.preview-row{display:grid;grid-template-columns:minmax(0,1fr) 32px;align-items:stretch;gap:8px;margin-top:10px}.grid-stage{position:relative;width:100%;aspect-ratio:var(--preview-columns)/var(--preview-rows);max-height:450px;border:1px solid #aeb8b1;background:#fff;overflow:hidden}.grid-stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72;filter:saturate(.7)}.grid-overlay{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(40,67,54,.18) 1px,transparent 1px),linear-gradient(to bottom,rgba(40,67,54,.18) 1px,transparent 1px);background-size:calc(100% / var(--preview-columns)) calc(100% / var(--preview-rows));background-color:rgba(250,250,246,.18)}.height{writing-mode:vertical-rl}.height i{width:1px;height:auto}.visual-card>p{margin:14px 0 0;color:var(--muted);font-size:13px}.projects{margin-top:34px}.projects-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}.projects-heading h2{margin:0;font:650 25px "Readex Pro",sans-serif;letter-spacing:-.035em}.projects-heading>span{color:var(--muted);font-size:13px}.empty{min-height:140px;border:1px dashed #cfc9b7;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;color:var(--muted);font-size:14px}.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.project-grid article{position:relative;border:1px solid #ddd8ca;border-radius:10px;background:#fff;box-shadow:0 7px 22px rgba(33,48,47,.05)}.project-open{width:100%;display:grid;grid-template-columns:180px minmax(0,1fr);border:0;background:transparent;padding:0;text-align:left;color:inherit}.mini-mosaic{height:142px;overflow:hidden;border-radius:9px 0 0 9px;background:#eef0e9;display:grid;place-items:center}.project-copy{min-width:0;padding:20px 44px 17px 20px;display:flex;flex-direction:column}.project-copy strong{font:650 16px "Readex Pro",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.project-copy>span{margin-top:8px;color:var(--forest);font-size:13px}.project-copy small{margin-top:8px;color:var(--muted);font-size:12px}.project-copy b{margin-top:auto;color:var(--forest);font-size:13px}.project-copy i{margin-left:8px;font-style:normal}.menu-trigger{position:absolute;right:10px;top:10px;width:40px;height:40px;border:0;border-radius:7px;background:transparent;font-size:22px}.menu-trigger:hover{background:#f3f1e9}.project-menu{position:absolute;z-index:5;right:10px;top:48px;padding:6px;border:1px solid #d8d3c6;border-radius:8px;background:white;box-shadow:0 12px 28px rgba(31,43,36,.16)}.project-menu button{height:40px;border:0;background:transparent;color:var(--danger);font-size:13px;white-space:nowrap}.project-menu button:hover{background:#fff1ec}@media(max-width:980px){.quick-start{grid-template-columns:1fr}.setup-card{border-right:0;border-bottom:1px solid #e2ddcf}.project-grid{grid-template-columns:1fr}.visual-card{min-height:420px}}@media(max-width:680px){.topbar{padding:0 16px;gap:12px}.brand{padding-right:0;border:0}.brand small,.topbar nav{display:none}.secondary-button{margin-left:auto;font-size:0;width:44px;padding:0;justify-content:center}main{padding:24px 16px 56px}.intro h1{font-size:34px}.intro>p:last-child{font-size:14px}.setup-card,.visual-card{padding:20px}.field-grid{grid-template-columns:1fr}.preview-row{grid-template-columns:1fr}.height{display:none}.visual-card{min-height:0}.project-open{grid-template-columns:120px 1fr}.mini-mosaic{height:132px}.project-copy{padding:16px 38px 14px 14px}.projects-heading>span{display:none}}
	.setup-card input.sr-only{width:1px!important;height:1px!important;padding:0!important}
	.device-button{min-height:38px;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 11px;border:1px solid #d7d2c4;border-radius:8px;background:#eef6f1;color:var(--forest);font-size:12px;font-weight:700}
</style>
