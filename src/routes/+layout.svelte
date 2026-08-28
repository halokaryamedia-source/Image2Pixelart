<script lang="ts">
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/og.png" />
	<title>Mosaic Plan — Pixel Grid untuk Produksi</title>
	<meta
		name="description"
		content="Rancang mosaic fisik, konversi gambar ke warna katalog, dan ekspor blueprint produksi."
	/>
	<meta property="og:title" content="MOSAIC/PLAN" />
	<meta property="og:description" content="Dari ukuran nyata ke grid presisi." />
	<meta property="og:image" content="/og.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="MOSAIC/PLAN" />
	<meta name="twitter:description" content="Dari ukuran nyata ke grid presisi." />
	<meta name="twitter:image" content="/og.png" />
</svelte:head>

{@render children()}
