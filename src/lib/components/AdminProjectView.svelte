<script lang="ts">
	import { cmToMm, validateGridMm } from '$lib/utils/grid';

	type CreateInput = { name: string; widthMm: number; heightMm: number; cellMm: number; mode: 'blank' };
	type Props = {
		deviceName: string;
		onCreate: (input: CreateInput) => Promise<void>;
		onRenameDevice: () => void;
	};

	let { deviceName, onCreate, onRenameDevice }: Props = $props();
	let creating = $state(false);
	let name = $state('Proyek mosaic baru');
	let widthCm = $state(240);
	let heightCm = $state(120);
	let cellCm = $state(5);
	let validation = $derived(validateGridMm(cmToMm(widthCm), cmToMm(heightCm), cmToMm(cellCm)));

	async function submit(event: SubmitEvent) {
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
	<nav aria-label="Navigasi utama"><a href="/">Proyek</a><a class="active" href="/admin">Admin</a></nav>
	<button class="device-button" type="button" onclick={onRenameDevice} title="Ganti nama pengguna">Pengguna · {deviceName}</button>
</header>

<main>
	<section class="intro">
		<p class="eyebrow">MIVUBI · PIXEL MOSAIC PLANNER</p>
		<h1>Buat <em>canvas proyek.</em></h1>
		<p>Tentukan ukuran canvas dan tile sebelum proyek digunakan.</p>
	</section>

	<section class="quick-start" aria-label="Buat proyek baru">
		<form class="setup-card" onsubmit={submit}>
			<label><span>Nama proyek</span><input bind:value={name} maxlength="200" /></label>
			<div class="field-grid">
				<label><span>Lebar canvas</span><div class="unit-input"><input type="number" bind:value={widthCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>
				<label><span>Tinggi canvas</span><div class="unit-input"><input type="number" bind:value={heightCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>
			</div>
			<label><span>Ukuran tile (persegi)</span><div class="unit-input"><input type="number" bind:value={cellCm} min="0.1" max="100000" step="0.1" /><b>cm</b></div></label>

			<div class:invalid={!validation.valid} class="grid-result">
				<span><b>▧</b><strong><small>Canvas</small>{widthCm} × {heightCm} cm</strong></span>
				<span><b>▦</b><strong><small>Grid Canvas</small>{validation.valid ? `${validation.columns} kolom × ${validation.rows} baris` : '—'}</strong></span>
				<span><b>▥</b><strong><small>Ukuran 1 Tile</small>{cellCm} × {cellCm} cm</strong></span>
			</div>
			{#if !validation.valid}<p class="form-error">{validation.reason}{#if validation.suggestionsCm.length} Coba {validation.suggestionsCm.join(', ')} cm.{/if}</p>{/if}
			<button class="primary-button" type="submit" disabled={!validation.valid || creating}>{creating ? 'Membuat proyek…' : 'Buat proyek'} <span>→</span></button>
		</form>

		<aside class="visual-card" aria-label="Preview ukuran grid">
			<div class="preview-heading"><strong>Preview · {validation.valid ? `${validation.columns} × ${validation.rows}` : '—'}</strong><span>Grid fisik</span></div>
			<div class="dimension width"><i></i><span>{widthCm} cm</span><i></i></div>
			<div class="preview-row"><div class="grid-stage" style={`--preview-columns:${validation.valid ? validation.columns : 24};--preview-rows:${validation.valid ? validation.rows : 24}`}><div class="grid-overlay"></div></div><div class="dimension height"><i></i><span>{heightCm} cm</span><i></i></div></div>
			<p>Preview menunjukkan ukuran canvas dan susunan grid yang akan digunakan.</p>
		</aside>
	</section>
</main>

<style>
	.topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:34px;background:rgba(254,252,245,.94);position:sticky;top:0;z-index:30}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);padding-right:32px;border-right:1px solid var(--line)}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand>span{display:flex;flex-direction:column;line-height:1}.brand strong{font:700 17px "Readex Pro",sans-serif;letter-spacing:.12em}.brand small{margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.16em}nav{margin-right:auto;height:100%;display:flex;align-items:center;gap:24px}nav a{height:100%;display:flex;align-items:center;color:var(--ink);font-size:14px;font-weight:650;text-decoration:none;border-bottom:2px solid transparent}nav a.active{border-bottom-color:var(--forest)}.device-button{min-height:38px;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 11px;border:1px solid #d7d2c4;border-radius:8px;background:#fffdfa;color:#66716b;font-size:12px;font-weight:650}main{max-width:1440px;margin:auto;padding:34px clamp(24px,5vw,72px) 72px}.intro{margin-bottom:20px}.eyebrow{margin:0 0 9px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.intro h1{margin:0;font:700 clamp(36px,4vw,52px)/1.05 "Readex Pro",sans-serif;letter-spacing:-.045em}.intro h1 em{font-style:normal;color:var(--forest)}.intro>p:last-child{margin:10px 0 0;color:var(--muted);font-size:16px}.quick-start{display:grid;grid-template-columns:minmax(360px,40%) 1fr;border:1px solid #ded8c8;border-radius:14px;background:white;box-shadow:0 16px 45px rgba(33,48,47,.07);overflow:hidden}.setup-card{padding:28px;border-right:1px solid #e2ddcf}.setup-card>label{display:block;margin-bottom:14px}.setup-card label>span{display:block;margin-bottom:6px;font-size:13px;font-weight:650}.setup-card input{width:100%;height:44px;border:1px solid #d9d5ca;border-radius:7px;background:white;padding:0 12px;color:var(--ink);font-size:14px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field-grid label{display:block}.unit-input{position:relative}.unit-input input{padding-right:46px}.unit-input b{position:absolute;right:12px;top:13px;color:#7a827d;font-size:12px}.grid-result{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #bad2c5;border-radius:8px;background:#eef6f1;margin:5px 0 14px}.grid-result>span{min-width:0;display:flex;align-items:center;gap:8px;padding:10px}.grid-result>span+span{border-left:1px solid #c8dbd1}.grid-result b{color:var(--forest);font-size:16px}.grid-result strong{min-width:0;display:flex;flex-direction:column;color:var(--forest);font:700 12px/1.35 "Readex Pro",sans-serif}.grid-result small{margin-bottom:2px;font:600 9px Poppins,sans-serif;color:#63756b}.grid-result.invalid{border-color:#e5b9aa;background:#fff2ed}.form-error{margin:-8px 0 12px;color:var(--danger);font-size:12px}.primary-button{width:100%;min-height:46px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:14px;font-weight:750}.primary-button span{margin-left:16px;font-size:18px}.primary-button:disabled{opacity:.48;cursor:not-allowed}.visual-card{min-width:0;padding:28px 30px 22px;background:#fffefa}.preview-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:14px}.preview-heading span{color:var(--muted);font-size:12px}.dimension{display:flex;align-items:center;color:#505953;font-size:12px}.dimension i{height:1px;background:#aeb5b0;flex:1}.dimension span{padding:0 12px}.preview-row{display:grid;grid-template-columns:minmax(0,1fr) 32px;align-items:stretch;gap:8px;margin-top:10px}.grid-stage{position:relative;width:100%;aspect-ratio:var(--preview-columns)/var(--preview-rows);max-height:450px;border:1px solid #aeb8b1;background:#fff;overflow:hidden}.grid-overlay{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(40,67,54,.18) 1px,transparent 1px),linear-gradient(to bottom,rgba(40,67,54,.18) 1px,transparent 1px);background-size:calc(100% / var(--preview-columns)) calc(100% / var(--preview-rows));background-color:rgba(250,250,246,.18)}.height{writing-mode:vertical-rl}.height i{width:1px;height:auto}.visual-card>p{margin:14px 0 0;color:var(--muted);font-size:13px}@media(max-width:980px){.quick-start{grid-template-columns:1fr}.setup-card{border-right:0;border-bottom:1px solid #e2ddcf}.visual-card{min-height:420px}}@media(max-width:680px){.topbar{padding:0 16px;gap:12px}.brand{padding-right:0;border:0}.brand small,.topbar nav,.device-button{display:none}main{padding:24px 16px 56px}.intro h1{font-size:34px}.intro>p:last-child{font-size:14px}.setup-card,.visual-card{padding:20px}.field-grid{grid-template-columns:1fr}.grid-result{grid-template-columns:1fr}.grid-result>span+span{border-left:0;border-top:1px solid #c8dbd1}.preview-row{grid-template-columns:1fr}.height{display:none}}
</style>