<script lang="ts">
	import CloudProjectThumbnail from '$lib/components/CloudProjectThumbnail.svelte';
	import type { CloudProjectSummary } from '$lib/cloud/types';
	import { cmToMm, validateGridMm } from '$lib/utils/grid';

	type CreateInput = { name: string; widthMm: number; heightMm: number; cellMm: number; mode: 'blank' };
	type Props = {
		projects: CloudProjectSummary[];
		ready: boolean;
		deviceName: string;
		deviceId: string;
		onCreate: (input: CreateInput) => Promise<void>;
		onOpen: (project: CloudProjectSummary) => void;
		onDelete: (id: string) => void;
		onImport: (file: File) => void;
		onRenameDevice: () => void;
	};

	let { projects, ready, deviceName, deviceId, onCreate, onOpen, onDelete, onImport, onRenameDevice }: Props = $props();
	let showAdminSetup = $state(false);
	let openMenu = $state<string | null>(null);
	let creating = $state(false);
	let name = $state('Proyek mosaic baru');
	let widthCm = $state(240);
	let heightCm = $state(120);
	let cellCm = $state(5);
	let validation = $derived(validateGridMm(cmToMm(widthCm), cmToMm(heightCm), cmToMm(cellCm)));

	function roleLabel(role: CloudProjectSummary['role']) {
		return role === 'owner' ? 'Admin' : role === 'editor' ? 'Bisa edit' : 'Hanya lihat';
	}

	function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file) onImport(file);
	}

	async function submitAdminProject(event: SubmitEvent) {
		event.preventDefault();
		if (!validation.valid || creating) return;
		creating = true;
		try {
			await onCreate({
				name: name.trim() || 'Proyek mosaic baru',
				widthMm: cmToMm(widthCm),
				heightMm: cmToMm(heightCm),
				cellMm: cmToMm(cellCm),
				mode: 'blank'
			});
		} finally {
			creating = false;
		}
	}
</script>

<header class="topbar">
	<a class="brand" href="/" aria-label="MIVUBI Mosaic Plan, beranda">
		<img src="/mivubi-logo.png" alt="" width="36" height="36" />
		<span><strong>MIVUBI</strong><small>PIXEL MOSAIC PLANNER</small></span>
	</a>
	<nav aria-label="Navigasi utama"><a class="active" href="#projects">Proyek</a></nav>
	<button class="device-button" type="button" onclick={onRenameDevice} title={`Kelola nama perangkat · ID: ${deviceId}`}>Perangkat · {deviceName}</button>
	<label class="secondary-button">
		<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v10h-17z" /></svg>
		Buka file proyek
		<input class="sr-only" type="file" accept=".json,.pixelgrid.json,application/json" onchange={importFile} />
	</label>
</header>

<main>
	<section class="intro">
		<p class="eyebrow">MIVUBI · PIXEL MOSAIC PLANNER</p>
		<div class="intro-row">
			<div><h1>Proyek <em>mosaic.</em></h1><p>Pilih proyek untuk upload gambar, melanjutkan edit, atau mulai build.</p></div>
			<button class="secondary-button admin-toggle" type="button" aria-expanded={showAdminSetup} onclick={() => (showAdminSetup = !showAdminSetup)}>{showAdminSetup ? 'Tutup pengaturan Admin' : 'Buat proyek · Admin'}</button>
		</div>
	</section>

	<section class="projects" id="projects">
		<div class="projects-heading"><div><p class="eyebrow">PROYEK</p><h2>Pilih pekerjaan</h2></div><span>{projects.length} proyek tersedia</span></div>
		{#if !ready}
			<div class="empty">Memuat proyek…</div>
		{:else if projects.length === 0}
			<div class="empty"><strong>Belum ada proyek untuk perangkat ini.</strong><span>Buka link proyek yang dibagikan Admin, atau buat proyek baru melalui Pengaturan Admin.</span></div>
		{:else}
			<div class="project-grid">
				{#each projects as project}
					<article>
						<button class="project-open" type="button" onclick={() => onOpen(project)}>
							<div class="mini-mosaic"><CloudProjectThumbnail {project} /></div>
							<div class="project-copy">
								<div class="project-title"><strong>{project.name}</strong><span class="role">{roleLabel(project.role)}</span></div>
								<span>{project.widthMm / 10} × {project.heightMm / 10} cm · {project.columns} × {project.rows} grid · tile {project.cellMm / 10} cm</span>
								<small>{project.deletedAt ? 'Di tempat sampah' : `Diubah ${new Date(project.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}</small>
								<b>{project.deletedAt ? 'Lihat status' : project.hasSourceImage ? 'Lanjutkan editor' : 'Upload gambar'} <i>→</i></b>
							</div>
						</button>
						{#if project.role === 'owner'}
							<button class="menu-trigger" type="button" aria-label={`Menu proyek ${project.name}`} aria-expanded={openMenu === project.id} onclick={() => (openMenu = openMenu === project.id ? null : project.id)}>⋮</button>
							{#if openMenu === project.id}<div class="project-menu"><button type="button" onclick={() => { openMenu = null; if (confirm(`Pindahkan proyek “${project.name}” ke tempat sampah selama 7 hari?`)) onDelete(project.id); }} disabled={!!project.deletedAt}>Hapus proyek</button></div>{/if}
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>

	{#if showAdminSetup}
		<section class="admin-section" aria-label="Pengaturan Admin">
			<div class="admin-heading"><div><p class="eyebrow">PENGATURAN ADMIN</p><h2>Buat canvas proyek</h2></div><span>Player hanya menerima ukuran ini sebagai informasi.</span></div>
			<div class="quick-start">
				<form class="setup-card" onsubmit={submitAdminProject}>
					<label><span>Nama proyek</span><input bind:value={name} maxlength="200" /></label>
					<div class="field-grid">
						<label><span>Lebar</span><div class="unit-input"><input type="number" bind:value={widthCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>
						<label><span>Tinggi</span><div class="unit-input"><input type="number" bind:value={heightCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>
					</div>
					<label><span>Ukuran tile</span><div class="unit-input"><input type="number" bind:value={cellCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>
					<div class:invalid={!validation.valid} class="grid-result">
						<span><b>▦</b><strong>{validation.valid ? `${validation.columns} × ${validation.rows}` : '—'}<small>grid</small></strong></span>
						<span><b>⠿</b><strong>{validation.valid ? validation.total.toLocaleString('id-ID') : '—'}<small>tile</small></strong></span>
						<span><b>▥</b><strong>{cellCm} cm<small>per tile</small></strong></span>
					</div>
					{#if !validation.valid}<p class="form-error">{validation.reason}{#if validation.suggestionsCm.length} Coba {validation.suggestionsCm.join(', ')} cm.{/if}</p>{/if}
					<button class="primary-button" type="submit" disabled={!validation.valid || creating}>{creating ? 'Membuat proyek…' : 'Buat proyek'} <span>→</span></button>
				</form>
				<aside class="visual-card" aria-label="Preview ukuran grid">
					<div class="preview-heading"><strong>Canvas tetap · {validation.valid ? `${validation.columns} × ${validation.rows}` : '—'}</strong><span>Admin configuration</span></div>
					<div class="dimension width"><i></i><span>{widthCm} cm</span><i></i></div>
					<div class="preview-row"><div class="grid-stage" style={`--preview-columns:${validation.valid ? validation.columns : 24};--preview-rows:${validation.valid ? validation.rows : 24}`}><div class="grid-overlay"></div></div><div class="dimension height"><i></i><span>{heightCm} cm</span><i></i></div></div>
					<p>Setelah proyek dibuat, Player dapat upload gambar atau build pada canvas ini tanpa mengubah ukurannya.</p>
				</aside>
			</div>
		</section>
	{/if}
</main>

<style>
	.topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:34px;background:rgba(254,252,245,.94);position:sticky;top:0;z-index:30}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);padding-right:32px;border-right:1px solid var(--line)}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand>span{display:flex;flex-direction:column;line-height:1}.brand strong{font:700 17px "Readex Pro",sans-serif;letter-spacing:.12em}.brand small{margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.16em}nav{margin-right:auto;height:100%;display:flex;align-items:center}nav a{height:100%;display:flex;align-items:center;color:var(--ink);font-size:14px;font-weight:650;text-decoration:none;border-bottom:2px solid var(--forest)}.secondary-button{min-height:44px;display:inline-flex;align-items:center;gap:9px;padding:0 15px;border:1px solid #d7d2c4;border-radius:8px;background:white;color:var(--ink);font-size:14px;font-weight:650;cursor:pointer}.secondary-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}.device-button{min-height:38px;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 11px;border:1px solid #d7d2c4;border-radius:8px;background:#fffdfa;color:#66716b;font-size:12px;font-weight:650}main{max-width:1440px;margin:auto;padding:34px clamp(24px,5vw,72px) 72px}.intro{margin-bottom:28px}.eyebrow{margin:0 0 9px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.intro-row{display:flex;align-items:end;justify-content:space-between;gap:24px}.intro h1{margin:0;font:700 clamp(36px,4vw,52px)/1.05 "Readex Pro",sans-serif;letter-spacing:-.045em}.intro h1 em{font-style:normal;color:var(--forest)}.intro p:last-child{margin:10px 0 0;color:var(--muted);font-size:16px}.admin-toggle{flex:0 0 auto}.projects-heading,.admin-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}.projects-heading h2,.admin-heading h2{margin:0;font:650 25px "Readex Pro",sans-serif;letter-spacing:-.035em}.projects-heading>span,.admin-heading>span{color:var(--muted);font-size:13px}.empty{min-height:160px;border:1px dashed #cfc9b7;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;padding:24px;text-align:center;color:var(--muted);font-size:14px}.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.project-grid article{position:relative;border:1px solid #ddd8ca;border-radius:10px;background:#fff;box-shadow:0 7px 22px rgba(33,48,47,.05);transition:border-color .16s,box-shadow .16s,transform .16s}.project-grid article:hover{border-color:#b6c8bd;box-shadow:0 10px 26px rgba(33,48,47,.08);transform:translateY(-1px)}.project-open{width:100%;display:grid;grid-template-columns:180px minmax(0,1fr);border:0;background:transparent;padding:0;text-align:left;color:inherit}.mini-mosaic{height:150px;overflow:hidden;border-radius:9px 0 0 9px;background:#eef0e9;display:grid;place-items:center}.project-copy{min-width:0;padding:18px 44px 16px 20px;display:flex;flex-direction:column}.project-title{display:flex;align-items:center;gap:8px;min-width:0}.project-title strong{min-width:0;font:650 16px "Readex Pro",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.role{flex:0 0 auto;padding:3px 7px;border-radius:99px;background:#eef6f1;color:var(--forest);font-size:10px;font-weight:750}.project-copy>span{margin-top:8px;color:var(--forest);font-size:13px}.project-copy small{margin-top:7px;color:var(--muted);font-size:12px}.project-copy b{margin-top:auto;color:var(--forest);font-size:13px}.project-copy i{margin-left:8px;font-style:normal}.menu-trigger{position:absolute;right:10px;top:10px;width:40px;height:40px;border:0;border-radius:7px;background:transparent;font-size:22px}.menu-trigger:hover{background:#f3f1e9}.project-menu{position:absolute;z-index:5;right:10px;top:48px;padding:6px;border:1px solid #d8d3c6;border-radius:8px;background:white;box-shadow:0 12px 28px rgba(31,43,36,.16)}.project-menu button{height:40px;border:0;background:transparent;color:var(--danger);font-size:13px;white-space:nowrap}.admin-section{margin-top:42px;padding-top:32px;border-top:1px solid var(--line)}.quick-start{display:grid;grid-template-columns:minmax(360px,40%) 1fr;border:1px solid #ded8c8;border-radius:14px;background:white;box-shadow:0 16px 45px rgba(33,48,47,.07);overflow:hidden}.setup-card{padding:28px;border-right:1px solid #e2ddcf}.setup-card>label{display:block;margin-bottom:14px}.setup-card label>span{display:block;margin-bottom:6px;font-size:13px;font-weight:650}.setup-card input{width:100%;height:44px;border:1px solid #d9d5ca;border-radius:7px;background:white;padding:0 12px;color:var(--ink);font-size:14px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field-grid label{display:block}.unit-input{position:relative}.unit-input input{padding-right:46px}.unit-input b{position:absolute;right:12px;top:13px;color:#7a827d;font-size:12px}.grid-result{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #bad2c5;border-radius:8px;background:#eef6f1;margin:5px 0 14px}.grid-result>span{min-width:0;display:flex;align-items:center;gap:9px;padding:10px}.grid-result>span+span{border-left:1px solid #c8dbd1}.grid-result b{color:var(--forest);font-size:16px}.grid-result strong{display:flex;flex-direction:column;color:var(--forest);font:700 15px "Readex Pro",sans-serif}.grid-result small{font:500 11px Poppins,sans-serif;color:#63756b}.grid-result.invalid{border-color:#e5b9aa;background:#fff2ed}.form-error{margin:-8px 0 12px;color:var(--danger);font-size:12px}.primary-button{width:100%;min-height:46px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:14px;font-weight:750}.primary-button span{margin-left:16px;font-size:18px}.primary-button:disabled{opacity:.48;cursor:not-allowed}.visual-card{min-width:0;padding:28px 30px 22px;background:#fffefa}.preview-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:14px}.preview-heading span{color:var(--muted);font-size:12px}.dimension{display:flex;align-items:center;color:#505953;font-size:12px}.dimension i{height:1px;background:#aeb5b0;flex:1}.dimension span{padding:0 12px}.preview-row{display:grid;grid-template-columns:minmax(0,1fr) 32px;align-items:stretch;gap:8px;margin-top:10px}.grid-stage{position:relative;width:100%;aspect-ratio:var(--preview-columns)/var(--preview-rows);max-height:420px;border:1px solid #aeb8b1;background:#fff;overflow:hidden}.grid-overlay{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(40,67,54,.18) 1px,transparent 1px),linear-gradient(to bottom,rgba(40,67,54,.18) 1px,transparent 1px);background-size:calc(100% / var(--preview-columns)) calc(100% / var(--preview-rows));background-color:rgba(250,250,246,.18)}.height{writing-mode:vertical-rl}.height i{width:1px;height:auto}.visual-card>p{margin:14px 0 0;color:var(--muted);font-size:13px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:980px){.project-grid{grid-template-columns:1fr}.quick-start{grid-template-columns:1fr}.setup-card{border-right:0;border-bottom:1px solid #e2ddcf}}@media(max-width:680px){.topbar{padding:0 16px;gap:12px}.brand{padding-right:0;border:0}.brand small,.topbar nav,.device-button{display:none}.secondary-button{margin-left:auto}.intro-row{align-items:stretch;flex-direction:column}.admin-toggle{margin-left:0;width:max-content}.projects-heading>span,.admin-heading>span{display:none}main{padding:24px 16px 56px}.intro h1{font-size:34px}.project-open{grid-template-columns:120px 1fr}.mini-mosaic{height:138px}.project-copy{padding:15px 38px 14px 14px}.field-grid{grid-template-columns:1fr}.grid-result{grid-template-columns:1fr}.grid-result>span+span{border-left:0;border-top:1px solid #c8dbd1}.setup-card,.visual-card{padding:20px}.preview-row{grid-template-columns:1fr}.height{display:none}}
</style>