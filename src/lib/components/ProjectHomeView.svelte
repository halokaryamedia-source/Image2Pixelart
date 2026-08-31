<script lang="ts">
	import CloudProjectThumbnail from '$lib/components/CloudProjectThumbnail.svelte';
	import type { CloudProjectSummary } from '$lib/cloud/types';

	type Props = {
		projects: CloudProjectSummary[];
		ready: boolean;
		deviceName: string;
		onOpen: (project: CloudProjectSummary) => void;
		onDelete: (id: string) => void;
		onImport: (file: File) => void;
		onRenameDevice: () => void;
	};

	let { projects, ready, deviceName, onOpen, onDelete, onImport, onRenameDevice }: Props = $props();
	let openMenu = $state<string | null>(null);

	function roleLabel(role: CloudProjectSummary['role']) {
		return role === 'owner' ? 'Admin' : role === 'editor' ? 'Bisa edit' : 'Hanya lihat';
	}

	function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file) onImport(file);
	}
</script>

<header class="topbar">
	<a class="brand" href="/" aria-label="MIVUBI Mosaic Plan, beranda">
		<img src="/mivubi-logo.png" alt="" width="36" height="36" />
		<span><strong>MIVUBI</strong><small>PIXEL MOSAIC PLANNER</small></span>
	</a>
	<nav aria-label="Navigasi utama"><a class="active" href="#projects">Proyek</a></nav>
	<button class="device-button" type="button" onclick={onRenameDevice} title="Ganti nama pengguna">Pengguna · {deviceName}</button>
	<label class="secondary-button">
		<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v10h-17z" /></svg>
		Buka file proyek
		<input class="sr-only" type="file" accept=".json,.pixelgrid.json,application/json" onchange={importFile} />
	</label>
</header>

<main>
	<section class="intro">
		<p class="eyebrow">MIVUBI · PIXEL MOSAIC PLANNER</p>
		<h1>Dari gambar ke <em>grid presisi.</em></h1>
		<p>Pilih proyek untuk mengunggah gambar atau melanjutkan build.</p>
	</section>

	<section class="projects" id="projects">
		<div class="projects-heading">
			<div><p class="eyebrow">PROYEK</p><h2>Lanjutkan pekerjaan</h2></div>
			<span>{projects.length} proyek</span>
		</div>
		{#if !ready}
			<div class="empty">Memuat proyek…</div>
		{:else if projects.length === 0}
			<div class="empty"><strong>Belum ada proyek.</strong><span>Buka link proyek yang dibagikan untuk mulai bekerja.</span></div>
		{:else}
			<div class="project-grid">
				{#each projects as project}
					<article>
						<button class="project-open" type="button" onclick={() => onOpen(project)}>
							<div class="mini-mosaic"><CloudProjectThumbnail {project} /></div>
							<div class="project-copy">
								<div class="project-title"><strong>{project.name}</strong><span>{roleLabel(project.role)}</span></div>
								<div class="project-facts">
									<span><small>Canvas</small><b>{project.widthMm / 10} × {project.heightMm / 10} cm</b></span>
									<span><small>Grid Canvas</small><b>{project.columns} kolom × {project.rows} baris</b></span>
									<span><small>Ukuran 1 Tile</small><b>{project.cellMm / 10} × {project.cellMm / 10} cm</b></span>
								</div>
								<small class="updated">{project.deletedAt ? 'Di tempat sampah' : `Diubah ${new Date(project.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}</small>
								<b class="project-cta">{project.deletedAt ? 'Lihat status' : project.hasSourceImage ? 'Lanjutkan editor' : 'Upload gambar'} <i>→</i></b>
							</div>
						</button>
						{#if project.role === 'owner'}
							<button class="menu-trigger" type="button" aria-label={`Menu proyek ${project.name}`} aria-expanded={openMenu === project.id} onclick={() => (openMenu = openMenu === project.id ? null : project.id)}>⋮</button>
							{#if openMenu === project.id}
								<div class="project-menu"><button type="button" onclick={() => { openMenu = null; if (confirm(`Pindahkan proyek “${project.name}” ke tempat sampah selama 7 hari?`)) onDelete(project.id); }} disabled={!!project.deletedAt}>Hapus proyek</button></div>
							{/if}
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:34px;background:rgba(254,252,245,.94);position:sticky;top:0;z-index:30}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);padding-right:32px;border-right:1px solid var(--line)}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand>span{display:flex;flex-direction:column;line-height:1}.brand strong{font:700 17px "Readex Pro",sans-serif;letter-spacing:.12em}.brand small{margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.16em}nav{margin-right:auto;height:100%;display:flex;align-items:center}nav a{height:100%;display:flex;align-items:center;color:var(--ink);font-size:14px;font-weight:650;text-decoration:none;border-bottom:2px solid var(--forest)}.secondary-button{min-height:44px;display:inline-flex;align-items:center;gap:9px;padding:0 15px;border:1px solid #d7d2c4;border-radius:8px;background:white;color:var(--ink);font-size:14px;font-weight:650;cursor:pointer}.secondary-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}.device-button{min-height:38px;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 11px;border:1px solid #d7d2c4;border-radius:8px;background:#fffdfa;color:#66716b;font-size:12px;font-weight:650}main{max-width:1440px;margin:auto;padding:34px clamp(24px,5vw,72px) 72px}.intro{margin-bottom:34px}.eyebrow{margin:0 0 9px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.intro h1{margin:0;font:700 clamp(36px,4vw,52px)/1.05 "Readex Pro",sans-serif;letter-spacing:-.045em}.intro h1 em{font-style:normal;color:var(--forest)}.intro>p:last-child{margin:10px 0 0;color:var(--muted);font-size:16px}.projects-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}.projects-heading h2{margin:0;font:650 25px "Readex Pro",sans-serif;letter-spacing:-.035em}.projects-heading>span{color:var(--muted);font-size:13px}.empty{min-height:160px;border:1px dashed #cfc9b7;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;padding:24px;text-align:center;color:var(--muted);font-size:14px}.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.project-grid article{position:relative;border:1px solid #ddd8ca;border-radius:10px;background:#fff;box-shadow:0 7px 22px rgba(33,48,47,.05);transition:border-color .16s,box-shadow .16s,transform .16s}.project-grid article:hover{border-color:#b6c8bd;box-shadow:0 10px 26px rgba(33,48,47,.08);transform:translateY(-1px)}.project-open{width:100%;display:grid;grid-template-columns:180px minmax(0,1fr);border:0;background:transparent;padding:0;text-align:left;color:inherit}.mini-mosaic{min-height:188px;overflow:hidden;border-radius:9px 0 0 9px;background:#eef0e9;display:grid;place-items:center}.project-copy{min-width:0;padding:18px 44px 16px 20px;display:flex;flex-direction:column}.project-title{display:flex;align-items:center;gap:8px;min-width:0}.project-title strong{min-width:0;font:650 16px "Readex Pro",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.project-title span{flex:0 0 auto;color:var(--forest);font-size:11px;font-weight:700}.project-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.project-facts span{min-width:0;padding:8px 9px;border:1px solid #dfe8e2;border-radius:7px;background:#f5faf7;display:flex;flex-direction:column}.project-facts small{color:#6c7771;font-size:10px}.project-facts b{margin-top:2px;color:var(--forest);font-size:11px;font-weight:700;line-height:1.35}.updated{margin-top:10px;color:var(--muted);font-size:11px}.project-cta{margin-top:auto;padding-top:10px;color:var(--forest);font-size:13px}.project-cta i{margin-left:8px;font-style:normal}.menu-trigger{position:absolute;right:10px;top:10px;width:40px;height:40px;border:0;border-radius:7px;background:transparent;font-size:22px}.menu-trigger:hover{background:#f3f1e9}.project-menu{position:absolute;z-index:5;right:10px;top:48px;padding:6px;border:1px solid #d8d3c6;border-radius:8px;background:white;box-shadow:0 12px 28px rgba(31,43,36,.16)}.project-menu button{height:40px;border:0;background:transparent;color:var(--danger);font-size:13px;white-space:nowrap}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:1100px){.project-facts{grid-template-columns:1fr}.mini-mosaic{min-height:238px}}@media(max-width:980px){.project-grid{grid-template-columns:1fr}.project-facts{grid-template-columns:repeat(3,minmax(0,1fr))}.mini-mosaic{min-height:188px}}@media(max-width:680px){.topbar{padding:0 16px;gap:12px}.brand{padding-right:0;border:0}.brand small,.topbar nav,.device-button{display:none}.secondary-button{margin-left:auto;font-size:0;width:44px;padding:0;justify-content:center}main{padding:24px 16px 56px}.intro h1{font-size:34px}.intro>p:last-child{font-size:14px}.projects-heading>span{display:none}.project-open{grid-template-columns:118px minmax(0,1fr)}.mini-mosaic{min-height:230px}.project-copy{padding:15px 38px 14px 14px}.project-facts{grid-template-columns:1fr}}
</style>