<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Pengaturan Website · MIVUBI Admin</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<header class="topbar"><a href="/admin">← Admin</a><strong>Pengaturan Website</strong><a href="/">Akses Umum</a></header>
<main>
	<p class="eyebrow">ADMIN WEBSITE</p><h1>Pengaturan Website</h1><p class="lead">Pengaturan di area ini mengatur pengalaman Akses Umum, bukan kepemilikan file.</p>
	<a class="setting" href="/admin/settings/canvas"><div><small>CANVAS</small><strong>Pengaturan Canvas</strong><span>{data.canvas.widthMm / 10} × {data.canvas.heightMm / 10} cm · Ukuran Sel {data.canvas.cellMm / 10} cm · Grid {data.canvas.columns} × {data.canvas.rows}</span></div><b>→</b></a>
</main>

<style>
	.topbar{height:60px;display:flex;align-items:center;gap:20px;padding:0 clamp(20px,4vw,52px);border-bottom:1px solid var(--line);background:#fffdfa}.topbar strong{margin-right:auto;font:650 14px "Readex Pro",sans-serif}.topbar a{color:var(--forest);font-size:12px;font-weight:700;text-decoration:none}main{max-width:820px;margin:auto;padding:46px 24px 72px}.eyebrow{margin:0 0 7px;color:var(--forest);font-size:10px;font-weight:800;letter-spacing:.14em}h1{margin:0;font:650 32px "Readex Pro",sans-serif;letter-spacing:-.04em}.lead{margin:9px 0 26px;color:var(--muted);font-size:13px}.setting{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px;border:1px solid #dcd7ca;border-radius:10px;background:#fffdfa;color:var(--ink);text-decoration:none;box-shadow:0 8px 24px rgba(31,43,36,.05)}.setting div{display:flex;flex-direction:column}.setting small{color:var(--forest);font-size:9px;font-weight:800;letter-spacing:.12em}.setting strong{margin-top:4px;font:650 17px "Readex Pro",sans-serif}.setting span{margin-top:6px;color:var(--muted);font-size:12px}.setting b{color:var(--forest);font-size:20px}
</style>
