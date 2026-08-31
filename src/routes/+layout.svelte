<script lang="ts">
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/mivubi-logo.png" />
	<link rel="apple-touch-icon" href="/mivubi-logo.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Readex+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
	<meta name="theme-color" content="#EBB734" />
	<title>MIVUBI Mosaic Plan — Pixel Grid untuk Produksi</title>
	<meta
		name="description"
		content="MIVUBI Mosaic Plan membantu merancang mosaic fisik, mengambil suggestion warna dari gambar, mengedit palet HEX, dan mengekspor blueprint produksi."
	/>
	<meta property="og:title" content="MIVUBI Mosaic Plan" />
	<meta property="og:description" content="Dari gambar dan warna HEX ke grid presisi." />
	<meta property="og:image" content="/mivubi-logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="MIVUBI Mosaic Plan" />
	<meta name="twitter:description" content="Dari gambar dan warna HEX ke grid presisi." />
	<meta name="twitter:image" content="/mivubi-logo.png" />
</svelte:head>

{@render children()}
