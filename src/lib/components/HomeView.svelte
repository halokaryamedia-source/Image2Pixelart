<script lang="ts">
	import type { CatalogColor, ProjectV1 } from '$lib/types';
	import { cmToMm, validateGridMm } from '$lib/utils/grid';

	type Props = {
		projects: ProjectV1[];
		catalog: CatalogColor[];
		ready: boolean;
		onCreate: (input: { name: string; widthMm: number; heightMm: number; cellMm: number; backgroundCatalogId: string }) => void;
		onOpen: (project: ProjectV1) => void;
		onDelete: (id: string) => void;
		onImport: (file: File) => void;
		onCatalog: () => void;
	};

	let { projects, catalog, ready, onCreate, onOpen, onDelete, onImport, onCatalog }: Props = $props();
	let name = $state('Mural lobby utama');
	let widthCm = $state(120);
	let heightCm = $state(240);
	let cellCm = $state(5);
	let backgroundId = $state('warm-white');
	let validation = $derived(validateGridMm(cmToMm(widthCm), cmToMm(heightCm), cmToMm(cellCm)));
	let previewColumns = $derived(validation.valid ? validation.columns : 24);
	let previewRows = $derived(validation.valid ? validation.rows : 24);
	let xLabels = $derived([...new Set([1, Math.max(1, Math.round(previewColumns / 3)), Math.max(1, Math.round(previewColumns * 2 / 3)), previewColumns])]);
	let yLabels = $derived([...new Set([1, Math.max(1, Math.round(previewRows / 3)), Math.max(1, Math.round(previewRows * 2 / 3)), previewRows])]);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!validation.valid) return;
		onCreate({ name, widthMm: cmToMm(widthCm), heightMm: cmToMm(heightCm), cellMm: cmToMm(cellCm), backgroundCatalogId: backgroundId });
	}

	function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0]; input.value = '';
		if (file) onImport(file);
	}
</script>

<header class="topbar">
	<a class="brand" href="/" aria-label="Mosaic Plan, beranda"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>MOSAIC<span>/PLAN</span></span></a>
	<nav aria-label="Navigasi utama"><a class="active" href="#projects">Proyek</a><button type="button" onclick={onCatalog}>Katalog warna</button></nav>
	<label class="ghost-button">Impor proyek <span>↗</span><input class="sr-only" type="file" accept=".json,.pixelgrid.json,application/json" onchange={importFile} /></label>
</header>

<main>
	<section class="intro">
		<div><p class="eyebrow">PIXEL MOSAIC PLANNER</p><h1>Dari ukuran nyata<br />ke <em>grid presisi.</em></h1><p class="lede">Atur dimensi, pilih ukuran tile, lalu mulai menggambar atau ubah foto menjadi blueprint produksi.</p></div>
		<div class="assurance"><span class="pulse"></span><div><strong>100% lokal</strong><small>Proyek tersimpan di perangkat ini</small></div></div>
	</section>

	<section class="workspace-preview">
		<form class="setup-card" onsubmit={submit}>
			<div class="card-heading"><span>01</span><div><p>PROYEK BARU</p><h2>Siapkan canvas fisik</h2></div></div>
			<label><span>Nama proyek</span><input bind:value={name} /></label>
			<div class="field-grid"><label><span>Lebar</span><div class="unit-input"><input type="number" bind:value={widthCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label><label><span>Tinggi</span><div class="unit-input"><input type="number" bind:value={heightCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label></div>
			<label><span>Ukuran tile persegi</span><div class="unit-input"><input type="number" bind:value={cellCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>
			<label><span>Warna latar</span><select bind:value={backgroundId}>{#each catalog.filter((color) => color.active) as color}<option value={color.id}>{color.code || '—'} · {color.name}</option>{/each}</select></label>
			<div class:invalid={!validation.valid} class="grid-result"><div><small>GRID OTOMATIS</small><strong>{validation.valid ? `${validation.columns} × ${validation.rows}` : 'Ukuran tidak pas'}</strong></div><div><small>TOTAL MATERIAL</small><strong>{validation.valid ? validation.total.toLocaleString('id-ID') : '—'}</strong></div></div>
			{#if !validation.valid}<p class="form-error">{validation.reason}{#if validation.suggestionsCm.length} Coba {validation.suggestionsCm.join(', ')} cm.{/if}</p>{/if}
			<button class="primary-button" type="submit" disabled={!validation.valid || !ready || !catalog.some((color) => color.active)}>Buat canvas <span>→</span></button>
		</form>

		<aside class="visual-card" aria-label="Preview grid mosaic">
			<div class="visual-topline"><span>PREVIEW / {validation.valid ? `${validation.columns} × ${validation.rows}` : '—'}</span><span>{cellCm} CM PER TILE</span></div>
			<div class="grid-stage" style={`--preview-columns:${previewColumns};--preview-rows:${previewRows}`}><div class="grid-art"><div class="pixel-shape cyan one"></div><div class="pixel-shape cyan two"></div><div class="pixel-shape green three"></div><div class="pixel-shape orange four"></div><div class="pixel-shape charcoal five"></div></div><div class="axis x">{#each xLabels as label}<span>{String(label).padStart(2, '0')}</span>{/each}</div><div class="axis y">{#each yLabels as label}<span>{String(label).padStart(2, '0')}</span>{/each}</div></div>
			<div class="swatches">{#each catalog.filter((color) => color.active).slice(0, 8) as color}<span style={`--swatch:${color.hex}`} title={color.name}></span>{/each}<small>{Math.min(8, catalog.filter((color) => color.active).length)} WARNA KATALOG</small></div>
		</aside>
	</section>

	<section class="projects" id="projects">
		<div class="projects-heading"><div><p class="eyebrow">PROYEK LOKAL</p><h2>Lanjutkan pekerjaan</h2></div><span>{projects.length} proyek di perangkat ini</span></div>
		{#if !ready}<div class="empty">Memuat proyek lokal…</div>{:else if projects.length === 0}<div class="empty"><strong>Belum ada proyek.</strong><span>Canvas pertamamu akan muncul di sini dan tersimpan otomatis.</span></div>{:else}<div class="project-grid">{#each projects as project}<article><button class="project-open" type="button" onclick={() => onOpen(project)}><div class="mini-mosaic" style={`--bg:${project.palette[project.backgroundSlot]?.hex ?? '#F1EFE6'}`}>{#each project.palette.slice(1, 8) as color, index}<i style={`--color:${color.hex};--x:${(index * 17 + 9) % 76}%;--y:${(index * 29 + 11) % 72}%;`}></i>{/each}</div><div class="project-copy"><small>DIPERBARUI ${new Date(project.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }).toUpperCase()}</small><strong>{project.name}</strong><span>{project.widthMm / 10} × {project.heightMm / 10} cm · {project.columns} × {project.rows} sel</span><div>{#each project.palette.slice(0, 6) as color}<i style={`--color:${color.hex}`}></i>{/each}<b>{project.palette.length} warna</b></div></div></button><button class="delete-project" type="button" onclick={() => confirm(`Hapus proyek “${project.name}”?`) && onDelete(project.id)} title="Hapus proyek">×</button></article>{/each}</div>{/if}
	</section>
</main>

<style>
	.topbar{height:72px;padding:0 clamp(20px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:38px;background:rgba(251,250,247,.82);backdrop-filter:blur(14px);position:sticky;top:0;z-index:10}.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink);font-weight:850;letter-spacing:-.04em;font-size:18px}.brand>span:last-child span{color:var(--accent)}.brand-mark{display:grid;grid-template-columns:repeat(2,8px);gap:2px;transform:rotate(45deg)}.brand-mark i{width:8px;height:8px;background:var(--forest)}.brand-mark i:nth-child(2),.brand-mark i:nth-child(3){background:var(--cyan)}nav{display:flex;gap:28px;margin-right:auto;align-items:center;height:100%}nav a,nav button{font-size:13px;color:var(--muted);text-decoration:none;font-weight:650;padding:27px 0;position:relative;border:0;background:transparent}nav a.active{color:var(--ink)}nav a.active:after{content:"";position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--accent)}.ghost-button{border:1px solid #c9c7bf;background:transparent;border-radius:7px;padding:10px 14px;color:var(--ink);font-size:12px;font-weight:750;cursor:pointer}.ghost-button span{color:var(--accent);margin-left:8px}main{padding:clamp(42px,6vw,84px) clamp(20px,6vw,94px) 72px;max-width:1500px;margin:auto}.intro{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:44px}.eyebrow{font-size:10px;letter-spacing:.18em;font-weight:850;color:var(--accent);margin:0 0 14px}.intro h1{font-size:clamp(44px,5vw,76px);letter-spacing:-.065em;line-height:.96;margin:0;font-weight:760}.intro h1 em{font-family:Georgia,serif;color:var(--forest);font-weight:500}.lede{max-width:570px;color:var(--muted);font-size:16px;line-height:1.65;margin:24px 0 0}.assurance{display:flex;gap:12px;align-items:center;border-left:1px solid var(--line);padding:8px 0 8px 25px;margin-bottom:7px}.assurance div{display:flex;flex-direction:column;gap:3px}.assurance strong{font-size:12px}.assurance small{font-size:11px;color:var(--muted)}.pulse{width:9px;height:9px;border-radius:50%;background:#5a9d65;box-shadow:0 0 0 5px rgba(90,157,101,.13)}.workspace-preview{display:grid;grid-template-columns:minmax(320px,430px) 1fr;border:1px solid #cbc9c1;border-radius:13px;overflow:hidden;background:var(--paper);box-shadow:0 25px 60px rgba(31,37,34,.08)}.setup-card{padding:31px 34px 34px;border-right:1px solid var(--line)}.card-heading{display:flex;gap:15px;align-items:flex-start;margin-bottom:25px}.card-heading>span{font:700 12px Georgia,serif;color:var(--accent);border:1px solid #dfd7ce;border-radius:50%;width:30px;height:30px;display:grid;place-items:center}.card-heading p{font-size:9px;letter-spacing:.18em;font-weight:800;color:var(--muted);margin:0 0 4px}.card-heading h2{font-size:22px;letter-spacing:-.035em;margin:0}.setup-card label{display:block;margin-bottom:15px}.setup-card label>span{display:block;font-size:9px;letter-spacing:.09em;text-transform:uppercase;font-weight:800;color:#626b65;margin:0 0 6px}.setup-card input,.setup-card select{width:100%;height:41px;border:1px solid #d4d1c9;border-radius:7px;background:white;padding:0 11px;color:var(--ink);font-weight:650;font-size:11px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.unit-input{position:relative}.unit-input input{padding-right:44px}.unit-input b{position:absolute;right:12px;top:13px;font-size:9px;color:#8a8e89;text-transform:uppercase}.grid-result{display:grid;grid-template-columns:1fr 1fr;border:1px solid #c8d6cf;background:#eef3f0;border-radius:8px;margin:4px 0 16px}.grid-result>div{padding:12px 14px}.grid-result>div+div{border-left:1px solid #c8d6cf}.grid-result small{display:block;font-size:7px;letter-spacing:.14em;color:#718078;font-weight:850;margin-bottom:4px}.grid-result strong{font:700 19px Georgia,serif;color:var(--forest)}.grid-result.invalid{background:#fff3ed;border-color:#efc9b9}.grid-result.invalid strong{color:var(--accent-dark)}.form-error{font-size:9px;line-height:1.45;color:var(--accent-dark);margin:-8px 0 13px}.primary-button{width:100%;height:45px;border:0;border-radius:7px;background:var(--accent);color:white;font-weight:800;font-size:12px;display:flex;justify-content:center;align-items:center;gap:18px;box-shadow:0 7px 18px rgba(235,106,60,.24)}.primary-button:hover{background:var(--accent-dark)}.primary-button:disabled{opacity:.45;cursor:not-allowed}.primary-button span{font-size:18px}.visual-card{background:#e8e6df;padding:21px 24px 20px;min-width:0}.visual-topline{display:flex;justify-content:space-between;font-size:8px;font-weight:850;letter-spacing:.15em;color:#727973;margin-bottom:13px}.grid-stage{position:relative;height:min(440px,52vw);aspect-ratio:var(--preview-columns)/var(--preview-rows);max-width:calc(100% - 25px);margin:0 auto;background:#f9f8f4;border:1px solid #b8bbb5}.grid-art{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(76,82,78,.17) 1px,transparent 1px),linear-gradient(to bottom,rgba(76,82,78,.17) 1px,transparent 1px);background-size:calc(100% / var(--preview-columns)) calc(100% / var(--preview-rows));overflow:hidden}.pixel-shape{position:absolute;opacity:.92}.pixel-shape.cyan{background:var(--cyan)}.pixel-shape.green{background:#719154}.pixel-shape.orange{background:var(--accent)}.pixel-shape.charcoal{background:#30383c}.one{left:12.5%;top:20.83%;width:25%;height:8.34%}.two{right:12.5%;bottom:16.66%;width:33.33%;height:8.34%}.three{left:29.16%;top:41.66%;width:37.5%;height:25%}.four{left:41.66%;top:25%;width:16.66%;height:41.66%}.five{left:20.83%;bottom:8.33%;width:58.33%;height:8.33%}.axis{position:absolute;font:700 8px ui-monospace,monospace;color:#7e837f;display:flex;justify-content:space-between}.axis.x{left:0;right:0;top:-13px}.axis.y{top:0;bottom:0;left:-21px;flex-direction:column}.swatches{display:flex;align-items:center;gap:5px;margin-top:16px}.swatches span{width:21px;height:21px;border:1px solid rgba(31,37,34,.16);background:var(--swatch)}.swatches small{font-size:8px;letter-spacing:.12em;font-weight:850;color:#717771;margin-left:8px}.projects{margin-top:80px}.projects-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px}.projects-heading h2{font-size:30px;letter-spacing:-.05em;margin:0}.projects-heading>span{font-size:10px;color:#787e79}.empty{min-height:150px;border:1px dashed #c8c5bd;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;color:#777d78;background:rgba(251,250,247,.5)}.empty strong{font-size:13px}.empty span{font-size:10px}.project-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.project-grid article{position:relative;border:1px solid #cbc9c1;border-radius:9px;overflow:hidden;background:#fbfaf7}.project-open{display:grid;grid-template-columns:128px 1fr;width:100%;border:0;background:transparent;text-align:left;padding:0}.mini-mosaic{height:135px;background-color:var(--bg);position:relative;background-image:linear-gradient(rgba(46,53,49,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(46,53,49,.14) 1px,transparent 1px);background-size:12px 12px;overflow:hidden}.mini-mosaic i{position:absolute;left:var(--x);top:var(--y);width:24px;height:24px;background:var(--color);box-shadow:12px 0 var(--color),0 12px var(--color)}.project-copy{padding:18px 15px;display:flex;flex-direction:column;min-width:0}.project-copy>small{font-size:7px;letter-spacing:.1em;color:#8b8f8b;font-weight:800}.project-copy>strong{font-size:14px;margin:7px 0 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.project-copy>span{font-size:8px;color:#747a75}.project-copy>div{display:flex;align-items:center;margin-top:auto}.project-copy i{width:13px;height:13px;margin-right:-3px;border:1px solid white;background:var(--color);border-radius:50%}.project-copy b{font-size:7px;color:#767c77;margin-left:8px}.delete-project{position:absolute;right:7px;top:7px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(251,250,247,.85);color:#8d4e3c;font-size:15px}.project-grid article:hover{border-color:#96a79f;box-shadow:0 8px 24px rgba(31,37,34,.08)}@media(max-width:1000px){.workspace-preview{grid-template-columns:1fr}.setup-card{border-right:0;border-bottom:1px solid var(--line)}.project-grid{grid-template-columns:1fr 1fr}.assurance{display:none}}@media(max-width:650px){.topbar{height:62px}nav{display:none}.ghost-button{margin-left:auto}main{padding-top:36px}.intro h1{font-size:44px}.workspace-preview{border-radius:9px}.setup-card{padding:25px 21px}.visual-card{padding:20px 16px}.grid-stage{height:min(310px,80vw)}.project-grid{grid-template-columns:1fr}.projects{margin-top:55px}}
</style>
