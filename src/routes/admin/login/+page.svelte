<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData | null } = $props();
</script>

<svelte:head><title>Admin · MIVUBI Pixel Art Editor</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<main class="admin-login">
	<section class="login-card">
		<a class="brand" href="/" aria-label="Kembali ke MIVUBI Pixel Art Editor"><img src="/mivubi-logo.png" alt="" /><span><strong>MIVUBI</strong><small>ADMIN</small></span></a>
		<div class="heading"><p>ADMIN WEBSITE</p><h1>Masuk ke Admin</h1><span>Masukkan Password Admin untuk membuka Pengaturan Website.</span></div>
		<form method="POST">
			<label><span>Password Admin</span><input type="password" name="password" required autocomplete="current-password" autofocus /></label>
			{#if form?.invalid}<p class="error" role="alert">Password Admin tidak sesuai.</p>{/if}
			<button type="submit">Masuk</button>
		</form>
		<a class="back" href="/">← Kembali ke Akses Umum</a>
	</section>
</main>

<style>
	.admin-login{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f1e8}.login-card{width:min(430px,100%);padding:28px;border:1px solid #d9d4c7;border-radius:12px;background:#fffdfa;box-shadow:0 20px 55px rgba(31,43,36,.12)}.brand{display:flex;align-items:center;gap:10px;width:max-content;color:var(--ink);text-decoration:none}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand span{display:flex;flex-direction:column}.brand strong{font:700 15px "Readex Pro",sans-serif;letter-spacing:.1em}.brand small{margin-top:3px;color:var(--forest);font-size:8px;font-weight:800;letter-spacing:.15em}.heading{margin:28px 0 22px}.heading p{margin:0 0 7px;color:var(--forest);font-size:10px;font-weight:800;letter-spacing:.14em}.heading h1{margin:0;font:650 28px "Readex Pro",sans-serif;letter-spacing:-.035em}.heading span{display:block;margin-top:8px;color:var(--muted);font-size:13px;line-height:1.5}label span{display:block;margin-bottom:7px;color:#59625d;font-size:12px;font-weight:700}input{width:100%;height:44px;border:1px solid #d8d3c6;border-radius:7px;background:white;padding:0 11px;color:var(--ink);font-size:14px}form button{width:100%;height:44px;margin-top:14px;border:0;border-radius:7px;background:var(--forest);color:white;font-size:13px;font-weight:750}.error{margin:9px 0 0;color:var(--danger);font-size:12px}.back{display:inline-block;margin-top:18px;color:var(--forest);font-size:12px;font-weight:700;text-decoration:none}
</style>
