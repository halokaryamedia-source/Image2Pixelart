<script lang="ts">
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/og.png" />
	<title>Mosaic Plan — Pixel Grid untuk Produksi</title>
	<meta
		name="description"
		content="Rancang mosaic fisik, ambil suggestion warna langsung dari gambar, edit palet HEX, dan ekspor blueprint produksi."
	/>
	<meta property="og:title" content="MOSAIC/PLAN" />
	<meta property="og:description" content="Dari gambar dan warna HEX ke grid presisi." />
	<meta property="og:image" content="/og.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="MOSAIC/PLAN" />
	<meta name="twitter:description" content="Dari gambar dan warna HEX ke grid presisi." />
	<meta name="twitter:image" content="/og.png" />
</svelte:head>

{@render children()}
