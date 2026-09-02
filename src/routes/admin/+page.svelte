<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Admin · MIVUBI Pixel Art Editor</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<header class="topbar">
	<a class="brand" href="/admin"><img src="/mivubi-logo.png" alt="" /><span><strong>MIVUBI</strong><small>ADMIN</small></span></a>
	<nav><a class="active" href="/admin">Admin</a><a href="/admin/settings">Pengaturan Website</a></nav>
	<form method="POST" action="?/logout"><button class="secondary" type="submit">Keluar</button></form>
</header>

<main>
	<section class="intro"><p>ADMIN WEBSITE</p><h1>Pengaturan Website</h1><span>Atur konfigurasi yang digunakan pada Akses Umum.</span></section>
	<section class="settings-card">
		<div><p>CANVAS</p><h2>Pengaturan Canvas</h2><span>Konfigurasi ini digunakan saat user membuat karya baru. Karya yang sudah ada tidak berubah.</span></div>
		<div class="summary"><span><small>Ukuran Fisik</small><strong>{data.canvas.widthMm / 10} × {data.canvas.heightMm / 10} cm</strong></span><span><small>Ukuran Sel</small><strong>{data.canvas.cellMm / 10} cm</strong></span><span><small>Ukuran Grid</small><strong>{data.canvas.columns} × {data.canvas.rows}</strong></span></div>
		<a class="primary" href="/admin/settings/canvas">Buka Pengaturan Canvas →</a>
	</section>
	<a class="public-link" href="/">← Akses Umum</a>
</main>

<style>
	.topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;gap:30px;border-bottom:1px solid var(--line);background:#fffdfa}.brand{display:flex;align-items:center;gap:10px;padding-right:28px;border-right:1px solid var(--line);color:var(--ink);text-decoration:none}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand span{display:flex;flex-direction:column}.brand strong{font:700 15px "Readex Pro",sans-serif;letter-spacing:.1em}.brand small{margin-top:3px;color:var(--forest);font-size:8px;font-weight:800;letter-spacing:.15em}nav{display:flex;align-self:stretch;gap:24px;margin-right:auto}nav a{display:flex;align-items:center;color:#5e6762;font-size:13px;font-weight:650;text-decoration:none;border-bottom:2px solid transparent}nav a.active{color:var(--forest);border-bottom-color:var(--forest)}.secondary{height:40px;padding:0 14px;border:1px solid #d8d3c6;border-radius:7px;background:white;color:var(--ink);font-size:12px;font-weight:700}main{max-width:980px;margin:auto;padding:48px 24px 72px}.intro>p,.settings-card>div:first-child>p{margin:0 0 8px;color:var(--forest);font-size:10px;font-weight:800;letter-spacing:.14em}.intro h1{margin:0;font:650 34px "Readex Pro",sans-serif;letter-spacing:-.04em}.intro>span{display:block;margin-top:9px;color:var(--muted);font-size:14px}.settings-card{margin-top:28px;padding:24px;border:1px solid #dcd7ca;border-radius:12px;background:#fffdfa;box-shadow:0 12px 32px rgba(31,43,36,.06)}.settings-card h2{margin:0;font:650 21px "Readex Pro",sans-serif}.settings-card>div:first-child>span{display:block;margin-top:7px;color:var(--muted);font-size:12px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0}.summary span{padding:13px;border:1px solid #ddd8cc;border-radius:8px;background:#faf9f4}.summary small{display:block;color:var(--muted);font-size:10px}.summary strong{display:block;margin-top:5px;color:var(--forest);font-size:13px}.primary{min-height:42px;display:inline-flex;align-items:center;padding:0 15px;border-radius:7px;background:var(--forest);color:white;font-size:12px;font-weight:750;text-decoration:none}.public-link{display:inline-block;margin-top:24px;color:var(--forest);font-size:12px;font-weight:700;text-decoration:none}@media(max-width:680px){.topbar{padding:0 16px}.topbar nav{display:none}.brand{margin-right:auto;border:0;padding:0}.summary{grid-template-columns:1fr}}
</style>
