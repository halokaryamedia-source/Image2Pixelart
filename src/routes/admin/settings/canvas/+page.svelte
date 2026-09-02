<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { cmToMm, validateGridMm } from '$lib/utils/grid';

	let { data, form }: { data: PageData; form: ActionData | null } = $props();
	const initial = form?.values ?? { widthCm: data.canvas.widthMm / 10, heightCm: data.canvas.heightMm / 10, cellCm: data.canvas.cellMm / 10 };
	let widthCm = $state(initial.widthCm);
	let heightCm = $state(initial.heightCm);
	let cellCm = $state(initial.cellCm);
	let validation = $derived(validateGridMm(cmToMm(widthCm), cmToMm(heightCm), cmToMm(cellCm)));
	let serverError = $derived(form && 'message' in form ? form.message : '');
</script>

<svelte:head><title>Pengaturan Canvas · MIVUBI Admin</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<header class="topbar"><a href="/admin/settings">← Pengaturan Website</a><strong>Pengaturan Canvas</strong><a href="/">Akses Umum</a></header>

<main>
	<p class="eyebrow">ADMIN WEBSITE</p><h1>Pengaturan Canvas</h1>
	<p class="lead">Atur Canvas yang digunakan saat user membuat karya baru. Karya yang sudah ada tetap menggunakan ukuran saat karya tersebut dibuat.</p>
	<form method="POST" class="settings-card">
		<div class="field-grid">
			<label><span>Lebar</span><div><input name="widthCm" type="number" min="0.1" step="0.1" bind:value={widthCm} required /><b>cm</b></div></label>
			<label><span>Tinggi</span><div><input name="heightCm" type="number" min="0.1" step="0.1" bind:value={heightCm} required /><b>cm</b></div></label>
		</div>
		<label><span>Ukuran Sel</span><div><input name="cellCm" type="number" min="0.1" step="0.1" bind:value={cellCm} required /><b>cm</b></div></label>
		<div class:invalid={!validation.valid} class="result">
			<span><small>Ukuran Grid</small><strong>{validation.valid ? `${validation.columns} × ${validation.rows}` : 'Tidak valid'}</strong></span>
			<span><small>Total Sel</small><strong>{validation.valid ? validation.total.toLocaleString('id-ID') : '—'}</strong></span>
		</div>
		{#if !validation.valid}<p class="error" role="alert">{validation.reason.replace('Ukuran tile', 'Ukuran sel')}{#if validation.suggestionsCm.length} Coba Ukuran Sel {validation.suggestionsCm.join(', ')} cm.{/if}</p>{/if}
		{#if serverError}<p class="error" role="alert">{serverError}</p>{/if}
		{#if form?.success}<p class="success" role="status">Pengaturan Canvas tersimpan. Pengaturan ini berlaku untuk karya baru.</p>{/if}
		<div class="actions"><a href="/admin/settings">Batal</a><button type="submit" disabled={!validation.valid}>Simpan Pengaturan</button></div>
	</form>
</main>

<style>
	.topbar{height:60px;display:flex;align-items:center;gap:20px;padding:0 clamp(20px,4vw,52px);border-bottom:1px solid var(--line);background:#fffdfa}.topbar strong{margin-right:auto;font:650 14px "Readex Pro",sans-serif}.topbar a{color:var(--forest);font-size:12px;font-weight:700;text-decoration:none}main{max-width:700px;margin:auto;padding:46px 24px 72px}.eyebrow{margin:0 0 7px;color:var(--forest);font-size:10px;font-weight:800;letter-spacing:.14em}h1{margin:0;font:650 32px "Readex Pro",sans-serif;letter-spacing:-.04em}.lead{margin:9px 0 24px;color:var(--muted);font-size:13px;line-height:1.55}.settings-card{padding:24px;border:1px solid #dcd7ca;border-radius:12px;background:#fffdfa;box-shadow:0 12px 32px rgba(31,43,36,.06)}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.settings-card>label,.field-grid label{display:block;margin-bottom:16px}.settings-card label>span{display:block;margin-bottom:7px;color:#59625d;font-size:12px;font-weight:700}.settings-card label>div{position:relative}.settings-card input{width:100%;height:44px;border:1px solid #d8d3c6;border-radius:7px;background:white;padding:0 44px 0 11px;color:var(--ink);font-size:14px}.settings-card label b{position:absolute;right:12px;top:12px;color:var(--muted);font-size:11px}.result{display:grid;grid-template-columns:1fr 1fr;margin-top:3px;border:1px solid #bad2c5;border-radius:8px;background:#eef6f1}.result span{padding:13px}.result span+span{border-left:1px solid #c8dbd1}.result small{display:block;color:#63756b;font-size:10px}.result strong{display:block;margin-top:4px;color:var(--forest);font:700 17px "Readex Pro",sans-serif}.result.invalid{border-color:#e5b9aa;background:#fff2ed}.error{margin:10px 0 0;color:var(--danger);font-size:12px}.success{margin:10px 0 0;padding:10px;border:1px solid #a9c9b8;border-radius:7px;background:#edf6f1;color:var(--forest);font-size:12px}.actions{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:20px}.actions a{height:42px;display:inline-flex;align-items:center;padding:0 14px;color:var(--ink);font-size:12px;font-weight:700;text-decoration:none}.actions button{height:42px;padding:0 16px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:12px;font-weight:750}.actions button:disabled{opacity:.45}@media(max-width:560px){.field-grid{grid-template-columns:1fr}.result{grid-template-columns:1fr}.result span+span{border-left:0;border-top:1px solid #c8dbd1}}
</style>
