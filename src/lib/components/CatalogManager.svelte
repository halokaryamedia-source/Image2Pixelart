<script lang="ts">
	import type { CatalogColor } from '$lib/types';
	import { catalogToCsv, parseCatalogCsv } from '$lib/utils/csv';
	import { downloadText } from '$lib/utils/download';
	import { normalizeHex } from '$lib/utils/color';

	type Props = { catalog: CatalogColor[]; onSave: (catalog: CatalogColor[]) => void; onClose: () => void };
	let { catalog, onSave, onClose }: Props = $props();
	let colors = $state<CatalogColor[]>([]);
	let initialized = false;
	let name = $state('');
	let code = $state('');
	let hex = $state('#5B7569');
	let message = $state<string | null>(null);
	let importErrors = $state<string[]>([]);

	$effect(() => {
		if (!initialized) {
			colors = catalog.map((color) => ({ ...color }));
			initialized = true;
		}
	});

	function commit(next = colors) {
		colors = next;
		onSave(next.map((color) => ({ ...color, updatedAt: new Date().toISOString() })));
	}

	function addColor() {
		const normalized = normalizeHex(hex);
		if (!name.trim() || !normalized) { message = 'Isi nama dan HEX yang valid.'; return; }
		if (code.trim() && colors.some((color) => color.code?.toLowerCase() === code.trim().toLowerCase())) { message = 'Kode produk sudah dipakai warna lain.'; return; }
		const now = new Date().toISOString();
		commit([...colors, { id: crypto.randomUUID(), name: name.trim(), code: code.trim() || undefined, hex: normalized, active: true, createdAt: now, updatedAt: now }]);
		name = ''; code = ''; hex = '#5B7569'; message = 'Warna ditambahkan.';
	}

	function updateColor(id: string, changes: Partial<CatalogColor>) {
		if (changes.active === false && colors.filter((color) => color.active).length <= 1) {
			message = 'Minimal satu warna katalog harus tetap aktif.';
			return;
		}
		if (changes.hex) {
			const normalized = normalizeHex(changes.hex);
			if (!normalized) { message = 'HEX tidak valid.'; return; }
			changes.hex = normalized;
		}
		if (changes.code?.trim() && colors.some((color) => color.id !== id && color.code?.toLowerCase() === changes.code?.trim().toLowerCase())) {
			message = 'Kode produk sudah dipakai warna lain.';
			return;
		}
		commit(colors.map((color) => color.id === id ? { ...color, ...changes } : color));
	}

	function removeColor(id: string) {
		if (colors.length <= 1) { message = 'Katalog harus memiliki minimal satu warna.'; return; }
		const target = colors.find((color) => color.id === id);
		if (target?.active && colors.filter((color) => color.active).length <= 1) { message = 'Minimal satu warna katalog harus tetap aktif.'; return; }
		if (confirm('Hapus warna dari katalog? Proyek lama tidak akan berubah.')) commit(colors.filter((color) => color.id !== id));
	}

	async function importCsv(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0]; input.value = '';
		if (!file) return;
		const result = parseCatalogCsv(await file.text());
		importErrors = result.errors;
		if (result.colors.length) {
			const knownCodes = new Set(colors.map((color) => color.code?.toLowerCase()).filter(Boolean));
			const added = result.colors.filter((color) => !color.code || !knownCodes.has(color.code.toLowerCase()));
			const merged = [...colors, ...added];
			commit(merged);
			message = `${added.length} warna ditambahkan; ${result.colors.length - added.length} kode duplikat dilewati.`;
		}
	}
</script>

<div class="catalog-page">
	<header>
		<button type="button" onclick={onClose}>← Kembali</button>
		<div><p>KATALOG MATERIAL</p><h1>Warna yang benar-benar tersedia.</h1><span>Perubahan katalog tidak mengubah snapshot warna pada proyek lama.</span></div>
		<label class="import-button">Impor CSV<input class="sr-only" type="file" accept=".csv,text/csv" onchange={importCsv} /></label>
		<button class="export-button" type="button" onclick={() => downloadText(catalogToCsv(colors), 'mosaic-color-catalog.csv', 'text/csv;charset=utf-8')}>Ekspor CSV</button>
	</header>

	<main>
		<section class="add-panel">
			<p class="label">TAMBAH WARNA</p><h2>Material baru</h2>
			<label><span>Nama</span><input bind:value={name} placeholder="Terracotta" /></label>
			<label><span>Kode produk</span><input bind:value={code} placeholder="MP-09" /></label>
			<label><span>Warna HEX</span><div class="color-input"><input type="color" bind:value={hex} /><input bind:value={hex} maxlength="7" /></div></label>
			<button class="add" type="button" onclick={addColor}>Tambah ke katalog <span>＋</span></button>
			<div class="csv-note"><strong>Format CSV</strong><code>name,code,hex</code><small>Kolom code opsional. Data valid akan digabung dengan katalog lokal.</small></div>
			{#if message}<p class="message" role="status" aria-live="polite">{message}</p>{/if}
			{#if importErrors.length}<details class="errors"><summary>{importErrors.length} baris dilewati</summary>{#each importErrors.slice(0, 8) as item}<small>{item}</small>{/each}</details>{/if}
		</section>

		<section class="catalog-table">
			<div class="table-heading"><div><p class="label">KATALOG AKTIF</p><h2>{colors.length} warna material</h2></div><span>{colors.filter((color) => color.active).length} dapat dipakai konversi</span></div>
			<div class="columns"><span>Warna</span><span>Nama material</span><span>Kode</span><span>HEX</span><span>Aktif</span><span></span></div>
			{#each colors as color, index (color.id)}
				<div class:inactive={!color.active} class="color-row">
					<div class="swatch" style={`--color:${color.hex}`}><span>{index + 1}</span></div>
					<input value={color.name} onblur={(event) => updateColor(color.id, { name: event.currentTarget.value.trim() || color.name })} aria-label={`Nama warna ${index + 1}`} />
					<input value={color.code ?? ''} onblur={(event) => updateColor(color.id, { code: event.currentTarget.value.trim() || undefined })} aria-label={`Kode warna ${index + 1}`} />
					<div class="hex-edit"><input type="color" value={color.hex} onchange={(event) => updateColor(color.id, { hex: event.currentTarget.value })} /><input type="text" value={color.hex} onblur={(event) => updateColor(color.id, { hex: event.currentTarget.value })} aria-label={`HEX warna ${index + 1}`} /></div>
					<label class="switch"><input type="checkbox" checked={color.active} onchange={(event) => updateColor(color.id, { active: event.currentTarget.checked })} /><span></span></label>
					<button class="delete" type="button" onclick={() => removeColor(color.id)} title="Hapus warna">×</button>
				</div>
			{/each}
		</section>
	</main>
</div>

<style>
	.catalog-page{min-height:100vh;background:#f2f0ea}.catalog-page>header{min-height:132px;display:flex;align-items:center;gap:16px;padding:24px clamp(22px,5vw,72px);background:#fbfaf7;border-bottom:1px solid #d2d0c8}.catalog-page>header>button:first-child{align-self:flex-start;border:0;background:transparent;color:#59615c;padding:6px 0;font-size:11px;font-weight:750}.catalog-page>header>div{margin-right:auto}.catalog-page header p,.label{margin:0 0 5px;font-size:8px;letter-spacing:.16em;color:var(--accent);font-weight:850}.catalog-page header h1{margin:0;font-size:29px;letter-spacing:-.05em}.catalog-page header div>span{display:block;margin-top:8px;color:#777d78;font-size:10px}.import-button,.export-button{border:1px solid #cbc9c1;background:white;border-radius:6px;padding:10px 13px;font-size:10px;font-weight:800;cursor:pointer}.export-button{background:var(--forest);color:white;border-color:var(--forest)}main{display:grid;grid-template-columns:290px 1fr;gap:28px;padding:32px clamp(22px,5vw,72px) 70px;max-width:1400px;margin:auto}.add-panel,.catalog-table{border:1px solid #cfcdc5;background:#fbfaf7;border-radius:9px}.add-panel{padding:24px;height:max-content;position:sticky;top:20px}.add-panel h2,.table-heading h2{font-size:20px;letter-spacing:-.04em;margin:0 0 22px}.add-panel label{display:block;margin-bottom:15px}.add-panel label>span{display:block;font-size:8px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;color:#747b76;margin-bottom:6px}.add-panel input{width:100%;height:39px;border:1px solid #d1cfc7;background:white;border-radius:6px;padding:0 9px;font-size:11px}.color-input{display:grid;grid-template-columns:42px 1fr}.color-input input[type=color]{padding:3px;border-radius:6px 0 0 6px}.color-input input+input{border-left:0;border-radius:0 6px 6px 0}.add{width:100%;height:42px;border:0;border-radius:6px;background:var(--accent);color:white;display:flex;align-items:center;justify-content:center;gap:15px;font-size:10px;font-weight:800}.csv-note{margin-top:23px;padding-top:18px;border-top:1px solid #ddd9d2;display:flex;flex-direction:column;gap:5px}.csv-note strong{font-size:9px}.csv-note code{font-size:10px;background:#eceae4;padding:7px;border-radius:4px}.csv-note small{font-size:8px;color:#7b817c;line-height:1.5}.message{font-size:9px;color:#315a49;background:#edf4f0;padding:8px;border-radius:5px}.errors summary{font-size:9px;color:#9b4a30;cursor:pointer}.errors small{display:block;margin-top:4px;color:#86513f}.catalog-table{overflow:hidden}.table-heading{display:flex;align-items:center;justify-content:space-between;padding:23px 24px 17px}.table-heading h2{margin-bottom:0}.table-heading>span{font-size:9px;color:#737a75;background:#eeece6;padding:6px 9px;border-radius:12px}.columns,.color-row{display:grid;grid-template-columns:66px minmax(150px,1.4fr) minmax(90px,.7fr) 180px 58px 34px;align-items:center}.columns{height:31px;padding:0 17px;background:#eae8e2;border-top:1px solid #d7d4cd;border-bottom:1px solid #d7d4cd;font-size:7px;text-transform:uppercase;letter-spacing:.1em;color:#7e837f;font-weight:850}.color-row{min-height:61px;padding:0 17px;border-bottom:1px solid #e1ded7}.color-row:last-child{border-bottom:0}.color-row.inactive{opacity:.5}.color-row>input,.hex-edit input[type=text],.hex-edit input:not([type]){height:32px;border:1px solid transparent;background:transparent;border-radius:4px;padding:0 7px;font-size:10px;font-weight:650;min-width:0}.color-row>input:hover,.color-row>input:focus,.hex-edit input:hover,.hex-edit input:focus{background:white;border-color:#d4d1ca}.swatch{width:39px;height:39px;background:var(--color);border:1px solid rgba(0,0,0,.18);display:grid;place-items:center}.swatch span{font-size:7px;background:rgba(255,255,255,.83);padding:2px 3px}.hex-edit{display:grid;grid-template-columns:34px 1fr}.hex-edit input[type=color]{width:33px;height:31px;border:0;background:transparent;padding:2px}.switch input{position:absolute;opacity:0}.switch span{display:block;width:30px;height:17px;border-radius:10px;background:#c5c6c2;position:relative;transition:.2s}.switch span:after{content:"";position:absolute;left:2px;top:2px;width:13px;height:13px;background:white;border-radius:50%;transition:.2s}.switch input:checked+span{background:#4d8069}.switch input:checked+span:after{transform:translateX(13px)}.delete{border:0;background:transparent;font-size:16px;color:#a36d5d}.delete:hover{color:#8c3d27}@media(max-width:900px){.catalog-page>header{flex-wrap:wrap}.catalog-page>header>div{order:-1;width:100%}main{grid-template-columns:1fr}.add-panel{position:static}.columns{display:none}.color-row{grid-template-columns:52px minmax(130px,1.2fr) 90px 145px 46px 26px;padding:0 10px;overflow-x:auto}}@media(max-width:620px){.color-row{grid-template-columns:46px 1fr 76px 38px 25px}.color-row>.hex-edit{display:none}.catalog-page>header{padding:22px}.catalog-page header h1{font-size:24px}main{padding:20px}}
</style>
